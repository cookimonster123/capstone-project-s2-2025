import React from "react";
import { motion } from "framer-motion";
import { Card, type CardProps } from "@mui/material";

interface AnimatedCardProps extends CardProps {
   children: React.ReactNode;
   delay?: number;
   hover3D?: boolean;
}

/**
 * Enhanced card component with entrance animations and 3D hover effects
 * Creates an immersive, interactive experience for project cards
 */
const AnimatedCard: React.FC<AnimatedCardProps> = ({
   children,
   delay = 0,
   hover3D = true,
   ...cardProps
}) => {
   const [rotateX, setRotateX] = React.useState(0);
   const [rotateY, setRotateY] = React.useState(0);

   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hover3D) return;
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateXValue = ((y - centerY) / centerY) * -10;
      const rotateYValue = ((x - centerX) / centerX) * 10;

      setRotateX(rotateXValue);
      setRotateY(rotateYValue);
   };

   const handleMouseLeave = () => {
      setRotateX(0);
      setRotateY(0);
   };

   return (
      <motion.div
         initial={{ opacity: 0, y: 50 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true, margin: "-100px" }}
         transition={{
            duration: 0.6,
            delay,
            ease: [0.6, -0.05, 0.01, 0.99],
         }}
         whileHover={{
            scale: 1.03,
            boxShadow: "0 20px 40px rgba(0,102,204,0.2)",
         }}
         onMouseMove={handleMouseMove}
         onMouseLeave={handleMouseLeave}
         style={{
            perspective: 1000,
         }}
      >
         <motion.div
            animate={{
               rotateX,
               rotateY,
            }}
            transition={{
               type: "spring",
               stiffness: 300,
               damping: 20,
            }}
            style={{
               transformStyle: "preserve-3d",
            }}
         >
            <Card
               {...cardProps}
               sx={{
                  ...cardProps.sx,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                     content: '""',
                     position: "absolute",
                     top: 0,
                     left: 0,
                     right: 0,
                     bottom: 0,
                     background:
                        "linear-gradient(135deg, rgba(0,102,204,0.05) 0%, rgba(0,153,255,0.05) 100%)",
                     opacity: 0,
                     transition: "opacity 0.3s ease",
                  },
                  "&:hover::before": {
                     opacity: 1,
                  },
               }}
            >
               {children}
            </Card>
         </motion.div>
      </motion.div>
   );
};

export default AnimatedCard;
