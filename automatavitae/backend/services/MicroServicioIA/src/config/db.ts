import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Se conectará a Supabase, Neon o PostgreSQL local usando la variable de entorno DATABASE_URL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // En producción (como Neon o Supabase), usualmente requerimos SSL
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});
