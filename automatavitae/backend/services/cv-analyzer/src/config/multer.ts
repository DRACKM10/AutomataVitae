import multer from 'multer';
import { Request } from 'express';

// Límite de tamaño: 5MB
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880');

// Configuración de almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro de archivos - Solo PDFs
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Verificar tipo MIME
  if (file.mimetype === 'application/pdf') {
    cb(null, true); // Aceptar archivo
  } else {
    cb(new Error('Solo se permiten archivos PDF'));
  }
};

// Configuración de Multer
export const upload = multer({  // ← IMPORTANTE: debe tener "export"
  storage: storage,
  limits: {
    fileSize: MAX_SIZE, // 5MB máximo
  },
  fileFilter: fileFilter,
});