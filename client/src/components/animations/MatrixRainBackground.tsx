import React, { useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";

/**
 * Matrix Rain Background - 黑客帝国风格
 *
 * 经典的数字雨效果，科技感十足
 * 适合登录/注册页面
 */
const MatrixRainBackground: React.FC = () => {
   const theme = useTheme();
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const isDark = theme.palette.mode === "dark";
   const rafIdRef = useRef<number | null>(null);
   const runningRef = useRef<boolean>(false);
   const reducedMotionRef = useRef<boolean>(false);

   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let cWidth = window.innerWidth;
      let cHeight = window.innerHeight;
      canvas.width = cWidth;
      canvas.height = cHeight;

      const fontSize = 14;
      let columns = Math.floor(cWidth / fontSize);
      const drops: number[] = Array(columns).fill(1);

      // 字符集：数字、字母、符号
      const chars =
         "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

      const drawFrame = () => {
         // 半透明黑色背景实现拖尾效果
         ctx.fillStyle = isDark
            ? "rgba(10, 14, 23, 0.05)"
            : "rgba(255, 255, 255, 0.05)";
         ctx.fillRect(0, 0, cWidth, cHeight);

         ctx.font = `${fontSize}px monospace`;

         for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // 渐变色：从亮到暗
            const opacity = Math.random() * 0.5 + 0.5;
            ctx.fillStyle = isDark
               ? `rgba(0, 255, 170, ${opacity})`
               : `rgba(0, 153, 255, ${opacity})`;

            ctx.fillText(text, x, y);

            // 随机重置某些列
            if (y > cHeight && Math.random() > 0.975) {
               drops[i] = 0;
            }

            drops[i]++;
         }
      };

      // RAF-based animation loop at ~30fps using a time accumulator
      let lastTime = performance.now();
      const targetFPS = 30;
      const frameInterval = 1000 / targetFPS;
      let accumulator = 0;

      const animate = (timestamp: number) => {
         if (!runningRef.current || reducedMotionRef.current) return;
         const delta = timestamp - lastTime;
         lastTime = timestamp;
         accumulator += delta;
         // Only render at target FPS
         if (accumulator >= frameInterval) {
            drawFrame();
            accumulator %= frameInterval;
         }
         rafIdRef.current = requestAnimationFrame(animate);
      };

      const handleResize = () => {
         cWidth = window.innerWidth;
         cHeight = window.innerHeight;
         canvas.width = cWidth;
         canvas.height = cHeight;
         // Recompute columns and reset drops to match new width
         columns = Math.floor(cWidth / fontSize);
         drops.length = 0;
         for (let i = 0; i < columns; i++) drops.push(1);
      };
      window.addEventListener("resize", handleResize);

      // Reduced motion
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotionRef.current = mql.matches;
      const onReducedMotionChange = (e: MediaQueryListEvent) => {
         reducedMotionRef.current = e.matches;
         if (e.matches) {
            runningRef.current = false;
            if (rafIdRef.current !== null) {
               cancelAnimationFrame(rafIdRef.current);
               rafIdRef.current = null;
            }
            // Static frame: draw background only, no animated rain
            ctx.fillStyle = isDark
               ? "rgba(10, 14, 23, 1)"
               : "rgba(255, 255, 255, 1)";
            ctx.fillRect(0, 0, cWidth, cHeight);
         } else if (!runningRef.current) {
            runningRef.current = true;
            rafIdRef.current = requestAnimationFrame(animate);
         }
      };
      if ("addEventListener" in mql) {
         mql.addEventListener("change", onReducedMotionChange);
      } else {
         (mql as any).addListener(onReducedMotionChange);
      }

      // Pause when hidden
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

      // Start
      if (reducedMotionRef.current) {
         runningRef.current = false;
         ctx.fillStyle = isDark
            ? "rgba(10, 14, 23, 1)"
            : "rgba(255, 255, 255, 1)";
         ctx.fillRect(0, 0, cWidth, cHeight);
      } else {
         runningRef.current = true;
         rafIdRef.current = requestAnimationFrame(animate);
      }

      return () => {
         window.removeEventListener("resize", handleResize);
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
      };
   }, [isDark]);

   return (
      <>
         {/* 基础渐变背景 */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background: isDark
                  ? "radial-gradient(ellipse at center, #0a0e17 0%, #000000 100%)"
                  : "radial-gradient(ellipse at center, #f0f4ff 0%, #e0e8ff 100%)",
               zIndex: 0,
            }}
         />

         {/* Matrix 雨 Canvas */}
         <canvas
            ref={canvasRef}
            style={{
               position: "fixed",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               zIndex: 0,
            }}
         />
      </>
   );
};

export default MatrixRainBackground;
