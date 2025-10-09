import React, { useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";

/**
 * StarfieldBackground Component
 *
 * Creates an animated starfield with twinkling stars and shooting stars (meteors)
 * in dark mode. Provides a premium, space-themed background effect.
 *
 * Features:
 * - Multiple layers of stars with different sizes and twinkle rates
 * - Periodic shooting stars that streak across the screen
 * - Optimized canvas rendering for performance
 * - Responsive to theme changes (only visible in dark mode)
 */
const StarfieldBackground: React.FC = () => {
   const theme = useTheme();
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const isDarkMode = theme.palette.mode === "dark";

   useEffect(() => {
      if (!isDarkMode) return;

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

      // Star class
      class Star {
         x: number;
         y: number;
         size: number;
         brightness: number;
         twinkleSpeed: number;
         twinklePhase: number;

         constructor(canvasWidth: number, canvasHeight: number) {
            this.x = Math.random() * canvasWidth;
            this.y = Math.random() * canvasHeight;
            this.size = Math.random() * 2 + 0.5;
            this.brightness = Math.random();
            this.twinkleSpeed = Math.random() * 0.02 + 0.005;
            this.twinklePhase = Math.random() * Math.PI * 2;
         }

         update() {
            this.twinklePhase += this.twinkleSpeed;
            this.brightness = (Math.sin(this.twinklePhase) + 1) / 2;
         }

         draw(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness * 0.8})`;
            ctx.fill();

            // Add glow effect for larger stars
            if (this.size > 1.5) {
               const gradient = ctx.createRadialGradient(
                  this.x,
                  this.y,
                  0,
                  this.x,
                  this.y,
                  this.size * 3,
               );
               gradient.addColorStop(
                  0,
                  `rgba(255, 255, 255, ${this.brightness * 0.3})`,
               );
               gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
               ctx.fillStyle = gradient;
               ctx.fillRect(
                  this.x - this.size * 3,
                  this.y - this.size * 3,
                  this.size * 6,
                  this.size * 6,
               );
            }
         }
      }

      // Shooting star (meteor) class
      class ShootingStar {
         x: number;
         y: number;
         length: number;
         speed: number;
         angle: number;
         opacity: number;
         fadeSpeed: number;

         constructor() {
            // Start from random position in upper portion
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height * 0.5;
            this.length = Math.random() * 80 + 60;
            this.speed = Math.random() * 10 + 15;
            this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5; // Roughly 45 degrees
            this.opacity = 1;
            this.fadeSpeed = 0.015;
         }

         update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.opacity -= this.fadeSpeed;
         }

         draw(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            // Create gradient for the tail
            const gradient = ctx.createLinearGradient(0, 0, -this.length, 0);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
            gradient.addColorStop(
               0.5,
               `rgba(180, 200, 255, ${this.opacity * 0.5})`,
            );
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-this.length, 0);
            ctx.stroke();

            // Add glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
            ctx.stroke();

            ctx.restore();
         }

         isFinished() {
            return (
               this.opacity <= 0 ||
               this.x > canvas.width + 100 ||
               this.y > canvas.height + 100
            );
         }
      }

      // Create stars
      const stars: Star[] = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < starCount; i++) {
         stars.push(new Star());
      }

      // Shooting stars array
      const shootingStars: ShootingStar[] = [];
      let lastShootingStarTime = 0;

      // Animation loop
      const animate = (timestamp: number) => {
         if (!ctx || !canvas) return;

         // Clear canvas with slight trail effect for smoother animation
         ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
         ctx.fillRect(0, 0, canvas.width, canvas.height);

         // Update and draw stars
         stars.forEach((star) => {
            star.update();
            star.draw(ctx);
         });

         // Create new shooting stars periodically
         if (timestamp - lastShootingStarTime > 3000 + Math.random() * 4000) {
            shootingStars.push(new ShootingStar());
            lastShootingStarTime = timestamp;
         }

         // Update and draw shooting stars
         for (let i = shootingStars.length - 1; i >= 0; i--) {
            const shootingStar = shootingStars[i];
            shootingStar.update();
            shootingStar.draw(ctx);

            if (shootingStar.isFinished()) {
               shootingStars.splice(i, 1);
            }
         }

         requestAnimationFrame(animate);
      };

      const animationId = requestAnimationFrame(animate);

      return () => {
         window.removeEventListener("resize", setCanvasSize);
         cancelAnimationFrame(animationId);
      };
   }, [isDarkMode]);

   if (!isDarkMode) return null;

   return (
      <Box
         sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0.6,
         }}
      >
         <canvas
            ref={canvasRef}
            style={{
               display: "block",
               width: "100%",
               height: "100%",
            }}
         />
      </Box>
   );
};

export default StarfieldBackground;
