import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Typography, Stack } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface FileUploadZoneProps {
   onFilesSelected: (files: File[]) => void;
   maxFiles?: number;
   acceptedTypes?: string;
}

/**
 * Epic drag-and-drop file upload zone with stunning animations
 * Features: Hover effects, file preview, smooth transitions
 */
const FileUploadZone: React.FC<FileUploadZoneProps> = ({
   onFilesSelected,
   maxFiles = 10,
   acceptedTypes = "image/*",
}) => {
   const [previews, setPreviews] = useState<string[]>([]);

   const onDrop = useCallback(
      (acceptedFiles: File[]) => {
         onFilesSelected(acceptedFiles);

         // Generate previews
         const newPreviews = acceptedFiles.map((file) =>
            URL.createObjectURL(file),
         );
         setPreviews((prev) => [...prev, ...newPreviews]);
      },
      [onFilesSelected],
   );

   const { getRootProps, getInputProps, isDragActive, isDragReject } =
      useDropzone({
         onDrop,
         accept: { [acceptedTypes]: [] },
         maxFiles,
      });

   return (
      <Box>
         <div {...getRootProps()}>
            <input {...getInputProps()} />
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5 }}
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
            >
               <Box
                  sx={{
                     border: "3px dashed",
                     borderColor: isDragReject
                        ? "error.main"
                        : isDragActive
                          ? "primary.main"
                          : "grey.300",
                     borderRadius: 3,
                     p: 6,
                     textAlign: "center",
                     cursor: "pointer",
                     transition: "all 0.3s ease",
                     background: isDragActive
                        ? "linear-gradient(135deg, rgba(0,102,204,0.1) 0%, rgba(0,153,255,0.1) 100%)"
                        : "rgba(249,250,251,0.8)",
                     backdropFilter: "blur(10px)",
                     position: "relative",
                     overflow: "hidden",
                     "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background:
                           "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                        transition: "left 0.5s ease",
                     },
                     "&:hover::before": {
                        left: "100%",
                     },
                  }}
               >
                  <motion.div
                     animate={
                        isDragActive
                           ? {
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0],
                             }
                           : {}
                     }
                     transition={{ duration: 0.5 }}
                  >
                     <CloudUploadIcon
                        sx={{
                           fontSize: 80,
                           color: isDragActive ? "primary.main" : "grey.400",
                           mb: 2,
                        }}
                     />
                  </motion.div>

                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                     {isDragActive
                        ? "Drop your files here!"
                        : "Drag & Drop your images"}
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                     or click to browse
                  </Typography>

                  <Typography
                     variant="caption"
                     color="text.secondary"
                     display="block"
                     mt={2}
                  >
                     Supports: JPG, PNG, GIF (Max {maxFiles} files)
                  </Typography>
               </Box>
            </motion.div>
         </div>

         {/* File Previews */}
         <AnimatePresence>
            {previews.length > 0 && (
               <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
               >
                  <Stack
                     direction="row"
                     spacing={2}
                     mt={3}
                     flexWrap="wrap"
                     gap={2}
                  >
                     {previews.map((preview, index) => (
                        <motion.div
                           key={preview}
                           initial={{ opacity: 0, scale: 0 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: index * 0.1 }}
                           whileHover={{ scale: 1.1 }}
                        >
                           <Box
                              sx={{
                                 width: 120,
                                 height: 120,
                                 borderRadius: 2,
                                 overflow: "hidden",
                                 position: "relative",
                                 boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                 border: "2px solid",
                                 borderColor: "primary.main",
                              }}
                           >
                              <img
                                 src={preview}
                                 alt={`Preview ${index + 1}`}
                                 style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                 }}
                              />
                              <Box
                                 sx={{
                                    position: "absolute",
                                    top: 5,
                                    right: 5,
                                    bgcolor: "success.main",
                                    borderRadius: "50%",
                                    p: 0.5,
                                 }}
                              >
                                 <CheckCircleIcon
                                    sx={{
                                       color: "white",
                                       fontSize: 20,
                                    }}
                                 />
                              </Box>
                           </Box>
                        </motion.div>
                     ))}
                  </Stack>
               </motion.div>
            )}
         </AnimatePresence>
      </Box>
   );
};

export default FileUploadZone;
