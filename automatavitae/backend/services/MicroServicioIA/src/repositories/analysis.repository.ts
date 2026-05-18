import { pool } from '../config/db';

export const saveCVAnalysis = async (
  userId: string,
  rawText: string,
  skillsExtracted: string[],
  strengths: string,
  weaknesses: string,
  overallScore: number
) => {
  const sql = `
    INSERT INTO cv_analysis (user_id, raw_text, skills_extracted, strengths, weaknesses, overall_score)
    VALUES ($1, $2, $3::jsonb, $4, $5, $6)
    RETURNING *;
  `;
  const result = await pool.query(sql, [
    userId,
    rawText,
    JSON.stringify(skillsExtracted),
    strengths,
    weaknesses,
    overallScore,
  ]);
  return result.rows[0];
};
