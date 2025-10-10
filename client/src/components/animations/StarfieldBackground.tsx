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
   // Track animation lifecycle and preferences to avoid runaway RAF loops
   const rafIdRef = useRef<number | null>(null);
   const runningRef = useRef<boolean>(false);
   const reducedMotionRef = useRef<boolean>(false);

   useEffect(() => {
      if (!isDarkMode) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Track dimensions separately to avoid nullable canvas typing inside classes
      let cWidth = window.innerWidth;
      let cHeight = window.innerHeight;

      // Set canvas size
      const setCanvasSize = () => {
         cWidth = window.innerWidth;
         cHeight = window.innerHeight;
         canvas.width = cWidth;
         canvas.height = cHeight;
      };
      setCanvasSize();
      window.addEventListener("resize", setCanvasSize);

      // Respect user motion preferences
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotionRef.current = mql.matches;
      const onReducedMotionChange = (e: MediaQueryListEvent) => {
         reducedMotionRef.current = e.matches;
         // If user switches to reduced motion on the fly, stop the loop
         if (e.matches) {
            runningRef.current = false;
            if (rafIdRef.current !== null) {
               cancelAnimationFrame(rafIdRef.current);
               rafIdRef.current = null;
            }
            // Re-render a static frame to keep a pleasant background
            renderStaticFrame();
         } else {
            // Resume
            if (!runningRef.current) {
               runningRef.current = true;
               rafIdRef.current = requestAnimationFrame(animate);
            }
         }
      };
      if ("addEventListener" in mql) {
         mql.addEventListener("change", onReducedMotionChange);
      } else {
         (mql as any).addListener(onReducedMotionChange);
      }

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
            this.x = Math.random() * cWidth;
            this.y = Math.random() * cHeight * 0.5;
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
               this.x > cWidth + 100 ||
               this.y > cHeight + 100
            );
         }
      }

      // Create stars
      const stars: Star[] = [];
      const starCount = Math.floor((cWidth * cHeight) / 8000);
      for (let i = 0; i < starCount; i++) {
         stars.push(new Star(cWidth, cHeight));
      }

      // Shooting stars array
      const shootingStars: ShootingStar[] = [];
      let lastShootingStarTime = 0;
      let nextSpawnGap = 3000 + Math.random() * 4000; // jitter once between spawns

      // Animation loop
      const animate = (timestamp: number) => {
         // If stopped (unmounted/hidden/reduced motion), don't schedule further frames
         if (!runningRef.current || reducedMotionRef.current) return;
         if (!ctx || !canvas) return;

         // Clear canvas with slight trail effect for smoother animation
         ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
         ctx.fillRect(0, 0, cWidth, cHeight);

         // Update and draw stars
         stars.forEach((star) => {
            star.update();
            star.draw(ctx);
         });

         // Create new shooting stars periodically (use stable jitter until next spawn)
         if (timestamp - lastShootingStarTime > nextSpawnGap) {
            shootingStars.push(new ShootingStar());
            lastShootingStarTime = timestamp;
            nextSpawnGap = 3000 + Math.random() * 4000;
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

         rafIdRef.current = requestAnimationFrame(animate);
      };

      // Draw a static single frame for reduced motion users
      const renderStaticFrame = () => {
         if (!ctx || !canvas) return;
         ctx.fillStyle = "rgba(0, 0, 0, 1)";
         ctx.fillRect(0, 0, cWidth, cHeight);
         stars.forEach((star) => {
            // Skip twinkle update; draw at initial brightness
            star.draw(ctx);
         });
      };

      // Handle tab visibility to pause when hidden
      const onVisibilityChange = () => {
         if (document.visibilityState === "hidden") {
            runningRef.current = false;
            if (rafIdRef.current !== null) {
               cancelAnimationFrame(rafIdRef.current);
               rafIdRef.current = null;
            }
         } else if (!reducedMotionRef.current) {
            runningRef.current = true;
            rafIdRef.current = requestAnimationFrame(animate);
         }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      // Start animation or static frame
      if (reducedMotionRef.current) {
         runningRef.current = false;
         renderStaticFrame();
      } else {
         runningRef.current = true;
         rafIdRef.current = requestAnimationFrame(animate);
      }

      return () => {
         window.removeEventListener("resize", setCanvasSize);
         document.removeEventListener("visibilitychange", onVisibilityChange);
         if ("removeEventListener" in mql) {
            mql.removeEventListener("change", onReducedMotionChange);
         } else {
            (mql as any).removeListener(onReducedMotionChange);
         }
         runningRef.current = false;
         if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
         }
         // Help GC by clearing arrays
         stars.length = 0;
         shootingStars.length = 0;
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
