import { Router } from 'express';
import { CvController } from '../controllers/cv.controller.js';
import { validateJWT } from '../middlewares/auth.middleware.js';

const router = Router();
const cvController = new CvController();

// Aplicar protección JWT a todos los endpoints de CV
router.use(validateJWT);

router.post('/', cvController.create);
router.get('/', cvController.getAll);
router.get('/:id', cvController.getById);

export default router;