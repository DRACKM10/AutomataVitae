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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { userId: string; email: string };
        req.user = decoded; // Inyectamos el userId y email extraídos del token
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token inválido o expirado' });
    }
};