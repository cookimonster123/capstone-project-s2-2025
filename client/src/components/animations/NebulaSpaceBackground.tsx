import React, { useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";

/**
 * Nebula Space Background - 星云太空背景
 *
 * 深邃的太空星云效果，配合流星和星星
 * 非常高级和梦幻
 */
const NebulaSpaceBackground: React.FC = () => {
   const theme = useTheme();
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const isDark = theme.palette.mode === "dark";

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

      // 星星
      class Star {
         x: number;
         y: number;
         size: number;
         brightness: number;
         twinkleSpeed: number;
         phase: number;

         constructor(w: number, h: number) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2.5;
            this.brightness = Math.random();
            this.twinkleSpeed = Math.random() * 0.02 + 0.01;
            this.phase = Math.random() * Math.PI * 2;
         }

         update() {
            this.phase += this.twinkleSpeed;
            this.brightness = (Math.sin(this.phase) + 1) / 2;
         }

         draw(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
            ctx.fill();

            // 较大星星加光晕
            if (this.size > 1.5) {
               ctx.shadowBlur = 10;
               ctx.shadowColor = `rgba(150, 200, 255, ${this.brightness * 0.5})`;
               ctx.fill();
               ctx.shadowBlur = 0;
            }
         }
      }

      // 流星
      class ShootingStar {
         x: number;
         y: number;
         length: number;
         speed: number;
         angle: number;
         opacity: number;

         constructor(w: number, h: number) {
            this.x = Math.random() * w;
            this.y = Math.random() * h * 0.5;
            this.length = Math.random() * 100 + 80;
            this.speed = Math.random() * 12 + 15;
            this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
            this.opacity = 1;
         }

         update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.opacity -= 0.01;
         }

         draw(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            const gradient = ctx.createLinearGradient(0, 0, -this.length, 0);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
            gradient.addColorStop(
               0.5,
               `rgba(100, 200, 255, ${this.opacity * 0.6})`,
            );
            gradient.addColorStop(1, "rgba(0, 100, 255, 0)");

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-this.length, 0);
            ctx.stroke();

            ctx.restore();
         }

         isDead(w: number, h: number) {
            return this.opacity <= 0 || this.x > w + 200 || this.y > h + 200;
         }
      }

      const stars: Star[] = [];
      const shootingStars: ShootingStar[] = [];

      // 创建星星
      for (let i = 0; i < 200; i++) {
         stars.push(new Star(canvas.width, canvas.height));
      }

      let lastShootingStarTime = 0;

      const animate = (timestamp: number) => {
         ctx.fillStyle = isDark ? "#0a0e1a" : "#e6f0ff";
         ctx.fillRect(0, 0, canvas.width, canvas.height);

         // 绘制星星
         stars.forEach((star) => {
            star.update();
            star.draw(ctx);
         });

         // 创建流星
         if (timestamp - lastShootingStarTime > 1500 + Math.random() * 2000) {
            shootingStars.push(new ShootingStar(canvas.width, canvas.height));
            lastShootingStarTime = timestamp;
         }

         // 绘制流星
         for (let i = shootingStars.length - 1; i >= 0; i--) {
            shootingStars[i].update();
            shootingStars[i].draw(ctx);
            if (shootingStars[i].isDead(canvas.width, canvas.height)) {
               shootingStars.splice(i, 1);
            }
         }

         requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);

      return () => {
         window.removeEventListener("resize", setCanvasSize);
      };
   }, [isDark]);

   return (
      <>
         {/* 星云渐变背景 */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background: isDark
                  ? `radial-gradient(ellipse at 30% 20%, rgba(50, 30, 100, 0.3), transparent 50%),
               radial-gradient(ellipse at 70% 60%, rgba(20, 50, 100, 0.3), transparent 50%),
               radial-gradient(ellipse at 50% 80%, rgba(30, 20, 80, 0.2), transparent 50%),
               #0a0e1a`
                  : `radial-gradient(ellipse at 30% 20%, rgba(100, 150, 255, 0.15), transparent 50%),
               radial-gradient(ellipse at 70% 60%, rgba(50, 100, 200, 0.15), transparent 50%),
               #e6f0ff`,
               zIndex: 0,
            }}
         />

         {/* 星星和流星 Canvas */}
         <canvas
            ref={canvasRef}
            style={{
               position: "fixed",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               zIndex: 1,
               opacity: isDark ? 1 : 0.7,
            }}
         />
      </>
   );
};

export default NebulaSpaceBackground;
