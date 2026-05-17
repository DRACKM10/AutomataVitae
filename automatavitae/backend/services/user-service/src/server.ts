import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { pool } from './config/db';

// Cargar variables de entorno de autenticación
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors({ origin: 'http://localhost:3000' }));
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

app.listen(PORT, () => {
    console.log(`User-Service corriendo en http://localhost:${PORT}`);
});