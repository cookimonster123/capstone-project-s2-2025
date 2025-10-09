import React from "react";
import { Box } from "@mui/material";

/**
 * PremiumLightBackground
 * University of Auckland (UOA) 品牌背景
 * 简约干净的浅色背景 + 优雅的玻璃态滚动特效
 * 设计灵感：iOS/macOS 设计语言
 * Features:
 * - UOA 品牌蓝色 (#00467F) 点缀
 * - 大型 UOA 文字水印
 * - 玻璃态有机形状动画
 * - 优雅的变形和旋转效果
 */
const PremiumLightBackground: React.FC = () => {
   return (
      <Box
         sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            overflow: "hidden",
            background: "linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)",
         }}
      >
         {/* Elegant glass morphism floating shapes */}
         <Box
            sx={{
               position: "absolute",
               top: "15%",
               left: "8%",
               width: "400px",
               height: "400px",
               borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
               background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)",
               backdropFilter: "blur(30px) saturate(180%)",
               WebkitBackdropFilter: "blur(30px) saturate(180%)",
               border: "1px solid rgba(255, 255, 255, 0.5)",
               boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
               animation: "morphFloat1 20s ease-in-out infinite",
               "@keyframes morphFloat1": {
                  "0%, 100%": {
                     transform: "translate(0, 0) rotate(0deg)",
                     borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
                  },
                  "25%": {
                     transform: "translate(20px, -20px) rotate(90deg)",
                     borderRadius: "70% 30% 50% 50% / 30% 30% 70% 70%",
                  },
                  "50%": {
                     transform: "translate(0, -40px) rotate(180deg)",
                     borderRadius: "50% 60% 30% 70% / 60% 30% 70% 40%",
                  },
                  "75%": {
                     transform: "translate(-20px, -20px) rotate(270deg)",
                     borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
                  },
               },
            }}
         />

         <Box
            sx={{
               position: "absolute",
               top: "50%",
               right: "10%",
               width: "350px",
               height: "350px",
               borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
               background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%)",
               backdropFilter: "blur(25px) saturate(180%)",
               WebkitBackdropFilter: "blur(25px) saturate(180%)",
               border: "1px solid rgba(255, 255, 255, 0.4)",
               boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.08)",
               animation: "morphFloat2 25s ease-in-out infinite",
               "@keyframes morphFloat2": {
                  "0%, 100%": {
                     transform: "translate(0, 0) rotate(0deg)",
                     borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
                  },
                  "33%": {
                     transform: "translate(-25px, 25px) rotate(120deg)",
                     borderRadius: "30% 70% 70% 30% / 40% 60% 40% 60%",
                  },
                  "66%": {
                     transform: "translate(25px, -15px) rotate(240deg)",
                     borderRadius: "70% 30% 40% 60% / 30% 70% 60% 40%",
                  },
               },
            }}
         />

         <Box
            sx={{
               position: "absolute",
               bottom: "20%",
               left: "35%",
               width: "320px",
               height: "320px",
               borderRadius: "50% 50% 30% 70% / 50% 50% 70% 30%",
               background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.25) 100%)",
               backdropFilter: "blur(28px) saturate(180%)",
               WebkitBackdropFilter: "blur(28px) saturate(180%)",
               border: "1px solid rgba(255, 255, 255, 0.45)",
               boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.09)",
               animation: "morphFloat3 30s ease-in-out infinite",
               "@keyframes morphFloat3": {
                  "0%, 100%": {
                     transform: "translate(0, 0) rotate(0deg)",
                     borderRadius: "50% 50% 30% 70% / 50% 50% 70% 30%",
                  },
                  "50%": {
                     transform: "translate(0, -30px) rotate(180deg)",
                     borderRadius: "30% 70% 70% 30% / 70% 30% 30% 70%",
                  },
               },
            }}
         />

         {/* UOA Brand Accents - University of Auckland Blue */}
         <Box
            sx={{
               position: "absolute",
               top: "5%",
               right: "15%",
               width: "250px",
               height: "250px",
               borderRadius: "50%",
               background:
                  "radial-gradient(circle, rgba(0, 70, 127, 0.12) 0%, transparent 70%)",
               filter: "blur(45px)",
               animation: "pulse1 8s ease-in-out infinite",
               "@keyframes pulse1": {
                  "0%, 100%": { opacity: 0.7, transform: "scale(1)" },
                  "50%": { opacity: 1, transform: "scale(1.25)" },
               },
            }}
         />

         <Box
            sx={{
               position: "absolute",
               bottom: "10%",
               right: "25%",
               width: "200px",
               height: "200px",
               borderRadius: "50%",
               background:
                  "radial-gradient(circle, rgba(0, 70, 127, 0.08) 0%, transparent 70%)",
               filter: "blur(40px)",
               animation: "pulse2 10s ease-in-out infinite",
               "@keyframes pulse2": {
                  "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
                  "50%": { opacity: 0.95, transform: "scale(1.2)" },
               },
            }}
         />

         {/* UOA Watermark - Large elegant text */}
         <Box
            sx={{
               position: "absolute",
               top: "50%",
               left: "50%",
               transform: "translate(-50%, -50%)",
               width: "100%",
               textAlign: "center",
               zIndex: 1,
               pointerEvents: "none",
               userSelect: "none",
            }}
         >
            <Box
               component="div"
               sx={{
                  fontSize: {
                     xs: "240px",
                     sm: "380px",
                     md: "520px",
                     lg: "650px",
                     xl: "800px",
                  },
                  fontWeight: 900,
                  color: "rgba(0, 70, 127, 0.10)",
                  letterSpacing: {
                     xs: "20px",
                     sm: "30px",
                     md: "45px",
                     lg: "60px",
                  },
                  fontFamily: '"Helvetica Neue", "Arial", sans-serif',
                  textTransform: "uppercase",
                  lineHeight: 0.9,
                  marginBottom: "20px",
               }}
            >
               UOA
            </Box>
            <Box
               component="div"
               sx={{
                  fontSize: {
                     xs: "28px",
                     sm: "38px",
                     md: "48px",
                     lg: "56px",
                     xl: "64px",
                  },
                  fontWeight: 500,
                  color: "rgba(0, 70, 127, 0.12)",
                  letterSpacing: {
                     xs: "12px",
                     sm: "18px",
                     md: "24px",
                     lg: "30px",
                  },
                  fontFamily: '"Helvetica Neue", "Arial", sans-serif',
                  textTransform: "uppercase",
               }}
            >
               University of Auckland
            </Box>
         </Box>
      </Box>
   );
};

export default PremiumLightBackground;
