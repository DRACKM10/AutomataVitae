import express from 'express';
import dotenv from 'dotenv';
import { pool } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middlewares globales
app.use(express.json());

// Endpoint de prueba de salud (Healthcheck)
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT NOW()');
        res.json({ status: 'UP', database: 'CONNECTED' });
    } catch (error) {
        res.status(500).json({ status: 'DOWN', error: (error as Error).message });
    }
});

app.listen(PORT, () => {
    console.log(`User-Service corriendo en http://localhost:${PORT}`);
});