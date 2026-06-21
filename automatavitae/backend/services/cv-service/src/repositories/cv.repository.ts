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
                INSERT INTO resumes (user_id, title, summary, phone, location, template_id, full_name, email)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id;
            `;
            const resumeRes = await client.query(resumeSql, [
                userId,
                resumeData.personalInfo.title,
                resumeData.personalInfo.summary,
                resumeData.personalInfo.phone,
                resumeData.personalInfo.location,
                resumeData.templateId || 'automata_standard',
                resumeData.personalInfo.fullName || '',
                resumeData.personalInfo.email || ''
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
        const sql = `SELECT id, title, is_public, template_id, created_at, updated_at FROM resumes WHERE user_id = $1 ORDER BY updated_at DESC;`;
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

    async deleteResume(resumeId: string, userId: string) {
        // DELETE cascade should be handled by the DB if foreign keys have ON DELETE CASCADE
        // If not, we should delete from child tables first. Let's assume standard cascade or manual deletion.
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Delete dependencies first just in case there's no CASCADE
            await client.query(`DELETE FROM resume_skills WHERE resume_id = $1`, [resumeId]);
            await client.query(`DELETE FROM resume_educations WHERE resume_id = $1`, [resumeId]);
            await client.query(`DELETE FROM resume_experiences WHERE resume_id = $1`, [resumeId]);
            
            // Delete the main resume only if it belongs to the user
            const result = await client.query(`DELETE FROM resumes WHERE id = $1 AND user_id = $2 RETURNING id`, [resumeId, userId]);
            
            await client.query('COMMIT');
            return result.rowCount ? result.rowCount > 0 : false;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateFullResume(resumeId: string, userId: string, resumeData: any) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Verificar que el CV pertenece al usuario
            const ownerCheck = await client.query(`SELECT id FROM resumes WHERE id = $1 AND user_id = $2`, [resumeId, userId]);
            if (ownerCheck.rowCount === 0) throw new Error('ACCESO_DENEGADO');

            // 2. Actualizar el registro principal
            await client.query(
                `UPDATE resumes SET title=$1, summary=$2, phone=$3, location=$4, template_id=$5, full_name=$6, email=$7, updated_at=NOW() WHERE id=$8`,
                [
                    resumeData.personalInfo.title,
                    resumeData.personalInfo.summary,
                    resumeData.personalInfo.phone,
                    resumeData.personalInfo.location,
                    resumeData.templateId || 'automata_standard',
                    resumeData.personalInfo.fullName || '',
                    resumeData.personalInfo.email || '',
                    resumeId
                ]
            );

            // 3. Reemplazar experiencias
            await client.query(`DELETE FROM resume_experiences WHERE resume_id = $1`, [resumeId]);
            if (resumeData.experience && resumeData.experience.length > 0) {
                for (const exp of resumeData.experience) {
                    await client.query(
                        `INSERT INTO resume_experiences (resume_id, company, position, description, start_date, end_date, is_current) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                        [resumeId, exp.company, exp.position, exp.description, formatDateForDb(exp.startDate), formatDateForDb(exp.endDate), exp.current || false]
                    );
                }
            }

            // 4. Reemplazar educación
            await client.query(`DELETE FROM resume_educations WHERE resume_id = $1`, [resumeId]);
            if (resumeData.education && resumeData.education.length > 0) {
                for (const edu of resumeData.education) {
                    await client.query(
                        `INSERT INTO resume_educations (resume_id, institution, degree, field, start_date, end_date, is_current) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
                        [resumeId, edu.institution, edu.degree, edu.field, formatDateForDb(edu.startDate), formatDateForDb(edu.endDate), edu.current || false]
                    );
                }
            }

            // 5. Reemplazar habilidades
            await client.query(`DELETE FROM resume_skills WHERE resume_id = $1`, [resumeId]);
            if (resumeData.skills && resumeData.skills.length > 0) {
                for (const skill of resumeData.skills) {
                    await client.query(`INSERT INTO resume_skills (resume_id, skill) VALUES ($1,$2)`, [resumeId, skill]);
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
}