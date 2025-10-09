import React, { useEffect, useRef } from "react";
import { useTheme } from "@mui/material";

/**
 * Epic Particles Background - Advanced interactive particle system
 * Features: Mouse tracking, dynamic connections, smooth animations, dark mode support
 * Enhanced with more particles and stronger visual effects
 */
const ParticlesBackground: React.FC = () => {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const theme = useTheme();
   const isDark = theme.palette.mode === "dark";

   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      const resizeCanvas = () => {
         if (!canvas) return;
         canvas.width = window.innerWidth;
         canvas.height = window.innerHeight;
      };
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      // Particle system - ENHANCED
      class Particle {
         x: number;
         y: number;
         vx: number;
         vy: number;
         radius: number;

         constructor() {
            if (!canvas) {
               this.x = 0;
               this.y = 0;
            } else {
               this.x = Math.random() * canvas.width;
               this.y = Math.random() * canvas.height;
            }
            this.vx = (Math.random() - 0.5) * 0.8; // Faster movement
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 2.5 + 1.5; // Larger particles
         }

         update() {
            this.x += this.vx;
            this.y += this.vy;

            if (!canvas) return;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
         }

         draw() {
            if (!ctx) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            // Brighter particles with glow
            ctx.fillStyle = isDark
               ? "rgba(56, 189, 248, 0.8)"
               : "rgba(0, 153, 255, 0.7)";
            ctx.shadowBlur = 10;
            ctx.shadowColor = isDark ? "#38bdf8" : "#0099ff";
            ctx.fill();
            ctx.shadowBlur = 0;
         }
      }

      const particles: Particle[] = [];
      const particleCount = 150; // More particles
      for (let i = 0; i < particleCount; i++) {
         particles.push(new Particle());
      }

      let mouseX = 0;
      let mouseY = 0;

      const handleMouseMove = (e: MouseEvent) => {
         mouseX = e.clientX;
         mouseY = e.clientY;
      };
      window.addEventListener("mousemove", handleMouseMove);

      // Animation loop
      const animate = () => {
         ctx.clearRect(0, 0, canvas.width, canvas.height);

         particles.forEach((particle) => {
            particle.update();
            particle.draw();
         });

         // Draw connections with stronger blue gradient
         particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach((p2) => {
               const dx = p1.x - p2.x;
               const dy = p1.y - p2.y;
               const distance = Math.sqrt(dx * dx + dy * dy);

               if (distance < 140) {
                  // Longer connection distance
                  ctx.beginPath();
                  ctx.strokeStyle = isDark
                     ? `rgba(56, 189, 248, ${0.4 - distance / 500})`
                     : `rgba(0, 153, 255, ${0.35 - distance / 500})`;
                  ctx.lineWidth = 1.5;
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.stroke();
               }
            });

            // Mouse interaction with stronger blue glow
            const dx = p1.x - mouseX;
            const dy = p1.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 180) {
               // Larger interaction radius
               ctx.beginPath();
               ctx.strokeStyle = isDark
                  ? `rgba(0, 204, 255, ${0.7 - distance / 300})`
                  : `rgba(0, 153, 255, ${0.6 - distance / 300})`;
               ctx.lineWidth = 2.5;
               ctx.shadowBlur = 8;
               ctx.shadowColor = isDark ? "#00ccff" : "#0099ff";
               ctx.moveTo(p1.x, p1.y);
               ctx.lineTo(mouseX, mouseY);
               ctx.stroke();
               ctx.shadowBlur = 0;
            }
         });

         requestAnimationFrame(animate);
      };

      animate();

      return () => {
         window.removeEventListener("resize", resizeCanvas);
         window.removeEventListener("mousemove", handleMouseMove);
      };
   }, [isDark]);

   return (
      <canvas
         ref={canvasRef}
         style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.9, // Slightly more visible
         }}
      />
   );
};

export default ParticlesBackground;
