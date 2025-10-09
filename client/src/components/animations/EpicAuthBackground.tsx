import React, { useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";

/**
 * Epic Auth Background Component
 *
 * Creates a stunning animated background for login/register pages with:
 * - Animated gradient waves
 * - Floating particles with trails
 * - Glowing orbs
 * - Dynamic grid distortion
 * - Pulse effects
 */
const EpicAuthBackground: React.FC = () => {
   const theme = useTheme();
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const isDark = theme.palette.mode === "dark";

   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      const setCanvasSize = () => {
         canvas.width = window.innerWidth;
         canvas.height = window.innerHeight;
      };
      setCanvasSize();
      window.addEventListener("resize", setCanvasSize);

      // Particle class
      class Particle {
         x: number;
         y: number;
         size: number;
         speedX: number;
         speedY: number;
         color: string;
         opacity: number;
         pulseSpeed: number;
         pulsePhase: number;

         constructor(canvasWidth: number, canvasHeight: number) {
            this.x = Math.random() * canvasWidth;
            this.y = Math.random() * canvasHeight;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;

            const colors = isDark
               ? ["#0099ff", "#00d4ff", "#0ea5e9", "#38bdf8"]
               : ["#06c", "#0099ff", "#0ea5e9"];
            this.color = colors[Math.floor(Math.random() * colors.length)];

            this.opacity = Math.random() * 0.5 + 0.3;
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
            this.pulsePhase = Math.random() * Math.PI * 2;
         }

         update(canvasWidth: number, canvasHeight: number) {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvasWidth) this.speedX *= -1;
            if (this.y < 0 || this.y > canvasHeight) this.speedY *= -1;

            this.pulsePhase += this.pulseSpeed;
            this.opacity = 0.3 + Math.sin(this.pulsePhase) * 0.2;
         }

         draw(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();

            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
         }
      }

      // Create particles
      const particles: Particle[] = [];
      const particleCount = isDark ? 120 : 80; // More particles in dark mode
      for (let i = 0; i < particleCount; i++) {
         particles.push(new Particle(canvas.width, canvas.height));
      }

      let mouseX = canvas.width / 2;
      let mouseY = canvas.height / 2;

      const handleMouseMove = (e: MouseEvent) => {
         mouseX = e.clientX;
         mouseY = e.clientY;
      };
      window.addEventListener("mousemove", handleMouseMove);

      // Animation loop
      let animationId: number;
      const animate = () => {
         ctx.clearRect(0, 0, canvas.width, canvas.height);

         // Update and draw particles
         particles.forEach((particle) => {
            particle.update(canvas.width, canvas.height);
            particle.draw(ctx);
         });

         // Draw connections
         particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach((p2) => {
               const dx = p1.x - p2.x;
               const dy = p1.y - p2.y;
               const distance = Math.sqrt(dx * dx + dy * dy);

               if (distance < 150) {
                  ctx.beginPath();
                  ctx.strokeStyle = isDark ? "#0099ff" : "#06c";
                  ctx.globalAlpha = (1 - distance / 150) * 0.2;
                  ctx.lineWidth = 1;
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.stroke();
                  ctx.globalAlpha = 1;
               }
            });

            // Mouse interaction
            const dx = p1.x - mouseX;
            const dy = p1.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 200) {
               ctx.beginPath();
               ctx.strokeStyle = isDark ? "#00d4ff" : "#0099ff";
               ctx.globalAlpha = (1 - distance / 200) * 0.4;
               ctx.lineWidth = 2;
               ctx.moveTo(p1.x, p1.y);
               ctx.lineTo(mouseX, mouseY);
               ctx.stroke();
               ctx.globalAlpha = 1;
            }
         });

         animationId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
         window.removeEventListener("resize", setCanvasSize);
         window.removeEventListener("mousemove", handleMouseMove);
         cancelAnimationFrame(animationId);
      };
   }, [isDark]);

   return (
      <>
         {/* Animated gradient background */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               zIndex: 0,
               background: isDark
                  ? "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)"
                  : "linear-gradient(135deg, #f0f4ff 0%, #e6f2ff 50%, #f0f4ff 100%)",
            }}
         />

         {/* Animated gradient orbs */}
         {[...Array(5)].map((_, i) => (
            <Box
               key={`orb-${i}`}
               sx={{
                  position: "fixed",
                  width: `${300 + i * 100}px`,
                  height: `${300 + i * 100}px`,
                  borderRadius: "50%",
                  background: isDark
                     ? `radial-gradient(circle, rgba(0,153,255,${0.15 - i * 0.02}), transparent)`
                     : `radial-gradient(circle, rgba(0,102,204,${0.12 - i * 0.02}), transparent)`,
                  filter: "blur(80px)",
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 20}%`,
                  animation: `float-orb-${i} ${20 + i * 5}s ease-in-out infinite`,
                  zIndex: 0,
                  "@keyframes float-orb-0": {
                     "0%, 100%": { transform: "translate(0, 0) scale(1)" },
                     "50%": { transform: "translate(100px, -80px) scale(1.2)" },
                  },
                  "@keyframes float-orb-1": {
                     "0%, 100%": { transform: "translate(0, 0) scale(1)" },
                     "50%": {
                        transform: "translate(-120px, 100px) scale(1.3)",
                     },
                  },
                  "@keyframes float-orb-2": {
                     "0%, 100%": { transform: "translate(0, 0) scale(1)" },
                     "50%": { transform: "translate(150px, 120px) scale(0.9)" },
                  },
                  "@keyframes float-orb-3": {
                     "0%, 100%": { transform: "translate(0, 0) scale(1)" },
                     "50%": {
                        transform: "translate(-100px, -90px) scale(1.1)",
                     },
                  },
                  "@keyframes float-orb-4": {
                     "0%, 100%": { transform: "translate(0, 0) scale(1)" },
                     "50%": { transform: "translate(80px, 150px) scale(1.15)" },
                  },
               }}
            />
         ))}

         {/* Grid pattern with distortion */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background: isDark
                  ? `linear-gradient(90deg, rgba(0,153,255,0.05) 1px, transparent 1px),
               linear-gradient(rgba(0,153,255,0.05) 1px, transparent 1px)`
                  : `linear-gradient(90deg, rgba(0,102,204,0.04) 1px, transparent 1px),
               linear-gradient(rgba(0,102,204,0.04) 1px, transparent 1px)`,
               backgroundSize: "60px 60px",
               opacity: 0.5,
               zIndex: 0,
               animation: "grid-flow 30s linear infinite",
               "@keyframes grid-flow": {
                  "0%": { transform: "perspective(500px) rotateX(0deg)" },
                  "100%": { transform: "perspective(500px) rotateX(360deg)" },
               },
            }}
         />

         {/* Canvas for particles */}
         <canvas
            ref={canvasRef}
            style={{
               position: "fixed",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               zIndex: 0,
               pointerEvents: "none",
            }}
         />

         {/* Pulse rings */}
         {[...Array(3)].map((_, i) => (
            <Box
               key={`ring-${i}`}
               sx={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  width: "800px",
                  height: "800px",
                  marginLeft: "-400px",
                  marginTop: "-400px",
                  borderRadius: "50%",
                  border: isDark
                     ? "2px solid rgba(0,153,255,0.1)"
                     : "2px solid rgba(0,102,204,0.08)",
                  animation: `pulse-ring ${3 + i}s ease-out infinite`,
                  animationDelay: `${i * 1}s`,
                  zIndex: 0,
                  "@keyframes pulse-ring": {
                     "0%": {
                        transform: "scale(0.5)",
                        opacity: 1,
                     },
                     "100%": {
                        transform: "scale(2)",
                        opacity: 0,
                     },
                  },
               }}
            />
         ))}
      </>
   );
};

export default EpicAuthBackground;
