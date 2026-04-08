import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Rocket, Moon, Sun, Download } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Toggle theme logic
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) setTheme('dark');
    else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    }
    
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  };

  // Generate particles for the swirl effect
  const [particles, setParticles] = useState<any[]>([]);
  useEffect(() => {
    const p = [];
    const colors = ['bg-blue-500', 'bg-red-400', 'bg-yellow-400', 'bg-purple-500', 'bg-green-400', 'bg-pink-400'];
    const total = 100;
    
    for (let i = 0; i < total; i++) {
      // Calculate a golden spiral positioning
      const t = i / total * Math.PI * 20; 
      const radius = (i / total) * (Math.min(dimensions.width, dimensions.height) * 0.45);
      const baseX = Math.cos(t) * radius;
      const baseY = Math.sin(t) * radius;
      
      p.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: Math.random() * 4 + 2,
        height: Math.random() * 8 + 3,
        x: baseX,
        y: baseY,
        angle: Math.atan2(baseY, baseX) * (180 / Math.PI), // Point angle
        delay: Math.random() * 2,
      });
    }
    setParticles(p);
  }, [dimensions]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white dark:bg-[#09090b] text-gray-900 dark:text-gray-100 transition-colors duration-500 font-sans flex flex-col">
      
      {/* Top Navbar */}
      <nav className="relative z-30 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/50 backdrop-blur-md bg-white/50 dark:bg-[#09090b]/50">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              A
            </span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">Automata</span>
            <span className="font-light text-gray-500 dark:text-gray-400">Vitae</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Producto</span>
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Casos de Uso</span>
          <span className="hover:text-blue-500 cursor-pointer transition-colors">Plantillas</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-300" />}
          </button>
          <motion.button
            onClick={() => navigate('/app')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-sm transition-colors hover:bg-gray-800 dark:hover:bg-gray-100"
          >
            Comenzar
            <Rocket className="w-4 h-4" />
          </motion.button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col justify-center items-center overflow-hidden">
        
        {/* Particle Swirl Container */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          >
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className={`absolute rounded-full ${p.color} opacity-70 dark:opacity-80`}
                style={{
                  width: p.width,
                  height: p.height,
                  left: p.x,
                  top: p.y,
                  transform: `rotate(${p.angle}deg)`,
                }}
                animate={{
                  x: [0, Math.random() * 10 - 5, 0],
                  y: [0, Math.random() * 10 - 5, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: p.delay
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Center Text block */}
        <div className="relative z-20 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center gap-3 mb-6">
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-4xl md:text-5xl font-extrabold tracking-tighter">
                A
              </span>
              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Automata <span className="font-light text-gray-500">Vitae</span>
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 dark:text-gray-200 mb-4 tracking-tight leading-tight">
              Diseña tu futuro profesional con Inteligencia Artificial.
            </h2>
            
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto text-base md:text-lg mb-8">
              AutomataVitae es tu constructor de currículums de próxima generación. Llena tus datos, obtén feedback analítico de reclutadores IA en tiempo real y exporta un documento perfecto.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10 text-left">
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <Rocket className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Rapidez</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Guarda tus datos en pasos estructurados para armar tu currículum en pocos minutos y sin distracciones.</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 mb-4 flex items-center justify-center text-white font-bold">IA</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Feedback IA Directo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mientras escribes, nuestra IA analiza y sugiere palabras clave, métricas de éxito y mejoras en tu redacción.</p>
              </div>
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <Download className="w-8 h-8 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Previsualización Live</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Visualiza tu progreso a lo largo de cada paso del asistente y descárgalo con un click en múltiples formatos.</p>
              </div>
            </div>

            <motion.button
              onClick={() => navigate('/app')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg shadow-lg flex items-center justify-center gap-2 mx-auto transition-all"
            >
              Comenzar a Crear
              <Rocket className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

