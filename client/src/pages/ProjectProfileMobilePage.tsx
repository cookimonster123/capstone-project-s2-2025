import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Project } from "../types/project";
import {
   Box,
   Container,
   IconButton,
   Stack,
   Typography,
   Button,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CommentSection from "../components/Profile/Comment";
import ProjectMeta from "../components/Profile/ProjectMeta";
import LikeFavorite from "../components/Profile/LikeFavorite";
import { useAuth } from "../context/AuthContext";
import {
   fetchProjectById,
   likeProject,
   ApiError as LikeApiError,
} from "../api/projectApi";
import {
   addProjectToFavorites,
   removeProjectFromFavorites,
   fetchFavoriteProjectIds,
   ApiError as FavoritesApiError,
   fetchUserById,
} from "../api/userApi";
import { projectCache } from "../state/projectCache";

const ProjectProfileMobileView: React.FC<{
   project: Project;
   onBack: () => void;
}> = ({ project, onBack }) => {
   const navigate = useNavigate();
   const { user } = useAuth();
   const [open, setOpen] = useState<null | "overview" | "meta">(null);
   // Resolve video URL from links
   const videoUrl = useMemo(() => {
      const raw = project.links.find((l) => l.type === "videoDemoUrl")?.value;
      return (typeof raw === "string" ? raw.trim() : "") || "";
   }, [project.links]);
   // Images state for top carousel
   const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
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
   useEffect(() => {
      if (currentSlideIndex >= totalSlides) setCurrentSlideIndex(0);
      setBrokenSlides(new Set());
   }, [totalSlides, currentSlideIndex]);

   const [isLiked, setIsLiked] = useState(false);
   const [likeCount, setLikeCount] = useState<number>(project.likeCounts ?? 0);
   const [liking, setLiking] = useState(false);
   const [isFavorited, setIsFavorited] = useState(false);

   // Initial favorite state
   useEffect(() => {
      let active = true;
      const run = async () => {
         if (!user?.id) {
            setIsFavorited(false);
            return;
         }
         try {
            const ids = await fetchFavoriteProjectIds(user.id);
            if (active) setIsFavorited(ids.includes(project._id));
         } catch {
            // ignore
         }
      };
      run();
      return () => {
         active = false;
      };
   }, [user?.id, project._id]);

   // Initial like state
   useEffect(() => {
      let active = true;
      const run = async () => {
         if (!user?.id) {
            setIsLiked(false);
            return;
         }
         try {
            const u = await fetchUserById(user.id);
            const liked = (u.user.likedProjects || []).map(String);
            if (active) setIsLiked(liked.includes(project._id));
         } catch {}
      };
      run();
      return () => {
         active = false;
      };
   }, [user?.id, project._id]);

   const handleToggleFavorite = async () => {
      if (!user?.id) {
         navigate("/sign-in");
         return;
      }
      try {
         if (isFavorited) {
            await removeProjectFromFavorites(user.id, project._id);
            setIsFavorited(false);
         } else {
            await addProjectToFavorites(user.id, project._id);
            setIsFavorited(true);
         }
      } catch (e) {
         if (e instanceof FavoritesApiError && e.status === 401) {
            navigate("/sign-in");
         }
      }
   };

   const handleToggleLike = async () => {
      if (liking) return;
      if (!user?.id) {
         navigate("/sign-in");
         return;
      }
      try {
         setLiking(true);
         const res = await likeProject(project._id);
         const nextLiked = Boolean(res.data.button);
         const nextCount =
            typeof res.data.likeCounts === "number"
               ? res.data.likeCounts
               : likeCount + (nextLiked ? 1 : -1);
         setIsLiked(nextLiked);
         setLikeCount(nextCount);
         try {
            window.dispatchEvent(
               new CustomEvent("project-like-changed", {
                  detail: {
                     projectId: project._id,
                     liked: nextLiked,
                     likeCounts: nextCount,
                  },
               }),
            );
         } catch {}
      } catch (e) {
         if (e instanceof LikeApiError && e.status === 401) {
            navigate("/sign-in");
            return;
         }
      } finally {
         setLiking(false);
      }
   };

   // Note: category chips removed in mobile popup flow

   return (
      <Container maxWidth={false} sx={{ px: 2, py: 3 }}>
         {/* Header */}
         <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 2 }}
         >
            <IconButton
               aria-label="Back"
               onClick={onBack}
               size="small"
               sx={{ border: "1px solid", borderColor: "divider" }}
            >
               <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
               {project.name}
            </Typography>
         </Stack>

         {/* Images carousel at top */}
         <Box sx={{ mb: 2 }}>
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
                  width: "100%",
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
                        p: 2,
                     }}
                  >
                     <Typography variant="body2" color="text.secondary">
                        No images
                     </Typography>
                  </Box>
               )}

               {/* Nav */}
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
            {/* Indicators */}
            <Box sx={{ mt: 1.5 }}>
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

         {/* Body: Like/Favorite, launch popups for Overview & Project Meta */}
         <Stack spacing={2.5} sx={{ mb: 3 }}>
            <LikeFavorite
               isLiked={isLiked}
               likeCount={likeCount}
               liking={liking}
               isFavorited={isFavorited}
               onToggleLike={handleToggleLike}
               onToggleFavorite={handleToggleFavorite}
            />

            <Stack direction="row" spacing={1.5}>
               <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setOpen("overview")}
               >
                  Overview
               </Button>
               <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setOpen("meta")}
               >
                  Project Meta
               </Button>
            </Stack>
         </Stack>

         {/* Modal dialog for Overview / Project Meta */}
         <Dialog
            open={open !== null}
            onClose={() => setOpen(null)}
            fullScreen
            aria-labelledby="project-section-dialog-title"
         >
            <DialogTitle id="project-section-dialog-title">
               {open === "overview"
                  ? "Overview"
                  : open === "meta"
                    ? "Project Meta"
                    : ""}
            </DialogTitle>
            <DialogContent dividers>
               {open === "overview" && (
                  <Typography
                     variant="body1"
                     color="text.secondary"
                     sx={{ lineHeight: 1.8 }}
                  >
                     {(project.description ?? "").trim() ||
                        "No overview provided."}
                  </Typography>
               )}
               {open === "meta" && <ProjectMeta project={project} />}
            </DialogContent>
            <DialogActions>
               <Button onClick={() => setOpen(null)} autoFocus>
                  Close
               </Button>
            </DialogActions>
         </Dialog>

         {/* Demo Video below Overview/Meta and above Comments */}
         {videoUrl && (
            <Box sx={{ mb: 3 }}>
               <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                  Demo Video
               </Typography>
               <Box
                  sx={{
                     aspectRatio: "16 / 9",
                     bgcolor: "grey.100",
                     borderRadius: 2,
                     overflow: "hidden",
                  }}
               >
                  <VideoEmbed videoUrl={videoUrl} />
               </Box>
            </Box>
         )}

         {/* Comments: explicitly at bottom on mobile */}
         <Box>
            <CommentSection projectId={project._id} />
         </Box>
      </Container>
   );
};

