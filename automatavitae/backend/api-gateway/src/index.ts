import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Rate limiting - Limitar peticiones por IP
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware globales
app.use(cors()); // Permitir peticiones del frontend
app.use(express.json()); // Parsear JSON
app.use(limiter); // Aplicar rate limiting

// Health check - Verificar que el gateway está funcionando
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: {
      cvAnalyzer: process.env.CV_ANALYZER_URL,
    }
  });
});

// PROXY - Redirigir peticiones a CV Analyzer
app.use('/api/cv', createProxyMiddleware({
  target: process.env.CV_ANALYZER_URL,
  changeOrigin: true,
  pathRewrite: { 
    '^/api/cv': '/api/analyze' // /api/cv/upload -> /api/analyze/upload
  },
  onProxyReq: fixRequestBody,
}));

// PROXY - Redirigir peticiones a MicroServicioIA
app.use('/api/ia', createProxyMiddleware({
  target: process.env.MICROSERVICIO_IA_URL || 'http://localhost:5002',
  changeOrigin: true,
  pathRewrite: { 
    '^/api/ia': '/api' // /api/ia/analyze -> /api/analyze
  },
  onProxyReq: fixRequestBody,
}));

// 404 handler - Ruta no encontrada
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🌐 API GATEWAY - AUTOMATAVITAE      ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n✅ Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('\n📡 Routing configurado:');
  console.log(`  /api/cv/* → ${process.env.CV_ANALYZER_URL}`);
  console.log(`  /api/ia/* → ${process.env.MICROSERVICIO_IA_URL || 'http://localhost:5002'}`);
  console.log('\n⏳ Esperando peticiones...\n');
});