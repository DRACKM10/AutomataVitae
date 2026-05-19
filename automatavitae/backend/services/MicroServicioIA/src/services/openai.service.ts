import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeCVText = async (rawText: string) => {
  const prompt = `
Eres un reclutador experto en tecnología y analista de recursos humanos. Analiza el siguiente texto extraído de un currículum vitae y devuelve un análisis estructurado en formato JSON.
El JSON debe tener exactamente la siguiente estructura:
{
  "skills_extracted": ["habilidad1", "habilidad2"],
  "strengths": "Un párrafo detallando los puntos fuertes del candidato basado estrictamente en el texto.",
  "weaknesses": "Un párrafo detallando áreas de mejora u oportunidades que faltan en el CV.",
  "overall_score": 85
}
El overall_score debe ser un número entero del 0 al 100 que refleje la calidad y completitud del perfil.

Texto del CV:
"""
${rawText}
"""
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Usamos el modelo rápido y costo-eficiente de OpenAI
    messages: [
        { role: 'system', content: 'You are an expert technical recruiter that strictly outputs valid JSON matching the requested schema.' },
        { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");
  
  return JSON.parse(content);
};

export const improveCVText = async (section: string = 'general', text: string, instructions: string = '') => {
  const prompt = `
Eres un experto redactor de currículums y reclutador de recursos humanos enfocado en formatos ATS (Applicant Tracking Systems).
Tu tarea es corregir la gramática, mejorar el tono profesional y hacer más atractiva la siguiente sección del currículum de un candidato.

Sección a mejorar: ${section}
Texto original:
"""
${text}
"""

${instructions ? `Instrucciones adicionales del usuario: ${instructions}\n` : ''}
Devuelve ÚNICAMENTE el texto mejorado en texto plano. No agregues saludos, explicaciones, markdown, ni comillas extra. Mantenlo profesional, conciso, medible y orientado a logros o habilidades técnicas.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
        { role: 'system', content: 'You are an expert resume writer. Output ONLY the improved text directly without any markdown formatting.' },
        { role: 'user', content: prompt }
    ],
    temperature: 0.4, // Un poco más de creatividad para redacción
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");
  
  return content.trim();
};

export const generateInterviewGreeting = async (summary: any) => {
  const prompt = `
Eres un reclutador técnico de alto nivel realizando una entrevista.
Acabas de revisar el perfil de este candidato para una vacante acorde a sus habilidades.
Habilidades extraídas de su CV: ${summary.skills_extracted ? summary.skills_extracted.join(', ') : 'No especificadas'}
Fortalezas: ${summary.strengths || 'Desconocidas'}
Áreas a indagar: ${summary.weaknesses || 'Ninguna en particular'}

Tu tarea es dar la bienvenida al candidato, presentarte brevemente como su entrevistador, y hacerle la primera pregunta técnica o de experiencia basándote en sus fortalezas. Sé amigable pero muy profesional y directo. No devuelvas más que el mensaje de saludo y la primera pregunta. No uses etiquetas Markdown innecesarias.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: 'You are an expert technical recruiter.' }, { role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content || 'Hola, bienvenido a la entrevista. Por favor, háblame sobre tu experiencia principal.';
};

export const generateInterviewResponse = async (
  summary: any, 
  history: {sender_role: string, content: string}[], 
  userMessage: string
) => {
  const messages: any[] = [
    { 
      role: 'system', 
      content: `Eres un reclutador técnico experto realizando una entrevista interactiva.
Perfil resumen del candidato:
- Habilidades: ${summary.skills_extracted ? summary.skills_extracted.join(', ') : 'No especificadas'}
- Fortalezas detectadas: ${summary.strengths || 'Ninguna'}
- Áreas de oportunidad (para evaluar): ${summary.weaknesses || 'Ninguna'}

Reglas de la entrevista:
1. Actúa como un humano, mantén la conversación fluida y profesional.
2. Haz solo UNA pregunta o comentario a la vez. No hagas listas largas de preguntas.
3. Evalúa las respuestas del usuario. Si responde bien, valídalo positivamente y pasa al siguiente tema.
4. Si el usuario no sabe algo, sé comprensivo y enfócate en lo que sí sabe.`
    }
  ];

  // Añadir la memoria corta (últimos N mensajes)
  history.forEach(msg => {
    messages.push({ 
      role: msg.sender_role === 'ai' ? 'assistant' : 'user', 
      content: msg.content 
    });
  });

  // Añadir el mensaje actual
  messages.push({ role: 'user', content: userMessage });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7, // Balance ideal entre coherencia y creatividad
  });

  return response.choices[0].message.content || 'Interesante. ¿Podrías elaborar un poco más sobre eso?';
};
