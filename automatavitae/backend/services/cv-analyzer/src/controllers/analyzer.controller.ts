import { Request, Response, NextFunction } from 'express';
import { CVParserService } from '../services/cvParser.service';
import { AIAnalysisService } from '../services/aiAnalysis.service';
import { supabase } from '../config/supabase';

const cvParser = new CVParserService();
const aiAnalysis = new AIAnalysisService();

/**
 * Controller para subir y analizar un CV
 */
export const uploadAndAnalyze = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Verificar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'No se recibió ningún archivo',
        }
      });
    }

    console.log(' Archivo recibido:', req.file.originalname);
    console.log(' Tamaño:', (req.file.size / 1024).toFixed(2), 'KB');

    // 2. Extraer texto del PDF
    console.log(' Extrayendo texto del PDF...');
    const parsedCV = await cvParser.extractText(req.file.buffer);
    console.log(' Texto extraído:', parsedCV.text.length, 'caracteres');
    console.log(' Páginas:', parsedCV.pageCount);

    // 3. Analizar con IA
    console.log(' Analizando con IA...');
    const analysis = await aiAnalysis.analyzeCV(parsedCV.text);
    console.log(' Análisis completado');

    // 4. Guardar en Supabase
    console.log(' Guardando en base de datos...');
    const { data: savedAnalysis, error: dbError } = await supabase
      .from('cv_analyses')
      .insert({
        // user_id: null, // Por ahora sin autenticación
        file_name: req.file.originalname,
        file_size: req.file.size,
        page_count: parsedCV.pageCount,
        score: analysis.score,
        summary: analysis.summary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
        missing_keywords: analysis.missingKeywords,
        extracted_text: parsedCV.text,
      })
      .select()
      .single();

    if (dbError) {
      console.error(' Error al guardar en BD:', dbError);
      // No detenemos el proceso, solo loggeamos el error
    } else {
      console.log(' Análisis guardado con ID:', savedAnalysis.id);
    }

    // 5. Retornar resultado
    res.json({
      success: true,
      data: {
        id: savedAnalysis?.id,
        file: {
          name: req.file.originalname,
          size: req.file.size,
          pages: parsedCV.pageCount,
        },
        analysis: {
          score: analysis.score,
          summary: analysis.summary,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          suggestions: analysis.suggestions,
          missingKeywords: analysis.missingKeywords,
        }
      }
    });

  } catch (error) {
    next(error); // Pasar al middleware de errores
  }
};

/**
 * Controller para obtener sugerencias de un paso del CV
 */
export const suggestForStep = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { step, context } = req.body;
    if (!step) {
      return res.status(400).json({ error: 'Falta el paso (step)' });
    }
    
    console.log(` Generando sugerencias para paso: ${step}...`);
    const suggestions = await aiAnalysis.suggestStep(step, context || '{}');
    console.log(` ${suggestions.length} sugerencias generadas.`);
    
    res.json({ success: true, suggestions });
  } catch (error) {
    next(error);
  }
};