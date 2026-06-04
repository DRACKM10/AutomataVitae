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

export const analyzeCVForAnalyzer = async (rawText: string) => {
  const prompt = `
Eres un experto reclutador con 15 años de experiencia. 
Tu trabajo es analizar hojas de vida y proporcionar feedback constructivo y específico.

Analiza la siguiente hoja de vida y responde ÚNICAMENTE con un objeto JSON (sin markdown, sin comentarios) con esta estructura exacta:

{
  "score": número del 1 al 10,
  "summary": "resumen breve de 2-3 líneas sobre el candidato",
  "strengths": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "weaknesses": ["debilidad 1", "debilidad 2", "debilidad 3"],
  "suggestions": ["sugerencia concreta 1", "sugerencia concreta 2", "sugerencia concreta 3"],
  "missingKeywords": ["keyword 1", "keyword 2", "keyword 3"]
}

Criterios de evaluación:
- score: Calidad general del CV (formato, contenido, claridad)
- strengths: Aspectos positivos concretos
- weaknesses: Áreas de mejora específicas
- suggestions: Acciones concretas para mejorar
- missingKeywords: Palabras clave importantes que faltan según la industria detectada

Sé específico, constructivo y honesto.

Texto de la hoja de vida a analizar:
"""
${rawText}
"""
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert resume analyzer that strictly outputs valid JSON matching the requested schema.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");
  
  return JSON.parse(content);
};

export const suggestStepForAnalyzer = async (step: string, contextData: string) => {
  const prompt = `
Eres un experto reclutador. El usuario está creando su CV en el paso: "${step}".
Aquí están los datos que ha rellenado en este paso:
${contextData}

Analiza los datos y devuelve un objeto JSON con una propiedad "suggestions" que contenga un array de sugerencias para mejorar. Cada sugerencia debe ser un objeto con esta estructura:
{
  "id": "un_id_unico_corto",
  "text": "Tu sugerencia aquí",
  "type": "tip" | "improvement" | "warning"
}
Si los datos están vacíos o incompletos, da consejos generales para este paso. Devuelve MÁXIMO 3 sugerencias.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert resume writer. Output ONLY a valid JSON object with a "suggestions" key.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");
  
  const parsed = JSON.parse(content);
  return parsed.suggestions || parsed;
};

export const extractStructuredCV = async (rawText: string) => {
  const prompt = `
Eres un experto reclutador y analista de datos. Tu tarea es leer el texto extraído de un currículum vitae en formato PDF y convertirlo EXACTAMENTE a la siguiente estructura JSON. Debes intentar rellenar la mayor cantidad de información posible basándote en el texto.

Estructura JSON requerida:
{
  "personalInfo": {
    "fullName": "Nombre completo",
    "email": "correo@ejemplo.com",
    "phone": "Teléfono",
    "location": "Ciudad, País",
    "title": "Título profesional principal (ej: Software Engineer)",
    "summary": "Un resumen profesional extraído o generado a partir de la experiencia"
  },
  "experience": [
    {
      "id": "exp_1",
      "company": "Nombre empresa",
      "position": "Cargo",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM o 'Presente'",
      "current": false,
      "description": "Descripción de logros y responsabilidades"
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "institution": "Universidad o Instituto",
      "degree": "Título obtenido",
      "field": "Campo de estudio",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM o 'Presente'",
      "current": false
    }
  ],
  "skills": ["Habilidad 1", "Habilidad 2", "Habilidad 3"]
}

Reglas:
1. Si un dato no existe en el texto, déjalo como string vacío "" (o false para booleanos, o un array vacío [] para listas).
2. Genera IDs únicos cortos (ej: exp_1, edu_1) para los items de experiencia y educación.
3. El resultado debe ser un JSON válido, sin explicaciones ni markdown adicional.

Texto del currículum:
"""
${rawText}
"""
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert data extractor that strictly outputs valid JSON matching the requested schema.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");
  
  return JSON.parse(content);
};

