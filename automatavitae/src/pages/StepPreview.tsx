import React, { useRef } from 'react';
import { useNavigate } from 'react-router';
import { useResume } from '../context/store';
import { Button } from '../components/ui/button';
import { AIAssistant } from '../components/AIAssistant';
import { Download, RefreshCw, CheckCircle } from 'lucide-react';
import { ResumePreview } from './ResumePreview';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const StepPreview: React.FC = () => {
  const navigate = useNavigate();
  const { resumeData } = useResume();
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // Simulación de descarga - en producción usarías una librería como html2pdf o jsPDF
    toast.success('¡CV descargado exitosamente!', {
      description: 'Tu hoja de vida ha sido generada en formato PDF.',
      duration: 3000,
    });
    
    // Simular descarga
    const element = document.createElement('a');
    const fileName = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'Mi_CV'}.pdf`;
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    // element.click(); // Comentado para no forzar descarga en demo
    document.body.removeChild(element);
  };

  const handleStartOver = () => {
    if (confirm('¿Estás seguro de que quieres empezar de nuevo? Se perderá toda la información ingresada.')) {
      navigate('/app');
    }
  };

  const hasContent =
    resumeData.personalInfo.fullName ||
    resumeData.experience.length > 0 ||
    resumeData.education.length > 0 ||
    resumeData.skills.length > 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">¡Casi listo!</h2>
            <p className="text-gray-600">
              Revisa tu hoja de vida y descárgala cuando esté lista.
            </p>
          </div>
        </div>

        {/* Vista previa completa */}
        <div
          ref={previewRef}
          className="my-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 shadow-inner border border-gray-200 max-h-[600px] overflow-y-auto"
        >
          <ResumePreview />
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDownload}
            disabled={!hasContent}
            size="lg"
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-5 h-5 mr-2" />
            Descargar CV en PDF
          </Button>
          <Button
            onClick={handleStartOver}
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-initial border-gray-300 hover:bg-gray-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Empezar de Nuevo
          </Button>
        </div>

        {!hasContent && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
            <div className="mt-0.5">⚠️</div>
            <p className="text-sm text-amber-800">
              Tu CV está vacío. Completa al menos la información personal para poder descargarlo.
            </p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center border border-blue-200 shadow-sm">
            <p className="text-3xl font-bold text-blue-700">{resumeData.experience.length}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Experiencias</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center border border-blue-200 shadow-sm">
            <p className="text-3xl font-bold text-blue-700">{resumeData.education.length}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Educación</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center border border-blue-200 shadow-sm">
            <p className="text-3xl font-bold text-blue-700">{resumeData.skills.length}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Habilidades</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center border border-blue-200 shadow-sm">
            <p className="text-3xl font-bold text-blue-700">
              {resumeData.personalInfo.summary ? '✓' : '—'}
            </p>
            <p className="text-xs text-gray-600 mt-1 font-medium">Resumen</p>
          </div>
        </div>
      </motion.div>

      {/* AI Assistant */}
      <AIAssistant step="preview" />

      {/* Tips adicionales */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          💡 Próximos Pasos
        </h3>
        <ul className="space-y-2.5 text-sm">
          <li className="flex items-start gap-3 bg-white/10 p-3 rounded-md backdrop-blur-sm">
            <span className="mt-0.5 text-blue-200">•</span>
            <span>Personaliza tu CV para cada aplicación, enfatizando las habilidades más relevantes.</span>
          </li>
          <li className="flex items-start gap-3 bg-white/10 p-3 rounded-md backdrop-blur-sm">
            <span className="mt-0.5 text-blue-200">•</span>
            <span>Guarda múltiples versiones para diferentes industrias o roles.</span>
          </li>
          <li className="flex items-start gap-3 bg-white/10 p-3 rounded-md backdrop-blur-sm">
            <span className="mt-0.5 text-blue-200">•</span>
            <span>Actualiza tu CV regularmente con nuevos logros y habilidades.</span>
          </li>
          <li className="flex items-start gap-3 bg-white/10 p-3 rounded-md backdrop-blur-sm">
            <span className="mt-0.5 text-blue-200">•</span>
            <span>Pide a alguien que lo revise antes de enviarlo a reclutadores.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
