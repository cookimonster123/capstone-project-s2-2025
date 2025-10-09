import React, { useEffect, useState } from "react";
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

   useEffect(() => {
      let lastTime = Date.now();
      let frameCount = 0;

      const handleMouseMove = (e: MouseEvent) => {
         const now = Date.now();
         frameCount++;

         // Throttle more aggressively: every 80ms and skip frames
         if (now - lastTime > 80 && frameCount % 2 === 0) {
            const newDot = {
               id: trailId,
               x: e.clientX,
               y: e.clientY,
            };
            setTrail((prev) => [...prev.slice(-6), newDot]); // Reduced to max 6 dots
            setTrailId((prev) => prev + 1);
            lastTime = now;
         }
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      return () => {
         window.removeEventListener("mousemove", handleMouseMove);
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
