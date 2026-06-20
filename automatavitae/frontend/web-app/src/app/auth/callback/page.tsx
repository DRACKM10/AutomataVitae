"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      setError('Código de autorización no encontrado en la URL');
      return;
    }

    const processGithubLogin = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3005';
        const res = await fetch(`${apiUrl}/api/v1/auth/github`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error al autenticar con GitHub');
        }

        const data = await res.json();
        console.log('Login con GitHub exitoso. Token:', data.token);
        
        // Aquí podrías guardar el token en localStorage o cookies
        
        router.push('/create');
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      }
    };

    processGithubLogin();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error de Autenticación</h1>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <button 
          onClick={() => router.push('/login')}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver al Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Verificando con GitHub, por favor espera...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
