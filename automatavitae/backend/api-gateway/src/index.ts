import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';

const app: Application = express();

// ✅ Confiar en el Load Balancer de Railway/Render/Vercel
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;

// ✅ Valores con fallback para desarrollo
const CV_ANALYZER_URL = process.env.CV_ANALYZER_URL || 'http://localhost:3333';
const MICROSERVICIO_IA_URL = process.env.MICROSERVICIO_IA_URL || 'http://localhost:5002';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const CV_SERVICE_URL = process.env.CV_SERVICE_URL || 'http://localhost:3003';
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:3004';

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

// Ruta raíz para healthchecks de Railway
app.get('/', (req, res) => res.status(200).send('OK'));

app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: {
      cvAnalyzer: CV_ANALYZER_URL,
      microservicioIA: MICROSERVICIO_IA_URL,
      userService: USER_SERVICE_URL,
      cvService: CV_SERVICE_URL,
      pdfService: PDF_SERVICE_URL
    }
  });
});

app.use('/api/cv', createProxyMiddleware({
  target: CV_ANALYZER_URL, // ✅ nunca undefined
  changeOrigin: true,
  pathRewrite: { '^/api/cv': '/api/analyze' },
  onProxyReq: (proxyReq, req, res) => {
    console.log('[Gateway Proxy] Proxying /api/cv ...');
    fixRequestBody(proxyReq, req);
  },
  onError: (err, req, res) => {
    console.error('[Gateway Proxy Error]', err);
  }
}));

app.use('/api/payments', createProxyMiddleware({
  target: CV_ANALYZER_URL,
  changeOrigin: true,
  onProxyReq: fixRequestBody,
}));

app.use('/api/ia', createProxyMiddleware({
  target: MICROSERVICIO_IA_URL, // ✅ nunca undefined
  changeOrigin: true,
  pathRewrite: { '^/api/ia': '/api' },
  onProxyReq: fixRequestBody,
}));

app.use('/api/users', createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/api/v1/auth' },
  onProxyReq: fixRequestBody,
}));

app.use('/api/cvs', createProxyMiddleware({
  target: CV_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/cvs': '/api/v1/cvs' },
  onProxyReq: fixRequestBody,
}));

app.use('/api/pdf', createProxyMiddleware({
  target: PDF_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/pdf': '/api/v1/pdf' },
  onProxyReq: fixRequestBody,
}));

app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🌐 API GATEWAY - AUTOMATAVITAE      ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n✅ Servidor corriendo en: http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('\n📡 Routing configurado:');
  console.log(`  /api/cv/* → ${CV_ANALYZER_URL}`);
  console.log(`  /api/ia/* → ${MICROSERVICIO_IA_URL}`);
  console.log(`  /api/users/* → ${USER_SERVICE_URL}`);
  console.log(`  /api/cvs/* → ${CV_SERVICE_URL}`);
  console.log(`  /api/pdf/* → ${PDF_SERVICE_URL}`);
  console.log('\n⏳ Esperando peticiones...\n');
});