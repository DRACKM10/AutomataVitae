"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  UploadCloud, 
  FileText, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  ArrowRight,
  Loader2
} from "lucide-react";

interface AnalysisResult {
  score: number;
  fortalezas: string[];
  debilidades: string[];
  sugerencias: string[];
  keywords_faltantes: string[];
}

export default function AppHome() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  const analyzeCV = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("cv", file); // Assuming the field name is "cv" or "file". We'll use "file" to be generic.
    
    // We recreate it just to be sure
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await fetch("http://localhost:3001/api/cv/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("No se pudo conectar con el servidor para analizar el CV. Verifica que el backend esté ejecutándose.");
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  // Helper for Score Color
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 5) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header Premium Glassmorphism */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Bot size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AutomataVitae</h1>
        </div>
        {!result && (
          <div className="text-sm font-medium text-muted hidden sm:block">
            AI Resume Analyzer
          </div>
        )}
        {result && (
          <button 
            onClick={resetAnalysis}
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Analizar otro CV
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-16 md:px-6">
        <div className="w-full max-w-3xl space-y-8">
          
          {/* STATE 1: Initial Upload Form */}
          {!result && !loading && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                  Eleva tu CV con <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Inteligencia Artificial</span>
                </h2>
                <p className="text-muted text-lg max-w-xl mx-auto">
                  Sube tu hoja de vida en PDF. Nuestra IA (Claude) la analizará, 
                  calificará y te dará sugerencias concretas para conseguir esa entrevista.
                </p>
              </div>

              {/* Dropzone */}
              <div 
                {...getRootProps()} 
                className={`border-3 border-dashed rounded-3xl p-10 sm:p-16 transition-all cursor-pointer flex flex-col items-center justify-center text-center group
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-card/50'}`}
              >
                <input {...getInputProps()} />
                <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300
                  ${isDragActive ? 'bg-primary text-primary-foreground scale-110 shadow-xl shadow-primary/30' : 'bg-primary/10 text-primary group-hover:scale-105 group-hover:bg-primary/20'}`}>
                  {file ? <FileText size={36} /> : <UploadCloud size={36} />}
                </div>
                {file ? (
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-foreground">{file.name}</p>
                    <p className="text-sm text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB - PDF listo para analizar</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-foreground">Arrastra tu PDF aquí</p>
                    <p className="text-sm text-muted">o haz clic para buscar en tus archivos</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center font-medium flex items-center justify-center gap-2">
                  <AlertTriangle size={18} />
                  {error}
                </div>
              )}

              <div className="flex justify-center">
                <button 
                  onClick={analyzeCV}
                  disabled={!file}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0"
                >
                  Analizar CV con IA <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: Loading Analysis */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <div className="h-24 w-24 bg-card border-2 border-primary/30 rounded-full flex items-center justify-center relative shadow-2xl">
                  <Loader2 className="animate-spin text-primary" size={40} />
                </div>
              </div>
              <h3 className="mt-8 text-2xl font-bold">Analizando tu CV...</h3>
              <p className="text-muted mt-2 text-center max-w-sm">
                Claude está leyendo tu experiencia, buscando palabras clave y preparando recomendaciones estratégicas.
              </p>
            </div>
          )}

          {/* STATE 3: Results Dashboard */}
          {result && !loading && (
            <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-8">
              {/* Score Hero */}
              <div className="bg-card border border-border rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-sm">
                <div className="space-y-2 text-center sm:text-left">
                  <h2 className="text-2xl font-bold">Diagnóstico de tu CV</h2>
                  <p className="text-muted text-sm max-w-md">Basado en las mejores prácticas de la industria y el análisis de compatibilidad con filtros ATS.</p>
                </div>
                <div className="flex flex-col items-center justify-center shrink-0">
                  <div className={`text-6xl font-black ${getScoreColor(result.score || 0)}`}>
                    {result.score || 0}<span className="text-2xl opacity-50">/10</span>
                  </div>
                  <div className="text-sm font-semibold uppercase tracking-wider mt-2 opacity-50">Score Global</div>
                </div>
              </div>

              {/* Keywords */}
              {result.keywords_faltantes && result.keywords_faltantes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-2">
                    <AlertTriangle size={16} /> Keywords Faltantes (ATS)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords_faltantes.map((kw, idx) => (
                      <span key={idx} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-sm font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fortalezas */}
                <div className="bg-green-500/5 border border-green-500/20 rounded-3xl p-6 space-y-4">
                  <h3 className="text-green-600 dark:text-green-400 font-bold text-lg flex items-center gap-2">
                    <CheckCircle2 size={24} /> Lo que está bien
                  </h3>
                  <ul className="space-y-3">
                    {result.fortalezas?.map((str, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-foreground/80 leading-relaxed">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                    {(!result.fortalezas || result.fortalezas.length === 0) && (
                      <p className="text-sm text-muted">No se encontraron fortalezas destacables.</p>
                    )}
                  </ul>
                </div>

                {/* Debilidades */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 space-y-4">
                  <h3 className="text-red-600 dark:text-red-400 font-bold text-lg flex items-center gap-2">
                    <AlertTriangle size={24} /> Áreas de riesgo
                  </h3>
                  <ul className="space-y-3">
                    {result.debilidades?.map((weak, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-foreground/80 leading-relaxed">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                    {(!result.debilidades || result.debilidades.length === 0) && (
                      <p className="text-sm text-muted">Tu CV no tiene debilidades críticas encontradas.</p>
                    )}
                  </ul>
                </div>
              </div>

              {/* Sugerencias */}
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <h3 className="font-bold text-xl flex items-center gap-3">
                  <div className="bg-yellow-500/10 text-yellow-500 p-2 rounded-xl"><Lightbulb size={24} /></div>
                  Plan de Acción
                </h3>
                <div className="space-y-4">
                  {result.sugerencias?.map((sug, idx) => (
                    <div key={idx} className="p-4 bg-background rounded-2xl border border-border text-sm leading-relaxed text-foreground/90 flex gap-4">
                      <div className="font-black text-muted text-xl">{idx + 1}</div>
                      <p>{sug}</p>
                    </div>
                  ))}
                  {(!result.sugerencias || result.sugerencias.length === 0) && (
                    <p className="text-sm text-muted">No hay sugerencias adicionales.</p>
                  )}
                </div>
              </div>
              
              <div className="pt-8 flex justify-center pb-12">
                 <button className="bg-foreground text-background px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform" disabled>
                   Practicar Entrevista (Próximamente)
                 </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
