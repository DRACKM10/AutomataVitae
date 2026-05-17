import { query, pool } from '../config/db.js';

function formatDateForDb(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    if (/^\d{4}-\d{2}$/.test(dateStr)) return `${dateStr}-01`;
    return dateStr;
}

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
                        formatDateForDb(exp.startDate),
                        formatDateForDb(exp.endDate),
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
                        formatDateForDb(edu.startDate),
                        formatDateForDb(edu.endDate),
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
        const cv = result.rows[0] || null;
        if (!cv) return null;

        // Fetch associated experiences
        const expSql = `SELECT * FROM resume_experiences WHERE resume_id = $1 ORDER BY start_date DESC;`;
        const expRes = await query(expSql, [resumeId]);
        cv.experience = expRes.rows;

        // Fetch associated educations
        const eduSql = `SELECT * FROM resume_educations WHERE resume_id = $1 ORDER BY start_date DESC;`;
        const eduRes = await query(eduSql, [resumeId]);
        cv.education = eduRes.rows;

        // Fetch associated skills
        const skillSql = `SELECT skill FROM resume_skills WHERE resume_id = $1;`;
        const skillRes = await query(skillSql, [resumeId]);
        cv.skills = skillRes.rows.map(r => r.skill);

        return cv;
    }
}