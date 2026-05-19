"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Zap, Building2, Sparkles, Loader2, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ParticleBackground } from '@/components/ParticleBackground';
import { useAuth } from '@/components/AuthProvider';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_resumes: number;
  max_analyses: number;
  ai_suggestions: boolean;
  pdf_export: boolean;
  priority_support: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

const formatCOP = (cents: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(cents / 100);

const planConfig: Record<string, {
  icon: React.ReactNode;
  gradient: string;
  border: string;
  glow: string;
  badge?: string;
}> = {
  free: {
    icon: <Sparkles className="w-5 h-5" />,
    gradient: 'from-gray-500 to-gray-600',
    border: 'border-gray-800',
    glow: '',
  },
  pro: {
    icon: <Zap className="w-5 h-5" />,
    gradient: 'from-blue-500 to-purple-600',
    border: 'border-blue-500/50',
    glow: 'shadow-[0_0_40px_rgba(99,102,241,0.25)]',
    badge: 'MÁS POPULAR',
  },
  business: {
    icon: <Building2 className="w-5 h-5" />,
    gradient: 'from-purple-500 to-pink-600',
    border: 'border-purple-500/50',
    glow: '',
  },
};

// Decodifica el JWT del user-service para obtener datos del usuario
const decodeJWT = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export default function PlanesPage() {
  const { user } = useAuth(); // Usuario de Supabase
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [jwtEmail, setJwtEmail] = useState<string | null>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      setTheme('light');
    }

    // Leer token JWT del user-service si existe
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.email) setJwtEmail(decoded.email);
    }

    loadPlans();
  }, []);

  useEffect(() => {
    if (user) loadSubscription(user.id);
  }, [user]);

  const loadPlans = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payments/plans`);
      const data = await res.json();
      if (data.success) setPlans(data.data);
    } catch (err) {
      console.error('Error cargando planes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async (userId: string) => {
    try {
      const subRes = await fetch(`${API_URL}/api/payments/subscription`, {
        headers: { 'x-user-id': userId },
      });
      const subData = await subRes.json();
      if (subData.success) setCurrentPlan(subData.data.plan_slug || 'free');
    } catch (err) {
      console.error('Error cargando suscripción:', err);
    }
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.slug === 'free' || plan.slug === currentPlan) return;

    // Obtener datos del usuario — soporta Supabase y JWT del user-service
    let userId: string | null = null;
    let userEmail: string | null = null;
    let userName: string | null = null;

    if (user) {
      // Usuario autenticado con Supabase
      userId = user.id;
      userEmail = user.email ?? null;
      userName = user.user_metadata?.full_name || userEmail;
    } else {
      // Intentar con JWT del user-service
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = decodeJWT(token);
        if (decoded) {
          userId = decoded.userId;
          userEmail = decoded.email;
          userName = decoded.fullName || userEmail;
        }
      }
    }

    if (!userId || !userEmail) {
      window.location.href = '/login';
      return;
    }

    setPaying(plan.slug);
    try {
      const res = await fetch(`${API_URL}/api/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planSlug: plan.slug,
          billingCycle,
          userEmail,
          userName: userName || userEmail,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.redirectUrl) {
        window.location.href = data.data.redirectUrl;
      } else if (!data.success) {
        const msg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        alert('Error al procesar el pago: ' + (msg || 'Intenta de nuevo'));
      }
    } catch {
      alert('Error de conexión. Verifica que el servidor esté corriendo.');
    } finally {
      setPaying(null);
    }
  };

  const getFeatures = (plan: Plan) => [
    {
      text: plan.max_resumes === -1 ? 'CVs ilimitados' : `${plan.max_resumes} CV${plan.max_resumes > 1 ? 's' : ''}`,
      included: true,
    },
    {
      text: plan.max_analyses === -1 ? 'Análisis ilimitados' : `${plan.max_analyses} análisis por mes`,
      included: true,
    },
    { text: 'Asistente IA', included: plan.ai_suggestions },
    { text: 'Exportar a PDF', included: plan.pdf_export },
    { text: 'Soporte prioritario', included: plan.priority_support },
  ];

  const displayEmail = user?.email || jwtEmail;
  const isLoggedIn = !!user || !!jwtEmail;

  return (
    <div className="relative w-screen min-h-screen overflow-x-hidden bg-white dark:bg-[#09090b] text-gray-900 dark:text-gray-100 transition-colors duration-500 font-sans">

      {/* Navbar */}
      <nav className="relative z-30 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/50 backdrop-blur-md bg-white/70 dark:bg-[#09090b]/70 sticky top-0">
        <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">A</span>
          <span className="font-semibold text-gray-800 dark:text-gray-100">Automata</span>
          <span className="font-light text-gray-500 dark:text-gray-400">Vitae</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Link href="/#features" className="hover:text-blue-500 transition-colors">Características</Link>
          <Link href="/planes" className="text-blue-500 transition-colors">Planes</Link>
          <Link href="/#faq" className="hover:text-blue-500 transition-colors">FAQ</Link>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {theme === 'light'
              ? <span className="text-gray-600 text-lg">🌙</span>
              : <span className="text-gray-300 text-lg">☀️</span>}
          </button>
          {isLoggedIn ? (
            <button
              onClick={() => {
                supabase.auth.signOut();
                localStorage.removeItem('token');
                window.location.href = '/';
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-500 transition-colors"
            >
              Cerrar sesión
            </button>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Entrar
              </Link>
              <Link href="/register" className="px-5 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-full hover:opacity-90 transition-all">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Partículas */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ParticleBackground baseOpacity="opacity-40 dark:opacity-50" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium border border-blue-200 dark:border-blue-800/50">
              <Star className="w-4 h-4" />
              Sin comisiones ocultas
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 dark:text-white tracking-tight mb-4">
            Elige tu <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">plan</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Empieza gratis y escala cuando lo necesites. Cancela cuando quieras.
          </p>

          {displayEmail && (
            <p className="mt-3 text-sm text-blue-500 dark:text-blue-400">
              Conectado como {displayEmail}
            </p>
          )}

          <div className="flex items-center justify-center gap-4 mt-10">
            <span className={`text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              Mensual
            </span>
            <button
              onClick={() => setBillingCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-7' : ''}`} />
            </button>
            <span className={`text-sm font-medium transition-colors ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              Anual
              <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs rounded-full font-semibold">
                2 meses gratis
              </span>
            </span>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, index) => {
              const config = planConfig[plan.slug] || planConfig.free;
              const isCurrentPlan = plan.slug === currentPlan;
              const isPro = plan.slug === 'pro';
              const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
              const monthlyEquivalent = billingCycle === 'yearly'
                ? Math.round(plan.price_yearly / 12)
                : plan.price_monthly;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.12, duration: 0.6 }}
                  className={`relative rounded-2xl border p-8 flex flex-col
                    bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm
                    ${config.border} ${config.glow}
                    ${isPro ? 'md:-translate-y-4' : ''}
                    transition-all duration-300 hover:scale-[1.02]`}
                >
                  {config.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className={`bg-gradient-to-r ${config.gradient} text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg`}>
                        {config.badge}
                      </span>
                    </div>
                  )}

                  <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-r ${config.gradient} text-white w-fit mb-5`}>
                    {config.icon}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">{plan.description}</p>

                  <div className="mb-8">
                    {price === 0 ? (
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">Gratis</div>
                    ) : (
                      <>
                        <div className="flex items-end gap-1">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={billingCycle + plan.slug}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="text-4xl font-bold text-gray-900 dark:text-white"
                            >
                              {formatCOP(billingCycle === 'yearly' ? monthlyEquivalent : price)}
                            </motion.span>
                          </AnimatePresence>
                          <span className="text-gray-400 text-sm mb-1">/mes</span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <p className="text-xs text-gray-400 mt-1">
                            {formatCOP(price)} facturado anualmente
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 flex-1 mb-8">
                    {getFeatures(plan).map((feature, i) => (
                      <li key={i} className={`flex items-center gap-3 text-sm ${feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${feature.included ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          <Check className={`w-3 h-3 ${feature.included ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}`} />
                        </div>
                        <span className={!feature.included ? 'line-through' : ''}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={!isCurrentPlan && plan.slug !== 'free' ? { scale: 1.03 } : {}}
                    whileTap={!isCurrentPlan && plan.slug !== 'free' ? { scale: 0.97 } : {}}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrentPlan || paying !== null || plan.slug === 'free'}
                    className={`w-full py-3 px-6 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2
                      ${isCurrentPlan
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default'
                        : plan.slug === 'free'
                        ? 'bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 cursor-default border border-gray-200 dark:border-gray-700'
                        : isPro
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {paying === plan.slug && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isCurrentPlan ? 'Plan actual' : plan.slug === 'free' ? 'Plan gratuito' : `Elegir ${plan.name}`}
                    {!isCurrentPlan && plan.slug !== 'free' && paying !== plan.slug && <ArrowRight className="w-4 h-4" />}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-gray-400 dark:text-gray-500 mt-14"
        >
          🔒 Pagos procesados de forma segura por{' '}
          <span className="text-gray-500 dark:text-gray-400 font-medium">PayU</span>
          {' '}· Cancela cuando quieras · Precios en COP
        </motion.p>
      </div>
    </div>
  );
}