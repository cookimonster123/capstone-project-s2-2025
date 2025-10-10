import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

/**
 * Light Mode Auth Background - 白色模式登录背景
 *
 * 清新优雅的浮动气泡和渐变效果
 * 适合白色主题，非常现代和专业
 */
const LightModeAuthBackground: React.FC = () => {
   const canvasRef = useRef<HTMLCanvasElement>(null);
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

      const setCanvasSize = () => {
         cWidth = window.innerWidth;
         cHeight = window.innerHeight;
         canvas.width = cWidth;
         canvas.height = cHeight;
      };
      setCanvasSize();
      window.addEventListener("resize", setCanvasSize);

      // Reduced motion preference
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
            renderStaticFrame();
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

      // 浮动气泡类
      class Bubble {
         x: number;
         y: number;
         radius: number;
         vx: number;
         vy: number;
         color: string;
         opacity: number;
         pulsePhase: number;
         pulseSpeed: number;

         constructor(w: number, h: number) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.radius = Math.random() * 80 + 40;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;

            const colors = [
               "rgba(99, 102, 241, 0.08)", // 柔和紫色
               "rgba(59, 130, 246, 0.08)", // 柔和蓝色
               "rgba(147, 51, 234, 0.08)", // 柔和紫罗兰
               "rgba(236, 72, 153, 0.08)", // 柔和粉色
               "rgba(34, 211, 238, 0.08)", // 柔和青色
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.5 + 0.3;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.01 + 0.005;
         }

         update(w: number, h: number) {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < -this.radius) this.x = w + this.radius;
            if (this.x > w + this.radius) this.x = -this.radius;
            if (this.y < -this.radius) this.y = h + this.radius;
            if (this.y > h + this.radius) this.y = -this.radius;

            this.pulsePhase += this.pulseSpeed;
         }

         draw(ctx: CanvasRenderingContext2D) {
            const pulse = (Math.sin(this.pulsePhase) + 1) / 2;
            const currentRadius = this.radius * (0.9 + pulse * 0.1);

            const gradient = ctx.createRadialGradient(
               this.x,
               this.y,
               0,
               this.x,
               this.y,
               currentRadius,
            );

            gradient.addColorStop(
               0,
               this.color.replace("0.08", String(this.opacity * 0.6)),
            );
            gradient.addColorStop(0.5, this.color);
            gradient.addColorStop(1, this.color.replace("0.08", "0"));

            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
         }
      }

      // 浮动粒子类
      class Particle {
         x: number;
         y: number;
         size: number;
         speedX: number;
         speedY: number;
         opacity: number;

         constructor(w: number, h: number) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.3 + 0.1;
         }

         update(w: number, h: number) {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > w) this.speedX *= -1;
            if (this.y < 0 || this.y > h) this.speedY *= -1;
         }

         draw(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
            ctx.fill();
         }
      }

      const bubbles: Bubble[] = [];
      const particles: Particle[] = [];

      // 创建气泡
      for (let i = 0; i < 8; i++) {
         bubbles.push(new Bubble(cWidth, cHeight));
      }

      // 创建粒子
      for (let i = 0; i < 50; i++) {
         particles.push(new Particle(cWidth, cHeight));
      }
      let mouseX = cWidth / 2;
      let mouseY = cHeight / 2;
      let lastMouseUpdate = 0;
      const THROTTLE_MS = 50; // 20Hz

      const handleMouseMove = (e: MouseEvent) => {
         const now = performance.now();
         if (now - lastMouseUpdate < THROTTLE_MS) return;
         lastMouseUpdate = now;
         mouseX = e.clientX;
         mouseY = e.clientY;
      };
      window.addEventListener("mousemove", handleMouseMove, { passive: true });

      const animate = () => {
         if (!runningRef.current || reducedMotionRef.current) return;
         ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
         ctx.fillRect(0, 0, cWidth, cHeight);

         // 绘制气泡
         bubbles.forEach((bubble) => {
            bubble.update(cWidth, cHeight);
            bubble.draw(ctx);
         });

         // 绘制粒子
         particles.forEach((particle) => {
            particle.update(cWidth, cHeight);
            particle.draw(ctx);
         });

         // 鼠标附近的光晕效果
         const gradient = ctx.createRadialGradient(
            mouseX,
            mouseY,
            0,
            mouseX,
            mouseY,
            150,
         );
         gradient.addColorStop(0, "rgba(99, 102, 241, 0.1)");
         gradient.addColorStop(1, "transparent");

         ctx.fillStyle = gradient;
         ctx.fillRect(0, 0, cWidth, cHeight);

         rafIdRef.current = requestAnimationFrame(animate);
      };

      const renderStaticFrame = () => {
         ctx.fillStyle = "rgba(255, 255, 255, 1)";
         ctx.fillRect(0, 0, cWidth, cHeight);
         bubbles.forEach((bubble) => bubble.draw(ctx));
         particles.forEach((p) => p.draw(ctx));
      };

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

      if (reducedMotionRef.current) {
         runningRef.current = false;
         renderStaticFrame();
      } else {
         runningRef.current = true;
         rafIdRef.current = requestAnimationFrame(animate);
      }

      return () => {
         window.removeEventListener("resize", setCanvasSize);
         window.removeEventListener("mousemove", handleMouseMove as any);
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
   }, []);

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
               background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
               zIndex: 0,
            }}
         />

         {/* Canvas 动画层 */}
         <canvas
            ref={canvasRef}
            style={{
               position: "fixed",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               zIndex: 1,
            }}
         />

         {/* 装饰性渐变光斑 */}
         <Box
            sx={{
               position: "fixed",
               top: "-10%",
               right: "-10%",
               width: "40%",
               height: "40%",
               background:
                  "radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)",
               borderRadius: "50%",
               filter: "blur(60px)",
               zIndex: 2,
               pointerEvents: "none",
            }}
         />

         <Box
            sx={{
               position: "fixed",
               bottom: "-10%",
               left: "-10%",
               width: "40%",
               height: "40%",
               background:
                  "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
               borderRadius: "50%",
               filter: "blur(60px)",
               zIndex: 2,
               pointerEvents: "none",
            }}
         />

         {/* 微妙的网格线 */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
          `,
               backgroundSize: "50px 50px",
               zIndex: 2,
               pointerEvents: "none",
            }}
         />
      </>
   );
};

export default LightModeAuthBackground;
