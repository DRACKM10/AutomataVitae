const MICROSERVICIO_IA_URL = process.env.MICROSERVICIO_IA_URL || 'http://localhost:5002';

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
   * Analiza un CV a través del MicroServicioIA
   * @param cvText - Texto extraído del CV
   * @returns Análisis estructurado del CV
   */
  async analyzeCV(cvText: string): Promise<CVAnalysis> {
    try {
      console.log(`[AIAnalysisService] Conectando a MicroServicioIA en ${MICROSERVICIO_IA_URL}/api/cv-analyzer/analyze ...`);
      
      const response = await fetch(`${MICROSERVICIO_IA_URL}/api/cv-analyzer/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw_text: cvText })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del MicroServicioIA: ${response.status} - ${errorText}`);
      }

      const analysis = await response.json() as CVAnalysis;
      return analysis;

    } catch (error: any) {
      console.error('❌ Error al analizar con IA:', error.message);
      throw new Error('Error al analizar el CV con IA: ' + error.message);
    }
  }

  /**
   * Genera sugerencias específicas para un paso en la creación de CV
   * @param step - El paso actual (personal, experience, education, skills, preview)
   * @param contextData - String JSON con los datos actuales del formulario
   * @returns Array de sugerencias
   */
  async suggestStep(step: string, contextData: string): Promise<any[]> {
    const defaultSuggestions: Record<string, any[]> = {
      personal: [
        {
          id: 'p1',
          text: 'Asegúrate de agregar un enlace a tu LinkedIn o portafolio personal para mayor visibilidad.',
          type: 'tip'
        },
        {
          id: 'p2',
          text: 'El título profesional debe ser conciso y alinearse con las vacantes a las que apuntas.',
          type: 'improvement'
        },
        {
          id: 'p3',
          text: 'Evita incluir datos demasiado sensibles como estado civil o dirección exacta.',
          type: 'warning'
        }
      ],
      experience: [
        {
          id: 'ex1',
          text: "Usa verbos de acción fuertes al inicio de cada logro (ej: 'Lideré', 'Diseñé', 'Optimicé').",
          type: 'tip'
        },
        {
          id: 'ex2',
          text: 'Intenta cuantificar tus logros con porcentajes o números reales siempre que sea posible.',
          type: 'improvement'
        },
        {
          id: 'ex3',
          text: 'No dejes brechas de tiempo inexplicables en tu historial laboral reciente.',
          type: 'warning'
        }
      ],
      education: [
        {
          id: 'ed1',
          text: 'Destaca cursos extracurriculares o certificaciones relevantes si tu educación formal es limitada.',
          type: 'tip'
        },
        {
          id: 'ed2',
          text: 'Incluye promedio de notas o menciones de honor únicamente si son sobresalientes.',
          type: 'improvement'
        },
        {
          id: 'ed3',
          text: 'Asegúrate de colocar primero tu título académico más reciente.',
          type: 'warning'
        }
      ],
      skills: [
        {
          id: 's1',
          text: 'Agrupa tus habilidades en categorías (ej: Técnicas, Blandas, Herramientas) en tu mente al seleccionarlas.',
          type: 'tip'
        },
        {
          id: 's2',
          text: 'Prioriza las tecnologías requeridas por el mercado actual en tu sector.',
          type: 'improvement'
        },
        {
          id: 's3',
          text: "Evita listar habilidades demasiado básicas como 'Navegación web' o 'Uso de correo'.",
          type: 'warning'
        }
      ],
      preview: [
        {
          id: 'pr1',
          text: 'Revisa dos veces la ortografía y gramática; una simple errata puede descartar tu CV.',
          type: 'tip'
        },
        {
          id: 'pr2',
          text: 'Asegúrate de que la hoja de vida no supere las dos páginas de extensión.',
          type: 'improvement'
        },
        {
          id: 'pr3',
          text: 'Verifica que tus enlaces (LinkedIn, Portafolio) funcionen correctamente.',
          type: 'warning'
        }
      ]
    };

    try {
      console.log(`[AIAnalysisService] Conectando a MicroServicioIA en ${MICROSERVICIO_IA_URL}/api/cv-analyzer/suggest para paso ${step} ...`);

      let parsedContext = {};
      try {
        parsedContext = JSON.parse(contextData || '{}');
      } catch (e) {
        console.warn('Advertencia al parsear contextData:', e);
      }

      const response = await fetch(`${MICROSERVICIO_IA_URL}/api/cv-analyzer/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ step, context: parsedContext })
      });

      if (!response.ok) {
        throw new Error(`Error del MicroServicioIA: ${response.status}`);
      }

      const suggestions = await response.json() as any[];
      return suggestions;

    } catch (error: any) {
      console.error('❌ Error en suggestStep usando MicroServicioIA:', error.message);
      // Retornar sugerencias por defecto como fallback en caso de error
      return defaultSuggestions[step] || defaultSuggestions.personal;
    }
  }
}