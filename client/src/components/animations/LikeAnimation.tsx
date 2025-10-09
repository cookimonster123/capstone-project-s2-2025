import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { IconButton } from "@mui/material";

interface LikeAnimationProps {
   liked: boolean;
   onToggle: () => void;
   size?: "small" | "medium" | "large";
}

interface Particle {
   id: number;
   angle: number;
   distance: number;
   size: number;
}

/**
 * Interactive like button with heart explosion animation
 * Shows particle burst effect when liked, smooth heart fill animation
 *
 * @param liked - Current liked state
 * @param onToggle - Callback when like button is clicked
 * @param size - Button size variant
 */
const LikeAnimation: React.FC<LikeAnimationProps> = ({
   liked,
   onToggle,
   size = "medium",
}) => {
   const [particles, setParticles] = useState<Particle[]>([]);
   const [showBurst, setShowBurst] = useState(false);

   const handleClick = () => {
      if (!liked) {
         // Create particle burst when liking
         const newParticles: Particle[] = Array.from(
            { length: 12 },
            (_, i) => ({
               id: Date.now() + i,
               angle: (i * 360) / 12,
               distance: 40 + Math.random() * 20,
               size: 4 + Math.random() * 4,
            }),
         );
         setParticles(newParticles);
         setShowBurst(true);

         // Clear particles after animation
         setTimeout(() => {
            setParticles([]);
            setShowBurst(false);
         }, 800);
      }
      onToggle();
   };

   const sizeMap = {
      small: 20,
      medium: 24,
      large: 32,
   };

   const iconSize = sizeMap[size];

   return (
      <div style={{ position: "relative", display: "inline-block" }}>
         {/* Particle burst */}
         <AnimatePresence>
            {showBurst &&
               particles.map((particle) => (
                  <motion.div
                     key={particle.id}
                     initial={{
                        x: 0,
                        y: 0,
                        opacity: 1,
                        scale: 1,
                     }}
                     animate={{
                        x:
                           Math.cos((particle.angle * Math.PI) / 180) *
                           particle.distance,
                        y:
                           Math.sin((particle.angle * Math.PI) / 180) *
                           particle.distance,
                        opacity: 0,
                        scale: 0,
                     }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.6, ease: "easeOut" }}
                     style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: particle.size,
                        height: particle.size,
                        borderRadius: "50%",
                        background:
                           "linear-gradient(135deg, #ff3b5c 0%, #ff6b88 100%)",
                        pointerEvents: "none",
                        zIndex: 10,
                     }}
                  />
               ))}
         </AnimatePresence>

         {/* Circular pulse effect */}
         <AnimatePresence>
            {showBurst && (
               <motion.div
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                     position: "absolute",
                     top: "50%",
                     left: "50%",
                     transform: "translate(-50%, -50%)",
                     width: iconSize * 2,
                     height: iconSize * 2,
                     borderRadius: "50%",
                     border: "2px solid #ff3b5c",
                     pointerEvents: "none",
                     zIndex: 9,
                  }}
               />
            )}
         </AnimatePresence>

         {/* Like button */}
         <IconButton
            onClick={handleClick}
            size={size}
            sx={{
               position: "relative",
               zIndex: 1,
               color: liked ? "#ff3b5c" : "text.secondary",
               transition: "color 0.2s ease",
               "&:hover": {
                  bgcolor: liked
                     ? "rgba(255, 59, 92, 0.08)"
                     : "rgba(0, 0, 0, 0.04)",
               },
            }}
         >
            <motion.div
               animate={{
                  scale: liked ? [1, 1.3, 1] : 1,
               }}
               transition={{
                  duration: 0.3,
                  ease: "easeInOut",
               }}
            >
               {liked ? (
                  <FavoriteIcon sx={{ fontSize: iconSize }} />
               ) : (
                  <FavoriteBorderIcon sx={{ fontSize: iconSize }} />
               )}
            </motion.div>
         </IconButton>
      </div>
   );
};

export default LikeAnimation;
