import React, { useState, useMemo } from "react";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { Project } from "../../types/project";

interface InfoProps {
   project: Project;
}

const Info: React.FC<InfoProps> = ({ project }) => {
   const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
   const presentationSlides = useMemo(
      () => ["Demo Slide 1", "Demo Slide 2", "Demo Slide 3", "Demo Slide 4"],
      [],
   );

   // Derived content from API; no default filler
   const descriptionText = (project.description ?? "").trim();
   return (
      <>
         {/* Demo Slides */}
         <Box>
            <Box
               sx={{
                  position: "relative",
                  borderRadius: 2,
                  bgcolor: "grey.100",
                  overflow: "hidden",
                  aspectRatio: "16 / 9",
                  width: { xs: "100%", md: "92%", lg: "88%" },
                  mr: "auto",
               }}
            >
               <Box
                  sx={{
                     position: "absolute",
                     inset: 0,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     textAlign: "center",
                     p: 2,
                  }}
               >
                  <Stack alignItems="center" spacing={1}>
                     <PlayArrowIcon
                        sx={{ fontSize: 64, color: "text.disabled" }}
                     />
                     <Typography variant="body2" color="text.secondary">
                        {presentationSlides[currentSlideIndex]}
                     </Typography>
                  </Stack>
               </Box>

               {/* Navigation */}
               <IconButton
                  aria-label="Previous"
                  onClick={() =>
                     setCurrentSlideIndex((prev) =>
                        prev > 0 ? prev - 1 : presentationSlides.length - 1,
                     )
                  }
                  sx={{
                     position: "absolute",
                     left: 8,
                     top: "50%",
                     transform: "translateY(-50%)",
                     bgcolor: "background.paper",
                     boxShadow: 2,
                     "&:hover": { bgcolor: "background.paper" },
                  }}
               >
                  <ChevronLeftIcon />
               </IconButton>
               <IconButton
                  aria-label="Next"
                  onClick={() =>
                     setCurrentSlideIndex((prev) =>
                        prev < presentationSlides.length - 1 ? prev + 1 : 0,
                     )
                  }
                  sx={{
                     position: "absolute",
                     right: 8,
                     top: "50%",
                     transform: "translateY(-50%)",
                     bgcolor: "background.paper",
                     boxShadow: 2,
                     "&:hover": { bgcolor: "background.paper" },
                  }}
               >
                  <ChevronRightIcon />
               </IconButton>
            </Box>

            {/* Indicators centered under the slide box */}
            <Box
               sx={{
                  width: { xs: "100%", md: "92%", lg: "88%" },
                  mr: "auto",
                  mt: 2,
               }}
            >
               <Stack direction="row" spacing={1} justifyContent="center">
                  {presentationSlides.map((_, i) => (
                     <Box
                        key={i}
                        onClick={() => setCurrentSlideIndex(i)}
                        sx={{
                           width: 8,
                           height: 8,
                           borderRadius: "50%",
                           bgcolor:
                              i === currentSlideIndex
                                 ? "text.primary"
                                 : "text.disabled",
                           cursor: "pointer",
                        }}
                     />
                  ))}
               </Stack>
            </Box>
         </Box>

         {/* Overview */}
         <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
               Overview
            </Typography>
            {descriptionText && (
               <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                     lineHeight: 1.9,
                     fontSize: { xs: "1.05rem", md: "1.1rem" },
                  }}
               >
                  {descriptionText}
               </Typography>
            )}
         </Box>

         {/* Demo Video */}
         <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
               Demo Video
            </Typography>
            <Box
               sx={{
                  aspectRatio: "16 / 9",
                  bgcolor: "grey.100",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: { xs: "100%", md: "92%", lg: "88%" },
                  mr: "auto",
               }}
            >
               <Stack alignItems="center" spacing={1}>
                  <OpenInNewIcon sx={{ color: "text.disabled" }} />
                  <Typography variant="body2" color="text.secondary">
                     Demo Video
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                     Would link to actual video
                  </Typography>
               </Stack>
            </Box>
         </Box>
      </>
   );
};

export default Info;
