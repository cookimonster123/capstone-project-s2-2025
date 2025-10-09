import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@mui/material";

interface Particle {
   id: number;
   x: number;
   y: number;
   angle: number;
   velocity: number;
   color: string;
}

const ParticleExplosion: React.FC = () => {
   const theme = useTheme();
   const isDark = theme.palette.mode === "dark";
   const [explosions, setExplosions] = useState<Particle[]>([]);
   const [particleId, setParticleId] = useState(0);

   useEffect(() => {
      const handleClick = (e: MouseEvent) => {
         const colors = isDark
            ? ["#00ccff", "#0099ff", "#33ddff", "#66e0ff", "#99e6ff"]
            : ["#0066cc", "#0099ff", "#00ccff", "#3399ff", "#6699ff"];

         // Create 12 particles in a circle
         const newParticles: Particle[] = [];
         for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            newParticles.push({
               id: particleId + i,
               x: e.clientX,
               y: e.clientY,
               angle,
               velocity: Math.random() * 3 + 2,
               color: colors[Math.floor(Math.random() * colors.length)],
            });
         }

         setExplosions((prev) => [...prev, ...newParticles]);
         setParticleId((prev) => prev + 12);

         // Auto-remove after animation
         setTimeout(() => {
            setExplosions((prev) =>
               prev.filter((p) => !newParticles.find((np) => np.id === p.id)),
            );
         }, 800);
      };

      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
   }, [particleId, isDark]);

   return (
      <AnimatePresence>
         {explosions.map((particle) => {
            const distance = particle.velocity * 50;
            const endX = particle.x + Math.cos(particle.angle) * distance;
            const endY = particle.y + Math.sin(particle.angle) * distance;

            return (
               <motion.div
                  key={particle.id}
                  initial={{
                     x: particle.x,
                     y: particle.y,
                     scale: 1,
                     opacity: 1,
                  }}
                  animate={{
                     x: endX,
                     y: endY,
                     scale: 0,
                     opacity: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                     duration: 0.8,
                     ease: "easeOut",
                  }}
                  style={{
                     position: "fixed",
                     width: 8,
                     height: 8,
                     borderRadius: "50%",
                     backgroundColor: particle.color,
                     pointerEvents: "none",
                     zIndex: 9995,
                     boxShadow: `0 0 8px ${particle.color}`,
                  }}
               />
            );
         })}
      </AnimatePresence>
   );
};

export default ParticleExplosion;
