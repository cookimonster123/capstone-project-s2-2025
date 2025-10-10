import React, { useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

/**
 * Epic custom cursor with glow effect - keeps default cursor visible
 * Adds beautiful trailing glow effect without hiding the mouse
 */
const CustomCursor: React.FC = () => {
   const prefersReducedMotion = useReducedMotion();
   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
   const [isClicking, setIsClicking] = useState(false);
   const rafIdRef = useRef<number | null>(null);
   const pendingPosRef = useRef<{ x: number; y: number } | null>(null);
   const runningRef = useRef(false);

   useEffect(() => {
      if (prefersReducedMotion) return;

      const tick = () => {
         rafIdRef.current = null;
         if (!runningRef.current) return;
         const next = pendingPosRef.current;
         if (next) {
            setMousePosition(next);
            pendingPosRef.current = null;
         }
      };

      const handleMouseMove = (e: MouseEvent) => {
         pendingPosRef.current = { x: e.clientX, y: e.clientY };
         if (rafIdRef.current == null) {
            rafIdRef.current = requestAnimationFrame(tick);
         }
      };

      const handleMouseDown = () => setIsClicking(true);
      const handleMouseUp = () => setIsClicking(false);

      runningRef.current = true;
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mousedown", handleMouseDown, { passive: true });
      window.addEventListener("mouseup", handleMouseUp, { passive: true });

      return () => {
         runningRef.current = false;
         if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
         rafIdRef.current = null;
         pendingPosRef.current = null;
         window.removeEventListener("mousemove", handleMouseMove as any);
         window.removeEventListener("mousedown", handleMouseDown as any);
         window.removeEventListener("mouseup", handleMouseUp as any);
      };
   }, [prefersReducedMotion]);

   if (prefersReducedMotion) return null;

   return (
      <LazyMotion features={domAnimation} strict>
         {/* Outer glow - follows with delay for trail effect */}
         <m.div
            animate={{
               x: mousePosition.x - 30,
               y: mousePosition.y - 30,
               scale: isClicking ? 1.5 : 1,
            }}
            transition={{
               type: "spring",
               stiffness: 80,
               damping: 25,
               mass: 1,
            }}
            style={{
               position: "fixed",
               width: 60,
               height: 60,
               borderRadius: "50%",
               background:
                  "radial-gradient(circle, rgba(0, 153, 255, 0.15) 0%, transparent 70%)",
               pointerEvents: "none",
               zIndex: 9997,
               filter: "blur(12px)",
            }}
         />

         {/* Middle glow */}
         <m.div
            animate={{
               x: mousePosition.x - 20,
               y: mousePosition.y - 20,
               scale: isClicking ? 1.3 : 1,
            }}
            transition={{
               type: "spring",
               stiffness: 150,
               damping: 20,
               mass: 0.8,
            }}
            style={{
               position: "fixed",
               width: 40,
               height: 40,
               borderRadius: "50%",
               background:
                  "radial-gradient(circle, rgba(0, 102, 204, 0.25) 0%, transparent 70%)",
               pointerEvents: "none",
               zIndex: 9998,
               filter: "blur(6px)",
            }}
         />

         {/* Inner ring - sharp and visible */}
         <m.div
            animate={{
               x: mousePosition.x - 12,
               y: mousePosition.y - 12,
               scale: isClicking ? 0.8 : 1,
            }}
            transition={{
               type: "spring",
               stiffness: 500,
               damping: 28,
            }}
            style={{
               position: "fixed",
               width: 24,
               height: 24,
               borderRadius: "50%",
               border: "2px solid rgba(0, 102, 204, 0.6)",
               background: "transparent",
               pointerEvents: "none",
               zIndex: 9999,
               boxShadow: "0 0 10px rgba(0, 102, 204, 0.3)",
            }}
         />
      </LazyMotion>
   );
};

export default CustomCursor;
