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
   startX: number;
   startY: number;
   angle: number;
   length: number;
   speed: number;
}

const ShootingStars: React.FC = () => {
   const [stars, setStars] = useState<Star[]>([]);
   const nextIdRef = useRef(0);
   const timeoutsRef = useRef<number[]>([]);
   const intervalRef = useRef<number | null>(null);
   const theme = useTheme();
   const isDark = theme.palette.mode === "dark";
   const prefersReducedMotion = useReducedMotion();

   useEffect(() => {
      if (!isDark || prefersReducedMotion) return; // Only show in dark mode and when motion allowed

      const createStar = () => {
         const newStar: Star = {
            id: nextIdRef.current++,
            startX: Math.random() * window.innerWidth,
            startY: Math.random() * (window.innerHeight * 0.6),
            angle: 45 + Math.random() * 20,
            length: 60 + Math.random() * 80,
            speed: 1 + Math.random() * 1.5,
         };

         setStars((prev) => {
            const next = [...prev, newStar];
            // Cap number of stars to avoid unbounded growth
            return next.length > 20 ? next.slice(-20) : next;
         });

         const t = window.setTimeout(() => {
            setStars((prev) => prev.filter((s) => s.id !== newStar.id));
         }, 2000);
         timeoutsRef.current.push(t);
      };

      const tick = () => {
         if (document.visibilityState === "visible") {
            if (Math.random() > 0.5) createStar();
         }
      };

      intervalRef.current = window.setInterval(tick, 1200);

      const onVisibility = () => {
         // When hidden, we don't spawn; when visible, resume normally via interval
      };
      document.addEventListener("visibilitychange", onVisibility);

      return () => {
         if (intervalRef.current != null) clearInterval(intervalRef.current);
         intervalRef.current = null;
         for (const t of timeoutsRef.current) clearTimeout(t);
         timeoutsRef.current = [];
         document.removeEventListener("visibilitychange", onVisibility);
      };
   }, [isDark, prefersReducedMotion]);

   if (!isDark || prefersReducedMotion) return null; // Don't render in light mode or when reduced motion preferred

   return (
      <LazyMotion features={domAnimation} strict>
         <AnimatePresence>
            {stars.map((star) => {
               const radians = (star.angle * Math.PI) / 180;
               const endX = star.startX + Math.cos(radians) * star.length * 20;
               const endY = star.startY + Math.sin(radians) * star.length * 20;

               return (
                  <m.div
                     key={star.id}
                     initial={{
                        x: star.startX,
                        y: star.startY,
                        opacity: 0,
                        scale: 0,
                     }}
                     animate={{
                        x: endX,
                        y: endY,
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1, 1, 0.5],
                     }}
                     exit={{ opacity: 0 }}
                     transition={{
                        duration: star.speed,
                        ease: "easeOut",
                        opacity: {
                           times: [0, 0.1, 0.7, 1],
                        },
                     }}
                     style={{
                        position: "fixed",
                        width: star.length,
                        height: 3, // Slightly thicker trail
                        background: `linear-gradient(90deg, 
                        transparent, 
                        rgba(255, 255, 255, 0.95), 
                        rgba(180, 220, 255, 0.8),
                        transparent)`,
                        borderRadius: 2,
                        transformOrigin: "left center",
                        transform: `rotate(${star.angle}deg)`,
                        pointerEvents: "none",
                        zIndex: 9990,
                        boxShadow: `
                        0 0 10px rgba(255, 255, 255, 0.8), 
                        0 0 20px rgba(180, 220, 255, 0.6),
                        0 0 30px rgba(0, 150, 255, 0.4)
                     `,
                        filter: "blur(0.5px)",
                     }}
                  />
               );
            })}
         </AnimatePresence>
      </LazyMotion>
   );
};

export default ShootingStars;
