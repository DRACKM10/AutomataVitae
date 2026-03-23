import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { StepPersonalInfo } from './components/StepPersonalInfo';
import { StepExperience } from './components/StepExperience';
import { StepEducation } from './components/StepEducation';
import { StepSkills } from './components/StepSkills';
import { StepPreview } from './components/StepPreview';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: StepPersonalInfo },
      { path: 'experience', Component: StepExperience },
      { path: 'education', Component: StepEducation },
      { path: 'skills', Component: StepSkills },
      { path: 'preview', Component: StepPreview },
    ],
  },
]);
