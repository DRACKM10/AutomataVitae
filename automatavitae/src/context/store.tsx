import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

interface ResumeContextType {
  resumeData: ResumeData;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  addExperience: (exp: Experience) => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;
  deleteExperience: (id: string) => void;
  addEducation: (edu: Education) => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  deleteEducation: (id: string) => void;
  updateSkills: (skills: string[]) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within ResumeProvider');
  }
  return context;
};

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      title: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [],
  });

  const updatePersonalInfo = (info: Partial<PersonalInfo>) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info },
    }));
  };

  const addExperience = (exp: Experience) => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, exp],
    }));
  };

  const updateExperience = (id: string, exp: Partial<Experience>) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => (e.id === id ? { ...e, ...exp } : e)),
    }));
  };

  const deleteExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id),
    }));
  };

  const addEducation = (edu: Education) => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, edu],
    }));
  };

  const updateEducation = (id: string, edu: Partial<Education>) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(e => (e.id === id ? { ...e, ...edu } : e)),
    }));
  };

  const deleteEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id),
    }));
  };

  const updateSkills = (skills: string[]) => {
    setResumeData(prev => ({
      ...prev,
      skills,
    }));
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        updatePersonalInfo,
        addExperience,
        updateExperience,
        deleteExperience,
        addEducation,
        updateEducation,
        deleteEducation,
        updateSkills,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};
