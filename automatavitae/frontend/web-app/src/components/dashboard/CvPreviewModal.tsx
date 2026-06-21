import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Loader2, X } from 'lucide-react';

interface CvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewCv: any | null;
  isLoading: boolean;
}

export const CvPreviewModal: React.FC<CvPreviewModalProps> = ({ isOpen, onClose, previewCv, isLoading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-[#12131A] border border-[#1E222D] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1E222D] shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-lg">
                  <Eye className="w-5 h-5 text-[#818CF8]" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Vista Previa del CV</h3>
                  <p className="text-xs text-[#64748B]">
                    {previewCv?.templateId === 'modern_glass' ? 'Modern Glass' :
                     previewCv?.templateId === 'executive_split' ? 'Executive Split' :
                     previewCv?.templateId === 'creative_studio' ? 'Creative Studio' :
                     'Automata Standard'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#20222D] text-[#64748B] hover:text-white rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 flex justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-[#6366F1] animate-spin" />
                  <p className="text-[#64748B] text-sm">Cargando vista previa...</p>
                </div>
              ) : previewCv ? (
                <div className="w-[794px] shrink-0">
                  {/* Inline preview using same template logic */}
                  {previewCv.templateId === 'modern_glass' ? (
                    <div className="bg-[#0b0f19] text-gray-200 rounded-lg p-8 border border-blue-900/30 font-sans min-h-[1123px]">
                      <div className="border-b border-blue-500/30 pb-6 mb-6">
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{previewCv.personalInfo.fullName || 'Sin nombre'}</h1>
                        <h2 className="text-xl text-blue-400 mb-4 font-semibold tracking-wide uppercase">{previewCv.personalInfo.title}</h2>
                        <div className="flex flex-wrap gap-5 text-sm text-gray-400">
                          {previewCv.personalInfo.email && <span>✉ {previewCv.personalInfo.email}</span>}
                          {previewCv.personalInfo.phone && <span>✆ {previewCv.personalInfo.phone}</span>}
                          {previewCv.personalInfo.location && <span>⊙ {previewCv.personalInfo.location}</span>}
                        </div>
                      </div>
                      {previewCv.personalInfo.summary && <p className="text-gray-300 font-light mb-8">{previewCv.personalInfo.summary}</p>}
                      {previewCv.experience.map((exp: any) => (
                        <div key={exp.id} className="mb-6 pl-6 border-l-2 border-blue-500/30">
                          <h4 className="font-bold text-white text-lg">{exp.position}</h4>
                          <p className="text-blue-300 font-medium">{exp.company}</p>
                          <p className="text-gray-400 text-sm mt-2 whitespace-pre-line">{exp.description}</p>
                        </div>
                      ))}
                      {previewCv.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {previewCv.skills.map((s: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-md text-sm">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : previewCv.templateId === 'executive_split' ? (
                    <div className="flex rounded-lg overflow-hidden border-2 border-gray-100 min-h-[1123px]">
                      <div className="w-1/3 bg-[#1e293b] text-white p-6">
                        <h1 className="text-2xl font-bold mb-1">{previewCv.personalInfo.fullName}</h1>
                        <h2 className="text-sm text-blue-300 mb-6">{previewCv.personalInfo.title}</h2>
                        <div className="text-xs text-gray-300 space-y-3 mb-8">
                          {previewCv.personalInfo.email && <div>✉ {previewCv.personalInfo.email}</div>}
                          {previewCv.personalInfo.phone && <div>✆ {previewCv.personalInfo.phone}</div>}
                          {previewCv.personalInfo.location && <div>⊙ {previewCv.personalInfo.location}</div>}
                        </div>
                        {previewCv.skills.length > 0 && (
                          <ul className="space-y-2">{previewCv.skills.map((s: string, i: number) => <li key={i} className="text-sm border-l-2 border-blue-500 pl-2">{s}</li>)}</ul>
                        )}
                      </div>
                      <div className="w-2/3 bg-white text-gray-900 p-8">
                        {previewCv.personalInfo.summary && <p className="text-gray-600 text-sm mb-8">{previewCv.personalInfo.summary}</p>}
                        {previewCv.experience.map((exp: any) => (
                          <div key={exp.id} className="mb-5">
                            <h4 className="font-bold">{exp.position}</h4>
                            <p className="text-blue-700 text-sm font-semibold mb-1">{exp.company}</p>
                            <p className="text-gray-600 text-sm whitespace-pre-line">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Standard / Creative Studio — use the standard clean look
                    <div className="bg-white text-gray-900 rounded-lg shadow-xl p-8 border-2 border-gray-100 min-h-[1123px]">
                      <div className="border-b-4 border-blue-700 pb-4 mb-6">
                        <h1 className="text-3xl font-bold mb-2">{previewCv.personalInfo.fullName || 'Sin nombre'}</h1>
                        <h2 className="text-xl text-blue-700 mb-3 font-medium">{previewCv.personalInfo.title}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {previewCv.personalInfo.email && <span>✉ {previewCv.personalInfo.email}</span>}
                          {previewCv.personalInfo.phone && <span>✆ {previewCv.personalInfo.phone}</span>}
                          {previewCv.personalInfo.location && <span>⊙ {previewCv.personalInfo.location}</span>}
                        </div>
                      </div>
                      {previewCv.personalInfo.summary && <p className="text-gray-700 leading-relaxed mb-6">{previewCv.personalInfo.summary}</p>}
                      {previewCv.experience.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">Experiencia</h3>
                          {previewCv.experience.map((exp: any) => (
                            <div key={exp.id} className="border-l-4 border-blue-700 pl-4 mb-4">
                              <h4 className="font-semibold">{exp.position}</h4>
                              <p className="text-blue-700 font-medium">{exp.company}</p>
                              <p className="text-gray-700 text-sm mt-1 whitespace-pre-line">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {previewCv.education.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">Educación</h3>
                          {previewCv.education.map((edu: any) => (
                            <div key={edu.id} className="border-l-4 border-blue-700 pl-4 mb-4">
                              <h4 className="font-semibold">{edu.degree}</h4>
                              <p className="text-blue-700 font-medium">{edu.institution}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {previewCv.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {previewCv.skills.map((s: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
