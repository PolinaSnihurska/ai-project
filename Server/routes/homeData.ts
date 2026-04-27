import express, { Request, Response } from 'express';
import { client } from '../data/DB';
const router = express.Router();

router.get('/home/banner', async(req:Request,res:Response) => {
    try {
        res.status(200).json({
            data: [
                {
                    id: 1,
                    imglink: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200&auto=format&fit=crop",
                    title: "Welcome to Electronics",
                    subtitle: "Best devices inside",
                    buttontext: "Shop Now"
                }
            ]
        });
    } catch (error) {
        res.sendStatus(500);
    }
});

const getImage = async (productID:number) => {
    try {
        const result = await client.query(
            `SELECT id AS imageid, image AS imglink, name AS imgalt 
             FROM electronics_products 
             WHERE id = $1`,
            [productID]
        );
        return result.rows[0] || {imageid:0,imglink:'',imgalt:''};
    } catch (error) {
        return {imageid:0,imglink:'',imgalt:''};
    }
};

router.get('/home/deals',async(req:Request,res:Response)=>{
    const fetchQuery = `
        SELECT ep.id AS productid, ep.name AS title, ep.rating AS stars, ep.price, ep.original_price AS discount, 
               15 AS sold, 100 AS available, ep.image AS imglink, ep.name AS imgalt, 
               NOW() + INTERVAL '1 day' AS end_time
        FROM electronics_products ep
        WHERE ep.original_price > ep.price 
        LIMIT 2`;
    try {
        const response = await client.query(fetchQuery);
        res.status(200).json({data:response.rows})
    } catch (error) {
        console.error("ПОМИЛКА У DEALS:", error);
        res.sendStatus(500)
    }
})

router.get('/home/trending',async(req:Request,res:Response)=>{
    const fetchQuery = `SELECT ep.id AS productid, ep.name AS title, ep.price, ep.original_price AS discount, ep.image AS imglink, ep.name AS imgalt, COALESCE(c.sub_category, 'general') AS category_name, COALESCE(c.main_category, 'electronics') AS maincategory
    FROM electronics_products ep 
    LEFT JOIN categories c ON c.id = ep.category_id
    ORDER BY ep.rating_count DESC NULLS LAST LIMIT 8`;
    
    const fetchQuery1 = `SELECT ep.id AS productid, ep.name AS title, ep.price, ep.original_price AS discount, ep.image AS imglink, ep.name AS imgalt, COALESCE(c.sub_category, 'general') AS category_name, COALESCE(c.main_category, 'electronics') AS maincategory
    FROM electronics_products ep 
    LEFT JOIN categories c ON c.id = ep.category_id
    ORDER BY ep.rating DESC NULLS LAST LIMIT 8`;
    
    const fetchQuery2 = `SELECT ep.id AS productid, ep.name AS title, ep.price, ep.original_price AS discount, ep.image AS imglink, ep.name AS imgalt, COALESCE(c.sub_category, 'general') AS category_name, COALESCE(c.main_category, 'electronics') AS maincategory
    FROM electronics_products ep 
    LEFT JOIN categories c ON c.id = ep.category_id
    ORDER BY ep.id DESC LIMIT 8`;
    
    try {
        const response = await client.query(fetchQuery);
        const response1 = await client.query(fetchQuery1);
        const response2 = await client.query(fetchQuery2);
        res.status(200).json({data:{trending:response.rows,top_rated:response1.rows,new_arrival:response2.rows}})
    } catch (error) {
        console.error("ПОМИЛКА У ТРЕНДАХ:", error);
        res.sendStatus(500)
    }
});

router.get('/home/best-sellers',async(req:Request,res:Response)=>{
    const fetchQuery = `SELECT ep.id AS productid, ep.name AS title, ep.price, ep.original_price AS discount, ep.image AS imglink, ep.name AS imgalt, COALESCE(c.sub_category, 'general') AS category_name, ep.rating AS stars, ep.rating
    FROM electronics_products ep 
    LEFT JOIN categories c ON c.id = ep.category_id
    ORDER BY ep.rating_count DESC NULLS LAST LIMIT 4`;
    
    try {
        const response = await client.query(fetchQuery);
        res.status(200).json({data:response.rows})
    } catch (error) {
        console.error("ПОМИЛКА У BEST SELLERS:", error);
        res.sendStatus(500)
    }
});

const fetchProducts = async () => {
    const query = `
        SELECT ep.id AS productid, ep.name AS title, 
        COALESCE(c.sub_category, 'general') AS category, 
        COALESCE(c.main_category, 'electronics') AS maincategory, 
        ep.price, ep.original_price AS discount, ep.rating AS stars, 
        false AS isnew, false AS issale, false AS isdiscount 
        FROM electronics_products ep 
        LEFT JOIN categories c ON c.id = ep.category_id
        ORDER BY ep.rating DESC NULLS LAST LIMIT 12`;
        
    try {
        const response = await client.query(query, []);
        if (response.rows.length === 0) return [];

        const products = await Promise.all(
            response.rows.map(async (product) => {
                const productID = product.productid;

                const [colors, sizes, reviewCount, images] = await Promise.all([
                    getColors(productID),
                    getSizes(productID),
                    review(productID),
                    getImage(productID)
                ]);

                return {
                    ...product,
                    colors,
                    sizes,
                    reviewCount,
                    images
                };
            })
        );

        return products;
    } catch (error) {
        console.error("ПОМИЛКА У fetchProducts:", error);
        return [];
    }
};

const review = async (productID:number) => {
    try {
        const result = await client.query(`SELECT rating_count FROM electronics_products WHERE id = $1`, [productID]);
        return result.rows[0] ? result.rows[0].rating_count : 0;
    } catch (error) {
        return 0;
    }
};

const getColors = async (productID:number) => {
    return []; 
};

const getSizes = async (productID:number) => {
    return []; 
};

router.get('/home/products',async(req:Request,res:Response)=>{
    try {
        const response = await fetchProducts();
        res.status(200).json({data:response})
    } catch (error) {
        console.error("ПОМИЛКА У ГОЛОВНИХ ПРОДУКТАХ:", error);
        res.sendStatus(500)
    }
});

export default router;