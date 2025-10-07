import React, { useState, useMemo, useEffect } from "react";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { Project } from "../../types/project";

/**
 * VideoArea fallback component for demo video display.
 * Shows a placeholder if no video URL is provided.
 */
interface VideoAreaProps {
   videoUrl?: string;
}

const VideoArea: React.FC<VideoAreaProps> = ({ videoUrl }) => {
   if (!videoUrl || typeof videoUrl !== "string" || videoUrl.trim() === "") {
      return (
         <Stack alignItems="center" spacing={1}>
            <PlayArrowIcon sx={{ fontSize: 64, color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary">
               No demo video available
            </Typography>
         </Stack>
      );
   }

   // Basic video embed (supports YouTube, Vimeo, direct MP4 links)
   // For YouTube/Vimeo, use iframe; for direct links, use <video>
   const isYouTube =
      videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
   const isVideoFile = /\.(mp4|webm|ogg|m3u8|mpd)(\?.*)?$/i.test(videoUrl);

   if (isYouTube) {
      // Extract video ID for embedding
      let videoId = "";
      const ytMatch = videoUrl.match(
         /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
      );
      if (ytMatch) videoId = ytMatch[1];
      return (
         <iframe
            title="Demo Video"
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: 8 }}
         />
      );
   }

   if (isVideoFile) {
      // get extension to set a reasonable mime type
      const extMatch = videoUrl.match(/\.(mp4|webm|ogg|m3u8|mpd)(\?.*)?$/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : null;
      const mimeMap: Record<string, string> = {
         mp4: "video/mp4",
         webm: "video/webm",
         ogg: "video/ogg",
         m3u8: "application/vnd.apple.mpegurl",
         mpd: "application/dash+xml",
      };
      const mime = (ext && mimeMap[ext]) || "video/mp4";
      // Note: HLS (.m3u8) plays natively on Safari; other browsers may need HLS.js.
      return (
         <video
            controls
            playsInline
            preload="metadata"
            style={{ width: "100%", height: "100%", borderRadius: 8 }}
            crossOrigin="anonymous"
            aria-label="Demo video"
         >
            <source src={videoUrl} type={mime} />
            {/* Fallback content if <video> isn't supported */}
            <div style={{ padding: 12, textAlign: "center" }}>
               Your browser does not support embedded video.
               <br />
               <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  Open video in new tab
               </a>
            </div>
         </video>
      );
   }

   // Fallback: open link in new tab
   return (
      <Stack alignItems="center" spacing={1}>
         <IconButton
            aria-label="Open demo video"
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
         >
            <OpenInNewIcon />
         </IconButton>
         <Typography variant="body2" color="text.secondary">
            Open demo video in new tab
         </Typography>
      </Stack>
   );
};

interface InfoProps {
   project: Project;
}

const Info: React.FC<InfoProps> = ({ project }) => {
   const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
   // Use backend images if provided; otherwise fall back to a single grey slide
   const imageSlides = useMemo(() => {
      const arr = Array.isArray(project.imageUrl)
         ? project.imageUrl.filter(
              (u): u is string => typeof u === "string" && u.trim().length > 0,
           )
         : [];
      return arr;
   }, [project.imageUrl]);
   const [brokenSlides, setBrokenSlides] = useState<Set<number>>(new Set());
   const totalSlides = imageSlides.length > 0 ? imageSlides.length : 1;
   const videoUrl = project.links.find((l) => l.type === "videoDemoUrl")?.value;
   useEffect(() => {
      if (currentSlideIndex >= totalSlides) setCurrentSlideIndex(0);
      // reset broken markers if slides change size
      setBrokenSlides(new Set());
   }, [totalSlides, currentSlideIndex]);

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
                  bgcolor:
                     imageSlides.length === 0 ||
                     brokenSlides.has(currentSlideIndex)
                        ? "grey.100"
                        : "transparent",
                  overflow: "hidden",
                  aspectRatio: "16 / 9",
                  width: { xs: "100%", md: "92%", lg: "88%" },
                  mr: "auto",
               }}
            >
               {imageSlides.length > 0 &&
               !brokenSlides.has(currentSlideIndex) ? (
                  <Box sx={{ position: "absolute", inset: 0 }}>
                     <img
                        src={imageSlides[currentSlideIndex]}
                        alt={`Project image ${currentSlideIndex + 1}`}
                        style={{
                           width: "100%",
                           height: "100%",
                           objectFit: "cover",
                           display: "block",
                        }}
                        onError={() =>
                           setBrokenSlides((prev) => {
                              const next = new Set(prev);
                              next.add(currentSlideIndex);
                              return next;
                           })
                        }
                     />
                  </Box>
               ) : (
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
                           Demo Slide
                        </Typography>
                     </Stack>
                  </Box>
               )}

               {/* Navigation */}
               <IconButton
                  aria-label="Previous"
                  onClick={() =>
                     setCurrentSlideIndex((prev) =>
                        totalSlides > 1
                           ? prev > 0
                              ? prev - 1
                              : totalSlides - 1
                           : 0,
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
                        totalSlides > 1
                           ? prev < totalSlides - 1
                              ? prev + 1
                              : 0
                           : 0,
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
                  {Array.from({ length: totalSlides }).map((_, i) => (
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
               <VideoArea videoUrl={videoUrl ?? undefined} />
            </Box>
         </Box>
      </>
   );
};

export default Info;
