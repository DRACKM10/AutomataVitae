"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useDropzone } from "react-dropzone";
import { 
  UploadCloud, FileText, Bot, CheckCircle2, 
  AlertTriangle, Lightbulb, ArrowRight, Loader2, Moon, Sun
} from "lucide-react";

interface AnalysisResult {
  score: number;
  fortalezas: string[];
  debilidades: string[];
  sugerencias: string[];
  keywords_faltantes: string[];
}

export default function AnalyzePage() {
  const router = useRouter();
  
  // Theme & Particles State
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Analysis State
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Theme Init
  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) setTheme('dark');
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    }
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  };


  // Dropzone Logic
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false
  });

  const analyzeCV = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await fetch("http://localhost:3001/api/cv/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("No se pudo conectar con el servidor para analizar el CV. Verifica que el backend esté ejecutándose.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-500";
    if (score >= 5) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent text-gray-900 dark:text-gray-100 transition-colors duration-500 font-sans flex flex-col pt-20">
      
      {/* Global Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-md bg-white/50 dark:bg-[#09090b]/50">
        <div 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
              A
            </span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Automata</span>
            <span className="font-light text-gray-500 dark:text-gray-400">Vitae</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {result && (
            <button 
              onClick={() => { setFile(null); setResult(null); setError(null); }}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors hidden sm:block"
            >
              Analizar otro archivo
            </button>
          )}
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-300" />}
          </button>
        </div>
      </nav>


      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-8 sm:py-16 md:px-6 w-full max-w-4xl mx-auto">
        <div className="w-full space-y-8">
          
          {/* UPLOAD STATE */}
          {!result && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                  Inteligencia <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">Analítica</span>
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
                  Sube tu hoja de vida en PDF. Nuestra IA inspeccionará cada rincón, evaluará tu compatibilidad ATS y dictará sugerencias estratégicas.
                </p>
              </div>

              {/* Glassmorphism Dropzone */}
              <div 
                {...getRootProps()} 
                className={`backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-2 border-dashed rounded-3xl p-10 sm:p-16 transition-all cursor-pointer flex flex-col items-center justify-center text-center group shadow-xl
                  ${isDragActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-indigo-500'}`}
              >
                <input {...getInputProps()} />
                <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300
                  ${isDragActive ? 'bg-gradient-to-tr from-blue-500 to-purple-500 text-white scale-110 shadow-xl shadow-blue-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-blue-500 group-hover:scale-105'}`}>
                  {file ? <FileText size={42} /> : <UploadCloud size={42} />}
                </div>
                {file ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{file.name}</p>
                    <p className="text-sm font-medium text-blue-600 dark:text-indigo-400 bg-blue-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full inline-block">
                      {(file.size / 1024 / 1024).toFixed(2)} MB - Listo para Inteligencia
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Suelta tu PDF gravitatorio aquí</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">o haz clic para explorar tu universo de archivos</p>
                  </div>
                )}
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center font-medium flex items-center justify-center gap-2 backdrop-blur-sm">
                  <AlertTriangle size={18} />
                  {error}
                </motion.div>
              )}

              <div className="flex justify-center pt-4">
                <motion.button 
                  onClick={analyzeCV}
                  disabled={!file}
                  whileHover={file ? { scale: 1.05 } : {}}
                  whileTap={file ? { scale: 0.95 } : {}}
                  className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-600/30 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                >
                  <Bot size={22} />
                  Analizar Estructura
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-2xl animate-pulse opacity-50"></div>
                <div className="h-28 w-28 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full flex items-center justify-center relative shadow-2xl">
                  <Loader2 className="animate-spin text-blue-500" size={50} />
                </div>
              </div>
              <h3 className="mt-10 text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Decodificando Perfil...</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-center max-w-md text-lg">
                Sintetizando experiencia, calculando impacto y consultando la red de métricas ATS.
              </p>
            </motion.div>
          )}

          {/* RESULTS DASHBOARD */}
          {result && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Score Hero */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-gray-200/50 dark:border-gray-800/50 rounded-[2rem] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl">
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Diagnóstico Quántico</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-base max-w-lg leading-relaxed">
                    Evaluación profunda de compatibilidad con motores ATS modernos y densidad de impacto profesional.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center shrink-0 bg-gray-50/50 dark:bg-gray-950/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className={`text-7xl font-black tracking-tighter ${getScoreColor(result.score || 0)}`}>
                    {result.score || 0}<span className="text-3xl opacity-30">/10</span>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] mt-3 text-gray-400">Puntaje Global</div>
                </div>
              </div>

              {/* Keywords Faltantes */}
              {result.keywords_faltantes && result.keywords_faltantes.length > 0 && (
                <div className="backdrop-blur-md bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle size={18} /> Keywords Ausentes Detectadas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords_faltantes.map((kw, idx) => (
                      <span key={idx} className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fortalezas Flex */}
                <div className="backdrop-blur-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 sm:p-8 space-y-5">
                  <h3 className="text-emerald-700 dark:text-emerald-400 font-extrabold text-xl flex items-center gap-3">
                    <CheckCircle2 size={26} /> Puntos Fuertes
                  </h3>
                  <ul className="space-y-4">
                    {result.fortalezas?.map((str, idx) => (
                      <li key={idx} className="flex gap-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        <span className="text-emerald-500 mt-0.5 whitespace-nowrap">✦</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Debilidades Flex */}
                <div className="backdrop-blur-md bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl p-6 sm:p-8 space-y-5">
                  <h3 className="text-rose-700 dark:text-rose-400 font-extrabold text-xl flex items-center gap-3">
                    <AlertTriangle size={26} /> Vectores de Riesgo
                  </h3>
                  <ul className="space-y-4">
                    {result.debilidades?.map((weak, idx) => (
                      <li key={idx} className="flex gap-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        <span className="text-rose-500 mt-0.5 whitespace-nowrap">✦</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sugerencias Action Plan */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl">
                <h3 className="font-extrabold text-2xl flex items-center gap-4 text-gray-900 dark:text-white">
                  <div className="bg-gradient-to-tr from-yellow-400 to-orange-500 text-white p-3 rounded-2xl shadow-lg shadow-orange-500/30">
                    <Lightbulb size={24} />
                  </div>
                  Plan de Acción
                </h3>
                <div className="space-y-4">
                  {result.sugerencias?.map((sug, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.01 }}
                      className="p-5 bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 text-base leading-relaxed text-gray-700 dark:text-gray-300 flex gap-5 shadow-sm"
                    >
                      <div className="font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-indigo-600 text-2xl pt-1">0{idx + 1}</div>
                      <p className="pt-1.5">{sug}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 pb-20 flex justify-center">
                 <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg opacity-50 cursor-not-allowed">
                   Entrenamiento de Entrevista QA (Secreto)
                 </button>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
