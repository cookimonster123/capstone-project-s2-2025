import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

/**
 * Abstract Art Background - 抽象艺术背景
 *
 * 高级现代艺术风格
 * 流动的有机形状和渐变
 * 非常有设计感和艺术感
 */
const AbstractArtBackground: React.FC = () => {
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

      // 有机形状类 - 用贝塞尔曲线创建流动的形状
      class OrganicShape {
         x: number;
         y: number;
         points: Array<{ x: number; y: number; vx: number; vy: number }>;
         color1: string;
         color2: string;
         rotation: number;
         rotationSpeed: number;
         scale: number;
         scaleDirection: number;

         constructor(w: number, h: number) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.002;
            this.scale = Math.random() * 0.5 + 0.8;
            this.scaleDirection = 1;

            // 创建随机控制点
            const pointCount = 6 + Math.floor(Math.random() * 4);
            this.points = [];
            const radius = Math.random() * 150 + 100;

            for (let i = 0; i < pointCount; i++) {
               const angle = (i / pointCount) * Math.PI * 2;
               const r = radius * (0.7 + Math.random() * 0.6);
               this.points.push({
                  x: Math.cos(angle) * r,
                  y: Math.sin(angle) * r,
                  vx: (Math.random() - 0.5) * 0.3,
                  vy: (Math.random() - 0.5) * 0.3,
               });
            }

            // 艺术渐变色
            const colors = [
               ["rgba(255, 107, 107, 0.15)", "rgba(255, 159, 64, 0.05)"], // 珊瑚红到橙
               ["rgba(78, 205, 196, 0.15)", "rgba(69, 183, 209, 0.05)"], // 青绿到蓝
               ["rgba(199, 125, 255, 0.15)", "rgba(124, 77, 255, 0.05)"], // 紫到深紫
               ["rgba(255, 195, 113, 0.15)", "rgba(255, 107, 129, 0.05)"], // 金黄到粉
               ["rgba(72, 219, 251, 0.15)", "rgba(88, 86, 214, 0.05)"], // 天蓝到靛蓝
            ];
            const selectedColors =
               colors[Math.floor(Math.random() * colors.length)];
            this.color1 = selectedColors[0];
            this.color2 = selectedColors[1];
         }

         update() {
            this.rotation += this.rotationSpeed;

            // 呼吸缩放效果
            this.scale += 0.001 * this.scaleDirection;
            if (this.scale > 1.2 || this.scale < 0.8) {
               this.scaleDirection *= -1;
            }

            // 更新形状的控制点
            this.points.forEach((point) => {
               point.x += point.vx;
               point.y += point.vy;

               // 保持形状不要变形太大
               const dist = Math.sqrt(point.x * point.x + point.y * point.y);
               if (dist > 200) {
                  point.vx *= -0.5;
                  point.vy *= -0.5;
               }
            });
         }

         draw(ctx: CanvasRenderingContext2D) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(this.scale, this.scale);

            // 创建渐变
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
            gradient.addColorStop(0, this.color1);
            gradient.addColorStop(1, this.color2);

            // 绘制有机形状
            ctx.beginPath();
            const firstPoint = this.points[0];
            ctx.moveTo(firstPoint.x, firstPoint.y);

            for (let i = 0; i < this.points.length; i++) {
               const current = this.points[i];
               const next = this.points[(i + 1) % this.points.length];
               const nextNext = this.points[(i + 2) % this.points.length];

               // 使用贝塞尔曲线创建平滑的有机形状
               const cp1x = current.x + (next.x - current.x) * 0.5;
               const cp1y = current.y + (next.y - current.y) * 0.5;
               const cp2x = next.x + (current.x - nextNext.x) * 0.2;
               const cp2y = next.y + (current.y - nextNext.y) * 0.2;

               ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
            }

            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // 添加微妙的边框
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
         }
      }

      const shapes: OrganicShape[] = [];
      const shapeCount = 5;

      for (let i = 0; i < shapeCount; i++) {
         shapes.push(new OrganicShape(canvas.width, canvas.height));
      }

      let mouseX = canvas.width / 2;
      let mouseY = canvas.height / 2;
      let targetMouseX = mouseX;
      let targetMouseY = mouseY;

      const handleMouseMove = (e: MouseEvent) => {
         targetMouseX = e.clientX;
         targetMouseY = e.clientY;
      };
      window.addEventListener("mousemove", handleMouseMove);

      const animate = () => {
         // 平滑鼠标跟随
         mouseX += (targetMouseX - mouseX) * 0.05;
         mouseY += (targetMouseY - mouseY) * 0.05;

         // 半透明清除创造拖尾效果
         ctx.fillStyle = "rgba(250, 250, 252, 0.05)";
         ctx.fillRect(0, 0, canvas.width, canvas.height);

         // 更新和绘制形状
         shapes.forEach((shape) => {
            shape.update();
            shape.draw(ctx);
         });

         // 鼠标附近的艺术光效
         const mouseGradient = ctx.createRadialGradient(
            mouseX,
            mouseY,
            0,
            mouseX,
            mouseY,
            200,
         );
         mouseGradient.addColorStop(0, "rgba(255, 255, 255, 0.2)");
         mouseGradient.addColorStop(0.5, "rgba(124, 77, 255, 0.08)");
         mouseGradient.addColorStop(1, "transparent");

         ctx.fillStyle = mouseGradient;
         ctx.fillRect(0, 0, canvas.width, canvas.height);

         requestAnimationFrame(animate);
      };

      animate();

      return () => {
         window.removeEventListener("resize", setCanvasSize);
         window.removeEventListener("mousemove", handleMouseMove);
      };
   }, []);

   return (
      <>
         {/* 精致的渐变基础 */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background:
                  "linear-gradient(135deg, #fafafa 0%, #f0f0f5 50%, #fafafc 100%)",
               zIndex: 0,
            }}
         />

         {/* Canvas 艺术层 */}
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

         {/* 装饰性艺术元素 - 左上角 */}
         <Box
            sx={{
               position: "fixed",
               top: "-20%",
               left: "-10%",
               width: "50%",
               height: "50%",
               background:
                  "radial-gradient(circle, rgba(124, 77, 255, 0.08) 0%, transparent 70%)",
               borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
               filter: "blur(80px)",
               animation: "morph 20s ease-in-out infinite",
               zIndex: 2,
               pointerEvents: "none",
               "@keyframes morph": {
                  "0%, 100%": {
                     borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
                  },
                  "50%": {
                     borderRadius: "70% 30% 50% 50% / 60% 40% 60% 40%",
                  },
               },
            }}
         />

         {/* 装饰性艺术元素 - 右下角 */}
         <Box
            sx={{
               position: "fixed",
               bottom: "-20%",
               right: "-10%",
               width: "50%",
               height: "50%",
               background:
                  "radial-gradient(circle, rgba(255, 107, 107, 0.08) 0%, transparent 70%)",
               borderRadius: "60% 40% 30% 70% / 50% 60% 40% 50%",
               filter: "blur(80px)",
               animation: "morphAlt 25s ease-in-out infinite",
               zIndex: 2,
               pointerEvents: "none",
               "@keyframes morphAlt": {
                  "0%, 100%": {
                     borderRadius: "60% 40% 30% 70% / 50% 60% 40% 50%",
                  },
                  "50%": {
                     borderRadius: "30% 70% 60% 40% / 40% 50% 60% 50%",
                  },
               },
            }}
         />

         {/* 艺术线条装饰 */}
         <Box
            sx={{
               position: "fixed",
               top: "20%",
               right: "10%",
               width: "300px",
               height: "300px",
               border: "1px solid rgba(124, 77, 255, 0.1)",
               borderRadius: "40% 60% / 60% 40%",
               animation: "float 15s ease-in-out infinite",
               zIndex: 2,
               pointerEvents: "none",
               "@keyframes float": {
                  "0%, 100%": {
                     transform: "translate(0, 0) rotate(0deg)",
                  },
                  "50%": {
                     transform: "translate(30px, -30px) rotate(180deg)",
                  },
               },
            }}
         />

         <Box
            sx={{
               position: "fixed",
               bottom: "25%",
               left: "15%",
               width: "200px",
               height: "200px",
               border: "1px solid rgba(255, 107, 107, 0.1)",
               borderRadius: "60% 40% / 40% 60%",
               animation: "floatAlt 18s ease-in-out infinite",
               zIndex: 2,
               pointerEvents: "none",
               "@keyframes floatAlt": {
                  "0%, 100%": {
                     transform: "translate(0, 0) rotate(0deg)",
                  },
                  "50%": {
                     transform: "translate(-20px, 20px) rotate(-180deg)",
                  },
               },
            }}
         />

         {/* 微妙的噪点纹理增加质感 */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
               zIndex: 3,
               pointerEvents: "none",
            }}
         />
      </>
   );
};

export default AbstractArtBackground;
