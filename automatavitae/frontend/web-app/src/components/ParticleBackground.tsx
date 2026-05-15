"use client";

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export function ParticleBackground({ 
  baseOpacity = "opacity-40 dark:opacity-50",
  // animateOpacity unused in canvas, kept for prop compatibility
}: { 
  baseOpacity?: string,
  animateOpacity?: number[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Still use Framer Motion just for the soft spotlight aura
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const springConfig = { damping: 25, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    let animationFrameId: number;

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 180 // The antigravity force field radius
    };

    const colors = [
      '#3b82f6', // blue
      '#f87171', // red
      '#facc15', // yellow
      '#a855f7', // purple
      '#4ade80', // green
      '#f472b6'  // pink
    ];

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;
      angle: number;
      distance: number;
      speed: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.angle = Math.random() * Math.PI * 2;
        // Distribute in a wide orbit covering the screen
        this.distance = Math.random() * (Math.max(canvasWidth, canvasHeight) * 0.6);
        
        this.x = (canvasWidth / 2) + Math.cos(this.angle) * this.distance;
        this.y = (canvasHeight / 2) + Math.sin(this.angle) * this.distance;
        
        this.baseX = this.x;
        this.baseY = this.y;
        
        // Dynamic sizes corresponding to CSS versions
        this.size = Math.random() * 4 + 1.5;
        // Density determines how strongly it is repelled
        this.density = (Math.random() * 25) + 5; 
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speed = (Math.random() * 0.0003) + 0.00015; // Velocidad reducida para no distraer
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.closePath();
        ctx!.globalAlpha = 0.35; // Opacidad reducida para hacerlas tenues
        ctx!.fillStyle = this.color;
        ctx!.fill();
        ctx!.globalAlpha = 1.0; // Reset
      }

      update(canvasWidth: number, canvasHeight: number) {
        // Core orbiting path
        this.angle += this.speed;
        this.baseX = (canvasWidth / 2) + Math.cos(this.angle) * this.distance;
        this.baseY = (canvasHeight / 2) + Math.sin(this.angle) * this.distance;

        // Interactive "Antigravity" Effect
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          // Calculate force (closer = stronger repel)
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = forceDirectionX * force * this.density;
          const directionY = forceDirectionY * force * this.density;
          
          this.x -= directionX;
          this.y -= directionY;
        } else {
          // Smooth spring return to base orbit
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX;
            this.x -= dx / 15;
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY;
            this.y -= dy / 15;
          }
        }
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesArray = [];
      const numberOfParticles = Math.min(Math.floor(window.innerWidth / 2.5), 400); // Scale up to 400 points
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update(canvas.width, canvas.height);
        particlesArray[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => init();

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      // Set Framer Motion mouse for Spotlight
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouseX.set(-1000);
      mouseY.set(-1000);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      
      {/* Interactive Cursor Glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none opacity-50 dark:opacity-30 blur-[100px]"
        style={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(59,130,246,0.2) 50%, rgba(0,0,0,0) 80%)',
          left: -200, // Offset for center centering
          top: -200, 
          x: smoothMouseX,
          y: smoothMouseY,
        }}
      />

      <canvas 
        ref={canvasRef} 
        className={`w-full h-full ${baseOpacity} transition-opacity duration-1000 pointer-events-none`}
      />
    </div>
  );
}
