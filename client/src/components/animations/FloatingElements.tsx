import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material";

/**
 * Floating geometric elements for background decoration
 * Adapts colors and opacity based on light/dark theme
 * Adds depth and visual interest to the page
 * Enhanced with more elements and dynamic animations
 */
const FloatingElements: React.FC = () => {
   const theme = useTheme();
   const isDark = theme.palette.mode === "dark";

   const shapes = [
      // Original shapes - enhanced
      {
         size: 80,
         top: "10%",
         left: "5%",
         delay: 0,
         duration: 20,
         type: "circle",
      },
      {
         size: 100,
         top: "20%",
         right: "10%",
         delay: 2,
         duration: 25,
         type: "square",
      },
      {
         size: 60,
         bottom: "15%",
         left: "15%",
         delay: 4,
         duration: 22,
         type: "circle",
      },
      {
         size: 90,
         bottom: "25%",
         right: "5%",
         delay: 1,
         duration: 23,
         type: "triangle",
      },
      {
         size: 50,
         top: "50%",
         left: "8%",
         delay: 3,
         duration: 18,
         type: "square",
      },
      {
         size: 75,
         top: "60%",
         right: "12%",
         delay: 5,
         duration: 21,
         type: "circle",
      },
      // New shapes for more visual interest
      {
         size: 45,
         top: "35%",
         left: "50%",
         delay: 2.5,
         duration: 19,
         type: "circle",
      },
      {
         size: 85,
         bottom: "40%",
         left: "25%",
         delay: 1.5,
         duration: 24,
         type: "square",
      },
      {
         size: 55,
         top: "75%",
         right: "30%",
         delay: 4.5,
         duration: 20,
         type: "triangle",
      },
      {
         size: 70,
         top: "15%",
         left: "40%",
         delay: 3.5,
         duration: 22,
         type: "circle",
      },
      {
         size: 40,
         bottom: "10%",
         right: "20%",
         delay: 0.5,
         duration: 17,
         type: "square",
      },
      {
         size: 95,
         top: "45%",
         right: "40%",
         delay: 5.5,
         duration: 26,
         type: "circle",
      },
   ];

   return (
      <>
         {shapes.map((shape, index) => (
            <motion.div
               key={index}
               initial={{ opacity: 0, scale: 0 }}
               animate={{
                  opacity: isDark ? [0.12, 0.25, 0.12] : [0.08, 0.2, 0.08],
                  scale: [1, 1.3, 1],
                  rotate: shape.type === "circle" ? [0, 360] : [0, 180, 360],
                  y: [0, -30, 0],
               }}
               transition={{
                  duration: shape.duration,
                  repeat: Infinity,
                  delay: shape.delay,
                  ease: "easeInOut",
               }}
               style={{
                  position: "absolute",
                  width: shape.size,
                  height: shape.size,
                  top: shape.top,
                  bottom: shape.bottom,
                  left: shape.left,
                  right: shape.right,
                  borderRadius:
                     shape.type === "circle"
                        ? "50%"
                        : shape.type === "square"
                          ? "20%"
                          : "0%",
                  clipPath:
                     shape.type === "triangle"
                        ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                        : undefined,
                  background: isDark
                     ? index % 3 === 0
                        ? "linear-gradient(135deg, #0099ff 0%, #00ccff 100%)"
                        : index % 3 === 1
                          ? "linear-gradient(135deg, #00ccff 0%, #33ddff 100%)"
                          : "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)"
                     : index % 3 === 0
                       ? "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)"
                       : index % 3 === 1
                         ? "linear-gradient(135deg, #0099ff 0%, #00ccff 100%)"
                         : "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
                  filter: "blur(3px)",
                  boxShadow: isDark
                     ? "0 0 40px rgba(0, 153, 255, 0.3)"
                     : "0 0 30px rgba(0, 153, 255, 0.2)",
                  pointerEvents: "none",
                  zIndex: 0,
               }}
            />
         ))}
      </>
   );
};

export default FloatingElements;
