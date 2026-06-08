import { Pool } from 'pg'; // Змінили Client на Pool
import 'dotenv/config';

type DetailsType = {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
};

const details: DetailsType = {
  user: process.env.DB_USER || '',
  password: process.env.DB_PASS || '',
  host: process.env.DB_HOST || '',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || '',
};

// Створюємо Pool, але називаємо його client для сумісності з твоїм кодом
const client = new Pool({
  user: details.user,
  password: details.password,
  host: details.host,
  port: details.port,
  database: details.database,
  ssl: details.host !== 'localhost' ? { rejectUnauthorized: false } : false,
  
  // Додаткові налаштування для стабільності в хмарі
  max: 10, // Максимальна кількість з'єднань
  idleTimeoutMillis: 30000, // Закривати неактивні з'єднання
});

// Додаємо захист від падіння сервера, якщо Neon розірве з'єднання в фоні
client.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

const connectDB = async () => {
  try {
    // Pool підключається автоматично під час запиту, тому ми просто робимо тестовий пінг
    await client.query('SELECT 1');
    console.log('Connected to the database via Pool');
  } catch (err: any) {
    console.error('Connection error', err.stack);
    process.exit(1);
  }
};

export { client, connectDB };