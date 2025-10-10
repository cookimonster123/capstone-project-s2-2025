import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Smooth cursor follower with subtle glow
 * Adds a delayed follower circle that tracks mouse movement
 */
const CursorFollower: React.FC = () => {
   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
   const [isHovering, setIsHovering] = useState(false);

   useEffect(() => {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      let reducedMotion = mql.matches;
      const onReducedMotionChange = (e: MediaQueryListEvent) => {
         reducedMotion = e.matches;
      };
      if ("addEventListener" in mql) {
         mql.addEventListener("change", onReducedMotionChange);
      } else {
         (mql as any).addListener(onReducedMotionChange);
      }

      let lastTime = performance.now();
      const THROTTLE_MS = 50;
      const handleMouseMove = (e: MouseEvent) => {
         if (reducedMotion || document.visibilityState !== "visible") return;
         const now = performance.now();
         if (now - lastTime < THROTTLE_MS) return;
         lastTime = now;
         setMousePosition({ x: e.clientX, y: e.clientY });

         const target = e.target as HTMLElement;
         const isInteractive =
            target.tagName === "BUTTON" ||
            target.tagName === "A" ||
            target.closest("button") ||
            target.closest("a") ||
            target.style.cursor === "pointer";
         setIsHovering(!!isInteractive);
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      return () => {
         window.removeEventListener("mousemove", handleMouseMove as any);
         if ("removeEventListener" in mql) {
            mql.removeEventListener("change", onReducedMotionChange);
         } else {
            (mql as any).removeListener(onReducedMotionChange);
         }
      };
   }, []);

   return (
      <motion.div
         animate={{
            x: mousePosition.x - 20,
            y: mousePosition.y - 20,
            scale: isHovering ? 1.5 : 1,
         }}
         transition={{
            type: "spring",
            stiffness: 150,
            damping: 15,
            mass: 0.5,
         }}
         style={{
            position: "fixed",
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "2px solid rgba(0, 102, 204, 0.3)",
            background:
               "radial-gradient(circle, rgba(0, 153, 255, 0.1) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 9997,
            mixBlendMode: "screen",
         }}
      />
   );
};

export default CursorFollower;
