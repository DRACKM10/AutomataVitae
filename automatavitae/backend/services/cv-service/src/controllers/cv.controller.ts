import { Request, Response } from 'express';
import { CvService } from '../services/cv.service.js';

const cvService = new CvService();

export class CvController {
    async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const resumeData = req.body;

            const newCv = await cvService.createNewCv(userId, resumeData);
            res.status(201).json(newCv);
        } catch (error: any) {
            console.error("Error creating resume in controller:", error);
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const cvs = await cvService.getUserCvs(userId);
            res.status(200).json(cvs);
        } catch (error: any) {
            res.status(500).json({ error: 'Error al obtener los CVs' });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;

            const cv = await cvService.getCvDetails(id as string, userId);
            res.status(200).json(cv);
        } catch (error: any) {
            if (error.message === 'CV_NO_ENCONTRADO') {
                res.status(404).json({ error: 'El CV solicitado no existe.' });
            } else if (error.message === 'ACCACESO_DENEGADO') {
                res.status(403).json({ error: 'No tienes permisos para ver este CV.' });
            } else {
                res.status(500).json({ error: 'Error interno' });
            }
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;

            await cvService.deleteCv(id as string, userId);
            res.status(200).json({ message: 'CV eliminado correctamente' });
        } catch (error: any) {
            if (error.message === 'CV_NO_ENCONTRADO') {
                res.status(404).json({ error: 'El CV solicitado no existe.' });
            } else if (error.message === 'ACCESO_DENEGADO') {
                res.status(403).json({ error: 'No tienes permisos para eliminar este CV.' });
            } else {
                res.status(500).json({ error: 'Error interno al eliminar el CV' });
            }
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;
            const resumeData = req.body;

            const updated = await cvService.updateCv(id as string, userId, resumeData);
            res.status(200).json(updated);
        } catch (error: any) {
            if (error.message === 'ACCESO_DENEGADO') {
                res.status(403).json({ error: 'No tienes permisos para editar este CV.' });
            } else if (error.message === 'EL_TITULO_ES_OBLIGATORIO') {
                res.status(400).json({ error: 'El título profesional es obligatorio.' });
            } else {
                console.error('Error updating CV:', error);
                res.status(500).json({ error: 'Error interno al actualizar el CV' });
            }
        }
    }
}