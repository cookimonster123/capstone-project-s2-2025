import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import { motion } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface UploadProgressProps {
   progress: number;
   fileName?: string;
}

/**
 * Stunning upload progress indicator with smooth animations
 * Creates anticipation and excitement during file uploads
 */
const UploadProgress: React.FC<UploadProgressProps> = ({
   progress,
   fileName = "Uploading...",
}) => {
   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -20 }}
      >
         <Box
            sx={{
               p: 4,
               borderRadius: 3,
               background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
               boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
               position: "relative",
               overflow: "hidden",
            }}
         >
            {/* Animated background pulse */}
            <motion.div
               animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.1, 0.3],
               }}
               transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
               }}
               style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background:
                     "radial-gradient(circle, rgba(0,102,204,0.3) 0%, transparent 70%)",
               }}
            />

            {/* Content */}
            <Box sx={{ position: "relative", zIndex: 1 }}>
               <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                     duration: 2,
                     repeat: Infinity,
                     ease: "linear",
                  }}
                  style={{
                     display: "inline-block",
                     marginBottom: 16,
                  }}
               >
                  <CloudUploadIcon
                     sx={{
                        fontSize: 48,
                        color: "primary.main",
                     }}
                  />
               </motion.div>

               <Typography variant="h6" gutterBottom fontWeight="bold">
                  {fileName}
               </Typography>

               <Box sx={{ position: "relative", mt: 2 }}>
                  <LinearProgress
                     variant="determinate"
                     value={progress}
                     sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: "rgba(255,255,255,0.3)",
                        "& .MuiLinearProgress-bar": {
                           borderRadius: 6,
                           background:
                              "linear-gradient(90deg, #0066cc 0%, #0099ff 100%)",
                        },
                     }}
                  />
                  <motion.div
                     animate={{
                        opacity: [0.5, 1, 0.5],
                     }}
                     transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                     }}
                  >
                     <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{
                           position: "absolute",
                           top: -60,
                           right: 0,
                           color: "primary.main",
                        }}
                     >
                        {Math.round(progress)}%
                     </Typography>
                  </motion.div>
               </Box>

               <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
               >
                  Please wait while we upload your awesome project...
               </Typography>
            </Box>
         </Box>
      </motion.div>
   );
};

export default UploadProgress;
