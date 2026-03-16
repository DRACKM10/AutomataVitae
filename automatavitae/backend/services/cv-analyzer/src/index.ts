import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzerRoutes from './routes/analyzer.routes';
import { errorHandler } from './middleware/errorHandler';

// Cargar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'cv-analyzer',
    timestamp: new Date().toISOString()
  });
});

// Rutas
app.use('/api/analyze', analyzerRoutes);

// Error handling - DEBE IR AL FINAL
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   📊 CV ANALYZER - AUTOMATAVITAE      ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n✅ Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📤 Upload endpoint: POST http://localhost:${PORT}/api/analyze/upload`);
  console.log('\n⏳ Esperando peticiones...\n');
});