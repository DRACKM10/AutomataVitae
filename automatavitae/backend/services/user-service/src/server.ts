import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { pool } from './config/db';

// Cargar variables de entorno de autenticación
dotenv.config();

// Manejadores de errores globales para detectar fallos en logs
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...', err);
    process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Inyección de rutas del microservicio
app.use('/api/v1/auth', authRoutes);

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT NOW()');
        res.json({ status: 'UP', database: 'CONNECTED' });
    } catch (error) {
        res.status(500).json({ status: 'DOWN', error: (error as Error).message });
    }
});

// Verificación de conexión a la base de datos al iniciar
pool.query('SELECT NOW()')
    .then(() => console.log('Database connected successfully'))
    .catch((err) => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`User-Service corriendo en http://0.0.0.0:${PORT}`);
});