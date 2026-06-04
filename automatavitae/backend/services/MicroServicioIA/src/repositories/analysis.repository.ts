import { supabase } from '../config/supabase';

export const saveCVAnalysis = async (
  userId: string,
  rawText: string,
  skillsExtracted: string[],
  strengths: string,
  weaknesses: string,
  overallScore: number
) => {
  const { data, error } = await supabase
    .from('cv_analysis')
    .insert([
      {
        user_id: userId,
        raw_text: rawText,
        skills_extracted: skillsExtracted,
        strengths,
        weaknesses,
        overall_score: overallScore,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error guardando análisis en Supabase:', error);
    throw new Error('Error guardando análisis en base de datos.');
  }

  return data;
};
