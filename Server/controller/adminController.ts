import { Request, Response } from 'express';
import { client } from '../data/DB';

export class AdminController {
    static async getOverviewStats(req: Request, res: Response): Promise<void> {
        try {
            const [
                totalResult,
                avgTimeResult,
                successResult,
                unresolvedResult,
                chartResult
            ] = await Promise.all([
                client.query('SELECT COUNT(*) FROM chatbot_logs;'),
                client.query('SELECT AVG(response_time_ms) FROM chatbot_logs;'),
                client.query('SELECT COUNT(*) FROM chatbot_logs WHERE is_resolved = true;'),
                client.query('SELECT COUNT(*) FROM chatbot_logs WHERE is_resolved = false;'),
                client.query(`
                    SELECT 
                        TO_CHAR(created_at, 'Dy') as name, 
                        COUNT(*) as messages 
                    FROM chatbot_logs 
                    WHERE created_at >= NOW() - INTERVAL '7 days' 
                    GROUP BY DATE(created_at), TO_CHAR(created_at, 'Dy') 
                    ORDER BY DATE(created_at) ASC;
                `)
            ]);

            
            const totalConversations = parseInt(totalResult.rows[0].count) || 0;
            
            const avgResponseTimeMs = Math.round(parseFloat(avgTimeResult.rows[0].avg)) || 0;
            
            const successfulMatches = parseInt(successResult.rows[0].count) || 0;
            
            const unresolvedQueries = parseInt(unresolvedResult.rows[0].count) || 0;

            const chartData = chartResult.rows.map(row => ({
                name: row.name,
                messages: parseInt(row.messages)
            }));

            const stats = {
                totalConversations,
                avgResponseTimeMs,
                successfulMatches,
                unresolvedQueries,
                chartData
            };

            res.status(200).json({
                success: true,
                data: stats
            });

        } catch (error: any) {
            console.error('Помилка отримання статистики:', error);
            res.status(500).json({ error: 'Failed to fetch analytics data' });
        }
    }
}