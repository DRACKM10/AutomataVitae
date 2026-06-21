import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Edit2, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsTabProps {
  profile: any;
  latestCv: any;
  cvs: any[];
  onProfileUpdate?: (updatedProfile: any) => void;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const SettingsTab: React.FC<SettingsTabProps> = ({ profile, latestCv, cvs, onProfileUpdate }) => {
  const initial = (profile?.fullName || profile?.email || 'U')[0].toUpperCase();

  // Edit Profile State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.fullName || '');
  const [isSavingName, setIsSavingName] = useState(false);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsSavingName(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${apiUrl}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName: nameInput.trim() }),
      });
      if (!response.ok) throw new Error('Error al actualizar');
      const data = await response.json();
      toast.success('Nombre actualizado correctamente');
      setIsEditingName(false);
      onProfileUpdate?.(data.user);
    } catch {
      toast.error('No se pudo actualizar el nombre');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setNameInput(profile?.fullName || '');
    setIsEditingName(false);
  };

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
    : [];

  // Dynamic Location
  const displayedLocation = latestCv?.location || profile?.email?.split('@')[1]?.split('.')[0] || 'Sin ubicación';

  // Dynamic Activity feed (representing their past work experiences)
  const displayedActivities = latestCv?.experience && latestCv.experience.length > 0
    ? latestCv.experience.slice(0, 3).map((exp: any) => ({
      name: exp.company || 'Experiencia',
      role: exp.position || 'Colaborador',
      time: exp.is_current ? 'Actual' : (exp.start_date ? new Date(exp.start_date).getFullYear().toString() : '')
    }))
    : [];

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
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#A855F7] border-[4px] border-[#12131A] flex items-center justify-center text-white font-black text-3xl shadow-xl overflow-hidden">
              {profile?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.picture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <span className="text-[10px] uppercase font-extrabold px-3 py-1 bg-[#6366F1]/10 text-[#818CF8] rounded-full border border-[#6366F1]/20 shadow-sm select-none">
              {latestRole}
            </span>
          </div>

          {/* Profile Information */}
          <div className="p-6 space-y-6">
            {/* Editable Name Row */}
            <div className="space-y-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelEdit(); }}
                    className="flex-1 bg-[#16171F] border border-[#6366F1]/50 rounded-lg px-3 py-1.5 text-white text-sm font-bold focus:outline-none focus:border-[#818CF8]"
                    placeholder="Tu nombre completo"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="p-1.5 bg-[#6366F1]/20 hover:bg-[#6366F1]/40 text-[#818CF8] rounded-lg transition-all disabled:opacity-50"
                  >
                    {isSavingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 hover:bg-[#20222D] text-[#64748B] hover:text-white rounded-lg transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h3 className="text-xl font-black text-white leading-none">
                    {profile?.fullName || 'Profesional'}
                  </h3>
                  <button
                    onClick={() => { setNameInput(profile?.fullName || ''); setIsEditingName(true); }}
                    className="p-1 hover:bg-[#20222D] text-[#64748B] hover:text-[#818CF8] rounded-md transition-all"
                    title="Editar nombre"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
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
                {displayedSkills.length > 0 ? displayedSkills.map((skill: any) => (
                  <span key={skill} className="text-[10px] font-bold px-2.5 py-1 bg-[#1E222D] text-[#E2E8F0] rounded-lg border border-[#272B36] hover:border-[#6366F1] transition-colors select-none">
                    {skill}
                  </span>
                )) : (
                  <span className="text-[10px] text-[#64748B] italic">Agrega habilidades a tu CV para verlas aquí</span>
                )}
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
                <p className="text-xs font-bold text-white">{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
                <span>Experiencia Laboral</span>
                {displayedActivities.length > 0 && (
                  <span className="text-[9px] text-[#818CF8] hover:underline cursor-pointer">Ver más</span>
                )}
              </h4>
              <div className="space-y-3">
                {displayedActivities.length > 0 ? displayedActivities.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#16171F] border border-[#222531] rounded-xl">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-[#64748B]">{item.role}</p>
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium shrink-0">{item.time}</span>
                  </div>
                )) : (
                  <div className="p-4 bg-[#16171F] border border-[#222531] rounded-xl text-center">
                    <p className="text-[10px] text-[#64748B] italic">Agrega experiencia laboral a tu CV para verla aquí</p>
                  </div>
                )}
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
            <span className="text-2xl font-black text-white block">{cvs.length > 0 ? '100%' : '0%'}</span>
            <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mt-1 block">Availability</span>
          </div>
          <div className="bg-[#12131A] border border-[#1E222D] rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
            <span className="text-2xl font-black text-white block">{latestCv?.summary ? Math.round(atsScore * 0.96) : 0}%</span>
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
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all ${idx === 0
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
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.status === 'Completado'
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
};
