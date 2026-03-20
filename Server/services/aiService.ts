import axios from 'axios';
import { Product } from './productService';
import { ConversationContext } from './contextService';
import { detectIntentByRules } from '../utils/intentRules';

export interface ExtractedEntities {
    intent: 'search' | 'compare' | 'recommend' | 'question' | 'refine' | 'budget' | 'scenario';
    category?: string;
    mainCategory?: string;
    budget?: number;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    searchTerm?: string;
    productIds?: number[];
    brand?: string;
    productType?: 'phone' | 'charger' | 'case' | 'earbuds' | 'tv';
    useCase?: string;
    specifications?: Record<string, any>;
    language?: 'en' | 'uk';
    needsClarification?: boolean;
    clarificationQuestion?: string;
}

export interface AIResponse {
    text: string;
    products?: Product[];
    comparisonTable?: any;
    quickReplies?: string[];
    needsProducts?: boolean;
    entities: ExtractedEntities;
}

export class AIService {
    private static readonly API_URL = 'https://api.openai.com/v1/responses';
    private static readonly MODEL = 'gpt-4o-mini';
    static formatComparison(products: Product[]): { products: any[] } | null {
        if (!products || products.length < 2) return null;
    
        return {
            products: products.slice(0, 2).map(p => ({
                id: p.id,
                name: p.name,
                price: p.price ?? 'N/A',
                discount: p.discount ?? 'N/A',
                rating: p.rating,
                rating_count: p.rating_count,
                category: `${p.main_category || ''} / ${p.sub_category}`,
                image: p.images?.[0]?.imglink || ''
            }))
        };
    }
    

    private static getHeaders() {
        const apiKey = process.env.OPENAI_API_KEY;
        const projectId = process.env.OPENAI_PROJECT_ID;

        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is missing');
        }

        return {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Project': projectId
        };
    }

    static async extractIntentAndEntities(
        message: string,
        context: ConversationContext,
        availableProducts: Product[],
        categories: { id: number; main_category: string; sub_category: string }[]
    ): Promise<ExtractedEntities> {
        try {
            const lower = message.toLowerCase();
            const language = this.detectLanguage(message);

            const keywordIntent = this.detectIntentFromKeywords(message);
            
            const systemPrompt = this.buildSystemPrompt(context, categories, language);

            const userPrompt = language === 'uk' ? `
Проаналізуй повідомлення користувача та витягни намір та сутності у форматі JSON.
ВАЖЛИВО: Оскільки база даних англійською, ПЕРЕКЛАДАЙ значення searchTerm, category, brand, productType, useCase та specifications на АНГЛІЙСЬКУ мову.

Повідомлення:
"${message}"

Поверни ТІЛЬКИ валідний JSON:
{
  "intent": "search|compare|recommend|question|refine|budget|scenario",
  "category": "string | null",
  "mainCategory": "string | null",
  "budget": "number | null",
  "minPrice": "number | null",
  "maxPrice": "number | null",
  "rating": "number | null",
  "searchTerm": "ТІЛЬКИ конкретний бренд або модель АНГЛІЙСЬКОЮ (наприклад 'Samsung', 'iPhone'). Якщо нічого немає - null",
  "productIds": "number[] | null",
  "brand": "string | null",
  "productType": "phone | charger | case | earbuds | tv | laptop | keyboard | chair | null",
  "useCase": "Для чого потрібен товар АНГЛІЙСЬКОЮ | null",
  "specifications": "Об'єкт з бажаними характеристиками АНГЛІЙСЬКОЮ | null",
  "language": "en|uk",
  "needsClarification": "boolean (став true ТІЛЬКИ якщо запит взагалі позбавлений сенсу. Для слів типу 'телефон', 'ноутбук', 'навушники' став false)",
  "clarificationQuestion": "Питання для уточнення виключно УКРАЇНСЬКОЮ МОВОЮ | null"
}
` : `
Analyze the following user message and extract intent and entities in JSON format.

Message:
"${message}"

Return ONLY valid JSON:
{
  "intent": "search|compare|recommend|question|refine|budget|scenario",
  "category": "string | null",
  "mainCategory": "string | null",
  "budget": "number | null",
  "minPrice": "number | null",
  "maxPrice": "number | null",
  "rating": "number | null",
  "searchTerm": "ONLY exact brand or model (e.g. 'Samsung', 'iPhone'). DO NOT put 'good battery' or 'for work' here. If no specific brand/model, return null",
  "productIds": "number[] | null",
  "brand": "string | null",
  "productType": "phone | charger | case | earbuds | tv | null",
  "useCase": "What the user needs it for (e.g. 'work and study') | null",
  "specifications": "Object with desired specs (e.g. {'battery': 'good', 'camera': 'good'}) | null",
  "language": "en|uk",
  "needsClarification": "boolean",
  "clarificationQuestion": "string | null"
}
`;
            const response = await axios.post(
                this.API_URL,
                {
                    model: this.MODEL,
                    input: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.3
                },
                { headers: this.getHeaders(), timeout: 15000 }
            );

            
            let content = response.data?.output?.[0]?.content?.[0]?.text || '{}';
            
            content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
            
            const entities = JSON.parse(content) as ExtractedEntities;
            
            if (entities.intent === 'search' && keywordIntent) {
                entities.intent = keywordIntent;
            }
            
            entities.language = language;
            
            const budgetMatch = message.match(/under\s+(\d+)|below\s+(\d+)|до\s+(\d+)|ціна\s+до\s+(\d+)|budget\s+(\d+)|бюджет\s+(\d+)/i);
            if (budgetMatch) {
                const value = Number(budgetMatch[1] || budgetMatch[2] || budgetMatch[3] || budgetMatch[4]);
                if (!isNaN(value)) {
                    entities.maxPrice = value;
                    if (!entities.intent || entities.intent === 'search') {
                        entities.intent = 'budget';
                    }
                }
            }

            return entities;
        } catch (error) {
            console.error('extractIntentAndEntities error:', error);
            return this.fallbackExtraction(message, context);
        }
    }