// Small helper for embedding YouTube/Video files
const VideoEmbed: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
   const isYouTube =
      videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
   const isVideoFile = /\.(mp4|webm|ogg|m3u8|mpd)(\?.*)?$/i.test(videoUrl);

   if (isYouTube) {
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
            style={{ display: "block" }}
         />
      );
   }

   if (isVideoFile) {
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
      return (
         <video
            controls
            playsInline
            preload="metadata"
            style={{ width: "100%", height: "100%", display: "block" }}
            crossOrigin="anonymous"
         >
            <source src={videoUrl} type={mime} />
         </video>
      );
   }

   // Fallback: link out
   return (
      <Box sx={{ p: 2, textAlign: "center" }}>
         <Typography variant="body2">
            View demo video:{" "}
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
               Open
            </a>
         </Typography>
      </Box>
   );
};

const ProjectProfileMobilePage: React.FC = () => {
   const navigate = useNavigate();
   const params = useParams();
   const id = params.id ?? null;

   // ensure scroll top on id change
   useEffect(() => {
      try {
         window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
         window.scrollTo(0, 0);
      }
   }, [id]);

   const cached = useMemo(
      () => (id ? (projectCache.get(id) ?? null) : null),
      [id],
   );
   const [project, setProject] = useState<Project | null>(cached);
   const [loading, setLoading] = useState(!cached);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      let active = true;
      const load = async () => {
         if (!id) {
            setError("No project id in URL");
            setLoading(false);
            return;
         }
         try {
            if (!cached) setLoading(true);
            const data = await fetchProjectById(id);
            if (active) {
               setProject(data);
               if (data) projectCache.set(id, data);
            }
         } catch (e) {
            if (active)
               setError(
                  e instanceof Error ? e.message : "Failed to load project",
               );
         } finally {
            if (active) setLoading(false);
         }
      };
      load();
      return () => {
         active = false;
      };
   }, [id]);

   if (loading) {
      return (
         <Container
            maxWidth="md"
            sx={{ py: 6, display: "flex", justifyContent: "center" }}
         >
            <Typography>Loading…</Typography>
         </Container>
      );
   }

   if (error) {
      return (
         <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography color="error">{error}</Typography>
         </Container>
      );
   }

   if (!project) {
      return (
         <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography color="text.secondary">Project not found.</Typography>
         </Container>
      );
   }

   return (
      <ProjectProfileMobileView
         project={project}
         onBack={() => navigate("/projects")}
      />
   );
};

export default ProjectProfileMobilePage;
