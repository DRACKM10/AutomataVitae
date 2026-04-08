"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResume } from '@/context/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AIAssistant } from '@/components/AIAssistant';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const StepPersonalInfo: React.FC = () => {
  const router = useRouter();
  const { resumeData, updatePersonalInfo } = useResume();
  const [formData, setFormData] = useState(resumeData.personalInfo);

  useEffect(() => {
    setFormData(resumeData.personalInfo);
  }, [resumeData.personalInfo]);

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updatePersonalInfo(updated);
  };

  const handleNext = () => {
    router.push('/create/experience');
  };

  const isValid = formData.fullName && formData.email && formData.title;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      {!formData.fullName && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white"
        >
          <h2 className="text-2xl font-bold mb-2">¡Bienvenido a AutomataVitae! 👋</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Crea tu hoja de vida profesional en minutos. Nuestro asistente inteligente te guiará
            paso a paso para construir un CV optimizado que destaque ante los reclutadores.
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Información Personal</h2>
        <p className="text-gray-600 mb-6">
          Comencemos con tu información básica. Esta será la primera impresión para los reclutadores.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nombre Completo *</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Ej: María García López"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="title">Título Profesional *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ej: Desarrolladora Full Stack"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="correo@ejemplo.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Ej: Ciudad de México, México"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="summary">Resumen Profesional</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              placeholder="Escribe un breve resumen de tu perfil profesional (2-3 líneas)..."
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.summary.length} / 300 caracteres recomendados
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!isValid}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow"
          >
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>

      {/* AI Assistant */}
      <AIAssistant step="personal" />
    </div>
  );
};
