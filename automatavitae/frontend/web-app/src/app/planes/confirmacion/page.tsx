"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { ParticleBackground } from '@/components/ParticleBackground';

function ConfirmacionContent() {
  const params = useSearchParams();
  const ref = params.get('ref');

  return (
    <div className="relative z-10 text-center p-8 max-w-md">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        ¡Pago procesado!
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        Tu pago está siendo verificado.
      </p>
      {ref && (
        <p className="text-xs text-gray-400 mb-8">
          Referencia: <span className="font-mono">{ref}</span>
        </p>
      )}
      <Link href="/create" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold hover:opacity-90 transition-all">
        Crear mi CV →
      </Link>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-[#09090b]">
      <div className="absolute inset-0 pointer-events-none">
        <ParticleBackground baseOpacity="opacity-40 dark:opacity-50" />
      </div>
      <Suspense fallback={<div className="text-white">Cargando...</div>}>
        <ConfirmacionContent />
      </Suspense>
    </div>
  );
}