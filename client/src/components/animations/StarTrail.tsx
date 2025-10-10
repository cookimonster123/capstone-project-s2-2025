import React, { useEffect, useRef, useState } from "react";
import {
   LazyMotion,
   domAnimation,
   m,
   AnimatePresence,
   useReducedMotion,
} from "framer-motion";
import { useTheme } from "@mui/material";

interface Star {
   id: number;
   x: number;
   y: number;
   size: number;
   rotation: number;
}

const StarTrail: React.FC = () => {
   const theme = useTheme();
   const prefersReducedMotion = useReducedMotion();
   const isDark = theme.palette.mode === "dark";
   const [stars, setStars] = useState<Star[]>([]);
   const [starId, setStarId] = useState(0);
   const timeoutsRef = useRef<number[]>([]);

   useEffect(() => {
      if (prefersReducedMotion) return;
      let lastTime = Date.now();
      let frameCount = 0;

      const handleMouseMove = (e: MouseEvent) => {
         const now = Date.now();
         frameCount++;

         // Throttle: Create star every 150ms (reduced frequency)
         // And skip some frames for better performance
         if (now - lastTime > 150 && frameCount % 2 === 0) {
            const newStar = {
               id: starId,
               x: e.clientX,
               y: e.clientY,
               size: Math.random() * 10 + 6, // Smaller stars
               rotation: Math.random() * 360,
            };
            setStars((prev) => {
               // Limit total stars to prevent memory issues
               const updatedStars = [...prev, newStar];
               return updatedStars.length > 15
                  ? updatedStars.slice(-15)
                  : updatedStars;
            });
            setStarId((prev) => prev + 1);

            // Auto-remove after animation
            const t = window.setTimeout(() => {
               setStars((prev) => prev.filter((s) => s.id !== newStar.id));
            }, 800); // Shorter duration
            timeoutsRef.current.push(t);

            lastTime = now;
         }
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      return () => {
         window.removeEventListener("mousemove", handleMouseMove);
         for (const t of timeoutsRef.current) clearTimeout(t);
         timeoutsRef.current = [];
      };
   }, [prefersReducedMotion, starId]);

   if (prefersReducedMotion) return null;

   return (
      <LazyMotion features={domAnimation} strict>
         <AnimatePresence>
            {stars.map((star) => (
               <m.div
                  key={star.id}
                  initial={{
                     x: star.x - star.size / 2,
                     y: star.y - star.size / 2,
                     scale: 0,
                     opacity: 1,
                     rotate: star.rotation,
                  }}
                  animate={{
                     scale: [0, 1, 0],
                     opacity: [0, 1, 0],
                     rotate: star.rotation + 180,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                     duration: 0.8, // Faster animation
                     ease: "easeOut",
                  }}
                  style={{
                     position: "fixed",
                     width: star.size,
                     height: star.size,
                     pointerEvents: "none",
                     zIndex: 9996,
                  }}
               >
                  <div
                     style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                     }}
                  >
                     <div
                        style={{
                           position: "absolute",
                           width: "100%",
                           height: "100%",
                           background: isDark
                              ? "linear-gradient(135deg, #FFE57F 0%, #FFD54F 50%, #FFC107 100%)"
                              : "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                           clipPath:
                              "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                           filter: isDark
                              ? "drop-shadow(0 0 6px rgba(255, 215, 0, 1))"
                              : "drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))",
                        }}
                     />
                  </div>
               </m.div>
            ))}
         </AnimatePresence>
      </LazyMotion>
   );
};

export default StarTrail;
