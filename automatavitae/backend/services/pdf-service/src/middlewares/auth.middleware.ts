import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
    email: string;
}

/**
 * Middleware que valida el JWT enviado en el header Authorization.
 * Usa el mismo JWT_SECRET que el user-service para verificar tokens.
 */
export const validateJWT = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Token no proporcionado' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
};
