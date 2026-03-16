import { Request, Response, NextFunction } from 'express';

// Interfaz para errores personalizados
interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Error:', err);

  // Error de Multer (archivo muy grande o tipo incorrecto)
  if (err.message === 'Solo se permiten archivos PDF') {
    return res.status(400).json({
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Solo se permiten archivos PDF',
      }
    });
  }

  if (err.message?.includes('File too large')) {
    return res.status(400).json({
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'El archivo es demasiado grande. Máximo 5MB.',
      }
    });
  }

  // Error genérico
  res.status(err.statusCode || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Error interno del servidor',
    }
  });
};