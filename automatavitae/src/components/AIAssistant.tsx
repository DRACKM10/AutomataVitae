import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { motion, AnimatePresence } from 'motion/react';

interface Suggestion {
  id: string;
  text: string;
  type: 'improvement' | 'tip' | 'warning';
}

interface AIAssistantProps {
  step: string;
  context?: string;
}

// Simulación de sugerencias según el paso
const getSuggestionsForStep = (step: string, context?: string): Suggestion[] => {
  const suggestions: Record<string, Suggestion[]> = {
    personal: [
      {
        id: '1',
        text: 'Usa un título profesional que refleje tu objetivo de carrera, como "Desarrollador Full Stack" o "Diseñador UX/UI".',
        type: 'tip',
      },
      {
        id: '2',
        text: 'El resumen profesional debe ser conciso (2-3 líneas) y destacar tus principales logros y habilidades.',
        type: 'improvement',
      },
      {
        id: '3',
        text: 'Asegúrate de que tu correo electrónico sea profesional.',
        type: 'tip',
      },
    ],
    experience: [
      {
        id: '1',
        text: 'Cuantifica tus logros con números: "Aumenté las ventas en un 30%" es más impactante que "Mejoré las ventas".',
        type: 'improvement',
      },
      {
        id: '2',
        text: 'Usa verbos de acción al inicio de cada punto: "Desarrollé", "Implementé", "Lideré", etc.',
        type: 'tip',
      },
      {
        id: '3',
        text: 'Enfócate en resultados y logros, no solo en responsabilidades.',
        type: 'improvement',
      },
    ],
    education: [
      {
        id: '1',
        text: 'Lista tus estudios en orden cronológico inverso (más reciente primero).',
        type: 'tip',
      },
      {
        id: '2',
        text: 'Incluye certificaciones relevantes o cursos especializados que complementen tu formación.',
        type: 'improvement',
      },
    ],
    skills: [
      {
        id: '1',
        text: 'Agrupa tus habilidades por categorías: técnicas, blandas, idiomas, herramientas, etc.',
        type: 'tip',
      },
      {
        id: '2',
        text: 'Incluye solo habilidades relevantes para el puesto que buscas. Evita listar demasiadas habilidades básicas.',
        type: 'improvement',
      },
      {
        id: '3',
        text: 'Sé honesto sobre tu nivel en cada habilidad. Los reclutadores pueden verificarlo en entrevistas.',
        type: 'warning',
      },
    ],
    preview: [
      {
        id: '1',
        text: 'Revisa que no haya errores ortográficos o gramaticales antes de descargar.',
        type: 'warning',
      },
      {
        id: '2',
        text: 'Tu CV debe caber idealmente en una página, máximo dos si tienes mucha experiencia.',
        type: 'tip',
      },
    ],
  };

  return suggestions[step] || [];
};

export const AIAssistant: React.FC<AIAssistantProps> = ({ step, context }) => {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simular carga de AI (skeleton screen)
    const timer = setTimeout(() => {
      setSuggestions(getSuggestionsForStep(step, context));
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [step, context]);

  const getIconColor = (type: string) => {
    switch (type) {
      case 'improvement':
        return 'text-blue-600';
      case 'tip':
        return 'text-green-600';
      case 'warning':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">Asistente Inteligente</span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {loading ? (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/6" />
                  </div>
                </>
              ) : (
                suggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-3 p-3 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <Sparkles className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getIconColor(suggestion.type)}`} />
                    <p className="text-sm text-gray-700 leading-relaxed">{suggestion.text}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
