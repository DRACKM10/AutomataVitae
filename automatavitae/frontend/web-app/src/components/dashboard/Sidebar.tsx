import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Files,
  Cpu,
  BookOpen,
  Settings,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'cvs' | 'ai' | 'templates' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'cvs' | 'ai' | 'templates' | 'settings') => void;
  cvsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, cvsCount }) => {
  return (
    <aside className="w-64 bg-[#0F1015] border-r border-[#1E222D] flex flex-col justify-between shrink-0 hidden md:flex relative z-25">
      <div className="flex flex-col">
        {/* Logo Section */}
        <div className="px-6 py-[26px] flex items-center gap-2 border-b border-[#1E222D]">
          <Link href="/" className="text-xl font-bold tracking-tighter flex items-center gap-2 select-none hover:opacity-80 transition-opacity">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 font-extrabold text-2xl">
              A
            </span>
            <span className="font-black text-white text-[19px] tracking-tight">Automata</span>
            <span className="font-light text-[#94A3B8] text-[19px]">Vitae</span>
          </Link>
        </div>

        {/* Staking Navigation Menu */}
        <div className="px-4 py-6 space-y-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all ${activeTab === 'dashboard'
              ? 'bg-[#181A22] text-[#818CF8] border-l-2 border-[#6366F1]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#12131A]'
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Panel Principal
          </button>

          <button
            onClick={() => setActiveTab('cvs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all ${activeTab === 'cvs'
              ? 'bg-[#181A22] text-[#818CF8] border-l-2 border-[#6366F1]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#12131A]'
              }`}
          >
            <Files className="w-4 h-4" />
            Mis Currículums
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#6366F1]/10 text-[#818CF8]">
              {cvsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all ${activeTab === 'ai'
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all ${activeTab === 'templates'
              ? 'bg-[#181A22] text-[#818CF8] border-l-2 border-[#6366F1]'
              : 'text-[#94A3B8] hover:text-white hover:bg-[#12131A]'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            Plantillas
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all ${activeTab === 'settings'
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
          <button className="w-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] hover:from-[#4F46E5] hover:to-[#6366F1] text-white font-bold text-xs py-2 rounded-xl transition-all shadow-md cursor-pointer">
            Mejorar Plan
          </button>
        </div>
      </div>
    </aside>
  );
};
