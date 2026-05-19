import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db';
import analysisRoutes from './routes/analysis.routes';
import interviewRoutes from './routes/interview.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002; // Asignamos el puerto 5002 como indicativo del 5.2

app.use(cors());
app.use(express.json());

// Registramos las rutas de análisis e IA
app.use('/api', analysisRoutes);
app.use('/api/interview', interviewRoutes);

// Endpoint de prueba y estado
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      service: 'MicroServicioIA',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`MicroServicioIA is running on port ${PORT}`);
});
