import React from "react";
import { Box, useTheme } from "@mui/material";
import { motion } from "framer-motion";

/**
 * Professional Dashboard Background
 *
 * Creates a sophisticated, professional background for admin/staff dashboards with:
 * - Subtle animated gradients
 * - Floating geometric shapes
 * - Grid patterns
 * - Minimal distraction, maximum professionalism
 */
const ProfessionalDashboardBackground: React.FC = () => {
   const theme = useTheme();
   const isDark = theme.palette.mode === "dark";

   return (
      <>
         {/* Base gradient background */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               zIndex: -1,
               background: isDark
                  ? "linear-gradient(to bottom, #0a0e1a 0%, #141824 50%, #0a0e1a 100%)"
                  : "linear-gradient(to bottom, #f8f9fb 0%, #ffffff 50%, #f8f9fb 100%)",
            }}
         />

         {/* Animated subtle gradient overlay */}
         <motion.div
            animate={{
               background: isDark
                  ? [
                       "radial-gradient(circle at 20% 20%, rgba(0,102,204,0.08) 0%, transparent 50%)",
                       "radial-gradient(circle at 80% 80%, rgba(0,153,255,0.08) 0%, transparent 50%)",
                       "radial-gradient(circle at 20% 80%, rgba(14,165,233,0.08) 0%, transparent 50%)",
                       "radial-gradient(circle at 80% 20%, rgba(0,102,204,0.08) 0%, transparent 50%)",
                       "radial-gradient(circle at 20% 20%, rgba(0,102,204,0.08) 0%, transparent 50%)",
                    ]
                  : [
                       "radial-gradient(circle at 20% 20%, rgba(0,102,204,0.05) 0%, transparent 50%)",
                       "radial-gradient(circle at 80% 80%, rgba(0,153,255,0.05) 0%, transparent 50%)",
                       "radial-gradient(circle at 20% 80%, rgba(14,165,233,0.05) 0%, transparent 50%)",
                       "radial-gradient(circle at 80% 20%, rgba(0,102,204,0.05) 0%, transparent 50%)",
                       "radial-gradient(circle at 20% 20%, rgba(0,102,204,0.05) 0%, transparent 50%)",
                    ],
            }}
            transition={{
               duration: 20,
               repeat: Infinity,
               ease: "easeInOut",
            }}
            style={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               zIndex: -1,
            }}
         />

         {/* Grid pattern */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background: isDark
                  ? `linear-gradient(90deg, rgba(0,153,255,0.02) 1px, transparent 1px),
               linear-gradient(rgba(0,153,255,0.02) 1px, transparent 1px)`
                  : `linear-gradient(90deg, rgba(0,102,204,0.015) 1px, transparent 1px),
               linear-gradient(rgba(0,102,204,0.015) 1px, transparent 1px)`,
               backgroundSize: "100px 100px",
               opacity: 0.4,
               zIndex: -1,
            }}
         />

         {/* Floating geometric shapes */}
         {[...Array(6)].map((_, i) => (
            <motion.div
               key={`shape-${i}`}
               initial={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  rotate: Math.random() * 360,
                  opacity: 0,
               }}
               animate={{
                  x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                  y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                  rotate: [0, 360],
                  opacity: [0, isDark ? 0.08 : 0.05, 0],
               }}
               transition={{
                  duration: 30 + i * 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 2,
               }}
               style={{
                  position: "fixed",
                  width: i % 2 === 0 ? "200px" : "150px",
                  height: i % 2 === 0 ? "200px" : "150px",
                  borderRadius: i % 3 === 0 ? "50%" : "20%",
                  border: isDark
                     ? "2px solid rgba(0,153,255,0.3)"
                     : "2px solid rgba(0,102,204,0.2)",
                  zIndex: -1,
               }}
            />
         ))}

         {/* Corner accents */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               right: 0,
               width: "400px",
               height: "400px",
               background: isDark
                  ? "radial-gradient(circle at top right, rgba(0,153,255,0.1), transparent)"
                  : "radial-gradient(circle at top right, rgba(0,102,204,0.06), transparent)",
               filter: "blur(60px)",
               zIndex: -1,
            }}
         />

         <Box
            sx={{
               position: "fixed",
               bottom: 0,
               left: 0,
               width: "400px",
               height: "400px",
               background: isDark
                  ? "radial-gradient(circle at bottom left, rgba(14,165,233,0.1), transparent)"
                  : "radial-gradient(circle at bottom left, rgba(14,165,233,0.06), transparent)",
               filter: "blur(60px)",
               zIndex: -1,
            }}
         />

         {/* Subtle scan line effect */}
         <motion.div
            animate={{
               y: ["-100%", "200%"],
            }}
            transition={{
               duration: 10,
               repeat: Infinity,
               ease: "linear",
            }}
            style={{
               position: "fixed",
               left: 0,
               right: 0,
               height: "200px",
               background: isDark
                  ? "linear-gradient(to bottom, transparent, rgba(0,153,255,0.02), transparent)"
                  : "linear-gradient(to bottom, transparent, rgba(0,102,204,0.015), transparent)",
               pointerEvents: "none",
               zIndex: -1,
            }}
         />

         {/* Particles for subtle movement */}
         {[...Array(isDark ? 25 : 15)].map((_, i) => (
            <motion.div
               key={`particle-${i}`}
               initial={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: 0,
               }}
               animate={{
                  y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                  scale: [0, 1, 0],
                  opacity: [0, isDark ? 0.8 : 0.4, 0],
               }}
               transition={{
                  duration: 8 + Math.random() * 10,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "easeInOut",
               }}
               style={{
                  position: "fixed",
                  width: isDark ? "6px" : "4px",
                  height: isDark ? "6px" : "4px",
                  borderRadius: "50%",
                  background: isDark ? "#0099ff" : "#06c",
                  boxShadow: isDark ? "0 0 8px #0099ff" : "none",
                  zIndex: -1,
               }}
            />
         ))}
      </>
   );
};

export default ProfessionalDashboardBackground;
