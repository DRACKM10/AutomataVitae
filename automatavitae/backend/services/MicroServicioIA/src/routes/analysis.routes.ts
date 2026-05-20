import { Router } from 'express';
import { analyzeCV, improveCV, analyzeCVForAnalyzerController, suggestStepForAnalyzerController } from '../controllers/analysis.controller';

const router = Router();

// Endpoint POST /api/analyze
router.post('/analyze', analyzeCV);

// Endpoint POST /api/improve (Para Copiloto IA)
router.post('/improve', improveCV);

// Endpoints para el microservicio cv-analyzer
router.post('/cv-analyzer/analyze', analyzeCVForAnalyzerController);
router.post('/cv-analyzer/suggest', suggestStepForAnalyzerController);

export default router;
