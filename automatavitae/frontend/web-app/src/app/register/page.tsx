"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Moon, Sun, ArrowRight, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) setTheme('dark');
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    }
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

  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }
    setErrorMsg('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3005';
      const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear la cuenta');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      console.log("Registro exitoso:", data.token);
      router.push('/dashboard');
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3005';
        const res = await fetch(`${apiUrl}/api/v1/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        if (!res.ok) {
          throw new Error('Error en el registro de Google');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        console.log("Registro/Login exitoso, token del backend:", data.token);

        router.push('/dashboard');
      } catch (error) {
        console.error("Error registrando con Google", error);
      }
    },
    onError: errorResponse => console.error("Google Register Error", errorResponse),
  });

  const handleGithubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!clientId) {
      setErrorMsg('Falta el NEXT_PUBLIC_GITHUB_CLIENT_ID en el entorno');
      return;
    }
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
  };

  return (
    <div className="relative w-screen min-h-screen flex flex-col overflow-x-hidden bg-transparent font-sans">
      {/* Header idéntico al landing */}
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
          <Link href="/#features" className="hover:text-blue-500 cursor-pointer transition-colors">Características</Link>
          <Link href="/#pricing" className="hover:text-blue-500 cursor-pointer transition-colors">Planes</Link>
          <Link href="/#faq" className="hover:text-blue-500 cursor-pointer transition-colors">FAQ</Link>
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
          </div>
        </div>
      </nav>

      {/* Tarjeta dividida con Glassmorphism */}
      <div className="flex-1 flex items-center justify-center p-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl flex flex-col md:flex-row bg-white/70 dark:bg-[#09090b]/80 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-gray-800/60 shadow-2xl overflow-hidden"
        >
          {/* ── PANEL IZQUIERDO (Imagen) ── */}
          <div className="hidden md:flex md:w-1/2 relative bg-gray-900">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/register-hero.png')" }}
            />
            {/* Overlay para oscurecer y dar gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="relative z-10 flex flex-col justify-end p-12 h-full w-full">
              <h2 className="text-white text-3xl font-bold leading-tight mb-3">
                Comienza hoy.<br />Tu carrera lo agradecerá.
              </h2>
              <p className="text-gray-300 text-sm">
                Crea tu cuenta y accede a plantillas generadas con IA, análisis de palabras clave y seguimiento.
              </p>

              {/* Indicadores estilo carrusel */}
              <div className="flex gap-2 mt-8">
                <div className="w-4 h-1 bg-white/30 rounded-full"></div>
                <div className="w-8 h-1 bg-white rounded-full"></div>
                <div className="w-4 h-1 bg-white/30 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* ── PANEL DERECHO (Formulario) ── */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Crea tu cuenta</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-100/50 border border-red-200 text-red-600 text-sm rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@correo.com"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 text-sm rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirmar
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="reg-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 text-sm rounded-xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex cursor-pointer items-center justify-center gap-2 py-3 rounded-xl text-base font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 mt-4"
              >
                Crear cuenta
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">O continuar con</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            </div>

            {/* Google */}
            <button
              id="register-google"
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full flex cursor-pointer items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#09090b] hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all shadow-sm"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            {/* GitHub */}
            <button
              id="register-github"
              type="button"
              onClick={handleGithubLogin}
              className="w-full flex cursor-pointer items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#09090b] hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all shadow-sm mt-3"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>

            <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
              Al registrarte aceptas nuestros{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Términos</a>
              {' '}y{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Privacidad</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
