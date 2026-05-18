"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResume, Experience } from '@/context/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AIAssistant } from '@/components/AIAssistant';
import { ArrowRight, Plus, Trash2, Briefcase, Calendar as CalendarIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'motion/react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export const StepExperience: React.FC = () => {
  const router = useRouter();
  const { resumeData, addExperience, updateExperience, deleteExperience } = useResume();
  const [isAdding, setIsAdding] = useState(resumeData.experience.length === 0);
  const [currentExp, setCurrentExp] = useState<Experience>({
    id: '',
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
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

  const handleAddExperience = () => {
    if (currentExp.company && currentExp.position && currentExp.startDate) {
      const newExp = {
        ...currentExp,
        id: Date.now().toString(),
      };
      addExperience(newExp);
      setCurrentExp({
        id: '',
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      });
      setIsAdding(false);
    }
  };

  const handleNext = () => {
    if (isAdding && currentExp.company) {
      handleAddExperience();
    }
    router.push('/create/education');
  };

  const handleSkip = () => {
    router.push('/create/education');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-900/60 backdrop-blur-xl rounded-lg shadow-xl p-6 border border-slate-800"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Experiencia Laboral</h2>
        <p className="text-slate-400 mb-6">
          Agrega tu experiencia laboral relevante. Enfócate en logros y resultados medibles.
        </p>

        {/* Lista de experiencias agregadas */}
        {resumeData.experience.length > 0 && (
          <div className="space-y-3 mb-6">
            {resumeData.experience.map((exp) => {
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
                  key={exp.id}
                  className="p-4 bg-blue-950/40 border border-blue-900/50 rounded-md flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-blue-400" />
                      <h4 className="font-semibold text-white">{exp.position}</h4>
                    </div>
                    <p className="text-sm text-blue-400 font-medium">{exp.company}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteExperience(exp.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Formulario de nueva experiencia */}
        {isAdding ? (
          <div className="space-y-4 p-4 bg-slate-950/40 rounded-md border border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-200" htmlFor="position">Cargo *</Label>
                <Input
                  id="position"
                  value={currentExp.position}
                  onChange={(e) => setCurrentExp({ ...currentExp, position: e.target.value })}
                  placeholder="Ej: Desarrollador Frontend"
                  className="mt-1 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600"
                />
              </div>

              <div>
                <Label className="text-slate-200" htmlFor="company">Empresa *</Label>
                <Input
                  id="company"
                  value={currentExp.company}
                  onChange={(e) => setCurrentExp({ ...currentExp, company: e.target.value })}
                  placeholder="Ej: Tech Solutions Inc."
                  className="mt-1 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600"
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
                      {currentExp.startDate ? (
                        formatDateLabel(currentExp.startDate)
                      ) : (
                        <span className="text-slate-500">Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-950 border border-slate-800 text-white" align="start">
                    <Calendar
                      mode="single"
                      selected={currentExp.startDate ? new Date(currentExp.startDate + "-02") : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          setCurrentExp({ ...currentExp, startDate: `${year}-${month}` });
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
                      disabled={currentExp.current}
                      className="w-full mt-1 justify-start text-left font-normal bg-slate-950/50 border-slate-800 text-white hover:bg-slate-900/60 hover:text-white disabled:opacity-50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                      {currentExp.endDate ? (
                        formatDateLabel(currentExp.endDate)
                      ) : (
                        <span className="text-slate-500">Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-950 border border-slate-800 text-white" align="start">
                    <Calendar
                      mode="single"
                      selected={currentExp.endDate ? new Date(currentExp.endDate + "-02") : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          setCurrentExp({ ...currentExp, endDate: `${year}-${month}` });
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
                id="current"
                checked={currentExp.current}
                onCheckedChange={(checked) =>
                  setCurrentExp({ ...currentExp, current: checked as boolean })
                }
              />
              <Label htmlFor="current" className="cursor-pointer">
                Actualmente trabajo aquí
              </Label>
            </div>

            <div>
              <Label htmlFor="description">Descripción y Logros</Label>
              <Textarea
                id="description"
                value={currentExp.description}
                onChange={(e) => setCurrentExp({ ...currentExp, description: e.target.value })}
                placeholder="• Desarrollé una aplicación que aumentó la eficiencia en 30%&#10;• Lideré un equipo de 5 personas&#10;• Implementé metodologías ágiles"
                rows={5}
                className="mt-1 dark:bg-slate-900 dark:border-slate-700"
              />
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                {currentExp.description.length} / 300 caracteres recomendados
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddExperience}
                disabled={!currentExp.company || !currentExp.position || !currentExp.startDate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Agregar Experiencia
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
            className="w-full border-dashed border-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Experiencia Laboral
          </Button>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={handleSkip} className="hover:bg-gray-100">
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
      <AIAssistant step="experience" />
    </div>
  );
};
