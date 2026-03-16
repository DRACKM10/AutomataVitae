import { Router } from 'express';
import { upload } from '../config/multer';
import { uploadAndAnalyze } from '../controllers/analyzer.controller';

const router = Router();

/**
 * POST /api/analyze/upload
 * Sube y analiza un CV
 * Body: FormData con key 'cv' y archivo PDF
 */
router.post('/upload', upload.single('cv'), uploadAndAnalyze);

export default router;