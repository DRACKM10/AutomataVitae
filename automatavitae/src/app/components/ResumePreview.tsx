import React from 'react';
import { useResume } from '../store';
import { Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';

export const ResumePreview: React.FC = () => {
  const { resumeData } = useResume();
  const { personalInfo, experience, education, skills } = resumeData;

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto border-2 border-gray-100">
      {/* Header */}
      <div className="border-b-4 border-blue-700 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {personalInfo.fullName || 'Tu Nombre'}
        </h1>
        <h2 className="text-xl text-blue-700 mb-3 font-medium">
          {personalInfo.title || 'Tu Título Profesional'}
        </h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-700" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-blue-700" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-700" />
              <span>{personalInfo.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2.5 uppercase tracking-wide border-b border-gray-300 pb-1">
            Resumen Profesional
          </h3>
          <p className="text-gray-700 leading-relaxed text-justify">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
            Experiencia Laboral
          </h3>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="border-l-4 border-blue-700 pl-4 hover:border-blue-900 transition-colors">
                <h4 className="font-semibold text-gray-900 text-base">{exp.position}</h4>
                <p className="text-blue-700 font-medium">{exp.company}</p>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
            Educación
          </h3>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="border-l-4 border-blue-700 pl-4 hover:border-blue-900 transition-colors">
                <h4 className="font-semibold text-gray-900 text-base">{edu.degree}</h4>
                <p className="text-blue-700 font-medium">{edu.institution}</p>
                {edu.field && <p className="text-gray-600 text-sm">{edu.field}</p>}
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {edu.startDate} - {edu.current ? 'Presente' : edu.endDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">
            Habilidades
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 rounded-full text-sm font-medium border border-blue-200 hover:shadow-sm transition-shadow"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!personalInfo.fullName &&
        experience.length === 0 &&
        education.length === 0 &&
        skills.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Tu hoja de vida aparecerá aquí</p>
            <p className="text-sm mt-2">Completa los pasos para ver la vista previa en tiempo real</p>
          </div>
        )}
    </div>
  );
};