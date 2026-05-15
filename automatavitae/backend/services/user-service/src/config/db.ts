import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requerido para entornos de desarrollo/producción en Neon
    }
});

// Helper para verificar la conexión al levantar el servicio
export const query = (text: string, params?: any[]) => pool.query(text, params);