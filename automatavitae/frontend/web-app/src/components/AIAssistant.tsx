"use client";
import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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

export const AIAssistant: React.FC<AIAssistantProps> = ({ step, context }) => {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/cv/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step, context })
        });
        
        if (!response.ok) throw new Error('Error de red');
        const data = await response.json();
        
        if (isMounted) {
          if (data.success && Array.isArray(data.suggestions)) {
            setSuggestions(data.suggestions);
          } else {
            setSuggestions([]);
          }
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        if (isMounted) setSuggestions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSuggestions();

    return () => { isMounted = false; };
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
