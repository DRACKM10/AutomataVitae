import { RouterProvider } from 'react-router';
import { router } from './routes/routes';
import { ResumeProvider } from './context/store';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <ResumeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </ResumeProvider>
  );
}
