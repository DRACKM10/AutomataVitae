"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { useResume } from '@/context/store';
import { toast } from 'sonner';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AICopilotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AICopilotModal({ open, onOpenChange }: AICopilotModalProps) {
  const { resumeData, updatePersonalInfo, updateExperience } = useResume();
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState<string>('');

  // Generamos las opciones disponibles basadas en lo que el usuario ya ha escrito
  const availableSections: { id: string; label: string; text: string; type: 'summary' | 'experience' }[] = [];
  
  if (resumeData.personalInfo.summary && resumeData.personalInfo.summary.trim() !== '') {
    availableSections.push({
      id: 'summary',
      label: 'Resumen Profesional',
      text: resumeData.personalInfo.summary,
      type: 'summary'
    });
  }

  resumeData.experience.forEach(exp => {
    if (exp.description && exp.description.trim() !== '') {
      availableSections.push({
        id: `exp_${exp.id}`,
        label: `Experiencia: ${exp.company || exp.position}`,
        text: exp.description,
        type: 'experience'
      });
    }
  });

  const handleGenerate = async () => {
    if (!selectedSection) {
      toast.error('Selecciona una sección primero');
      return;
    }

    const sectionData = availableSections.find(s => s.id === selectedSection);
    if (!sectionData) return;

    setIsLoading(true);
    setSuggestion(null);
    setOriginalText(sectionData.text);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/ia/improve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          section: sectionData.label,
          text: sectionData.text,
          instructions
        })
      });

      if (!response.ok) {
        throw new Error('Error al conectar con la IA');
      }

      const result = await response.json();
      setSuggestion(result.data.suggestion);
      toast.success('¡Mejora generada!');
    } catch (error) {
      toast.error('Hubo un error al generar la mejora. Intenta de nuevo.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!suggestion || !selectedSection) return;

    const sectionData = availableSections.find(s => s.id === selectedSection);
    if (!sectionData) return;

    if (sectionData.type === 'summary') {
      updatePersonalInfo({ summary: suggestion });
    } else if (sectionData.type === 'experience') {
      const expId = sectionData.id.replace('exp_', '');
      updateExperience(expId, { description: suggestion });
    }

    toast.success('Currículum actualizado con la mejora de IA');
    onOpenChange(false);
    // Reiniciar estado
    setSuggestion(null);
    setInstructions('');
    setSelectedSection('');
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      setSuggestion(null);
      setInstructions('');
      setSelectedSection('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-[#0f1117] border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
            <Sparkles className="w-5 h-5" />
            Copiloto IA
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Selecciona una sección de tu currículum que quieras que la IA corrija y haga más atractiva para reclutadores.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {!suggestion && !isLoading && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ¿Qué sección quieres mejorar?
                </label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Selecciona una sección con texto..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0f1117] border border-gray-200 dark:border-gray-800 shadow-xl z-[100]">
                    {availableSections.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No hay secciones con texto aún
                      </SelectItem>
                    ) : (
                      availableSections.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Instrucciones adicionales (Opcional)
                </label>
                <Textarea
                  placeholder="Ej: Hazlo sonar más profesional y resalta mis habilidades en liderazgo..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="resize-none border-gray-300 dark:border-gray-700 focus-visible:ring-blue-500"
                  rows={2}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!selectedSection || availableSections.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generar Mejora Mágica
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin relative" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
                La IA está redactando la mejora...
              </p>
            </div>
          )}

          {suggestion && !isLoading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Original
                    </span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200 p-4 rounded-lg text-sm min-h-[150px] border border-red-100 dark:border-red-900/50">
                    {originalText}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Sugerencia IA
                    </span>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-200 p-4 rounded-lg text-sm min-h-[150px] border border-green-200 dark:border-green-800/50 font-medium">
                    {suggestion}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSuggestion(null)}
                  className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Rechazar e intentar de nuevo
                </Button>
                <Button 
                  onClick={handleApply}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Aplicar al Currículum
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
