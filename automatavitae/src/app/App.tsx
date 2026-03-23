import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ResumeProvider } from './store';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <ResumeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </ResumeProvider>
  );
}