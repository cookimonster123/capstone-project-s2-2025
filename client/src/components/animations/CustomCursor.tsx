import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Epic custom cursor with glow effect - keeps default cursor visible
 * Adds beautiful trailing glow effect without hiding the mouse
 */
const CustomCursor: React.FC = () => {
   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
   const [isClicking, setIsClicking] = useState(false);

   useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
         setMousePosition({ x: e.clientX, y: e.clientY });
      };

      const handleMouseDown = () => setIsClicking(true);
      const handleMouseUp = () => setIsClicking(false);

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
         window.removeEventListener("mousemove", handleMouseMove);
         window.removeEventListener("mousedown", handleMouseDown);
         window.removeEventListener("mouseup", handleMouseUp);
      };
   }, []);

   return (
      <>
         {/* Outer glow - follows with delay for trail effect */}
         <motion.div
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
         <motion.div
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
         <motion.div
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
      </>
   );
};

export default CustomCursor;
