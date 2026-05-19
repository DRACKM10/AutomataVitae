import { Router } from 'express';
import { startInterview, sendMessage } from '../controllers/interview.controller';

const router = Router();

// Iniciar una nueva sesión de entrevista
router.post('/start', startInterview);

// Enviar un mensaje en una sesión de entrevista existente
router.post('/message', sendMessage);

export default router;
