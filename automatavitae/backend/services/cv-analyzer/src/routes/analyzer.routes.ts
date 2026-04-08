import { Router } from 'express';
import { upload } from '../config/multer';
import { uploadAndAnalyze, suggestForStep } from '../controllers/analyzer.controller';

const router = Router();

/**
 * POST /api/analyze/upload
 * Sube y analiza un CV
 * Body: FormData con key 'cv' y archivo PDF
 */
router.post('/upload', upload.single('cv'), uploadAndAnalyze);

/**
 * POST /api/analyze/suggest
 * Retorna sugerencias para el CV usando IA
 */
router.post('/suggest', suggestForStep);

export default router;