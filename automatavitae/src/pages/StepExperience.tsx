import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useResume, Experience } from '../context/store';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { AIAssistant } from '../components/AIAssistant';
import { ArrowRight, Plus, Trash2, Briefcase } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { motion } from 'motion/react';

export const StepExperience: React.FC = () => {
  const navigate = useNavigate();
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
    navigate('/app/education');
  };

  const handleSkip = () => {
    navigate('/app/education');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Experiencia Laboral</h2>
        <p className="text-gray-600 mb-6">
          Agrega tu experiencia laboral relevante. Enfócate en logros y resultados medibles.
        </p>

        {/* Lista de experiencias agregadas */}
        {resumeData.experience.length > 0 && (
          <div className="space-y-3 mb-6">
            {resumeData.experience.map((exp) => (
              <div
                key={exp.id}
                className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-blue-700" />
                    <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                  </div>
                  <p className="text-sm text-blue-700 font-medium">{exp.company}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteExperience(exp.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Formulario de nueva experiencia */}
        {isAdding ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Cargo *</Label>
                <Input
                  id="position"
                  value={currentExp.position}
                  onChange={(e) => setCurrentExp({ ...currentExp, position: e.target.value })}
                  placeholder="Ej: Desarrollador Frontend"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="company">Empresa *</Label>
                <Input
                  id="company"
                  value={currentExp.company}
                  onChange={(e) => setCurrentExp({ ...currentExp, company: e.target.value })}
                  placeholder="Ej: Tech Solutions Inc."
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
                  value={currentExp.startDate}
                  onChange={(e) => setCurrentExp({ ...currentExp, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input
                  id="endDate"
                  type="month"
                  value={currentExp.endDate}
                  onChange={(e) => setCurrentExp({ ...currentExp, endDate: e.target.value })}
                  disabled={currentExp.current}
                  className="mt-1"
                />
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
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usa viñetas (•) para listar tus logros y responsabilidades
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
