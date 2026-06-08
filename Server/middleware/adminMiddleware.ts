import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { client } from '../data/DB';

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ success: false, message: "Доступ заборонено. Токен відсутній." });
    }

    try {
        const secret = process.env.JWT_ENCRYPTION_KEY || '';
        const decoded = jwt.verify(token, secret) as { userID: number };

        const query = `SELECT role FROM "users" WHERE userid = $1;`;
        const dbResult = await client.query(query, [decoded.userID]);

        if (dbResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Користувача не знайдено." });
        }

        const user = dbResult.rows[0];

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Доступ заборонено. Потрібні права адміністратора." });
        }

        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        return res.status(401).json({ success: false, message: "Недійсний або прострочений токен." });
    }
};