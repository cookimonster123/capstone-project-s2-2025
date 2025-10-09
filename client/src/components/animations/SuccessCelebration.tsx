import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface SuccessCelebrationProps {
   show: boolean;
   onClose: () => void;
   projectTitle?: string;
}

/**
 * Epic success celebration modal with confetti, animations, and triumph!
 * Creates an unforgettable moment when users complete important actions
 */
const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
   show,
   onClose,
   projectTitle = "Your Project",
}) => {
   const [windowDimensions, setWindowDimensions] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
   });

   useEffect(() => {
      const handleResize = () => {
         setWindowDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
         });
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   if (!show) return null;

   return (
      <Box
         sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
         }}
         onClick={onClose}
      >
         <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            numberOfPieces={500}
            recycle={false}
            gravity={0.3}
         />

         <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
               type: "spring",
               stiffness: 200,
               damping: 20,
            }}
            onClick={(e) => e.stopPropagation()}
         >
            <Box
               sx={{
                  bgcolor: "white",
                  borderRadius: 4,
                  p: 6,
                  textAlign: "center",
                  maxWidth: 500,
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
               }}
            >
               {/* Animated background gradient */}
               <motion.div
                  animate={{
                     background: [
                        "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                        "linear-gradient(135deg, #0099ff 0%, #00ccff 100%)",
                        "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                     ],
                  }}
                  transition={{
                     duration: 3,
                     repeat: Infinity,
                     ease: "linear",
                  }}
                  style={{
                     position: "absolute",
                     top: 0,
                     left: 0,
                     right: 0,
                     height: 200,
                     zIndex: 0,
                  }}
               />

               {/* Content */}
               <Box sx={{ position: "relative", zIndex: 1 }}>
                  {/* Success Icon */}
                  <motion.div
                     animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 360],
                     }}
                     transition={{
                        duration: 1,
                        times: [0, 0.5, 1],
                        ease: "easeInOut",
                     }}
                  >
                     <Box
                        sx={{
                           bgcolor: "white",
                           borderRadius: "50%",
                           width: 120,
                           height: 120,
                           display: "flex",
                           alignItems: "center",
                           justifyContent: "center",
                           margin: "0 auto",
                           mb: 3,
                           boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                        }}
                     >
                        <CheckCircleIcon
                           sx={{
                              fontSize: 80,
                              color: "success.main",
                           }}
                        />
                     </Box>
                  </motion.div>

                  {/* Sparkles */}
                  {[...Array(6)].map((_, i) => (
                     <motion.div
                        key={i}
                        animate={{
                           scale: [0, 1, 0],
                           opacity: [0, 1, 0],
                           x: Math.cos((i * Math.PI) / 3) * 100,
                           y: Math.sin((i * Math.PI) / 3) * 100,
                        }}
                        transition={{
                           duration: 1.5,
                           delay: 0.2,
                           repeat: Infinity,
                           repeatDelay: 1,
                        }}
                        style={{
                           position: "absolute",
                           top: "50%",
                           left: "50%",
                        }}
                     >
                        <AutoAwesomeIcon
                           sx={{
                              color: "warning.main",
                              fontSize: 24,
                           }}
                        />
                     </motion.div>
                  ))}

                  <Typography
                     variant="h3"
                     fontWeight="bold"
                     color="white"
                     gutterBottom
                     sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                     }}
                  >
                     Success!
                  </Typography>

                  <Typography
                     variant="h6"
                     color="white"
                     sx={{ mb: 4, opacity: 0.9 }}
                  >
                     {projectTitle} has been uploaded successfully!
                  </Typography>

                  <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                  >
                     <Button
                        variant="contained"
                        size="large"
                        startIcon={<RocketLaunchIcon />}
                        onClick={onClose}
                        sx={{
                           bgcolor: "white",
                           color: "primary.main",
                           px: 4,
                           py: 1.5,
                           fontSize: "1.1rem",
                           fontWeight: "bold",
                           boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                           "&:hover": {
                              bgcolor: "grey.100",
                           },
                        }}
                     >
                        View Your Project
                     </Button>
                  </motion.div>
               </Box>
            </Box>
         </motion.div>
      </Box>
   );
};

export default SuccessCelebration;
