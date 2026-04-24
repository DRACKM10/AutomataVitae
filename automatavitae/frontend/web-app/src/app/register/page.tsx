"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual registration logic
    router.push('/create');
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-4 transition-colors duration-500 bg-transparent">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="text-3xl font-bold tracking-tighter flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              A
            </span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Automata</span>
            <span className="font-light text-gray-500 dark:text-gray-400">Vitae</span>
          </Link>
        </div>

        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Crea tu cuenta
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">
            Comienza a construir tu mejor currículum gratis
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all sm:text-sm"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

            <div className="group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                  placeholder="Tu correo electrónico"
                />
              </div>
            </div>

            <div className="group">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all sm:text-sm"
                  placeholder="Contraseña"
                />
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 mt-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
            >
              Registrarse ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </motion.button>
          </form>

          <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
            Al registrarte aceptas nuestros Términos de Servicio y Política de Privacidad.
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-all">
            Inicia sesión aquí
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
