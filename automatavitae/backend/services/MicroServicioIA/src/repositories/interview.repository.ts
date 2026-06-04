import { supabase } from '../config/supabase';

export const createInterviewSession = async (userId: string, cvAnalysisId: string) => {
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert([
      {
        user_id: userId,
        cv_analysis_id: cvAnalysisId,
        status: 'in_progress',
        // started_at is usually set by default in DB, or we can leave it out to use DB default
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const saveInterviewMessage = async (
  sessionId: string, 
  senderRole: 'user' | 'ai' | 'system', 
  content: string
) => {
  const { data, error } = await supabase
    .from('interview_messages')
    .insert([
      {
        session_id: sessionId,
        sender_role: senderRole,
        content: content
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Obtenemos los últimos N mensajes, pero necesitamos ordenarlos cronológicamente
export const getInterviewHistory = async (sessionId: string, limit: number = 5) => {
  const { data, error } = await supabase
    .from('interview_messages')
    .select('sender_role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Los obtenemos descendentes por el límite, y luego los invertimos para mostrarlos cronológicos
  return data.reverse();
};

// Buscamos la síntesis del análisis para no pasarle todo el CV a OpenAI (Ahorro de tokens)
export const getCVAnalysisSummary = async (cvAnalysisId: string) => {
  const { data, error } = await supabase
    .from('cv_analysis')
    .select('skills_extracted, strengths, weaknesses')
    .eq('id', cvAnalysisId)
    .single();

  if (error) throw error;
  return data;
};
