"use client";
import React from 'react';
import { useResume, ResumeData } from '@/context/store';
import { Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 2) return dateStr;
  const [year, month] = parts;
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthIdx = parseInt(month, 10) - 1;
  const monthName = months[monthIdx] || month;
  return `${monthName} ${year}`;
};

// 1. Plantilla Estándar (Automata Standard)
export const StandardTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-gray-900 rounded-lg shadow-xl p-8 max-w-3xl mx-auto border-2 border-gray-100 min-h-full">
    <div className="border-b-4 border-blue-700 pb-4 mb-6">
      <h1 className="text-3xl font-bold mb-2">{data.personalInfo.fullName || 'Tu Nombre'}</h1>
      <h2 className="text-xl text-blue-700 mb-3 font-medium">{data.personalInfo.title || 'Tu Título Profesional'}</h2>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        {data.personalInfo.email && <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-blue-700" /><span>{data.personalInfo.email}</span></div>}
        {data.personalInfo.phone && <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-blue-700" /><span>{data.personalInfo.phone}</span></div>}
        {data.personalInfo.location && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-700" /><span>{data.personalInfo.location}</span></div>}
      </div>
    </div>
    {data.personalInfo.summary && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2.5 uppercase tracking-wide border-b border-gray-300 pb-1">Resumen Profesional</h3>
        <p className="text-gray-700 leading-relaxed text-justify">{data.personalInfo.summary}</p>
      </div>
    )}
    {data.experience.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">Experiencia Laboral</h3>
        <div className="space-y-4">
          {data.experience.map((exp) => (
            <div key={exp.id} className="border-l-4 border-blue-700 pl-4 hover:border-blue-900 transition-colors">
              <h4 className="font-semibold text-base">{exp.position}</h4>
              <p className="text-blue-700 font-medium">{exp.company}</p>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}
    {data.education.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">Educación</h3>
        <div className="space-y-4">
          {data.education.map((edu) => (
            <div key={edu.id} className="border-l-4 border-blue-700 pl-4 hover:border-blue-900 transition-colors">
              <h4 className="font-semibold text-base">{edu.degree}</h4>
              <p className="text-blue-700 font-medium">{edu.institution}</p>
              {edu.field && <p className="text-gray-600 text-sm">{edu.field}</p>}
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(edu.startDate)} - {edu.current ? 'Presente' : formatDate(edu.endDate)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    {data.skills.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">Habilidades</h3>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, index) => (
            <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 rounded-full text-sm font-medium border border-blue-200">{skill}</span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// 2. Plantilla Modern Glass
export const ModernGlassTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-[#0b0f19] text-gray-200 rounded-lg shadow-xl p-8 max-w-3xl mx-auto border border-blue-900/30 min-h-full font-sans relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
    <div className="border-b border-blue-500/30 pb-6 mb-6 z-10 relative">
      <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{data.personalInfo.fullName || 'Tu Nombre'}</h1>
      <h2 className="text-xl text-blue-400 mb-4 font-semibold tracking-wide uppercase">{data.personalInfo.title || 'Tu Título Profesional'}</h2>
      <div className="flex flex-wrap gap-5 text-sm text-gray-400">
        {data.personalInfo.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /><span>{data.personalInfo.email}</span></div>}
        {data.personalInfo.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" /><span>{data.personalInfo.phone}</span></div>}
        {data.personalInfo.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /><span>{data.personalInfo.location}</span></div>}
      </div>
    </div>
    {data.personalInfo.summary && (
      <div className="mb-8 z-10 relative">
        <h3 className="text-sm font-bold text-blue-500 mb-3 uppercase tracking-[0.2em]">Resumen</h3>
        <p className="text-gray-300 leading-relaxed font-light">{data.personalInfo.summary}</p>
      </div>
    )}
    {data.experience.length > 0 && (
      <div className="mb-8 z-10 relative">
        <h3 className="text-sm font-bold text-blue-500 mb-4 uppercase tracking-[0.2em]">Experiencia</h3>
        <div className="space-y-6">
          {data.experience.map((exp) => (
            <div key={exp.id} className="relative pl-6 border-l border-blue-500/20">
              <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[4.5px] top-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              <h4 className="font-bold text-white text-lg">{exp.position}</h4>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm mb-2">
                <span className="text-blue-300 font-medium">{exp.company}</span>
                <span className="hidden sm:inline text-gray-600">•</span>
                <span className="text-gray-500 font-mono text-xs">{formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line font-light">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}
    {data.education.length > 0 && (
      <div className="mb-8 z-10 relative">
        <h3 className="text-sm font-bold text-blue-500 mb-4 uppercase tracking-[0.2em]">Educación</h3>
        <div className="space-y-4">
          {data.education.map((edu) => (
            <div key={edu.id} className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h4 className="font-bold text-white">{edu.degree}</h4>
              <p className="text-blue-300 text-sm mt-1">{edu.institution} {edu.field ? `— ${edu.field}` : ''}</p>
              <p className="text-gray-500 font-mono text-xs mt-2">{formatDate(edu.startDate)} - {edu.current ? 'Presente' : formatDate(edu.endDate)}</p>
            </div>
          ))}
        </div>
      </div>
    )}
    {data.skills.length > 0 && (
      <div className="mb-6 z-10 relative">
        <h3 className="text-sm font-bold text-blue-500 mb-4 uppercase tracking-[0.2em]">Habilidades</h3>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, index) => (
            <span key={index} className="px-4 py-1.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-md text-sm font-medium">{skill}</span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// 3. Plantilla Executive Split
export const ExecutiveSplitTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-gray-900 rounded-lg shadow-xl max-w-3xl mx-auto border-2 border-gray-100 min-h-[1056px] flex overflow-hidden">
    {/* Columna Izquierda */}
    <div className="w-1/3 bg-[#1e293b] text-white p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold leading-tight mb-2">{data.personalInfo.fullName || 'Tu Nombre'}</h1>
        <h2 className="text-sm text-blue-300 font-medium">{data.personalInfo.title || 'Tu Título Profesional'}</h2>
      </div>
      <div className="space-y-4 text-xs text-gray-300 mb-8 border-b border-gray-700 pb-8">
        {data.personalInfo.email && <div className="flex items-center gap-2 break-all"><Mail className="w-4 h-4 shrink-0" /><span>{data.personalInfo.email}</span></div>}
        {data.personalInfo.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /><span>{data.personalInfo.phone}</span></div>}
        {data.personalInfo.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /><span>{data.personalInfo.location}</span></div>}
      </div>
      {data.skills.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-gray-400">Habilidades</h3>
          <ul className="space-y-2">
            {data.skills.map((skill, idx) => (
              <li key={idx} className="text-sm border-l-2 border-blue-500 pl-2">{skill}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
    {/* Columna Derecha */}
    <div className="w-2/3 p-8 bg-white">
      {data.personalInfo.summary && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-3 uppercase tracking-wider">Perfil</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{data.personalInfo.summary}</p>
        </div>
      )}
      {data.experience.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4 uppercase tracking-wider">Experiencia</h3>
          <div className="space-y-5">
            {data.experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-gray-900">{exp.position}</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded shrink-0">{formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}</span>
                </div>
                <p className="text-blue-700 text-sm font-semibold mb-2">{exp.company}</p>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.education.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4 uppercase tracking-wider">Educación</h3>
          <div className="space-y-4">
            {data.education.map(edu => (
              <div key={edu.id}>
                <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                <p className="text-gray-700 text-sm">{edu.institution} {edu.field && `· ${edu.field}`}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(edu.startDate)} - {edu.current ? 'Presente' : formatDate(edu.endDate)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// 4. Plantilla Creative Studio
export const CreativeStudioTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-[#fafafa] text-gray-800 rounded-lg shadow-xl p-10 max-w-3xl mx-auto border-2 border-gray-100 min-h-full font-serif">
    <div className="text-center mb-10">
      <h1 className="text-4xl font-black tracking-tighter text-black mb-3">{data.personalInfo.fullName || 'Tu Nombre'}</h1>
      <h2 className="text-lg text-gray-500 italic mb-4">{data.personalInfo.title || 'Tu Título Profesional'}</h2>
      <div className="flex justify-center flex-wrap gap-4 text-xs font-sans text-gray-400 uppercase tracking-widest">
        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
        {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
        {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
      </div>
    </div>

    {data.personalInfo.summary && (
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <p className="text-gray-600 text-sm leading-loose italic">"{data.personalInfo.summary}"</p>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        {data.experience.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-black border-t-2 border-black pt-2 mb-6">Experiencia</h3>
            <div className="space-y-6">
              {data.experience.map(exp => (
                <div key={exp.id}>
                  <p className="text-xs font-sans text-gray-400 mb-1">{formatDate(exp.startDate)} — {exp.current ? 'Presente' : formatDate(exp.endDate)}</p>
                  <h4 className="font-bold text-gray-900 text-sm">{exp.position}</h4>
                  <p className="text-gray-800 text-sm mb-2 font-medium">{exp.company}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        {data.education.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-black border-t-2 border-black pt-2 mb-6">Educación</h3>
            <div className="space-y-6">
              {data.education.map(edu => (
                <div key={edu.id}>
                  <p className="text-xs font-sans text-gray-400 mb-1">{formatDate(edu.startDate)} — {edu.current ? 'Presente' : formatDate(edu.endDate)}</p>
                  <h4 className="font-bold text-gray-900 text-sm">{edu.degree}</h4>
                  <p className="text-gray-800 text-sm">{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-black border-t-2 border-black pt-2 mb-6">Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="text-xs border border-gray-300 text-gray-600 px-2 py-1 rounded-sm">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);


export const ResumePreview: React.FC = () => {
  const { resumeData } = useResume();
  const { personalInfo, experience, education, skills, templateId } = resumeData;

  const isEmpty = !personalInfo.fullName && experience.length === 0 && education.length === 0 && skills.length === 0;

  if (isEmpty) {
    return (
      <div className="text-center py-16 text-gray-400 bg-white rounded-lg p-8 border-2 border-gray-100">
        <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">Tu hoja de vida aparecerá aquí</p>
        <p className="text-sm mt-2">Completa los pasos para ver la vista previa en tiempo real</p>
      </div>
    );
  }

  switch (templateId) {
    case 'modern_glass':
      return <ModernGlassTemplate data={resumeData} />;
    case 'executive_split':
      return <ExecutiveSplitTemplate data={resumeData} />;
    case 'creative_studio':
      return <CreativeStudioTemplate data={resumeData} />;
    case 'automata_standard':
    default:
      return <StandardTemplate data={resumeData} />;
  }
};
