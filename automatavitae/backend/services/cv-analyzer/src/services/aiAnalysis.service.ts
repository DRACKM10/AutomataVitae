import { anthropic, MODEL, MAX_TOKENS } from '../config/anthropic';

// Interfaz para el análisis del CV
interface CVAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  missingKeywords: string[];
  summary: string;
}

export class AIAnalysisService {
  /**
   * Analiza un CV usando Claude AI
   * @param cvText - Texto extraído del CV
   * @returns Análisis estructurado del CV
   */
  async analyzeCV(cvText: string): Promise<CVAnalysis> {
    try {
      // System prompt - Instrucciones para Claude
      const systemPrompt = `Eres un experto reclutador con 15 años de experiencia. 
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
- Score: Calidad general del CV (formato, contenido, claridad)
- Strengths: Aspectos positivos concretos
- Weaknesses: Áreas de mejora específicas
- Suggestions: Acciones concretas para mejorar
- MissingKeywords: Palabras clave importantes que faltan según la industria detectada

Sé específico, constructivo y honesto.`;

      // Llamar a Claude API
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Analiza esta hoja de vida:\n\n${cvText}`
          }
        ],
      });

      // Extraer el contenido de la respuesta
      const content = response.content[0];
      
      if (content.type !== 'text') {
        throw new Error('Respuesta inesperada de la API');
      }

      // Parsear el JSON de la respuesta
      const analysis = this.parseAnalysis(content.text);

      return analysis;

    } catch (error: any) {
      console.error('❌ Error al analizar con IA:', error.message);
      throw new Error('Error al analizar el CV con IA: ' + error.message);
    }
  }

  /**
   * Parsea la respuesta JSON de Claude
   * @param text - Texto de respuesta de Claude
   * @returns Análisis parseado
   */
  private parseAnalysis(text: string): CVAnalysis {
    try {
      // Limpiar posibles markdown code blocks
      let cleanText = text.trim();
      cleanText = cleanText.replace(/```json\n?/g, '');
      cleanText = cleanText.replace(/```\n?/g, '');
      cleanText = cleanText.trim();

      // Parsear JSON
      const parsed = JSON.parse(cleanText);

      // Validar estructura
      if (
        typeof parsed.score !== 'number' ||
        !Array.isArray(parsed.strengths) ||
        !Array.isArray(parsed.weaknesses) ||
        !Array.isArray(parsed.suggestions) ||
        !Array.isArray(parsed.missingKeywords)
      ) {
        throw new Error('Estructura de respuesta inválida');
      }

      return parsed as CVAnalysis;

    } catch (error: any) {
      console.error('❌ Error al parsear análisis:', error.message);
      console.error('Texto recibido:', text);
      throw new Error('Error al procesar la respuesta de la IA');
    }
  }

  /**
   * Genera sugerencias específicas para un paso en la creación de CV
   * @param step - El paso actual (personal, experience, education, skills, preview)
   * @param contextData - String JSON con los datos actuales del formulario
   * @returns Array de sugerencias
   */
  async suggestStep(step: string, contextData: string): Promise<any[]> {
    try {
      const systemPrompt = `Eres un experto reclutador. El usuario está creando su CV en el paso: "${step}".
Aquí están los datos que ha rellenado en este paso:
${contextData}

Analiza los datos y devuelve un array JSON con sugerencias para mejorar. Cada sugerencia debe ser un objeto:
{
  "id": "1",
  "text": "Tu sugerencia aquí",
  "type": "tip" | "improvement" | "warning"
}
Si los datos están vacíos, da consejos generales para este paso. Devuelve MÁXIMO 3 sugerencias. ÚNICAMENTE devuelve JSON válido (Array), sin explicaciones.`;

      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Dame el array JSON de sugerencias ahora.' }],
      });

      const content = response.content[0];
      if (content.type !== 'text') throw new Error('Respuesta inesperada');
      
      let cleanText = content.text.trim();
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error: any) {
      console.error('❌ Error en suggestStep:', error.message);
      return []; // graceful fallback
    }
  }
}