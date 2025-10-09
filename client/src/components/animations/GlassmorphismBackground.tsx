import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

/**
 * Glassmorphism Background - 玻璃态背景
 *
 * 现代玻璃效果，非常高级和优雅
 * 半透明的玻璃卡片和柔和的背景
 */
const GlassmorphismBackground: React.FC = () => {
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const setCanvasSize = () => {
         canvas.width = window.innerWidth;
         canvas.height = window.innerHeight;
      };
      setCanvasSize();
      window.addEventListener("resize", setCanvasSize);

      // 浮动光点
      class LightOrb {
         x: number;
         y: number;
         radius: number;
         vx: number;
         vy: number;
         opacity: number;
         pulsePhase: number;
         color: string;

         constructor(w: number, h: number) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.radius = Math.random() * 100 + 50;
            this.vx = (Math.random() - 0.5) * 0.2;
            this.vy = (Math.random() - 0.5) * 0.2;
            this.opacity = Math.random() * 0.3 + 0.2;
            this.pulsePhase = Math.random() * Math.PI * 2;

            const colors = [
               "rgba(139, 92, 246, ", // 紫色
               "rgba(59, 130, 246, ", // 蓝色
               "rgba(236, 72, 153, ", // 粉色
               "rgba(14, 165, 233, ", // 天蓝
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
         }

         update(w: number, h: number) {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < -this.radius) this.x = w + this.radius;
            if (this.x > w + this.radius) this.x = -this.radius;
            if (this.y < -this.radius) this.y = h + this.radius;
            if (this.y > h + this.radius) this.y = -this.radius;

            this.pulsePhase += 0.01;
         }

         draw(ctx: CanvasRenderingContext2D) {
            const pulse = (Math.sin(this.pulsePhase) + 1) / 2;
            const currentOpacity = this.opacity * (0.7 + pulse * 0.3);

            const gradient = ctx.createRadialGradient(
               this.x,
               this.y,
               0,
               this.x,
               this.y,
               this.radius,
            );
            gradient.addColorStop(0, this.color + currentOpacity * 0.4 + ")");
            gradient.addColorStop(0.5, this.color + currentOpacity * 0.2 + ")");
            gradient.addColorStop(1, "transparent");

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
         }
      }

      // 微小粒子
      class Particle {
         x: number;
         y: number;
         size: number;
         vx: number;
         vy: number;
         opacity: number;

         constructor(w: number, h: number) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 1;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.2;
         }

         update(w: number, h: number) {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
         }

         draw(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
         }
      }

      const orbs: LightOrb[] = [];
      const particles: Particle[] = [];

      // 创建光球
      for (let i = 0; i < 6; i++) {
         orbs.push(new LightOrb(canvas.width, canvas.height));
      }

      // 创建粒子
      for (let i = 0; i < 40; i++) {
         particles.push(new Particle(canvas.width, canvas.height));
      }

      const animate = () => {
         ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
         ctx.fillRect(0, 0, canvas.width, canvas.height);

         // 绘制光球
         orbs.forEach((orb) => {
            orb.update(canvas.width, canvas.height);
            orb.draw(ctx);
         });

         // 绘制粒子
         particles.forEach((particle) => {
            particle.update(canvas.width, canvas.height);
            particle.draw(ctx);
         });

         requestAnimationFrame(animate);
      };

      animate();

      return () => {
         window.removeEventListener("resize", setCanvasSize);
      };
   }, []);

   return (
      <>
         {/* 柔和渐变基础 */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)",
               backgroundSize: "400% 400%",
               animation: "gradientShift 15s ease infinite",
               "@keyframes gradientShift": {
                  "0%": { backgroundPosition: "0% 50%" },
                  "50%": { backgroundPosition: "100% 50%" },
                  "100%": { backgroundPosition: "0% 50%" },
               },
               zIndex: 0,
            }}
         />

         {/* 白色半透明覆盖层 - 让颜色更柔和 */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background: "rgba(255, 255, 255, 0.7)",
               zIndex: 1,
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
               zIndex: 2,
            }}
         />

         {/* 玻璃态卡片装饰 - 左上 */}
         <Box
            sx={{
               position: "fixed",
               top: "10%",
               left: "5%",
               width: "300px",
               height: "400px",
               background: "rgba(255, 255, 255, 0.25)",
               backdropFilter: "blur(10px)",
               borderRadius: "30px",
               border: "1px solid rgba(255, 255, 255, 0.4)",
               boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
               animation: "float1 20s ease-in-out infinite",
               zIndex: 3,
               pointerEvents: "none",
               "@keyframes float1": {
                  "0%, 100%": {
                     transform: "translate(0, 0) rotate(0deg)",
                  },
                  "33%": {
                     transform: "translate(30px, -30px) rotate(5deg)",
                  },
                  "66%": {
                     transform: "translate(-20px, 20px) rotate(-5deg)",
                  },
               },
            }}
         />

         {/* 玻璃态卡片装饰 - 右上 */}
         <Box
            sx={{
               position: "fixed",
               top: "15%",
               right: "8%",
               width: "250px",
               height: "250px",
               background: "rgba(255, 255, 255, 0.2)",
               backdropFilter: "blur(10px)",
               borderRadius: "50%",
               border: "1px solid rgba(255, 255, 255, 0.35)",
               boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
               animation: "float2 18s ease-in-out infinite",
               zIndex: 3,
               pointerEvents: "none",
               "@keyframes float2": {
                  "0%, 100%": {
                     transform: "translate(0, 0) scale(1)",
                  },
                  "50%": {
                     transform: "translate(-30px, 40px) scale(1.1)",
                  },
               },
            }}
         />

         {/* 玻璃态卡片装饰 - 左下 */}
         <Box
            sx={{
               position: "fixed",
               bottom: "20%",
               left: "10%",
               width: "200px",
               height: "200px",
               background: "rgba(255, 255, 255, 0.22)",
               backdropFilter: "blur(10px)",
               borderRadius: "30px",
               border: "1px solid rgba(255, 255, 255, 0.4)",
               boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
               animation: "float3 22s ease-in-out infinite",
               transform: "rotate(45deg)",
               zIndex: 3,
               pointerEvents: "none",
               "@keyframes float3": {
                  "0%, 100%": {
                     transform: "rotate(45deg) translate(0, 0)",
                  },
                  "50%": {
                     transform: "rotate(50deg) translate(20px, -20px)",
                  },
               },
            }}
         />

         {/* 玻璃态卡片装饰 - 右下 */}
         <Box
            sx={{
               position: "fixed",
               bottom: "10%",
               right: "5%",
               width: "350px",
               height: "200px",
               background: "rgba(255, 255, 255, 0.18)",
               backdropFilter: "blur(10px)",
               borderRadius: "40px",
               border: "1px solid rgba(255, 255, 255, 0.35)",
               boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
               animation: "float4 25s ease-in-out infinite",
               zIndex: 3,
               pointerEvents: "none",
               "@keyframes float4": {
                  "0%, 100%": {
                     transform: "translate(0, 0) rotate(0deg)",
                  },
                  "50%": {
                     transform: "translate(-40px, -20px) rotate(-3deg)",
                  },
               },
            }}
         />

         {/* 中央小玻璃圆 */}
         <Box
            sx={{
               position: "fixed",
               top: "50%",
               left: "25%",
               width: "150px",
               height: "150px",
               background: "rgba(255, 255, 255, 0.3)",
               backdropFilter: "blur(10px)",
               borderRadius: "50%",
               border: "1px solid rgba(255, 255, 255, 0.5)",
               boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
               animation: "float5 16s ease-in-out infinite",
               zIndex: 3,
               pointerEvents: "none",
               "@keyframes float5": {
                  "0%, 100%": {
                     transform: "translate(0, 0)",
                  },
                  "50%": {
                     transform: "translate(50px, -50px)",
                  },
               },
            }}
         />

         {/* 微妙的噪点纹理 */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")`,
               zIndex: 4,
               pointerEvents: "none",
            }}
         />
      </>
   );
};

export default GlassmorphismBackground;
