import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Ripple {
   id: number;
   x: number;
   y: number;
}

/**
 * Epic mouse click ripple effect
 * Creates expanding circles on every click for satisfying feedback
 */
const MouseRipple: React.FC = () => {
   const [ripples, setRipples] = useState<Ripple[]>([]);
   const [rippleId, setRippleId] = useState(0);

   useEffect(() => {
      const handleClick = (e: MouseEvent) => {
         const newRipple = {
            id: rippleId,
            x: e.clientX,
            y: e.clientY,
         };
         setRipples((prev) => [...prev, newRipple]);
         setRippleId((prev) => prev + 1);

         // Auto-remove after animation completes
         setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
         }, 1000);
      };

      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
   }, [rippleId]);

   return (
      <AnimatePresence>
         {ripples.map((ripple) => (
            <motion.div
               key={ripple.id}
               initial={{
                  width: 0,
                  height: 0,
                  x: ripple.x,
                  y: ripple.y,
                  opacity: 1,
               }}
               animate={{
                  width: 100,
                  height: 100,
                  x: ripple.x - 50,
                  y: ripple.y - 50,
                  opacity: 0,
               }}
               exit={{ opacity: 0 }}
               transition={{
                  duration: 0.8,
                  ease: "easeOut",
               }}
               style={{
                  position: "fixed",
                  borderRadius: "50%",
                  border: "3px solid rgba(0, 102, 204, 0.6)",
                  pointerEvents: "none",
                  zIndex: 9999,
               }}
            />
         ))}
      </AnimatePresence>
   );
};

export default MouseRipple;
