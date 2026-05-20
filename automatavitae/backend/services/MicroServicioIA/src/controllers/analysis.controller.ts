import { Request, Response } from 'express';
import { analyzeCVText, improveCVText, analyzeCVForAnalyzer, suggestStepForAnalyzer } from '../services/openai.service';
import { saveCVAnalysis } from '../repositories/analysis.repository';

export const analyzeCV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, raw_text } = req.body;

    // Validación básica
    if (!user_id || !raw_text) {
      res.status(400).json({ error: 'user_id and raw_text are required fields.' });
      return;
    }

    // 1. Enviar el texto extraído a OpenAI para ser analizado
    const aiResult = await analyzeCVText(raw_text);

    // 2. Guardar el análisis estructurado en nuestra base de datos PostgreSQL
    const savedAnalysis = await saveCVAnalysis(
      user_id,
      raw_text,
      aiResult.skills_extracted || [],
      aiResult.strengths || '',
      aiResult.weaknesses || '',
      aiResult.overall_score || 0
    );

    // 3. Retornar la respuesta al cliente/frontend
    res.status(201).json({
      message: 'CV analyzed successfully',
      data: savedAnalysis,
    });
  } catch (error: any) {
    console.error('Error analyzing CV:', error);
    res.status(500).json({ error: 'Internal server error during AI analysis', details: error.message });
  }
};

export const improveCV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section, text, instructions } = req.body;
    
    if (!text) {
      res.status(400).json({ error: 'El campo "text" es obligatorio para mejorar el currículum.' });
      return;
    }

    const suggestion = await improveCVText(section, text, instructions);

    res.status(200).json({
      message: 'Texto mejorado generado exitosamente',
      data: {
        original: text,
        suggestion
      }
    });
  } catch (error: any) {
    console.error('Error improving CV text:', error);
    res.status(500).json({ error: 'Error interno del servidor al intentar mejorar el texto', details: error.message });
  }
};

export const analyzeCVForAnalyzerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { raw_text } = req.body;

    if (!raw_text) {
      res.status(400).json({ error: 'raw_text is a required field.' });
      return;
    }

    const aiResult = await analyzeCVForAnalyzer(raw_text);

    res.status(200).json(aiResult);
  } catch (error: any) {
    console.error('Error in analyzeCVForAnalyzerController:', error);
    res.status(500).json({ error: 'Error analyzing CV text', details: error.message });
  }
};

export const suggestStepForAnalyzerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { step, context } = req.body;

    if (!step) {
      res.status(400).json({ error: 'step is a required field.' });
      return;
    }

    const suggestions = await suggestStepForAnalyzer(step, JSON.stringify(context || {}));

    res.status(200).json(suggestions);
  } catch (error: any) {
    console.error('Error in suggestStepForAnalyzerController:', error);
    res.status(500).json({ error: 'Error generating step suggestions', details: error.message });
  }
};
