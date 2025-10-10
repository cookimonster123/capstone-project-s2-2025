import React, { useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";

/**
 * Neural Network Background - 神经网络背景
 *
 * AI/科技风格的神经网络节点和连接
 * 非常现代和高科技感
 */
const NeuralNetworkBackground: React.FC = () => {
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

      // Track dimensions to avoid nullable canvas inside inner classes
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

      // Respect user motion preferences
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotionRef.current = mql.matches;
      const onReducedMotionChange = (e: MediaQueryListEvent) => {
         reducedMotionRef.current = e.matches;
         if (e.matches) {
            // Stop loop and render a static frame
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

      // 神经元节点
      class Node {
         x: number;
         y: number;
         vx: number;
         vy: number;
         size: number;
         connections: Node[];
         pulsePhase: number;
         pulseSpeed: number;

         constructor(w: number, h: number) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 3 + 2;
            this.connections = [];
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
         }

         update(w: number, h: number) {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;

            this.pulsePhase += this.pulseSpeed;
         }

         draw(ctx: CanvasRenderingContext2D) {
            const pulse = (Math.sin(this.pulsePhase) + 1) / 2;
            const opacity = 0.5 + pulse * 0.5;

            // 节点核心
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = isDark
               ? `rgba(0, 200, 255, ${opacity})`
               : `rgba(0, 120, 255, ${opacity})`;
            ctx.fill();

            // 光晕
            const gradient = ctx.createRadialGradient(
               this.x,
               this.y,
               0,
               this.x,
               this.y,
               this.size * 4,
            );
            gradient.addColorStop(
               0,
               isDark ? "rgba(0, 200, 255, 0.3)" : "rgba(0, 120, 255, 0.2)",
            );
            gradient.addColorStop(1, "transparent");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
            ctx.fill();
         }

         drawConnections(ctx: CanvasRenderingContext2D) {
            this.connections.forEach((node) => {
               const dx = node.x - this.x;
               const dy = node.y - this.y;
               const distance = Math.sqrt(dx * dx + dy * dy);

               if (distance < 200) {
                  const opacity = (1 - distance / 200) * 0.3;

                  // 连接线
                  ctx.strokeStyle = isDark
                     ? `rgba(0, 200, 255, ${opacity})`
                     : `rgba(0, 120, 255, ${opacity * 0.6})`;
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  ctx.moveTo(this.x, this.y);
                  ctx.lineTo(node.x, node.y);
                  ctx.stroke();

                  // 数据流动效果
                  const flowPosition = (Date.now() % 2000) / 2000;
                  const flowX = this.x + dx * flowPosition;
                  const flowY = this.y + dy * flowPosition;

                  ctx.beginPath();
                  ctx.arc(flowX, flowY, 2, 0, Math.PI * 2);
                  ctx.fillStyle = isDark
                     ? `rgba(0, 255, 200, ${opacity * 2})`
                     : `rgba(0, 150, 255, ${opacity * 2})`;
                  ctx.fill();
               }
            });
         }
      }

      const nodes: Node[] = [];
      const nodeCount = 50;

      for (let i = 0; i < nodeCount; i++) {
         nodes.push(new Node(cWidth, cHeight));
      }

      // 建立连接
      nodes.forEach((node, i) => {
         const connectionCount = Math.floor(Math.random() * 3) + 2;
         for (let j = 0; j < connectionCount; j++) {
            const targetIndex = Math.floor(Math.random() * nodes.length);
            if (targetIndex !== i) {
               node.connections.push(nodes[targetIndex]);
            }
         }
      });

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

         ctx.fillStyle = isDark
            ? "rgba(10, 14, 26, 0.1)"
            : "rgba(230, 240, 255, 0.1)";
         ctx.fillRect(0, 0, cWidth, cHeight);

         // 更新和绘制节点
         nodes.forEach((node) => {
            node.update(cWidth, cHeight);
            node.drawConnections(ctx);
         });

         nodes.forEach((node) => {
            node.draw(ctx);
         });

         // 鼠标交互
         nodes.forEach((node) => {
            const dx = mouseX - node.x;
            const dy = mouseY - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
               ctx.strokeStyle = isDark
                  ? `rgba(0, 255, 200, ${(1 - distance / 150) * 0.5})`
                  : `rgba(0, 150, 255, ${(1 - distance / 150) * 0.3})`;
               ctx.lineWidth = 2;
               ctx.beginPath();
               ctx.moveTo(node.x, node.y);
               ctx.lineTo(mouseX, mouseY);
               ctx.stroke();
            }
         });

         rafIdRef.current = requestAnimationFrame(animate);
      };

      // Static frame for reduced-motion users
      const renderStaticFrame = () => {
         ctx.fillStyle = isDark
            ? "rgba(10, 14, 26, 1)"
            : "rgba(230, 240, 255, 1)";
         ctx.fillRect(0, 0, cWidth, cHeight);
         // Draw nodes without motion or flowing dots
         nodes.forEach((node) => {
            node.drawConnections(ctx);
         });
         nodes.forEach((node) => node.draw(ctx));
      };

      // Pause when tab hidden
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
   }, [isDark]);

   return (
      <>
         {/* 基础渐变 */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background: isDark
                  ? "linear-gradient(135deg, #0a0e1a 0%, #141a2e 50%, #0a0e1a 100%)"
                  : "linear-gradient(135deg, #e6f0ff 0%, #f0f8ff 50%, #e6f0ff 100%)",
               zIndex: 0,
            }}
         />

         {/* 神经网络 Canvas */}
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

         {/* 脉冲扫描线 */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background: isDark
                  ? "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 200, 255, 0.03) 2px, rgba(0, 200, 255, 0.03) 4px)"
                  : "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 120, 255, 0.02) 2px, rgba(0, 120, 255, 0.02) 4px)",
               animation: "scan 10s linear infinite",
               zIndex: 2,
               pointerEvents: "none",
               "@keyframes scan": {
                  "0%": { transform: "translateY(0)" },
                  "100%": { transform: "translateY(100%)" },
               },
               "@media (prefers-reduced-motion: reduce)": {
                  animation: "none",
               },
            }}
         />
      </>
   );
};

export default NeuralNetworkBackground;
