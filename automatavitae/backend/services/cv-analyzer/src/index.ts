import dotenv from 'dotenv';
// Configurar dotenv ANTES de importar otras rutas internas
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import analyzerRoutes from './routes/analyzer.routes';
import { paymentRouter } from './routes/payment.routes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();
const PORT = process.env.PORT || 3000;

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
app.use('/api/payments', paymentRouter);

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