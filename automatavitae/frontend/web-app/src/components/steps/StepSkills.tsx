"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResume } from '@/context/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AIAssistant } from '@/components/AIAssistant';
import { ArrowRight, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';

const suggestedSkills = [
  'JavaScript',
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'Git',
  'SQL',
  'CSS',
  'HTML',
  'Trabajo en Equipo',
  'Comunicación',
  'Liderazgo',
  'Resolución de Problemas',
  'Inglés',
];

export const StepSkills: React.FC = () => {
  const router = useRouter();
  const { resumeData, updateSkills } = useResume();
  const [skills, setSkills] = useState<string[]>(resumeData.skills);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      updateSkills(updatedSkills);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter((s) => s !== skillToRemove);
    setSkills(updatedSkills);
    updateSkills(updatedSkills);
  };

  const handleAddSuggested = (skill: string) => {
    if (!skills.includes(skill)) {
      const updatedSkills = [...skills, skill];
      setSkills(updatedSkills);
      updateSkills(updatedSkills);
    }
  };

  const handleNext = () => {
    updateSkills(skills);
    router.push('/create/preview');
  };

  const handleSkip = () => {
    router.push('/create/preview');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-800"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Habilidades y Aptitudes</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          Agrega tus habilidades técnicas y blandas más relevantes.
        </p>

        {/* Input para agregar habilidades */}
        <div className="mb-6">
          <Label htmlFor="newSkill">Agregar Habilidad</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="newSkill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ej: React, Liderazgo, Excel..."
              className="flex-1"
            />
            <Button
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Habilidades agregadas */}
        {skills.length > 0 && (
          <div className="mb-6">
            <Label>Tus Habilidades ({skills.length})</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill) => (
                <motion.div
                  key={skill}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-sm py-1.5 px-3 bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Sugerencias */}
        <div>
          <Label>Sugerencias</Label>
          <p className="text-sm text-gray-500 mb-3">
            Haz clic en una habilidad para agregarla rápidamente
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills
              .filter((s) => !skills.includes(s))
              .map((skill) => (
                <Button
                  key={skill}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSuggested(skill)}
                  className="text-sm border-dashed"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {skill}
                </Button>
              ))}
          </div>
        </div>

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
      <AIAssistant step="skills" />
    </div>
  );
};
