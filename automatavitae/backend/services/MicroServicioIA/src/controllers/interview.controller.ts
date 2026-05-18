import { Request, Response } from 'express';
import { 
  createInterviewSession, 
  saveInterviewMessage, 
  getCVAnalysisSummary, 
  getInterviewHistory 
} from '../repositories/interview.repository';
import { 
  generateInterviewGreeting, 
  generateInterviewResponse 
} from '../services/openai.service';

export const startInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cv_analysis_id, user_id } = req.body;
    if (!cv_analysis_id || !user_id) {
      res.status(400).json({ error: 'Missing cv_analysis_id or user_id' });
      return;
    }

    const summary = await getCVAnalysisSummary(cv_analysis_id);
    if (!summary) {
      res.status(404).json({ error: 'Análisis de CV no encontrado.' });
      return;
    }

    // 1. Crear la sesión en la base de datos
    const session = await createInterviewSession(user_id, cv_analysis_id);
    
    // 2. Generar el primer mensaje (el saludo)
    const greetingText = await generateInterviewGreeting(summary);
    
    // 3. Guardar el saludo en la BD y devolverlo
    const savedMessage = await saveInterviewMessage(session.id, 'ai', greetingText);

    res.status(201).json({
      session,
      message: savedMessage
    });
  } catch (error: any) {
    console.error('Error starting interview:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { session_id, cv_analysis_id, content } = req.body;
    if (!session_id || !cv_analysis_id || !content) {
      res.status(400).json({ error: 'Missing session_id, cv_analysis_id or content' });
      return;
    }

    // 1. Guardamos el mensaje del usuario en la BD inmediatamente
    await saveInterviewMessage(session_id, 'user', content);
    
    // 2. Recuperamos el contexto y la memoria
    const summary = await getCVAnalysisSummary(cv_analysis_id);
    const history = await getInterviewHistory(session_id, 5); // Límite de 5 mensajes para ahorrar tokens

    // 3. Generamos la respuesta de la IA
    const aiResponseText = await generateInterviewResponse(summary, history, content);
    
    // 4. Guardamos la respuesta de la IA en la BD
    const savedAiMessage = await saveInterviewMessage(session_id, 'ai', aiResponseText);

    res.status(200).json({
      message: savedAiMessage
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
