import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import pdfRoutes from './routes/pdf.routes';
import { pool } from './config/db';

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' })); // El resumeData puede ser grande

// Health check con verificación de BD
app.get('/health', async (_req, res) => {
    try {
        await pool.query('SELECT NOW()');
        res.json({
            status: 'UP',
            service: 'pdf-service',
            database: 'CONNECTED',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'DOWN',
            service: 'pdf-service',
            database: 'DISCONNECTED',
            error: (error as Error).message
        });
    }
});

// Rutas
app.use('/api/v1/pdf', pdfRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   📄 PDF-SERVICE - AUTOMATAVITAE       ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\n✅ Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`🔍 Health check:           http://localhost:${PORT}/health`);
    console.log(`📄 Generar CV PDF:  POST   http://localhost:${PORT}/api/v1/pdf/generate/cv`);
    console.log(`📊 Generar Reporte: POST   http://localhost:${PORT}/api/v1/pdf/generate/analysis-report`);
    console.log(`📋 Historial:       GET    http://localhost:${PORT}/api/v1/pdf/history/:userId`);
    console.log('\n⏳ Esperando peticiones...\n');
});
