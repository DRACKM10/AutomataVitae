import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Loader2, X } from 'lucide-react';
import { StandardTemplate, ModernGlassTemplate, ExecutiveSplitTemplate, CreativeStudioTemplate } from '@/components/steps/ResumePreview';

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
                  {previewCv.templateId === 'modern_glass' ? (
                    <ModernGlassTemplate data={previewCv} />
                  ) : previewCv.templateId === 'executive_split' ? (
                    <ExecutiveSplitTemplate data={previewCv} />
                  ) : previewCv.templateId === 'creative_studio' ? (
                    <CreativeStudioTemplate data={previewCv} />
                  ) : (
                    <StandardTemplate data={previewCv} />
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
