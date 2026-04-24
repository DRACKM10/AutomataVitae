"use client";
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Eye, EyeOff, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ResumePreview } from '@/components/steps/ResumePreview';
import { motion } from 'motion/react';

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
      <header className="bg-white/80 dark:bg-gray-900/80 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {canGoBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center gap-1 hover:bg-blue-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Atrás</span>
                </Button>
              )}
              <h1 
                onClick={() => router.push('/')}
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-700" />
                AutomataVitae
              </h1>
            </div>

            {/* Preview Toggle (Mobile) */}
            <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden border-blue-200 hover:bg-blue-50">
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
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">
                Paso {currentStep} de {steps.length}
              </span>
              <span className="text-blue-700 font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2.5" />
            <div className="hidden sm:flex justify-between text-xs text-gray-500 mt-2">
              {steps.map((step) => (
                <span
                  key={step.path}
                  className={`transition-colors ${
                    step.step === currentStep ? 'text-blue-700 font-semibold' : ''
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
