import { pool } from '../config/db';

export const createInterviewSession = async (userId: string, cvAnalysisId: string) => {
  const sql = `
    INSERT INTO interview_sessions (user_id, cv_analysis_id, status, started_at)
    VALUES ($1, $2, 'in_progress', CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const result = await pool.query(sql, [userId, cvAnalysisId]);
  return result.rows[0];
};

export const saveInterviewMessage = async (
  sessionId: string, 
  senderRole: 'user' | 'ai' | 'system', 
  content: string
) => {
  const sql = `
    INSERT INTO interview_messages (session_id, sender_role, content)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(sql, [sessionId, senderRole, content]);
  return result.rows[0];
};

// Obtenemos los últimos N mensajes, pero necesitamos ordenarlos cronológicamente
export const getInterviewHistory = async (sessionId: string, limit: number = 5) => {
  const sql = `
    SELECT * FROM (
      SELECT sender_role, content, created_at
      FROM interview_messages
      WHERE session_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    ) AS recent_messages
    ORDER BY created_at ASC;
  `;
  const result = await pool.query(sql, [sessionId, limit]);
  return result.rows;
};

// Buscamos la síntesis del análisis para no pasarle todo el CV a OpenAI (Ahorro de tokens)
export const getCVAnalysisSummary = async (cvAnalysisId: string) => {
  const sql = `
    SELECT skills_extracted, strengths, weaknesses 
    FROM cv_analysis 
    WHERE id = $1;
  `;
  const result = await pool.query(sql, [cvAnalysisId]);
  return result.rows[0];
};
