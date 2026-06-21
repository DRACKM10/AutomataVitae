import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Check, Sparkles } from 'lucide-react';

interface TemplatesTabProps {
  currentTemplateId: string;
  onApply: (templateId: string, label: string) => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({ currentTemplateId, onApply }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-[#12131A] border border-[#1E222D] rounded-3xl p-6 shadow-2xl space-y-6"
    >
      <div className="border-b border-[#1E222D] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#818CF8]" />
            Catálogo de Plantillas
          </h3>
          <p className="text-xs text-[#64748B] mt-1">Explora diseños validados por reclutadores del sector tecnológico.</p>
        </div>
        <div className="flex gap-2">
          {['Todos', 'Gratis', 'Premium'].map((filter, idx) => (
            <button key={filter} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${idx === 0 ? 'bg-[#6366F1] text-white shadow-lg' : 'bg-[#16171F] border border-[#272B36] text-[#64748B] hover:text-white'}`}>
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Template 1 - Automata Standard */}
        <div className={`bg-[#16171F] rounded-2xl overflow-hidden shadow-md group relative flex flex-col transition-all border ${
          currentTemplateId === 'automata_standard'
            ? 'border-[#6366F1] shadow-[0_0_15px_rgba(99,102,241,0.2)]'
            : 'border-[#272B36] hover:border-[#6366F1]/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)]'
        }`}>
          <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md z-10 backdrop-blur-sm">
            Recomendado
          </div>
          {currentTemplateId === 'automata_standard' && (
            <div className="absolute top-3 right-3 bg-[#6366F1] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
              <Check className="w-3 h-3" /> Usando
            </div>
          )}
          <div className="h-48 bg-[#0F1015] flex items-center justify-center p-4 relative group-hover:bg-[#12131A] transition-colors">
            <div className="w-32 h-40 bg-white rounded shadow-md flex flex-col p-2 space-y-2 transform group-hover:scale-105 transition-transform duration-500">
              <div className="w-full h-3 bg-slate-800 rounded-sm" />
              <div className="w-1/2 h-1.5 bg-slate-400 rounded-sm" />
              <div className="flex-1 border-t border-slate-200 mt-2 pt-2 space-y-1.5">
                <div className="w-full h-1.5 bg-slate-300 rounded-sm" />
                <div className="w-full h-1.5 bg-slate-300 rounded-sm" />
                <div className="w-3/4 h-1.5 bg-slate-300 rounded-sm" />
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-[#1E222D] flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Automata Standard</h4>
              <p className="text-[10px] text-[#64748B] mt-0.5">ATS Friendly • Tech Focus</p>
            </div>
            {currentTemplateId === 'automata_standard' ? (
              <button
                disabled
                className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-[#6366F1] text-white border-transparent cursor-default"
              >
                ✓ Plantilla Actual
              </button>
            ) : (
              <button
                onClick={() => onApply('automata_standard', 'Automata Standard')}
                className="mt-4 w-full py-2 rounded-xl text-xs font-bold text-[#6366F1] border border-[#6366F1]/30 hover:bg-[#6366F1]/10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
              >
                Aplicar Plantilla
              </button>
            )}
          </div>
        </div>

        {/* Template 2 */}
        <div className="bg-[#16171F] border border-[#272B36] rounded-2xl overflow-hidden shadow-md group hover:border-[#A855F7]/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all flex flex-col relative">
          <div className="absolute top-3 left-3 bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md z-10 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Premium
          </div>
          <div className="h-48 bg-gradient-to-br from-[#12131A] to-[#1a1423] flex items-center justify-center p-4">
            <div className="w-32 h-40 bg-[#12131A] border border-slate-700 rounded shadow-2xl flex flex-col p-2 space-y-2 transform group-hover:scale-105 transition-transform duration-500">
              <div className="w-full h-3 bg-gradient-to-r from-[#A855F7] to-[#EC4899] rounded-sm" />
              <div className="w-2/3 h-1.5 bg-slate-600 rounded-sm" />
              <div className="flex-1 border-t border-slate-700/50 mt-2 pt-2 space-y-1.5">
                <div className="w-full h-1 bg-slate-700 rounded-sm" />
                <div className="w-5/6 h-1 bg-slate-700 rounded-sm" />
                <div className="w-full h-1 bg-slate-700 rounded-sm mt-3" />
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-[#1E222D] flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Modern Glass</h4>
              <p className="text-[10px] text-[#64748B] mt-0.5">Diseño Oscuro • UI/UX</p>
            </div>
            <button
              onClick={() => onApply('modern_glass', 'Modern Glass')}
              className={`mt-4 w-full py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${
                currentTemplateId === 'modern_glass'
                  ? 'bg-gradient-to-r from-[#A855F7] to-[#EC4899] opacity-100'
                  : 'bg-gradient-to-r from-[#A855F7] to-[#EC4899] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0'
              }`}
            >
              {currentTemplateId === 'modern_glass' ? '✓ Aplicada' : 'Aplicar Plantilla'}
            </button>
          </div>
        </div>

        {/* Template 3 */}
        <div className="bg-[#16171F] border border-[#272B36] rounded-2xl overflow-hidden shadow-md group hover:border-[#38BDF8]/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] transition-all flex flex-col relative">
          <div className="absolute top-3 left-3 bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md z-10">
            Gratis
          </div>
          <div className="h-48 bg-[#0F1015] flex items-center justify-center p-4">
            <div className="w-32 h-40 bg-white rounded shadow-md flex p-1 gap-1 transform group-hover:scale-105 transition-transform duration-500">
              <div className="w-1/3 bg-[#38BDF8]/10 h-full rounded-sm p-1 space-y-1">
                <div className="w-full h-4 bg-[#38BDF8] rounded-sm" />
                <div className="w-full h-1 bg-slate-300 rounded-sm mt-2" />
                <div className="w-2/3 h-1 bg-slate-300 rounded-sm" />
              </div>
              <div className="w-2/3 h-full p-1 space-y-1.5">
                <div className="w-3/4 h-2 bg-slate-800 rounded-sm" />
                <div className="w-full h-1 bg-slate-200 rounded-sm mt-3" />
                <div className="w-full h-1 bg-slate-200 rounded-sm" />
                <div className="w-4/5 h-1 bg-slate-200 rounded-sm" />
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-[#1E222D] flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Executive Split</h4>
              <p className="text-[10px] text-[#64748B] mt-0.5">Dos Columnas • Corporativo</p>
            </div>
            <button
              onClick={() => onApply('executive_split', 'Executive Split')}
              className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all ${
                currentTemplateId === 'executive_split'
                  ? 'text-white bg-[#38BDF8]/80 opacity-100'
                  : 'text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/10 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0'
              }`}
            >
              {currentTemplateId === 'executive_split' ? '✓ Aplicada' : 'Aplicar Plantilla'}
            </button>
          </div>
        </div>

        {/* Template 4 */}
        <div className="bg-[#16171F] border border-[#272B36] rounded-2xl overflow-hidden shadow-md group hover:border-[#FBBF24]/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all flex flex-col relative">
          <div className="absolute top-3 left-3 bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md z-10 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Premium
          </div>
          <div className="h-48 bg-gradient-to-br from-[#12131A] to-[#1c1813] flex items-center justify-center p-4">
            <div className="w-32 h-40 bg-[#FAF9F6] rounded shadow-md flex flex-col items-center p-2 space-y-2 transform group-hover:scale-105 transition-transform duration-500">
              <div className="w-10 h-10 rounded-full bg-slate-300 mb-1" />
              <div className="w-3/4 h-2 bg-slate-800 rounded-sm" />
              <div className="w-1/2 h-1 bg-slate-400 rounded-sm" />
              <div className="w-full border-t border-slate-200 mt-2 pt-2 space-y-1">
                <div className="w-full h-1 bg-slate-300 rounded-sm" />
                <div className="w-full h-1 bg-slate-300 rounded-sm" />
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-[#1E222D] flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Creative Studio</h4>
              <p className="text-[10px] text-[#64748B] mt-0.5">Minimalista • Con Foto</p>
            </div>
            <button
              onClick={() => onApply('creative_studio', 'Creative Studio')}
              className={`mt-4 w-full py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${
                currentTemplateId === 'creative_studio'
                  ? 'bg-gradient-to-r from-[#A855F7] to-[#EC4899] opacity-100'
                  : 'bg-gradient-to-r from-[#A855F7] to-[#EC4899] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0'
              }`}
            >
              {currentTemplateId === 'creative_studio' ? '✓ Aplicada' : 'Aplicar Plantilla'}
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
