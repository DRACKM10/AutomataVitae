"use client";
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResume } from '@/context/store';
import { Button } from '@/components/ui/button';
import { AIAssistant } from '@/components/AIAssistant';
import { Download, CheckCircle, Lock, LogIn, UserPlus, X, Loader2 } from 'lucide-react';
import { ResumePreview } from './ResumePreview';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const PDF_SERVICE_URL = process.env.NEXT_PUBLIC_PDF_SERVICE_URL || 'http://localhost:3007';
const CV_SERVICE_URL  = process.env.NEXT_PUBLIC_CV_SERVICE_URL  || 'http://localhost:3006';

/** Extrae el payload del JWT sin librerías externas */
function decodeJwtPayload(token: string): { id?: string; sub?: string; userId?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const StepPreview: React.FC = () => {
  const router = useRouter();
  const { resumeData, clearResumeData } = useResume();
  const previewRef = useRef<HTMLDivElement>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSaveToDatabase = async () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await fetch(`${CV_SERVICE_URL}/api/v1/cvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) throw new Error('Error al guardar el CV');

      toast.success('¡CV guardado exitosamente!', {
        description: 'Tu hoja de vida ha sido guardada en tu cuenta.',
      });
    } catch (error) {
      toast.error('Error al guardar', { description: 'No se pudo conectar con el servidor.' });
    }
  };

  const handleDownload = async () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      setShowAuthModal(true);
      return;
    }

    const payload = decodeJwtPayload(token);
    const userId = payload?.userId || payload?.id || payload?.sub;

    if (!userId) {
      toast.error('Sesión inválida', { description: 'No se pudo identificar tu cuenta. Vuelve a iniciar sesión.' });
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading('Generando tu PDF...', { description: 'Esto puede tomar unos segundos.' });

    try {
      const response = await fetch(`${PDF_SERVICE_URL}/api/v1/pdf/generate/cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, resumeData }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Error desconocido en el servidor');
      }

      // Convertir la respuesta a Blob y forzar la descarga
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const fileName = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'Mi_CV'}.pdf`;
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      toast.success('¡CV descargado exitosamente!', {
        id: toastId,
        description: 'Tu hoja de vida fue generada en formato PDF.',
        duration: 4000,
      });
    } catch (error) {
      toast.error('Error al generar el PDF', {
        id: toastId,
        description: (error as Error).message || 'No se pudo conectar con el servidor.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleStartOver = () => {
    if (confirm('¿Estás seguro de que quieres empezar de nuevo? Se perderá toda la información ingresada.')) {
      clearResumeData();
      router.push('/create');
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
        className="bg-slate-900/60 backdrop-blur-xl rounded-lg shadow-xl p-6 border border-slate-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-950/50 border border-green-800/80 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">¡Casi listo!</h2>
            <p className="text-slate-400">
              Revisa tu hoja de vida y descárgala cuando esté lista.
            </p>
          </div>
        </div>

        {/* Vista previa completa */}
        <div
          ref={previewRef}
          className="my-6 bg-slate-950/40 rounded-lg p-6 border border-slate-800 max-h-[600px] overflow-y-auto"
        >
          <ResumePreview />
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSaveToDatabase}
            disabled={!hasContent}
            size="lg"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Guardar en mi Cuenta
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!hasContent || isDownloading}
            variant="outline"
            size="lg"
            className="flex-1 border-slate-800 hover:bg-slate-800/50 text-slate-200 disabled:opacity-60"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Descargar PDF
              </>
            )}
          </Button>
        </div>

        {!hasContent && (
          <div className="mt-4 p-4 bg-amber-950/40 border border-amber-900/50 rounded-md flex items-start gap-3">
            <div className="mt-0.5">⚠️</div>
            <p className="text-sm text-amber-300">
              Tu CV está vacío. Completa al menos la información personal para poder descargarlo.
            </p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950/50 border border-slate-800/60 rounded-lg text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-400">{resumeData.experience.length}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Experiencias</p>
          </div>
          <div className="p-4 bg-slate-950/50 border border-slate-800/60 rounded-lg text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-400">{resumeData.education.length}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Educación</p>
          </div>
          <div className="p-4 bg-slate-950/50 border border-slate-800/60 rounded-lg text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-400">{resumeData.skills.length}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Habilidades</p>
          </div>
          <div className="p-4 bg-slate-950/50 border border-slate-800/60 rounded-lg text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-400">
              {resumeData.personalInfo.summary ? '✓' : '—'}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Resumen</p>
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

      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center space-y-6"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mx-auto w-12 h-12 bg-blue-900/50 border border-blue-700/80 rounded-full flex items-center justify-center text-blue-400">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">¡Inicia sesión para guardar!</h3>
                <p className="text-slate-400 text-sm">
                  Necesitas tener una cuenta para poder guardar tu CV de manera segura en tu cuenta y acceder a él en cualquier momento.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push('/login');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </Button>

                <Button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push('/register');
                  }}
                  variant="outline"
                  className="w-full border-slate-800 hover:bg-slate-800/50 text-slate-200 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Crear una Cuenta
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
