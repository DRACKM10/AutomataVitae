import { Router } from 'express';
import { analyzeCV, improveCV } from '../controllers/analysis.controller';

const router = Router();

// Endpoint POST /api/analyze
router.post('/analyze', analyzeCV);

// Endpoint POST /api/improve (Para Copiloto IA)
router.post('/improve', improveCV);

export default router;
