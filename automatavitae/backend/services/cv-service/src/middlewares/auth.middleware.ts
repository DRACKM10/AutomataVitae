import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const validateJWT = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        console.log("cv-service verifying with secret:", process.env.JWT_SECRET || 'fallback_secret');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { userId: string; email: string };
        req.user = decoded; // Inyectamos el userId y email extraídos del token
        next();
    } catch (error: any) {
        console.error("JWT Verification failed. Secret used:", process.env.JWT_SECRET || 'fallback_secret', "Error:", error.message);
        res.status(403).json({ error: 'Token inválido o expirado', details: error.message });
    }
};