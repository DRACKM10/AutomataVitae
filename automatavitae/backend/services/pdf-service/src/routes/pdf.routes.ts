import { Router } from 'express';
import { PdfController } from '../controllers/pdf.controller';
import { validateJWT } from '../middlewares/auth.middleware';

const router = Router();
const pdfController = new PdfController();

// Generación de PDFs (protegidos con JWT)
router.post('/generate/cv',              validateJWT, pdfController.generateCv);
router.post('/generate/analysis-report', validateJWT, pdfController.generateAnalysisReport);

// Historial del usuario
router.get('/history/:userId', validateJWT, pdfController.getHistory);

// Eliminar registro
router.delete('/:id', validateJWT, pdfController.deleteRecord);

export default router;
