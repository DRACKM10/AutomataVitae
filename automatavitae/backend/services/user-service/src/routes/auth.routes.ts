import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateJWT } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// Definición de endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/github', authController.githubLogin);
router.get('/me', validateJWT, authController.getMe);

export default router;