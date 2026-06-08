import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import adminRoutes from './routes/admin';
import { verifyAdmin } from './middleware/adminMiddleware';
import routes from './routes';
import { connectDB, client } from './data/DB';
import rateLimiterMiddleware from './middleware/rateLimit';
import adminProductRoutes from './routes/adminProducts';

const app: Express = express();
app.set('trust proxy', true);

const port = process.env.PORT || 3500;

app.use(rateLimiterMiddleware);
app.use(bodyParser.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

const origin_url = process.env.FRONTEND_SERVER_ORIGIN as string;
const allowedOrigins = [
  'http://localhost:3000',
  'https://ai-project-9c512oykx-12345s-projects-0ea5045f.vercel.app',
  'https://ai-project-gf68shvut-12345s-projects-0ea5045f.vercel.app',
  process.env.FRONTEND_SERVER_ORIGIN
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS blocked request from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  })
);


app.use('/api/admin', verifyAdmin, adminRoutes); 
app.use('/api/admin', adminProductRoutes);
app.use('/api', routes);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Success' });
});

app.use('/api', routes);

const startServer = async () => {
  await connectDB();

  // === TEST CONNECTION ===
  // try {
  //   const res = await client.query('SELECT COUNT(*) FROM electronics_products');
  //   console.log('Products in DB:', res.rows[0].count);
  // } catch (err) {
  //   console.error('Test query error:', err);
  // }
  // ======================


  app.listen(port, () => {
    console.log(`[server]: Server is running at Port ${port}`);
  });
};

startServer();
