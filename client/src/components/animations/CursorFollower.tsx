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
      const handleMouseMove = (e: MouseEvent) => {
         setMousePosition({ x: e.clientX, y: e.clientY });

         // Check if hovering over interactive element
         const target = e.target as HTMLElement;
         const isInteractive =
            target.tagName === "BUTTON" ||
            target.tagName === "A" ||
            target.closest("button") ||
            target.closest("a") ||
            target.style.cursor === "pointer";

         setIsHovering(!!isInteractive);
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
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
