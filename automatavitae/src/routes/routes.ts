import { createBrowserRouter, redirect } from 'react-router';
import { Layout } from '../layouts/Layout';
import { StepPersonalInfo } from '../pages/StepPersonalInfo';
import { StepExperience } from '../pages/StepExperience';
import { StepEducation } from '../pages/StepEducation';
import { StepSkills } from '../pages/StepSkills';
import { StepPreview } from '../pages/StepPreview';
import { LandingPage } from '../pages/LandingPage';

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  {
    path: '/app',
    Component: Layout,
    children: [
      { index: true, Component: StepPersonalInfo },
      { path: 'experience', Component: StepExperience },
      { path: 'education', Component: StepEducation },
      { path: 'skills', Component: StepSkills },
      { path: 'preview', Component: StepPreview },
    ],
  },
  { path: '*', loader: () => redirect('/') }
]);
