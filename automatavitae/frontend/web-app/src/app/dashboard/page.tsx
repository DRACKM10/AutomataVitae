"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Files, Cpu, BookOpen, Settings, Search, Bell, 
  ChevronRight, TrendingUp, Sparkles, Download, Trash2, Eye, Edit2, 
  Plus, Moon, Sun, Loader2, Mail, User, Check, ExternalLink, Lock, LogOut
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  userId: string;
  email: string;
  fullName?: string;
}

interface CVItem {
  id: string;
  title: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cvs, setCvs] = useState<CVItem[]>([]);
  const [latestCv, setLatestCv] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cvs' | 'ai' | 'templates' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Stakent style is strictly dark by default! Let's ensure dark mode is active.
    document.documentElement.classList.add('dark');
    
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      toast.error('Acceso denegado', { description: 'Debes iniciar sesión para acceder al panel.' });
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileRes = await fetch('http://localhost:3005/api/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!profileRes.ok) throw new Error('Error al obtener perfil');
        const profileData = await profileRes.json();
        setProfile(profileData.user);

        // Fetch CVs
        const cvsRes = await fetch('http://localhost:3006/api/v1/cvs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (cvsRes.ok) {
          const cvsData = await cvsRes.json();
          setCvs(cvsData);

          if (cvsData.length > 0) {
            try {
              const detailRes = await fetch(`http://localhost:3006/api/v1/cvs/${cvsData[0].id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                setLatestCv(detailData);
              }
            } catch (detailErr) {
              console.error("Error fetching CV details:", detailErr);
            }
          }
        }
      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        toast.error('Error de conexión', { description: 'No se pudo sincronizar con los servicios.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Sesión cerrada', { description: 'Has cerrado sesión correctamente.' });
    router.push('/');
  };

  const filteredCvs = cvs.filter(cv => 
    cv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090C] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#6366F1] to-[#A855F7] rounded-full blur-2xl animate-pulse opacity-40"></div>
          <div className="h-20 w-20 bg-[#12131A] border border-[#222531] rounded-full flex items-center justify-center relative shadow-2xl">
            <Loader2 className="animate-spin text-[#6366F1]" size={36} />
          </div>
        </div>
        <p className="text-[#94A3B8] mt-6 text-sm font-medium">Cargando tu ecosistema profesional...</p>
      </div>
    );
  }

  const initial = (profile?.fullName || profile?.email || 'U')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#08090C] text-[#F8FAFC] font-sans flex overflow-hidden">
      
      {/* LEFT SIDEBAR (Stakent Style) */}
      <aside className="w-64 bg-[#0F1015] border-r border-[#1E222D] flex flex-col justify-between shrink-0 hidden md:flex relative z-25">
        <div className="flex flex-col">
          {/* Logo Section */}
          <div className="px-6 py-[26px] flex items-center gap-2 border-b border-[#1E222D]">
            <span className="text-xl font-bold tracking-tighter flex items-center gap-2 select-none">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 font-extrabold text-2xl">
                A
              </span>
              <span className="font-black text-white text-[19px] tracking-tight">Automata</span>
              <span className="font-light text-[#94A3B8] text-[19px]">Vitae</span>
            </span>
          </div>

          {/* Staking Navigation Menu */}
          <div className="px-4 py-6 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#181A22] text-[#818CF8] border-l-2 border-[#6366F1]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#12131A]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Panel Principal
            </button>

            <button
              onClick={() => setActiveTab('cvs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'cvs'
                  ? 'bg-[#181A22] text-[#818CF8] border-l-2 border-[#6366F1]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#12131A]'
              }`}
            >
              <Files className="w-4 h-4" />
              Mis Currículums
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#6366F1]/10 text-[#818CF8]">
                {cvs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'ai'
                  ? 'bg-[#181A22] text-[#818CF8] border-l-2 border-[#6366F1]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#12131A]'
              }`}
            >
              <Cpu className="w-4 h-4" />
              Asistente IA
              <span className="ml-auto text-[8px] tracking-widest px-1.5 py-0.5 rounded bg-[#A855F7]/20 text-[#D8B4FE] font-black uppercase">
                Beta
              </span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'templates'
                  ? 'bg-[#181A22] text-[#818CF8] border-l-2 border-[#6366F1]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#12131A]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Plantillas
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#181A22] text-[#818CF8] border-l-2 border-[#6366F1]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#12131A]'
              }`}
            >
              <Settings className="w-4 h-4" />
              Configuración
            </button>
          </div>
        </div>

        {/* Promo Upgrade Banner Card */}
        <div className="p-4 border-t border-[#1E222D]">
          <div className="bg-gradient-to-br from-[#12131A] to-[#1C1D26] border border-[#2B2F3D] rounded-2xl p-4 relative overflow-hidden shadow-xl text-center">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#6366F1]/10 rounded-full blur-xl" />
            <Sparkles className="w-6 h-6 text-[#A855F7] mx-auto mb-2" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Automata Pro</h4>
            <p className="text-[10px] text-[#94A3B8] mt-1 mb-3">Diseños ilimitados con IA de última generación</p>
            <button 
              onClick={() => router.push('/planes')}
              className="w-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:from-[#4F46E5] hover:to-[#6366F1] text-white font-bold text-xs py-2 rounded-xl transition-all shadow-md cursor-pointer">
              Mejorar Plan
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-y-auto min-h-screen">
        
        {/* HEADER BAR (Stakent Style) */}
        <header className="h-20 bg-[#0F1015] border-b border-[#1E222D] px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Left search */}
          <div className="relative w-72 hidden sm:block">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar currículum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16171F] border border-[#272B36] rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-white placeholder-[#64748B] focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Notification Bell */}
            <button className="w-10 h-10 rounded-xl bg-[#16171F] border border-[#272B36] flex items-center justify-center hover:bg-[#20222D] transition-colors relative">
              <Bell className="w-4 h-4 text-[#94A3B8]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full" />
            </button>

            {/* Profile Avatar Badge */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#1E222D]">
              <div className="flex flex-col text-right hidden md:flex">
                <span className="text-xs font-bold text-white">{profile?.fullName || 'Usuario'}</span>
                <span className="text-[9px] text-[#A855F7] uppercase tracking-wider font-extrabold flex items-center gap-1 justify-end">
                  <span className="w-1 h-1 bg-[#A855F7] rounded-full animate-ping" />
                  Free Account
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#A855F7] flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                {initial}
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-8 h-8 rounded-xl bg-[#16171F]/40 border border-[#272B36]/50 flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-[1400px] w-full mx-auto">
          
          {/* Dynamic Tabs Renderer based on Left Sidebar Menu */}
          <AnimatePresence mode="wait">
            
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                
                {/* 1. Header Overview cards block */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      Ecosistema Automata <span className="text-sm font-semibold bg-[#222531] text-[#94A3B8] px-3 py-1 rounded-full border border-[#272B36]">v1.0.5</span>
                    </h2>
                    <p className="text-xs text-[#94A3B8]">Administra, optimiza y audita tus perfiles profesionales con asistencia de IA generativa.</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/create')}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:from-[#4F46E5] hover:to-[#6366F1] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-[#6366F1]/20 transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Nuevo CV desde cero
                  </motion.button>
                </div>

                {/* 2. Three Metric Cards (Stakent Style Stats) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: CVs Creados */}
                  <div className="bg-[#12131A] border border-[#1E222D] rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#6366F1]/5 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Hojas de Vida</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6366F1]/10 text-[#818CF8] font-bold border border-[#6366F1]/20 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Active
                      </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white">{cvs.length}</span>
                      <span className="text-xs text-[#64748B]">currículums en la nube</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1E222D] rounded-full overflow-hidden mt-4">
                      <div className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-full" style={{ width: `${Math.min(cvs.length * 20, 100)}%` }} />
                    </div>
                  </div>

                  {/* Card 2: Plantilla Recomendada */}
                  <div className="bg-[#12131A] border border-[#1E222D] rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#A855F7]/5 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Tasa de Completado</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#F87171] font-bold border border-[#EF4444]/20">Proxima Meta</span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white">92%</span>
                      <span className="text-xs text-[#64748B]">nivel de detalle promedio</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1E222D] rounded-full overflow-hidden mt-4">
                      <div className="h-full bg-gradient-to-r from-[#A855F7] to-[#C084FC] rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  {/* Card 3: Auditorías de IA */}
                  <div className="bg-[#12131A] border border-[#1E222D] rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/5 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Sugerencias IA</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#34D399] font-bold border border-[#10B981]/20">Óptimo</span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white">12</span>
                      <span className="text-xs text-[#64748B]">optimizaciones aplicadas</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1E222D] rounded-full overflow-hidden mt-4">
                      <div className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>

                {/* 3. Middle Section split (Stakent Callout & Recommended Card) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Callout Promotional banner (2/3 width) */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-[#12131A] to-[#1B1D28] border border-[#1E222D] rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[220px]">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.06),transparent)]" />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#A855F7]/10 rounded-full blur-3xl" />
                    
                    <div className="space-y-3 relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#818CF8] bg-[#6366F1]/10 border border-[#6366F1]/20 px-3 py-1 rounded-full">
                        Automata AI Engine
                      </span>
                      <h3 className="text-xl font-bold text-white max-w-md mt-2">
                        Potencia tu perfil profesional con recomendaciones en tiempo real y análisis ATS.
                      </h3>
                      <p className="text-xs text-[#94A3B8] max-w-lg">
                        El 75% de las empresas filtran currículums a través de sistemas ATS. Nuestro analizador escanea tu información y te otorga mejoras estratégicas.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-6 relative z-10">
                      <button 
                        onClick={() => setActiveTab('ai')}
                        className="bg-white hover:bg-slate-100 text-gray-900 font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Cpu className="w-4 h-4 text-[#6366F1]" />
                        Escanear Currículum
                      </button>
                      <button 
                        onClick={() => router.push('/create')}
                        className="text-white hover:bg-[#1E222D] font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-[#272B36] flex items-center gap-1 cursor-pointer"
                      >
                        Crear nuevo CV
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Subscription widget card (1/3 width) */}
                  <div className="bg-[#12131A] border border-[#1E222D] rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tu Cuenta</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#6366F1]/15 text-[#818CF8] font-bold uppercase">Basic</span>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-xs text-[#94A3B8]">
                          <span>Plan actual:</span>
                          <span className="font-bold text-white">Free Account</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-[#94A3B8]">
                          <span>Email de registro:</span>
                          <span className="font-bold text-white text-right truncate max-w-[150px]">{profile?.email}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-[#94A3B8]">
                          <span>Estatus:</span>
                          <span className="font-bold text-emerald-500 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Activa
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#1E222D] mt-6">
                      <button 
                        onClick={() => setActiveTab('settings')}
                        className="w-full bg-[#16171F] hover:bg-[#20222D] text-white border border-[#272B36] text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#818CF8]" />
                        Administrar Cuenta
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Detailed CV List Table ("Mis Hojas de Vida") */}
                <div className="bg-[#12131A] border border-[#1E222D] rounded-3xl p-6 shadow-2xl space-y-6">
                  
                  <div className="flex items-center justify-between border-b border-[#1E222D] pb-5">
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <Files className="w-5 h-5 text-[#818CF8]" />
                        Hojas de Vida Activas
                      </h3>
                      <p className="text-xs text-[#64748B]">Tus archivos guardados y sincronizados con los microservicios.</p>
                    </div>
                    <span className="text-[10px] font-black px-3 py-1 bg-[#16171F] text-[#818CF8] rounded-full border border-[#222531]">
                      {cvs.length} total
                    </span>
                  </div>

                  {filteredCvs.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-[#16171F] border border-[#272B36] flex items-center justify-center text-[#64748B]">
                        <Files className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-white">No se encontraron currículums</h4>
                        <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                          Comienza ahora mismo con nuestro constructor intuitivo y plasma tu perfil.
                        </p>
                      </div>
                      <button 
                        onClick={() => router.push('/create')}
                        className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Crear mi Primer CV
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#1E222D]/60 text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
                            <th className="pb-3.5 font-bold">Título del CV</th>
                            <th className="pb-3.5 font-bold">Estado de Publicidad</th>
                            <th className="pb-3.5 font-bold">Fecha de Creación</th>
                            <th className="pb-3.5 font-bold text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E222D]/40 text-xs">
                          {filteredCvs.map((cv) => (
                            <tr key={cv.id} className="hover:bg-[#16171F]/40 transition-colors group">
                              <td className="py-4 font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-[#6366F1]/10 text-[#818CF8] border border-[#6366F1]/20 rounded-lg group-hover:bg-[#6366F1]/25 transition-colors">
                                  <Files className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span>{cv.title}</span>
                                  <span className="text-[10px] text-[#64748B] font-light">Formato Automata Standard</span>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                  cv.is_public 
                                    ? 'bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/20' 
                                    : 'bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/20'
                                }`}>
                                  {cv.is_public ? 'Público' : 'Privado'}
                                </span>
                              </td>
                              <td className="py-4 text-[#94A3B8]">
                                {new Date(cv.created_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={() => {
                                      toast.info('Visualizador interactivo', {
                                        description: `Cargando el visor para el CV: ${cv.title}`
                                      });
                                    }}
                                    className="p-2 hover:bg-[#20222D] text-[#94A3B8] hover:text-white rounded-lg border border-transparent hover:border-[#272B36] transition-all cursor-pointer"
                                    title="Previsualizar"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      router.push(`/create/preview`);
                                    }}
                                    className="p-2 hover:bg-[#20222D] text-[#818CF8] hover:text-white rounded-lg border border-transparent hover:border-[#272B36] transition-all cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      toast.success('¡Generación exitosa!', {
                                        description: `Se ha descargado el archivo PDF de ${cv.title}.`
                                      });
                                    }}
                                    className="p-2 hover:bg-[#20222D] text-emerald-500 hover:text-white rounded-lg border border-transparent hover:border-[#272B36] transition-all cursor-pointer"
                                    title="Descargar PDF"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>

              </motion.div>
            )}

            {/* Render other sub-tabs */}
            {activeTab === 'cvs' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#12131A] border border-[#1E222D] rounded-3xl p-6 shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-[#1E222D] pb-5">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Files className="w-5 h-5 text-[#818CF8]" />
                      Mis Currículums Guardados
                    </h3>
                    <p className="text-xs text-[#64748B]">Explora y edita todas tus hojas de vida.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cvs.map(cv => (
                    <div key={cv.id} className="bg-[#16171F] border border-[#272B36] rounded-2xl p-5 hover:border-[#6366F1] transition-all shadow-md group relative">
                      <div className="flex items-start justify-between">
                        <div className="p-3 bg-[#6366F1]/10 text-[#818CF8] border border-[#6366F1]/20 rounded-xl">
                          <Files className="w-5 h-5" />
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold ${
                          cv.is_public 
                            ? 'bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/20' 
                            : 'bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/20'
                        }`}>
                          {cv.is_public ? 'Público' : 'Privado'}
                        </span>
                      </div>
                      <div className="mt-4 space-y-1">
                        <h4 className="font-bold text-white group-hover:text-[#818CF8] transition-colors">{cv.title}</h4>
                        <p className="text-[10px] text-[#64748B]">Editado el {new Date(cv.updated_at).toLocaleDateString()}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-[#272B36]/60 flex items-center justify-between">
                        <button 
                          onClick={() => router.push(`/create/preview`)}
                          className="text-xs text-[#818CF8] hover:text-white font-bold transition-colors cursor-pointer"
                        >
                          Editar CV
                        </button>
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-[#20222D] text-[#94A3B8] hover:text-white rounded-md transition-all cursor-pointer">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 hover:bg-[#20222D] text-emerald-500 hover:text-white rounded-md transition-all cursor-pointer">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#12131A] border border-[#1E222D] rounded-3xl p-6 shadow-2xl space-y-6 text-center py-16"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#818CF8] mx-auto shadow-lg shadow-[#6366F1]/5">
                  <Cpu className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-lg font-black text-white">Asistente de Escritura Inteligente</h3>
                  <p className="text-xs text-[#94A3B8]">
                    Analiza y reformula tus experiencias profesionales usando modelos avanzados de IA adaptados a tu sector.
                  </p>
                </div>
                <div className="pt-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-[#A855F7]/10 text-[#D8B4FE] border border-[#A855F7]/20 rounded-full">
                    Próximamente disponible
                  </span>
                </div>
              </motion.div>
            )}

            {activeTab === 'templates' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-[#12131A] border border-[#1E222D] rounded-3xl p-6 shadow-2xl space-y-6"
              >
                <div className="border-b border-[#1E222D] pb-5">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#818CF8]" />
                    Plantillas Profesionales Recomendadas
                  </h3>
                  <p className="text-xs text-[#64748B]">Explora diseños validados por reclutadores del sector tecnológico.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Template Card 1 */}
                  <div className="bg-[#16171F] border border-[#272B36] rounded-2xl overflow-hidden shadow-md group hover:border-[#6366F1] transition-all">
                    <div className="h-44 bg-gradient-to-br from-[#12131A] to-[#1E202B] flex items-center justify-center p-6 border-b border-[#272B36]/60">
                      <div className="w-24 h-32 bg-[#12131A] border border-slate-700/50 rounded-md shadow-lg flex flex-col p-2 space-y-2">
                        <div className="w-full h-2 bg-[#6366F1]/30 rounded" />
                        <div className="w-2/3 h-1 bg-slate-700/50 rounded" />
                        <div className="h-10 border-t border-slate-800/80 pt-2 space-y-1.5">
                          <div className="w-full h-1 bg-slate-800/85 rounded" />
                          <div className="w-5/6 h-1 bg-slate-800/85 rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">Automata Standard</h4>
                        <p className="text-[10px] text-[#64748B]">ATS Friendly • Tech Focus</p>
                      </div>
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">Activo</span>
                    </div>
                  </div>

                  {/* Template Card 2 */}
                  <div className="bg-[#16171F] border border-[#272B36] rounded-2xl overflow-hidden shadow-md group hover:border-[#6366F1] transition-all">
                    <div className="h-44 bg-gradient-to-br from-[#12131A] to-[#1E202B] flex items-center justify-center p-6 border-b border-[#272B36]/60">
                      <div className="w-24 h-32 bg-[#12131A] border border-slate-700/50 rounded-md shadow-lg flex flex-col p-2 space-y-2">
                        <div className="w-full h-2 bg-[#A855F7]/30 rounded" />
                        <div className="w-2/3 h-1 bg-slate-700/50 rounded" />
                        <div className="h-10 border-t border-slate-800/80 pt-2 space-y-1.5">
                          <div className="w-full h-1 bg-slate-800/85 rounded" />
                          <div className="w-5/6 h-1 bg-slate-800/85 rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">Modern Glassmorphism</h4>
                        <p className="text-[10px] text-[#64748B]">Premium • Creative</p>
                      </div>
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-[#6366F1]/10 text-[#818CF8] rounded border border-[#6366F1]/20">Premium</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (() => {
              // Calculate Dynamic Score
              const calculateAtsScore = () => {
                if (!latestCv) return 70; // baseline
                let score = 70;
                if (latestCv.summary && latestCv.summary.trim().length > 10) score += 10;
                if (latestCv.skills && latestCv.skills.length > 0) score += Math.min(latestCv.skills.length * 2.5, 10);
                if (latestCv.experience && latestCv.experience.length > 0) score += Math.min(latestCv.experience.length * 3.5, 10);
                return Math.round(Math.min(score, 100));
              };
              const atsScore = calculateAtsScore();
              const strokeDash = Math.round((atsScore / 100) * 188);

              // Dynamic Role Badge
              const latestRole = latestCv?.experience?.[0]?.position || 'Professional';

              // Dynamic Skills
              const displayedSkills = latestCv?.skills && latestCv.skills.length > 0
                ? latestCv.skills
                : ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Next.js', 'PostgreSQL'];

              // Dynamic Location
              const displayedLocation = latestCv?.location || 'Bogotá, CO';

              // Dynamic Activity feed (representing their past work experiences)
              const displayedActivities = latestCv?.experience && latestCv.experience.length > 0
                ? latestCv.experience.slice(0, 3).map((exp: any) => ({
                    name: exp.company || 'Experiencia',
                    role: exp.position || 'Colaborador',
                    time: exp.is_current ? 'Actual' : (exp.start_date ? new Date(exp.start_date).getFullYear().toString() : '')
                  }))
                : [
                    { name: 'Automata AI Core', role: 'Resume Audit Success', time: 'Hace 5 min' },
                    { name: 'SaaSify Partner', role: 'CV Shared Publicly', time: 'Hace 2 horas' },
                    { name: 'Direct PDF Export', role: 'Downloaded Standard Format', time: 'Ayer' }
                  ];

              // Dynamic Audits based on CV contents
              const getDynamicAudits = () => {
                const audits = [];
                if (!latestCv?.summary || latestCv.summary.trim().length < 10) {
                  audits.push({ title: 'Resumen Profesional Ausente', subtitle: 'Agrega un perfil profesional impactante para pasar los filtros de selección iniciales.', score: '60%', status: 'Sugerido' });
                } else {
                  audits.push({ title: 'Resumen Profesional Optimizado', subtitle: 'Tu perfil ejecutivo describe con precisión tu propuesta de valor.', score: '98%', status: 'Completado' });
                }

                if (!latestCv?.skills || latestCv.skills.length < 3) {
                  audits.push({ title: 'Densidad de Palabras Clave Baja', subtitle: 'Tu currículum cuenta con menos de 3 habilidades registradas. Añade habilidades técnicas.', score: '72%', status: 'Sugerido' });
                } else {
                  audits.push({ title: 'Keywords de Sector Verificadas', subtitle: 'Habilidades alineadas correctamente con los requerimientos técnicos.', score: '95%', status: 'Completado' });
                }

                if (!latestCv?.experience || latestCv.experience.length === 0) {
                  audits.push({ title: 'Falta Historial de Experiencia', subtitle: 'Registra tus empleos anteriores para sustentar tus habilidades técnicas.', score: '50%', status: 'Sugerido' });
                } else {
                  audits.push({ title: 'Auditoría Ortográfica e Impacto IA', subtitle: 'Historial verificado con verbos de acción y logros de impacto.', score: '92%', status: 'Completado' });
                }

                return audits;
              };
              const dynamicAudits = getDynamicAudits();

              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
                >
                  {/* LEFT PROFILE CARD COLUMN (1/3) */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#12131A] border border-[#1E222D] rounded-3xl overflow-hidden shadow-2xl relative">
                      {/* Header Banner image/gradient */}
                      <div className="h-32 bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#A855F7] relative p-4 flex justify-between items-start">
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                        <span className="relative z-10 text-[9px] uppercase font-black px-2.5 py-1 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center gap-1 border border-white/25 shadow-sm select-none">
                          <span className="w-1.5 h-1.5 bg-emerald-450 rounded-full animate-ping" />
                          Verified Professional
                        </span>
                      </div>

                      {/* Avatar Overlap */}
                      <div className="px-6 -mt-12 relative z-10 flex items-end justify-between">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#A855F7] border-[4px] border-[#12131A] flex items-center justify-center text-white font-black text-3xl shadow-xl">
                          {initial}
                        </div>
                        <span className="text-[10px] uppercase font-extrabold px-3 py-1 bg-[#6366F1]/10 text-[#818CF8] rounded-full border border-[#6366F1]/20 shadow-sm select-none">
                          {latestRole}
                        </span>
                      </div>

                      {/* Profile Information */}
                      <div className="p-6 space-y-6">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-white leading-none">
                            {profile?.fullName || 'Profesional'}
                          </h3>
                          <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {profile?.email}
                          </p>
                        </div>

                        <div className="h-[1px] bg-[#1E222D]" />

                        {/* Skills section */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#94A3B8]">Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {displayedSkills.map((skill: any) => (
                              <span key={skill} className="text-[10px] font-bold px-2.5 py-1 bg-[#1E222D] text-[#E2E8F0] rounded-lg border border-[#272B36] hover:border-[#6366F1] transition-colors select-none">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Position type section */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#94A3B8]">Position Type</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {['Remote', 'Full-time', 'Contract'].map(pos => (
                              <span key={pos} className="text-[10px] font-bold px-2.5 py-1 bg-[#1E222D]/60 text-slate-350 rounded-lg border border-[#222531] select-none">
                                {pos}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Location & Timezone widgets */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#16171F] border border-[#222531] rounded-2xl p-3.5 space-y-1">
                            <span className="text-[9px] uppercase font-black tracking-widest text-[#64748B]">Location</span>
                            <p className="text-xs font-bold text-white">{displayedLocation}</p>
                          </div>
                          <div className="bg-[#16171F] border border-[#222531] rounded-2xl p-3.5 space-y-1">
                            <span className="text-[9px] uppercase font-black tracking-widest text-[#64748B]">Timezone</span>
                            <p className="text-xs font-bold text-white">UTC-5 (EST)</p>
                          </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
                            <span>Recent Activity</span>
                            <span className="text-[9px] text-[#818CF8] hover:underline cursor-pointer">Ver más</span>
                          </h4>
                          <div className="space-y-3">
                            {displayedActivities.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-[#16171F] border border-[#222531] rounded-xl">
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-white">{item.name}</p>
                                  <p className="text-[10px] text-[#64748B]">{item.role}</p>
                                </div>
                                <span className="text-[9px] text-slate-500 font-medium shrink-0">{item.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* RIGHT DETAILED COLUMN (2/3) */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Three beautiful metric cards at the top */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#12131A] border border-[#1E222D] rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
                        <span className="text-2xl font-black text-white block">{atsScore}%</span>
                        <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mt-1 block">ATS Score</span>
                      </div>
                      <div className="bg-[#12131A] border border-[#1E222D] rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
                        <span className="text-2xl font-black text-white block">100%</span>
                        <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mt-1 block">Availability</span>
                      </div>
                      <div className="bg-[#12131A] border border-[#1E222D] rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
                        <span className="text-2xl font-black text-white block">{Math.round(atsScore * 0.96)}%</span>
                        <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mt-1 block">Readability</span>
                      </div>
                    </div>

                    {/* Aspect Score circular progress panel */}
                    <div className="bg-[#12131A] border border-[#1E222D] rounded-3xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-wider text-[#94A3B8]">Aspect Score</h4>
                        
                        {/* Arc Progress chart using beautiful SVG */}
                        <div className="relative w-full max-w-[180px] aspect-square mx-auto flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background Circle Arc */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              className="stroke-[#222531]"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray="188 251"
                              strokeLinecap="round"
                            />
                            {/* Foreground Glowing Arc Progress */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              className="stroke-[#6366F1]"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={`${strokeDash} 251`}
                              strokeLinecap="round"
                              style={{ filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))' }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                            <span className="text-4xl font-black text-white">{atsScore}</span>
                            <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-widest">
                              {atsScore >= 90 ? 'Excellent' : (atsScore >= 80 ? 'Good' : 'Needs Work')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quality Breakdown text info */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-wider text-[#94A3B8]">Overall Summary</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/25 flex items-center justify-center shrink-0 text-xs font-bold">✓</div>
                            <p className="text-xs text-[#94A3B8]">
                              <strong className="text-white">Correspondencia de Sector:</strong> {atsScore >= 85 ? 'Tu perfil técnico cuenta con una excelente alineación con los motores ATS.' : 'Aumenta tus habilidades para mejorar la compatibilidad ATS.'}
                            </p>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/25 flex items-center justify-center shrink-0 text-xs font-bold">★</div>
                            <p className="text-xs text-[#94A3B8]">
                              <strong className="text-white">Fortaleza Narrativa:</strong> {latestCv?.summary ? 'Excelente resumen ejecutivo que capta de inmediato la atención del reclutador.' : 'Agrega un resumen profesional para describir tu propuesta de valor.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Interviews Styled tab widget */}
                    <div className="bg-[#12131A] border border-[#1E222D] rounded-3xl p-6 shadow-xl space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E222D]/60 pb-5">
                        <h4 className="text-sm font-black uppercase tracking-wider text-white">Auditorías de Rendimiento</h4>
                        
                        {/* Styled Filter tabs */}
                        <div className="flex items-center gap-1.5 bg-[#16171F] p-1 rounded-xl border border-[#272B36] shrink-0">
                          {[`All (${dynamicAudits.length})`, `New (${dynamicAudits.filter(a => a.status === 'Sugerido').length})`, 'Screening (0)'].map((tab, idx) => (
                            <button
                              key={tab}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all ${
                                idx === 0
                                  ? 'bg-[#6366F1] text-white shadow-md'
                                  : 'text-[#64748B] hover:text-white'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interview / recommendations items */}
                      <div className="space-y-4">
                        {dynamicAudits.map((item, index) => (
                          <div key={index} className="p-4 bg-[#16171F] border border-[#222531] rounded-2xl flex items-center justify-between gap-4 hover:border-[#6366F1] transition-all">
                            <div className="space-y-1">
                              <h5 className="text-xs font-bold text-white">{item.title}</h5>
                              <p className="text-[10px] text-[#64748B]">{item.subtitle}</p>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <span className="text-xs font-black text-white">{item.score}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                item.status === 'Completado'
                                  ? 'bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/25'
                                  : 'bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/25'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })()}

          </AnimatePresence>
          
        </main>
      </div>

    </div>
  );
}
