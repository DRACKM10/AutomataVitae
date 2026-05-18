"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Rocket, Moon, Sun, Download, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { ParticleBackground } from '@/components/ParticleBackground';

export default function LandingPage() {
  const router = useRouter();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 }); // safe init for hydration
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white dark:bg-[#09090b] text-gray-900 dark:text-gray-100 transition-colors duration-500 font-sans flex flex-col">
      <nav className="relative z-30 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800/80 backdrop-blur-lg bg-white/90 dark:bg-[#09090b]/90 sticky top-0 shadow-sm dark:shadow-md dark:shadow-black/40">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/35 via-purple-500/35 to-transparent" />
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              A
            </span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Automata</span>
            <span className="font-light text-gray-500 dark:text-gray-400">Vitae</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Link href="#features" className="hover:text-blue-500 cursor-pointer transition-colors">Características</Link>
        <Link href="/planes" className="hover:text-blue-500 cursor-pointer transition-colors">Planes</Link>          <Link href="#faq" className="hover:text-blue-500 cursor-pointer transition-colors">FAQ</Link>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-300" />}
          </button>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative flex-1 flex flex-col justify-center items-center overflow-hidden z-10 w-full">
        <ParticleBackground baseOpacity="opacity-70 dark:opacity-80" animateOpacity={[0.3, 0.8, 0.3]} />

        <div className="relative z-20 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium border border-blue-200 dark:border-blue-800/50">
                <Sparkles className="w-4 h-4" />
                Automatiza tu éxito laboral
              </span>
            </div>

            <div className="inline-flex items-center justify-center gap-3 mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-5xl md:text-6xl font-extrabold tracking-tighter drop-shadow-sm">
                A
              </span>
              <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Automata <span className="font-light text-gray-500">Vitae</span>
              </h1>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 dark:text-gray-200 mb-4 tracking-tight leading-tight">
              Diseña tu futuro profesional con Inteligencia Artificial.
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto text-base md:text-lg mb-8">
              AutomataVitae es tu constructor de currículums de próxima generación. Analiza tu perfil con IA y perfecciona tu presentación para conseguir entrevistas.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10 text-left">
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <Rocket className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Rapidez Total</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sube tu PDF en segundos para obtener un feedback inteligente e inmediato.</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 mb-4 flex items-center justify-center text-white font-bold">IA</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Feedback IA Directo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nuestra IA identifica debilidades en tu redacción y resalta fortalezas clave ante los filtros de RH modernos.</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <Download className="w-8 h-8 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Scores Precisos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recibe una calificación global sobre 10 con advertencias de palabras clave ausentes en tu industria.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 mx-auto">
              <motion.button
                onClick={() => router.push('/create')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 cursor-pointer rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg shadow-lg flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
              >
                Crear desde cero
                <Rocket className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={() => router.push('/analyze')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-lg shadow-lg flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
              >
                Analizar PDF
                <Download className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
