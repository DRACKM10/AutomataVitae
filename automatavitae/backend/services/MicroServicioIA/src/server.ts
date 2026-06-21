import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRoutes from './routes/analysis.routes';
import interviewRoutes from './routes/interview.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002; // Asignamos el puerto 5002 como indicativo del 5.2

app.use(cors());
app.use(express.json());

// Ruta raíz para healthchecks de Railway
app.get('/', (req, res) => res.status(200).send('OK'));

// Registramos las rutas de análisis e IA
app.use('/api', analysisRoutes);
app.use('/api/interview', interviewRoutes);

// Endpoint de prueba y estado
app.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'ok',
      service: 'MicroServicioIA',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`MicroServicioIA is running on http://0.0.0.0:${PORT}`);
});
