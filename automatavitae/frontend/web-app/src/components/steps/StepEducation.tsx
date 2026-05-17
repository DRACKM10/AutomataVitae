"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResume, Education } from '@/context/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AIAssistant } from '@/components/AIAssistant';
import { ArrowRight, Plus, Trash2, GraduationCap, Calendar as CalendarIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'motion/react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export const StepEducation: React.FC = () => {
  const router = useRouter();
  const { resumeData, addEducation, deleteEducation } = useResume();
  const [isAdding, setIsAdding] = useState(resumeData.education.length === 0);
  const [currentEdu, setCurrentEdu] = useState<Education>({
    id: '',
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false,
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return 'Seleccionar fecha';
    const [year, month] = dateStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 2);
    const label = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const handleAddEducation = () => {
    if (currentEdu.institution && currentEdu.degree && currentEdu.startDate) {
      const newEdu = {
        ...currentEdu,
        id: Date.now().toString(),
      };
      addEducation(newEdu);
      setCurrentEdu({
        id: '',
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false,
      });
      setIsAdding(false);
    }
  };

  const handleNext = () => {
    if (isAdding && currentEdu.institution) {
      handleAddEducation();
    }
    router.push('/create/skills');
  };

  const handleSkip = () => {
    router.push('/create/skills');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-lg shadow-xl p-6 border border-slate-800"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Educación y Formación</h2>
        <p className="text-slate-400 mb-6">
          Incluye tu formación académica, certificaciones y cursos relevantes.
        </p>

        {/* Lista de educación agregada */}
        {resumeData.education.length > 0 && (
          <div className="space-y-3 mb-6">
            {resumeData.education.map((edu) => {
              const formatDate = (dateStr: string) => {
                if (!dateStr) return '';
                const parts = dateStr.split('-');
                if (parts.length !== 2) return dateStr;
                const [year, month] = parts;
                const months = [
                  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
                ];
                const monthIdx = parseInt(month, 10) - 1;
                const monthName = months[monthIdx] || month;
                return `${monthName} ${year}`;
              };
              return (
                <div
                  key={edu.id}
                  className="p-4 bg-blue-950/40 border border-blue-900/50 rounded-md flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      <h4 className="font-semibold text-white">{edu.degree}</h4>
                    </div>
                    <p className="text-sm text-blue-400 font-medium">{edu.institution}</p>
                    {edu.field && <p className="text-sm text-slate-300">{edu.field}</p>}
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(edu.startDate)} - {edu.current ? 'Presente' : formatDate(edu.endDate)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEducation(edu.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Formulario de nueva educación */}
        {isAdding ? (
          <div className="space-y-4 p-4 bg-slate-950/40 rounded-md border border-slate-800">
            <div>
              <Label className="text-slate-200" htmlFor="institution">Institución *</Label>
              <Input
                id="institution"
                value={currentEdu.institution}
                onChange={(e) => setCurrentEdu({ ...currentEdu, institution: e.target.value })}
                placeholder="Ej: Universidad Nacional"
                className="mt-1 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-200" htmlFor="degree">Título/Grado *</Label>
                <Input
                  id="degree"
                  value={currentEdu.degree}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, degree: e.target.value })}
                  placeholder="Ej: Licenciatura, Maestría, Certificación"
                  className="mt-1 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50"
                />
              </div>

              <div>
                <Label className="text-slate-200" htmlFor="field">Campo de Estudio</Label>
                <Input
                  id="field"
                  value={currentEdu.field}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, field: e.target.value })}
                  placeholder="Ej: Ingeniería en Sistemas"
                  className="mt-1 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-200" htmlFor="startDate">Fecha de Inicio *</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      className="w-full mt-1 justify-start text-left font-normal bg-slate-950/50 border-slate-800 text-white hover:bg-slate-900/60 hover:text-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                      {currentEdu.startDate ? (
                        formatDateLabel(currentEdu.startDate)
                      ) : (
                        <span className="text-slate-500">Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-950 border border-slate-800 text-white" align="start">
                    <Calendar
                      mode="single"
                      selected={currentEdu.startDate ? new Date(currentEdu.startDate + "-02") : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          setCurrentEdu({ ...currentEdu, startDate: `${year}-${month}` });
                        }
                        setStartDateOpen(false);
                      }}
                      className="bg-slate-950 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-slate-200" htmlFor="endDate">Fecha de Fin</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant="outline"
                      disabled={currentEdu.current}
                      className="w-full mt-1 justify-start text-left font-normal bg-slate-950/50 border-slate-800 text-white hover:bg-slate-900/60 hover:text-white disabled:opacity-50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                      {currentEdu.endDate ? (
                        formatDateLabel(currentEdu.endDate)
                      ) : (
                        <span className="text-slate-500">Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-950 border border-slate-800 text-white" align="start">
                    <Calendar
                      mode="single"
                      selected={currentEdu.endDate ? new Date(currentEdu.endDate + "-02") : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          setCurrentEdu({ ...currentEdu, endDate: `${year}-${month}` });
                        }
                        setEndDateOpen(false);
                      }}
                      className="bg-slate-950 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="currentEdu"
                checked={currentEdu.current}
                onCheckedChange={(checked) =>
                  setCurrentEdu({ ...currentEdu, current: checked as boolean })
                }
              />
              <Label htmlFor="currentEdu" className="cursor-pointer text-slate-200">
                Actualmente estudiando
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddEducation}
                disabled={!currentEdu.institution || !currentEdu.degree || !currentEdu.startDate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Agregar Educación
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            className="w-full border-dashed border-2 border-slate-800 hover:bg-slate-850"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Educación
          </Button>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={handleSkip} className="text-slate-400 hover:text-white hover:bg-slate-800/50">
            Omitir este paso
          </Button>
          <Button
            onClick={handleNext}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-shadow"
          >
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>

      {/* AI Assistant */}
      <AIAssistant step="education" />
    </div>
  );
};