static async generateResponse(
    message: string,
    context: ConversationContext,
    entities: ExtractedEntities,
    products: Product[]
): Promise<AIResponse> {

    console.log('ENTER generateResponse');

    let productContext = "No specific products found matching the criteria.";
    if (products.length > 0) {
        productContext = products.slice(0, 20).map(p => `
        ID: ${p.id}
        Name: ${p.name}
        Price: ${p.price}
        `).join('\n');
    }

    console.log('PRODUCT CONTEXT:', productContext);

    const payload = {
        model: this.MODEL,
        input: [
            {
                role: 'system',
                content: `
              You are a friendly and helpful AI assistant for an electronics e-commerce platform.

              User language: ${entities.language}

              CRITICAL RULE: You MUST write your final response ONLY in this language: ${entities.language}. 
              Even though the product names are in English, your explanations, reasons, and formatting MUST be in ${entities.language}. DO NOT output English text unless it's the official brand/product name.
              
              Your task:
              - The user has complex requirements: Use case: ${entities.useCase || 'None'}, Specifications: ${JSON.stringify(entities.specifications || {})}.
              - Look carefully at the "Name" field of the provided products. The Name contains important specifications like RAM, Battery capacity (mAh), camera megapixels, etc.
              - ACT AS A FILTER: Out of the products provided below, choose ONLY 1-3 products that BEST match the user's requirements (e.g., if they want a 'good battery', pick the one with 5000mAh or 6000mAh).
              - Explain WHY you are recommending them based on these specs.
              - Speak naturally, like an expert consultant in a tech store.
              - Start with an empathetic and confident opening.
              - Do NOT invent products. Use ONLY the products provided.

              Response style rules:
              - Start with a short friendly sentence (for example: "Sure! Here are the best Samsung products I can recommend.").
              - If the user asks for recommendations, clearly say that you are recommending products.
              - If a brand is mentioned, explicitly mention the brand in the response.
              - Then list or describe the products.
              - Do NOT invent products.
              - Use ONLY the products provided below.
              - If no products exist, politely say so.
              
              Tone:
              - Friendly
              - Confident
              - Clear
              `
              },

              {
                role: 'system',
                content: `
              USER INTENT: ${entities.intent}
              USER SEARCH TERM: ${entities.searchTerm || 'not specified'}
              `
              },
              
            { 
                role: 'system', 
                content: `PRODUCTS:\n${productContext}` 
            },

            { 
                role: 'user', 
                content: message 
            }
        ]
    };

    console.log('AI PAYLOAD:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
        this.API_URL,
        payload,
        { headers: this.getHeaders(), timeout: 20000 }
    );

    console.log('AI RAW RESPONSE:', JSON.stringify(response.data, null, 2));

    const aiText =
        response.data?.output?.[0]?.content?.[0]?.text ??
        response.data?.choices?.[0]?.message?.content ??
        'Here are some products you might like:';

    return {
        text: aiText,
        products: products.slice(0, 10),
        quickReplies: this.generateQuickReplies(entities, products),
        needsProducts: true,
        entities
    };
}

