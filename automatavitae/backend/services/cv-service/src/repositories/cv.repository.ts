import { query, pool } from '../config/db.js';

export class CvRepository {
    // Crear el CV completo usando una transacción
    async createFullResume(userId: string, resumeData: any) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Insertar en resumes
            const resumeSql = `
                INSERT INTO resumes (user_id, title, summary, phone, location)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id;
            `;
            const resumeRes = await client.query(resumeSql, [
                userId,
                resumeData.personalInfo.title,
                resumeData.personalInfo.summary,
                resumeData.personalInfo.phone,
                resumeData.personalInfo.location
            ]);
            const resumeId = resumeRes.rows[0].id;

            // 2. Insertar experiencias
            if (resumeData.experience && resumeData.experience.length > 0) {
                for (const exp of resumeData.experience) {
                    const expSql = `
                        INSERT INTO resume_experiences (resume_id, company, position, description, start_date, end_date, is_current)
                        VALUES ($1, $2, $3, $4, $5, $6, $7);
                    `;
                    await client.query(expSql, [
                        resumeId,
                        exp.company,
                        exp.position,
                        exp.description,
                        exp.startDate || null,
                        exp.endDate || null,
                        exp.current || false
                    ]);
                }
            }

            // 3. Insertar educación
            if (resumeData.education && resumeData.education.length > 0) {
                for (const edu of resumeData.education) {
                    const eduSql = `
                        INSERT INTO resume_educations (resume_id, institution, degree, field, start_date, end_date, is_current)
                        VALUES ($1, $2, $3, $4, $5, $6, $7);
                    `;
                    await client.query(eduSql, [
                        resumeId,
                        edu.institution,
                        edu.degree,
                        edu.field,
                        edu.startDate || null,
                        edu.endDate || null,
                        edu.current || false
                    ]);
                }
            }

            // 4. Insertar habilidades
            if (resumeData.skills && resumeData.skills.length > 0) {
                for (const skill of resumeData.skills) {
                    const skillSql = `INSERT INTO resume_skills (resume_id, skill) VALUES ($1, $2);`;
                    await client.query(skillSql, [resumeId, skill]);
                }
            }

            await client.query('COMMIT');
            return { id: resumeId, ...resumeData };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findByUserId(userId: string) {
        const sql = `SELECT id, title, is_public, created_at, updated_at FROM resumes WHERE user_id = $1 ORDER BY updated_at DESC;`;
        const result = await query(sql, [userId]);
        return result.rows;
    }

    async findById(resumeId: string) {
        const sql = `SELECT * FROM resumes WHERE id = $1;`;
        const result = await query(sql, [resumeId]);
        return result.rows[0] || null;
    }
}