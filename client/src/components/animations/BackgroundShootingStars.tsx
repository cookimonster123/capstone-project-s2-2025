import React, { useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";

/**
 * Background Shooting Stars Component
 *
 * Creates automatic shooting stars that streak across the screen
 * in dark mode. Optimized for performance with throttling.
 * This is different from the mouse-following StarTrail component.
 */
const BackgroundShootingStars: React.FC = () => {
   const theme = useTheme();
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const isDarkMode = theme.palette.mode === "dark";
   const rafIdRef = useRef<number | null>(null);
   const runningRef = useRef<boolean>(false);
   const reducedMotionRef = useRef<boolean>(false);

   useEffect(() => {
      if (!isDarkMode) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Track dimensions to avoid nullable canvas typing and reuse values
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
         if (e.matches) {
            // Stop loop and render static
            runningRef.current = false;
            if (rafIdRef.current !== null) {
               cancelAnimationFrame(rafIdRef.current);
               rafIdRef.current = null;
            }
            renderStaticFrame();
         } else if (!runningRef.current) {
            // Resume
            runningRef.current = true;
            rafIdRef.current = requestAnimationFrame(animate);
         }
      };
      if ("addEventListener" in mql) {
         mql.addEventListener("change", onReducedMotionChange);
      } else {
         (mql as any).addListener(onReducedMotionChange);
      }

      // Shooting star class
      class ShootingStar {
         x: number;
         y: number;
         length: number;
         speed: number;
         angle: number;
         opacity: number;
         fadeSpeed: number;
         thickness: number;

         constructor(canvasWidth: number, canvasHeight: number) {
            // Start from random position in upper portion
            this.x = Math.random() * canvasWidth;
            this.y = Math.random() * canvasHeight * 0.5;
            this.length = Math.random() * 80 + 60;
            this.speed = Math.random() * 8 + 10;
            this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5; // Roughly 45 degrees
            this.opacity = 1;
            this.fadeSpeed = 0.012;
            this.thickness = Math.random() * 2 + 1.5;
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
               0.3,
               `rgba(200, 220, 255, ${this.opacity * 0.8})`,
            );
            gradient.addColorStop(
               0.7,
               `rgba(150, 180, 255, ${this.opacity * 0.4})`,
            );
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

            // Draw main trail
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.thickness;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-this.length, 0);
            ctx.stroke();

            // Add subtle glow
            ctx.shadowBlur = 8;
            ctx.shadowColor = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
            ctx.stroke();

            ctx.restore();
         }

         isFinished(canvasWidth: number, canvasHeight: number) {
            return (
               this.opacity <= 0 ||
               this.x > canvasWidth + 100 ||
               this.y > canvasHeight + 100 ||
               this.x < -100 ||
               this.y < -100
            );
         }
      }

      const shootingStars: ShootingStar[] = [];
      let lastShootingStarTime = 0;
      let nextSpawnGap = 2500 + Math.random() * 3000; // compute once per spawn
      let lastFrameTime = performance.now();
      const targetFPS = 30; // Reduced FPS for better performance
      const frameInterval = 1000 / targetFPS;

      // Animation loop with throttling
      const animate = (timestamp: number) => {
         // If stopped (unmounted/hidden/reduced motion), don't schedule further frames
         if (!runningRef.current || reducedMotionRef.current) return;
         if (!ctx || !canvas) return;

         const deltaTime = timestamp - lastFrameTime;

         // Throttle to target FPS
         if (deltaTime < frameInterval) {
            rafIdRef.current = requestAnimationFrame(animate);
            return;
         }

         lastFrameTime = timestamp - (deltaTime % frameInterval);

         // Clear canvas
         ctx.clearRect(0, 0, cWidth, cHeight);

         // Create new shooting stars periodically (reduced frequency)
         if (timestamp - lastShootingStarTime > nextSpawnGap) {
            if (shootingStars.length < 5) {
               shootingStars.push(new ShootingStar(cWidth, cHeight));
               lastShootingStarTime = timestamp;
               nextSpawnGap = 2500 + Math.random() * 3000;
            }
         }

         // Update and draw shooting stars
         for (let i = shootingStars.length - 1; i >= 0; i--) {
            const shootingStar = shootingStars[i];
            shootingStar.update();
            shootingStar.draw(ctx);

            if (shootingStar.isFinished(cWidth, cHeight)) {
               shootingStars.splice(i, 1);
            }
         }

         rafIdRef.current = requestAnimationFrame(animate);
      };

      // Render a static frame for reduced motion users (blank/no streaks)
      const renderStaticFrame = () => {
         if (!ctx || !canvas) return;
         ctx.clearRect(0, 0, cWidth, cHeight);
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
            zIndex: 1,
            pointerEvents: "none",
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

export default BackgroundShootingStars;