private static buildSystemPrompt(
    context: ConversationContext,
    categories?: { id: number; main_category: string; sub_category: string }[],
    language: 'en' | 'uk' = 'en'
): string {
    if (language === 'uk') {
        let prompt = `
Ти - корисний AI-помічник для інтернет-магазину електроніки.
Використовуй ТІЛЬКИ надані дані про продукти.
Ніколи не вигадуй продукти.
Користувач може писати українською або англійською мовою.
Розпізнай намір користувача: "search" (пошук), "compare" (порівняння), "recommend" (рекомендація), "question" (питання).
`;

        if (categories?.length) {
            prompt += `Доступні категорії: ${categories
                .map(c => `${c.main_category} / ${c.sub_category}`)
                .join(', ')}\n`;
        }

        return prompt;
    }
    
    let prompt = `
You are a helpful AI assistant for an electronics store.
Use ONLY the provided product data.
Never invent products.
Use user's language.
`;

    if (categories?.length) {
        prompt += `Available categories: ${categories
            .map(c => `${c.main_category} / ${c.sub_category}`)
            .join(', ')}\n`;
    }

    return prompt;
}

    private static detectIntentFromKeywords(message: string): ExtractedEntities['intent'] | null {
        const lower = message.toLowerCase();
        
        const ukKeywords = {
            compare: ['порівняй', 'порівняти', 'відмінність', 'проти', 'vs', 'versus'],
            recommend: ['порекомендуй', 'порадь', 'рекомендації', 'підбери'],
            search: ['знайди', 'шукаю', 'покажи', 'знайти'],
            budget: ['бюджет', 'ціна', 'до', 'дешевші', 'дорогі'],
            question: ['як', 'що', 'чи', 'де', 'коли', 'чому']
        };
        
        const enKeywords = {
            compare: ['compare', 'difference', 'vs', 'versus', 'two', 'both'],
            recommend: ['recommend', 'suggest', 'advise'],
            search: ['find', 'search', 'show', 'look for'],
            budget: ['budget', 'price', 'under', 'below', 'cheap', 'expensive'],
            question: ['how', 'what', 'where', 'when', 'why']
        };
        
        for (const [intent, keywords] of Object.entries(ukKeywords)) {
            if (keywords.some(keyword => lower.includes(keyword))) {
                return intent as ExtractedEntities['intent'];
            }
        }
        
        for (const [intent, keywords] of Object.entries(enKeywords)) {
            if (keywords.some(keyword => lower.includes(keyword))) {
                return intent as ExtractedEntities['intent'];
            }
        }
        
        return null;
    }

    private static generateQuickReplies(
        entities: ExtractedEntities,
        products: Product[]
    ): string[] {
        const replies: string[] = [];

        if (entities.intent === 'compare' && products.length >= 2) {
            replies.push('Compare these products');
        }

        if (entities.intent === 'search') {
            replies.push('Show cheaper options');
            replies.push('Show higher rated');
        }

        return replies.slice(0, 4);
    }

    private static fallbackExtraction(
        message: string,
        context: ConversationContext
    ): ExtractedEntities {
        const language = this.detectLanguage(message);
        const keywordIntent = this.detectIntentFromKeywords(message);
        
        return {
            intent: keywordIntent || 'search',
            searchTerm: null as unknown as string, 
            language: language,
            needsClarification: false
        };
    }

    private static generateFallbackResponse(
        message: string,
        entities: ExtractedEntities
    ): AIResponse {
        return {
            text: 'AI ERROR: Unknown error',
            entities,
            quickReplies: []
        };
    }

    private static detectLanguage(message: string): 'en' | 'uk' {
        return /[а-яіїєґ]/i.test(message) ? 'uk' : 'en';
    }
}
