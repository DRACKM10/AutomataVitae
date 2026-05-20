import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// ✅ Valores con fallback para desarrollo
const CV_ANALYZER_URL = process.env.CV_ANALYZER_URL || 'http://localhost:5001';
const MICROSERVICIO_IA_URL = process.env.MICROSERVICIO_IA_URL || 'http://localhost:5002';

// ✅ Validación temprana: aborta con mensaje claro si falta algo crítico
if (!CV_ANALYZER_URL) {
  throw new Error('❌ CV_ANALYZER_URL no está definida en .env');
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json());
app.use(limiter);

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: {
      cvAnalyzer: CV_ANALYZER_URL,
      microservicioIA: MICROSERVICIO_IA_URL,
    }
  });
});

app.use('/api/cv', createProxyMiddleware({
  target: CV_ANALYZER_URL, // ✅ nunca undefined
  changeOrigin: true,
  pathRewrite: { '^/api/cv': '/api/analyze' },
  onProxyReq: fixRequestBody,
}));

app.use('/api/ia', createProxyMiddleware({
  target: MICROSERVICIO_IA_URL, // ✅ nunca undefined
  changeOrigin: true,
  pathRewrite: { '^/api/ia': '/api' },
  onProxyReq: fixRequestBody,
}));

app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🌐 API GATEWAY - AUTOMATAVITAE      ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n✅ Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('\n📡 Routing configurado:');
  console.log(`  /api/cv/* → ${CV_ANALYZER_URL}`);
  console.log(`  /api/ia/* → ${MICROSERVICIO_IA_URL}`);
  console.log('\n⏳ Esperando peticiones...\n');
});