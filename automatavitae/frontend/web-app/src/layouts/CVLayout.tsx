"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Eye, EyeOff, FileText, LogOut, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ResumePreview } from '@/components/steps/ResumePreview';
import { motion } from 'motion/react';
import { AICopilotModal } from '@/components/AICopilotModal';

const steps = [
  { path: '/create', label: 'Personal', step: 1 },
  { path: '/create/experience', label: 'Experiencia', step: 2 },
  { path: '/create/education', label: 'Educación', step: 3 },
  { path: '/create/skills', label: 'Habilidades', step: 4 },
  { path: '/create/preview', label: 'Revisar', step: 5 },
];

export default function CVLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
      const apiUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3005';
      fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Invalid token');
      })
      .then(data => {
        setUserEmail(data.user.email);
        setUserName(data.user.fullName || data.user.email);
      })
      .catch(err => {
        console.error("Error loading user profile in CVLayout", err);
        localStorage.removeItem('token');
      });
    }
  }, []);

  const currentStepIndex = steps.findIndex((s) => s.path === pathname);
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;
  const progress = (currentStep / steps.length) * 100;

  const canGoBack = currentStepIndex > 0;

  const handleBack = () => {
    if (canGoBack) {
      router.push(steps[currentStepIndex - 1].path);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-transparent">
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-950/85 shadow-md border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {canGoBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Atrás</span>
                </Button>
              )}
              <h1 
                onClick={() => router.push('/')}
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
                AutomataVitae
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Preview Toggle (Mobile) */}
              <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {previewOpen ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Vista Previa
                      </>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Vista Previa de tu CV</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <ResumePreview />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Auth Panel */}
              <div className="flex items-center gap-3">
                {userName ? (
                  <div className="flex items-center gap-3">
                    <span className="hidden md:inline-block text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Sesión: <span className="text-blue-500 dark:text-blue-400 font-bold">{userName}</span>
                    </span>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      Ir al Panel
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        setUserEmail(null);
                        setUserName(null);
                        router.push('/');
                      }}
                      className="hidden sm:inline-block text-xs font-bold text-red-500 hover:text-red-650 dark:hover:text-red-400 transition-all cursor-pointer"
                    >
                      Salir
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push('/login')}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => router.push('/register')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm transition-all cursor-pointer"
                    >
                      Registrarse
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Paso {currentStep} de {steps.length}
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2.5" />
            <div className="hidden sm:flex justify-between text-xs mt-2">
              {steps.map((step) => (
                <span
                  key={step.path}
                  className={`transition-colors ${
                    step.step === currentStep 
                      ? 'text-blue-600 dark:text-blue-400 font-bold' 
                      : 'text-slate-500 dark:text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 relative z-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Area */}
          <div className="lg:col-span-2">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>

          {/* Preview Area (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-700" />
                Vista Previa en Tiempo Real
              </h3>
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg p-4 shadow-inner border border-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="transform scale-75 origin-top">
                  <ResumePreview />
                </div>
              </div>

              {/* Botón Flotante Copiloto IA */}
              <div className="mt-6">
                <Button 
                  onClick={() => setIsCopilotOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white font-bold py-6 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all duration-300 transform hover:-translate-y-1 rounded-xl flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 blur-[20px] rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 ease-out"></div>
                  <div className="flex items-center gap-2 relative z-10">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span className="text-base tracking-wide">Corregir con IA</span>
                  </div>
                  <span className="text-xs text-blue-100 font-normal relative z-10 hidden xl:block">Optimiza y mejora la redacción al instante</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AICopilotModal open={isCopilotOpen} onOpenChange={setIsCopilotOpen} />
    </div>
  );
};
