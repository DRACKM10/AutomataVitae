import { Request, Response } from 'express';
import { PdfGeneratorService } from '../services/pdf.generator.service';
import { PdfRepository } from '../repositories/pdf.repository';
import { GenerateCvPdfDto, GenerateAnalysisReportDto } from '../types/pdf.types';

const generatorService = new PdfGeneratorService();
const pdfRepository = new PdfRepository();

export class PdfController {

    /**
     * POST /api/v1/pdf/generate/cv
     * Genera un PDF de CV y lo devuelve como descarga directa.
     * También guarda el registro en la BD.
     */
    generateCv = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto: GenerateCvPdfDto = req.body;

            if (!dto.userId || !dto.resumeData?.personalInfo) {
                res.status(400).json({ success: false, message: 'userId y resumeData son requeridos' });
                return;
            }

            // Generar el buffer del PDF
            const pdfBuffer = await generatorService.generateCvPdf(dto);

            // Nombre del archivo
            const filename = `cv_${dto.resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

            // Guardar registro en Neon
            const record = await pdfRepository.create({
                userId: dto.userId,
                type: 'cv',
                template: dto.template ?? 'default',
                filename,
                metadata: dto.resumeData as unknown as Record<string, any>
            });

            // Enviar PDF como descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('X-Pdf-Record-Id', record.id);
            res.send(pdfBuffer);

        } catch (error) {
            console.error('❌ Error generando CV PDF:', error);
            res.status(500).json({ success: false, message: 'Error al generar el PDF', error: (error as Error).message });
        }
    };

    /**
     * POST /api/v1/pdf/generate/analysis-report
     * Genera un PDF de reporte de análisis de IA.
     */
    generateAnalysisReport = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto: GenerateAnalysisReportDto = req.body;

            if (!dto.userId || !dto.analysisData) {
                res.status(400).json({ success: false, message: 'userId y analysisData son requeridos' });
                return;
            }

            const pdfBuffer = await generatorService.generateAnalysisReportPdf(dto);
            const filename = `analisis_cv_${Date.now()}.pdf`;

            const record = await pdfRepository.create({
                userId: dto.userId,
                type: 'analysis_report',
                filename,
                metadata: dto.analysisData as unknown as Record<string, any>
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('X-Pdf-Record-Id', record.id);
            res.send(pdfBuffer);

        } catch (error) {
            console.error('❌ Error generando reporte PDF:', error);
            res.status(500).json({ success: false, message: 'Error al generar el reporte', error: (error as Error).message });
        }
    };

    /**
     * GET /api/v1/pdf/history/:userId
     * Devuelve el historial de PDFs generados por un usuario.
     */
    getHistory = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.userId as string;

            if (!userId) {
                res.status(400).json({ success: false, message: 'userId es requerido' });
                return;
            }

            const records = await pdfRepository.findByUserId(userId);

            res.json({
                success: true,
                data: records,
                total: records.length
            });

        } catch (error) {
            console.error('❌ Error obteniendo historial:', error);
            res.status(500).json({ success: false, message: 'Error al obtener el historial' });
        }
    };

    /**
     * DELETE /api/v1/pdf/:id
     * Elimina un registro de PDF de la BD (no borra archivo si hay storage externo).
     */
    deleteRecord = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id as string;
            const { userId } = req.body;

            if (!id || !userId) {
                res.status(400).json({ success: false, message: 'id y userId son requeridos' });
                return;
            }

            const deleted = await pdfRepository.delete(id, userId);

            if (!deleted) {
                res.status(404).json({ success: false, message: 'Registro no encontrado o no pertenece a este usuario' });
                return;
            }

            res.json({ success: true, message: 'Registro eliminado correctamente' });

        } catch (error) {
            console.error('❌ Error eliminando registro:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar el registro' });
        }
    };
}
