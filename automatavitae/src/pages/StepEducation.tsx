import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useResume, Education } from '../context/store';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { AIAssistant } from '../components/AIAssistant';
import { ArrowRight, Plus, Trash2, GraduationCap } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { motion } from 'motion/react';

export const StepEducation: React.FC = () => {
  const navigate = useNavigate();
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
    navigate('/app/skills');
  };

  const handleSkip = () => {
    navigate('/app/skills');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Educación</h2>
        <p className="text-gray-600 mb-6">
          Incluye tu formación académica, certificaciones y cursos relevantes.
        </p>

        {/* Lista de educación agregada */}
        {resumeData.education.length > 0 && (
          <div className="space-y-3 mb-6">
            {resumeData.education.map((edu) => (
              <div
                key={edu.id}
                className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-4 h-4 text-blue-700" />
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                  </div>
                  <p className="text-sm text-blue-700 font-medium">{edu.institution}</p>
                  {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                  <p className="text-xs text-gray-600 mt-1">
                    {edu.startDate} - {edu.current ? 'Presente' : edu.endDate}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteEducation(edu.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Formulario de nueva educación */}
        {isAdding ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div>
              <Label htmlFor="institution">Institución *</Label>
              <Input
                id="institution"
                value={currentEdu.institution}
                onChange={(e) => setCurrentEdu({ ...currentEdu, institution: e.target.value })}
                placeholder="Ej: Universidad Nacional"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="degree">Título/Grado *</Label>
                <Input
                  id="degree"
                  value={currentEdu.degree}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, degree: e.target.value })}
                  placeholder="Ej: Licenciatura, Maestría, Certificación"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="field">Campo de Estudio</Label>
                <Input
                  id="field"
                  value={currentEdu.field}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, field: e.target.value })}
                  placeholder="Ej: Ingeniería en Sistemas"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                <Input
                  id="startDate"
                  type="month"
                  value={currentEdu.startDate}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input
                  id="endDate"
                  type="month"
                  value={currentEdu.endDate}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, endDate: e.target.value })}
                  disabled={currentEdu.current}
                  className="mt-1"
                />
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
              <Label htmlFor="currentEdu" className="cursor-pointer">
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
            className="w-full border-dashed border-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Educación
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
      <AIAssistant step="education" />
    </div>
  );
};
