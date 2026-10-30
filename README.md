# E-Commerce AI Consultant API

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green.svg)
![AI Integration](https://img.shields.io/badge/AI-OpenAI%20%7C%20LangChain-orange.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

> A scalable backend service integrating a conversational AI consultant into an e-commerce platform, enabling smart product discovery and personalized shopping experiences.

## Overview

Traditional e-commerce platforms rely on keyword-based searches and static filters, which can lead to search fatigue. This project introduces an **AI-powered Virtual Consultant** that interacts with users in natural language, understands their intent, and recommends products using **Retrieval-Augmented Generation (RAG)**. 

The backend is designed with a focus on clean architecture, performance, and seamless LLM (Large Language Model) integration without compromising the core e-commerce business logic.

## Key Features

* **Conversational Commerce:** Natural language search and chat interface for users to ask about products, comparisons, and availability.
* **Smart Context Injection (RAG):** The AI does not hallucinate; it answers strictly based on the real-time product catalog using vector embeddings.
* **Automated Product Tagging:** Background workers that automatically generate metadata and vector embeddings for new products.
* **Core E-Commerce API:** RESTful endpoints for user management, product catalog, cart operations, and order processing.
* **Session Memory:** The AI remembers the context of the conversation within a specific shopping session.

## System Architecture

```text
[Client] --> (REST API Gateway)
                 |
                 +--> [Core E-Commerce Services] <--> (PostgreSQL Relational DB)
                 |
                 +--> [AI Consultant Service] 
                             |
                             +--> (Vector DB / pgvector) - Product Embeddings
                             |
                             +--> (LLM Provider / OpenAI API)
Tech Stack
Core Backend: Node.js, Express.js / NestJS (Update based on your exact framework)
Database: PostgreSQL (for relational data like Users, Orders, Products)
Vector Store: pgvector / Pinecone (for fast semantic search of products)
AI & NLP: OpenAI API (GPT-4/GPT-3.5), LangChain for prompt orchestration
Infrastructure: Docker, Docker Compose
Documentation: Swagger / OpenAPI
AI Integration Workflow
User Query: User asks, "I need a laptop for video editing under $1500."
Embedding Generation: The backend converts this query into a vector embedding.
Semantic Search: We query the Vector Database to find the top 5 laptops matching the semantic intent and price filter.
Context Assembly: The backend constructs a system prompt including the retrieved laptops and the user's chat history.
LLM Generation: The LLM generates a human-like, persuasive response recommending the best options from the provided context.
Getting Started
Prerequisites
Docker & Docker Compose
Node.js (v18+)
An active OpenAI API Key
Installation
Clone the repository:
Bash
git clone [https://github.com/PolinaSnihurska/ai-project.git](https://github.com/PolinaSnihurska/ai-project.git)
cd ai-project
Environment Variables:
Copy the example .env file and fill in your credentials.
Bash
cp .env.example .env
Required variables:
Code snippet
DATABASE_URL=postgres://user:password@localhost:5432/ecommerce
OPENAI_API_KEY=sk-...
PORT=8000
Run with Docker:
Launch the API, PostgreSQL database, and run migrations in one command:
Bash
docker-compose up --build -d
Access the API:
Server runs on http://localhost:8000
Swagger Docs available at http://localhost:8000/api/docs
Core API Endpoints
AI Consultant
POST /api/v1/chat/message - Send a message to the AI consultant.
GET /api/v1/chat/sessions/:id - Retrieve chat history for a session.
E-Commerce (Catalog & Orders)
GET /api/v1/products - List products (with optional traditional filters).
GET /api/v1/products/:id - Get product details.
POST /api/v1/cart - Add an AI-recommended item to the cart.
Project Structure
Plaintext
├── src/
│   ├── api/            # Controllers and routing
│   ├── services/       # Core business logic (Cart, Products)
│   ├── ai/             # LLM orchestration, prompt templates, embeddings
│   ├── models/         # Database schemas and ORM entities
│   └── config/         # Environment and third-party integrations
├── docker-compose.yml
├── Dockerfile
└── README.md
Future Improvements
[ ] Implement Redis for caching frequent AI queries and saving LLM costs.
[ ] Add streaming responses (Server-Sent Events) for the chat interface to reduce perceived latency.
[ ] Implement sentiment analysis to transfer angry customers to human support.
