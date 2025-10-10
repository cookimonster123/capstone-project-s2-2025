import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material";

interface TrailDot {
   id: number;
   x: number;
   y: number;
}

const MouseTrail: React.FC = () => {
   const theme = useTheme();
   const isDark = theme.palette.mode === "dark";
   const [trail, setTrail] = useState<TrailDot[]>([]);
   const [trailId, setTrailId] = useState(0);
   const reducedMotionRef = useRef<boolean>(false);
   const visibleRef = useRef<boolean>(true);

   useEffect(() => {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotionRef.current = mql.matches;
      const onReducedMotionChange = (e: MediaQueryListEvent) => {
         reducedMotionRef.current = e.matches;
      };
      if ("addEventListener" in mql) {
         mql.addEventListener("change", onReducedMotionChange);
      } else {
         (mql as any).addListener(onReducedMotionChange);
      }

      const onVisibilityChange = () => {
         visibleRef.current = document.visibilityState === "visible";
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      let lastTime = performance.now();
      const THROTTLE_MS = 80;

      const handleMouseMove = (e: MouseEvent) => {
         if (reducedMotionRef.current || !visibleRef.current) return;
         const now = performance.now();
         if (now - lastTime > THROTTLE_MS) {
            const newDot = {
               id: trailId,
               x: e.clientX,
               y: e.clientY,
            };
            setTrail((prev) => {
               const next = prev.length >= 6 ? prev.slice(1) : prev.slice();
               next.push(newDot);
               return next;
            }); // keep at most 6, reuse array where possible
            setTrailId((prev) => prev + 1);
            lastTime = now;
         }
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      return () => {
         window.removeEventListener("mousemove", handleMouseMove);
         document.removeEventListener("visibilitychange", onVisibilityChange);
         if ("removeEventListener" in mql) {
            mql.removeEventListener("change", onReducedMotionChange);
         } else {
            (mql as any).removeListener(onReducedMotionChange);
         }
      };
   }, [trailId]);

   return (
      <>
         {trail.map((dot, index) => (
            <motion.div
               key={dot.id}
               initial={{ scale: 0, opacity: 0.6 }}
               animate={{ scale: 0, opacity: 0 }}
               transition={{ duration: 0.5 }} // Faster fade
               style={{
                  position: "fixed",
                  left: dot.x - 4,
                  top: dot.y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: isDark
                     ? `rgba(0, 204, 255, ${0.7 - index * 0.08})`
                     : `rgba(0, 102, 204, ${0.6 - index * 0.07})`,
                  pointerEvents: "none",
                  zIndex: 9998,
               }}
            />
         ))}
      </>
   );
};

export default MouseTrail;
