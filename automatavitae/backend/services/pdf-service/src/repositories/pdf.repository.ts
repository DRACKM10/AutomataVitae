import { pool } from '../config/db';
import { PdfRecord, CreatePdfRecordDto } from '../types/pdf.types';

export class PdfRepository {

    /**
     * Crea un nuevo registro de PDF en la BD
     */
    async create(dto: CreatePdfRecordDto): Promise<PdfRecord> {
        const { rows } = await pool.query<PdfRecord>(
            `INSERT INTO pdf_records (user_id, type, template, filename, storage_url, metadata)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [dto.userId, dto.type, dto.template ?? null, dto.filename ?? null, dto.storageUrl ?? null, dto.metadata ?? null]
        );
        return rows[0];
    }

    /**
     * Obtiene todos los PDFs generados por un usuario
     */
    async findByUserId(userId: string): Promise<PdfRecord[]> {
        const { rows } = await pool.query<PdfRecord>(
            `SELECT * FROM pdf_records
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );
        return rows;
    }

    /**
     * Obtiene un PDF por su ID
     */
    async findById(id: string): Promise<PdfRecord | null> {
        const { rows } = await pool.query<PdfRecord>(
            `SELECT * FROM pdf_records WHERE id = $1`,
            [id]
        );
        return rows[0] ?? null;
    }

    /**
     * Elimina un registro de PDF
     */
    async delete(id: string, userId: string): Promise<boolean> {
        const { rowCount } = await pool.query(
            `DELETE FROM pdf_records WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );
        return (rowCount ?? 0) > 0;
    }

    /**
     * Cuenta cuántos PDFs ha generado un usuario (útil para límites de plan)
     */
    async countByUserId(userId: string): Promise<number> {
        const { rows } = await pool.query(
            `SELECT COUNT(*) as total FROM pdf_records WHERE user_id = $1`,
            [userId]
        );
        return parseInt(rows[0].total, 10);
    }
}
