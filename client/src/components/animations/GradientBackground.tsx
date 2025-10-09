import React from "react";
import { motion } from "framer-motion";
import { Box, useTheme } from "@mui/material";

/**
 * Animated gradient background with smooth color transitions
 * Adapts colors based on light/dark theme
 * Creates a dynamic, modern atmosphere with blue theme
 * Enhanced with more vibrant animations and effects
 */
const GradientBackground: React.FC = () => {
   const theme = useTheme();
   const isDark = theme.palette.mode === "dark";

   return (
      <Box
         sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            overflow: "hidden",
            background: isDark ? "#0a0e17" : "#ffffff",
            transition: "background 0.3s ease",
         }}
      >
         {/* Starfield effect for dark mode */}
         {isDark && (
            <Box
               sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                     radial-gradient(2px 2px at 20% 30%, white, transparent),
                     radial-gradient(2px 2px at 60% 70%, white, transparent),
                     radial-gradient(1px 1px at 50% 50%, white, transparent),
                     radial-gradient(1px 1px at 80% 10%, white, transparent),
                     radial-gradient(2px 2px at 90% 60%, white, transparent),
                     radial-gradient(1px 1px at 33% 80%, white, transparent),
                     radial-gradient(1px 1px at 15% 90%, white, transparent),
                     radial-gradient(2px 2px at 40% 20%, white, transparent),
                     radial-gradient(1px 1px at 70% 40%, white, transparent),
                     radial-gradient(2px 2px at 25% 60%, white, transparent),
                     radial-gradient(1px 1px at 85% 85%, white, transparent),
                     radial-gradient(1px 1px at 45% 15%, white, transparent)
                  `,
                  backgroundSize:
                     "200px 200px, 300px 300px, 250px 250px, 350px 350px, 280px 280px, 220px 220px, 180px 180px, 240px 240px, 320px 320px, 260px 260px, 190px 190px, 310px 310px",
                  backgroundPosition:
                     "0 0, 40px 60px, 130px 270px, 70px 100px, 150px 50px, 90px 180px, 200px 120px, 110px 220px, 170px 80px, 50px 160px, 210px 190px, 140px 240px",
                  opacity: 0.5, // Increased from 0.3
                  animation: "twinkle 8s ease-in-out infinite",
                  "@keyframes twinkle": {
                     "0%, 100%": { opacity: 0.4 },
                     "50%": { opacity: 0.7 }, // Increased from 0.5
                  },
               }}
            />
         )}

         {/* Primary animated gradient overlay - MORE VIBRANT */}
         <motion.div
            animate={{
               background: isDark
                  ? [
                       "radial-gradient(circle at 0% 0%, rgba(0, 153, 255, 0.25) 0%, transparent 50%)",
                       "radial-gradient(circle at 100% 100%, rgba(0, 204, 255, 0.25) 0%, transparent 50%)",
                       "radial-gradient(circle at 0% 100%, rgba(56, 189, 248, 0.25) 0%, transparent 50%)",
                       "radial-gradient(circle at 100% 0%, rgba(14, 165, 233, 0.25) 0%, transparent 50%)",
                       "radial-gradient(circle at 0% 0%, rgba(0, 153, 255, 0.25) 0%, transparent 50%)",
                    ]
                  : [
                       "radial-gradient(circle at 0% 0%, rgba(0, 102, 204, 0.2) 0%, transparent 50%)",
                       "radial-gradient(circle at 100% 100%, rgba(0, 153, 255, 0.2) 0%, transparent 50%)",
                       "radial-gradient(circle at 0% 100%, rgba(56, 189, 248, 0.2) 0%, transparent 50%)",
                       "radial-gradient(circle at 100% 0%, rgba(14, 165, 233, 0.2) 0%, transparent 50%)",
                       "radial-gradient(circle at 0% 0%, rgba(0, 102, 204, 0.2) 0%, transparent 50%)",
                    ],
            }}
            transition={{
               duration: 15,
               repeat: Infinity,
               ease: "easeInOut",
            }}
            style={{
               position: "absolute",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
            }}
         />

         {/* Secondary gradient for depth - ENHANCED */}
         <motion.div
            animate={{
               background: isDark
                  ? [
                       "radial-gradient(circle at 50% 50%, rgba(0, 153, 255, 0.18) 0%, transparent 60%)",
                       "radial-gradient(circle at 30% 70%, rgba(0, 102, 204, 0.18) 0%, transparent 60%)",
                       "radial-gradient(circle at 70% 30%, rgba(56, 189, 248, 0.18) 0%, transparent 60%)",
                       "radial-gradient(circle at 50% 50%, rgba(0, 153, 255, 0.18) 0%, transparent 60%)",
                    ]
                  : [
                       "radial-gradient(circle at 50% 50%, rgba(0, 153, 255, 0.15) 0%, transparent 60%)",
                       "radial-gradient(circle at 30% 70%, rgba(0, 102, 204, 0.15) 0%, transparent 60%)",
                       "radial-gradient(circle at 70% 30%, rgba(56, 189, 248, 0.15) 0%, transparent 60%)",
                       "radial-gradient(circle at 50% 50%, rgba(0, 153, 255, 0.15) 0%, transparent 60%)",
                    ],
            }}
            transition={{
               duration: 12,
               repeat: Infinity,
               ease: "easeInOut",
            }}
            style={{
               position: "absolute",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
            }}
         />

         {/* New: Pulsing center glow */}
         <motion.div
            animate={{
               opacity: [0.3, 0.6, 0.3],
               scale: [1, 1.2, 1],
            }}
            transition={{
               duration: 8,
               repeat: Infinity,
               ease: "easeInOut",
            }}
            style={{
               position: "absolute",
               top: "50%",
               left: "50%",
               transform: "translate(-50%, -50%)",
               width: "800px",
               height: "800px",
               borderRadius: "50%",
               background: isDark
                  ? "radial-gradient(circle, rgba(0, 153, 255, 0.2) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(0, 153, 255, 0.15) 0%, transparent 70%)",
               filter: "blur(60px)",
            }}
         />

         {/* Mesh gradient overlay - ENHANCED */}
         <Box
            sx={{
               position: "absolute",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background: `
                  linear-gradient(to right, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%),
                  linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)
               `,
               backgroundSize: "100px 100px",
            }}
         />
      </Box>
   );
};

export default GradientBackground;
