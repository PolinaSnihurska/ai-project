import express, { Request, Response } from 'express';
import { client } from '../data/DB'; 
import { verifyAdmin } from '../middleware/adminMiddleware'; 

const router = express.Router();

router.get('/products', verifyAdmin, async (req: Request, res: Response) => {
    try {
        const query = `SELECT * FROM "products" ORDER BY productid DESC;`;
        const result = await client.query(query);
        return res.status(200).json({ success: true, products: result.rows });
    } catch (error) {
        console.error('Помилка отримання товарів:', error);
        return res.status(500).json({ success: false, message: 'Помилка сервера' });
    }
});

router.post('/products/add', verifyAdmin, async (req: Request, res: Response) => {
    try {
        const { 
            title, category, maincategory, price, 
            discount, stars, image, link, review_count 
        } = req.body; 
        
        const insertQuery = `
            INSERT INTO "products" 
            (title, category, maincategory, price, discount, stars, image, link, review_count) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
        `;
        const values = [title, category, maincategory, price, discount, stars, image, link, review_count];
        
        const result = await client.query(insertQuery, values);
        return res.status(201).json({ success: true, message: 'Товар успішно додано!', product: result.rows[0] });
    } catch (error) {
        console.error('Помилка додавання товару:', error);
        return res.status(500).json({ success: false, message: 'Помилка сервера' });
    }
});

router.put('/products/update/:productid', verifyAdmin, async (req: Request, res: Response) => {
    try {
        const productid = req.params.productid;
        const { 
            title, category, maincategory, price, 
            discount, stars, image, link, review_count 
        } = req.body;
        
        const updateQuery = `
            UPDATE "products" 
            SET title = $1, category = $2, maincategory = $3, price = $4, 
                discount = $5, stars = $6, image = $7, link = $8, review_count = $9
            WHERE productid = $10 RETURNING *;
        `;
        const values = [title, category, maincategory, price, discount, stars, image, link, review_count, productid];
        
        const result = await client.query(updateQuery, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Товар не знайдено' });
        }
        
        return res.status(200).json({ success: true, message: 'Товар оновлено', product: result.rows[0] });
    } catch (error) {
        console.error('Помилка оновлення:', error);
        return res.status(500).json({ success: false, message: 'Помилка сервера' });
    }
});

router.delete('/products/delete/:productid', verifyAdmin, async (req: Request, res: Response) => {
    try {
        const productid = req.params.productid;
        
        const deleteQuery = `DELETE FROM "products" WHERE productid = $1 RETURNING *;`;
        const result = await client.query(deleteQuery, [productid]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Товар не знайдено' });
        }
        
        return res.status(200).json({ success: true, message: 'Товар успішно видалено' });
    } catch (error) {
        console.error('Помилка видалення:', error);
        return res.status(500).json({ success: false, message: 'Помилка сервера' });
    }
});

export default router;