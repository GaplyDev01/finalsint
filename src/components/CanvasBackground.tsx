import React, { useEffect, useRef } from 'react';

const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize with a value to prevent "Cannot access before initialization" error
    let animationFrameId: number = 0;

    // Create particles
    const particles: Particle[] = [];
    const particleCount = Math.min(window.innerWidth / 20, 100); // Responsive count
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        color: `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 150 + 100)}, ${Math.floor(Math.random() * 100 + 150)}, ${Math.random() * 0.5 + 0.2})`,
        vx: Math.random() * 0.1 - 0.05,
        vy: Math.random() * 0.1 - 0.05,
      });
    }

    // Draw function
    function draw(ctx: CanvasRenderingContext2D) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid pattern
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 135, 230, 0.05)';
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let x = 0; x <= canvas.width; x += 60) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      
      // Horizontal lines
      for (let y = 0; y <= canvas.height; y += 60) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      
      ctx.stroke();

      // Update and draw particles
      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      // Draw connections between particles
      ctx.strokeStyle = 'rgba(0, 135, 230, 0.1)';
      ctx.lineWidth = 0.3;
      
      particles.forEach((particle, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = particle.x - p2.x;
          const dy = particle.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(() => draw(ctx));
    }

    // Set canvas size to match window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Redraw for the new dimensions
      if (ctx) draw(ctx);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial sizing

    // Start animation
    draw(ctx);

    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
};

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
}

export default CanvasBackground;