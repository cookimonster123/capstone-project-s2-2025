import React, { useEffect, useMemo, useState } from "react";
import type { Project } from "../types/project";
import {
   Box,
   Chip,
   Container,
   IconButton,
   Stack,
   Typography,
   useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CommentSection from "../components/Profile/Comment";
import Info from "../components/Profile/Info";
import ProjectMeta from "../components/Profile/ProjectMeta";
import {
   fetchProjectById,
   likeProject,
   ApiError as LikeApiError,
} from "../api/projectApi";
import { projectCache } from "../state/projectCache";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
   addProjectToFavorites,
   removeProjectFromFavorites,
   fetchFavoriteProjectIds,
   ApiError as FavoritesApiError,
   fetchUserById,
} from "../api/userApi";
import LikeFavorite from "../components/Profile/LikeFavorite";

interface ProjectProfileProps {
   project: Project;
   onBack: () => void;
}

const ProjectProfileView: React.FC<ProjectProfileProps> = ({
   project,
   onBack,
}) => {
   const theme = useTheme();
   // Respect user motion preference and avoid heavy animations when reduced
   const [reducedMotion, setReducedMotion] = useState(false);
   useEffect(() => {
      try {
         const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
         const update = () => setReducedMotion(!!mq.matches);
         update();
         mq.addEventListener("change", update);
         return () => mq.removeEventListener("change", update);
      } catch {
         // noop (SSR or older browsers)
      }
   }, []);
   const [isLiked, setIsLiked] = useState(false);
   const [likeCount, setLikeCount] = useState<number>(project.likeCounts ?? 0);
   const [liking, setLiking] = useState(false);
   const [isFavorited, setIsFavorited] = useState(false);
   const navigate = useNavigate();
   const { user } = useAuth();

   // Load initial favorite state for logged-in user
   useEffect(() => {
      let active = true;
      const ensureFavorite = async () => {
         if (!user?.id) {
            setIsFavorited(false);
            return;
         }
         try {
            const ids = await fetchFavoriteProjectIds(user.id);
            if (active) setIsFavorited(ids.includes(project._id));
         } catch (e) {
            // ignore; clicking will redirect on 401
         }
      };
      ensureFavorite();
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

   // Load initial like state for logged-in user
   useEffect(() => {
      let active = true;
      const loadLikeState = async () => {
         // If server someday returns userLiked, prefer that
         // Otherwise, derive from user's likedProjects list
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
      // run
      loadLikeState();
      return () => {
         active = false;
      };
   }, [user?.id, project._id]);

   // Precompute decoration configs once per mount to avoid recreating styles
   const orbConfigs = useMemo(() => {
      if (reducedMotion) return [] as Array<any>;
      const count = 3; // reduced from 5
      return Array.from({ length: count }).map(() => {
         const size = 100 + Math.round(Math.random() * 200);
         const dx1 = -100 + Math.round(Math.random() * 200);
         const dy1 = -100 + Math.round(Math.random() * 200);
         const s1 = 1 + Math.random() * 0.6; // 1-1.6
         const dx2 = -150 + Math.round(Math.random() * 300);
         const dy2 = -80 + Math.round(Math.random() * 160);
         const s2 = 0.7 + Math.random() * 0.6; // 0.7-1.3
         const left = Math.round(Math.random() * 100);
         const top = Math.round(Math.random() * 100);
         const opacity = 0.12 + Math.random() * 0.12;
         const dur = 28 + Math.round(Math.random() * 24); // 28-52s
         const delay = Math.round(Math.random() * 10);
         return {
            size,
            dx1,
            dy1,
            s1,
            dx2,
            dy2,
            s2,
            left,
            top,
            opacity,
            dur,
            delay,
         };
      });
   }, [reducedMotion]);

   const particleConfigs = useMemo(() => {
      if (reducedMotion) return [] as Array<any>;
      const count = 14; // reduced from 20
      return Array.from({ length: count }).map(() => {
         const size = 3 + Math.round(Math.random() * 6);
         const left = Math.round(Math.random() * 100);
         const top = Math.round(Math.random() * 100);
         const opacity = +(0.2 + Math.random() * 0.3).toFixed(2);
         const boxGlow = 10 + Math.round(Math.random() * 20);
         const dx1 = -20 + Math.round(Math.random() * 40);
         const dy1 = -40 - Math.round(Math.random() * 30);
         const dx2 = -30 + Math.round(Math.random() * 60);
         const dy2 = -60 - Math.round(Math.random() * 40);
         const dx3 = -20 + Math.round(Math.random() * 40);
         const dy3 = -30 - Math.round(Math.random() * 30);
         const dur = 10 + Math.round(Math.random() * 20);
         const delay = Math.round(Math.random() * 5);
         const colorIndex = Math.floor(Math.random() * 3);
         return {
            size,
            left,
            top,
            opacity,
            boxGlow,
            dx1,
            dy1,
            dx2,
            dy2,
            dx3,
            dy3,
            dur,
            delay,
            colorIndex,
         };
      });
   }, [reducedMotion]);

   const streakConfigs = useMemo(() => {
      if (reducedMotion) return [] as Array<any>;
      const count = 2; // reduced from 3
      return Array.from({ length: count }).map((_, i) => {
         const h = 100 + Math.round(Math.random() * 200);
         const left = 20 + i * 35 + Math.round(Math.random() * 8);
         const dur = 3 + Math.round(Math.random() * 2);
         const delay = i * 2 + Math.round(Math.random() * 3);
         return { h, left, dur, delay };
      });
   }, [reducedMotion]);

   const containerSx = useMemo(
      () => ({
         minHeight: "100vh",
         bgcolor: (theme: any) =>
            theme.palette.mode === "dark" ? "#0a0e17" : "#fbfbfd",
         position: "relative",
         overflow: "hidden",
         // Define reusable keyframes ONCE to prevent re-injection
         "@keyframes pulse": {
            "0%, 100%": { opacity: 1, transform: "scale(1)" },
            "50%": { opacity: 0.8, transform: "scale(1.05)" },
         },
         "@keyframes gridMove": {
            "0%": { transform: "translate(0, 0)" },
            "100%": { transform: "translate(60px, 60px)" },
         },
         // New global keyframes using CSS variables per element
         "@keyframes orbitKF": {
            "0%, 100%": { transform: "translate(0, 0) scale(1)" },
            "33%": {
               transform:
                  "translate(var(--o1x, 40px), var(--o1y, -30px)) scale(var(--o1s, 1.2))",
            },
            "66%": {
               transform:
                  "translate(var(--o2x, -60px), var(--o2y, 40px)) scale(var(--o2s, 0.9))",
            },
         },
         "@keyframes float3dKF": {
            "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
            "25%": {
               transform:
                  "translate3d(var(--p1x, -10px), var(--p1y, -30px), 0) rotate(90deg)",
            },
            "50%": {
               transform:
                  "translate3d(var(--p2x, -15px), var(--p2y, -50px), 0) rotate(180deg)",
            },
            "75%": {
               transform:
                  "translate3d(var(--p3x, -10px), var(--p3y, -28px), 0) rotate(270deg)",
            },
         },
         "@keyframes streakKF": {
            "0%": { transform: "translateY(0) scaleY(0)", opacity: 0 },
            "10%": { opacity: 1 },
            "90%": { opacity: 0.5 },
            "100%": { transform: "translateY(120vh) scaleY(1)", opacity: 0 },
         },
         // Animated pulsing gradient background
         "&::before": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: (theme: any) =>
               theme.palette.mode === "dark"
                  ? `
                           radial-gradient(circle 900px at 20% 15%, rgba(0, 153, 255, 0.10), transparent),
                           radial-gradient(circle 700px at 80% 85%, rgba(14, 165, 233, 0.08), transparent),
                           radial-gradient(circle 500px at 50% 50%, rgba(0, 153, 255, 0.05), transparent)
                        `
                  : `
                           radial-gradient(circle 900px at 20% 15%, rgba(0, 102, 204, 0.12), transparent),
                           radial-gradient(circle 700px at 80% 85%, rgba(14, 165, 233, 0.1), transparent),
                           radial-gradient(circle 500px at 50% 50%, rgba(0, 102, 204, 0.05), transparent)
                        `,
            animation: reducedMotion ? "none" : "pulse 8s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 0,
         },
         // Animated grid pattern
         "&::after": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: (theme: any) =>
               theme.palette.mode === "dark"
                  ? `
                           linear-gradient(rgba(0, 153, 255, 0.04) 2px, transparent 2px),
                           linear-gradient(90deg, rgba(0, 153, 255, 0.04) 2px, transparent 2px)
                        `
                  : `
                           linear-gradient(rgba(0, 102, 204, 0.03) 2px, transparent 2px),
                           linear-gradient(90deg, rgba(0, 102, 204, 0.03) 2px, transparent 2px)
                        `,
            backgroundSize: "60px 60px",
            opacity: 0.6,
            pointerEvents: "none",
            zIndex: 0,
            animation: reducedMotion ? "none" : "gridMove 20s linear infinite",
         },
      }),
      [reducedMotion, theme.palette.mode],
   );

   // Derive category name once for chips
   const categoryName = project.category?.name ?? "Uncategorized";

   // Like toggle handler (unchanged semantics)
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

   return (
      <Box sx={containerSx}>
         {/* Glowing orbs (stable styles) */}
         {orbConfigs.map((c, i) => (
            <Box
               key={`orb-${i}`}
               sx={
                  {
                     position: "fixed",
                     width: `${c.size}px`,
                     height: `${c.size}px`,
                     borderRadius: "50%",
                     background: `radial-gradient(circle, rgba(0, 102, 204, ${c.opacity}), transparent)`,
                     filter: "blur(40px)",
                     left: `${c.left}%`,
                     top: `${c.top}%`,
                     pointerEvents: "none",
                     zIndex: 0,
                     animation: reducedMotion
                        ? "none"
                        : `orbitKF ${c.dur}s ease-in-out infinite`,
                     animationDelay: `${c.delay}s`,
                     "--o1x": `${c.dx1}px`,
                     "--o1y": `${c.dy1}px`,
                     "--o1s": `${c.s1}`,
                     "--o2x": `${c.dx2}px`,
                     "--o2y": `${c.dy2}px`,
                     "--o2s": `${c.s2}`,
                  } as any
               }
            />
         ))}
         {/* Floating particles with rotation (stable styles) */}
         {particleConfigs.map((p, i) => (
            <Box
               key={`particle-${i}`}
               sx={
                  {
                     position: "fixed",
                     width: `${p.size}px`,
                     height: `${p.size}px`,
                     bgcolor:
                        p.colorIndex === 0
                           ? "#06c"
                           : p.colorIndex === 1
                             ? "#0ea5e9"
                             : "#38bdf8",
                     opacity: p.opacity,
                     borderRadius: "50%",
                     left: `${p.left}%`,
                     top: `${p.top}%`,
                     pointerEvents: "none",
                     zIndex: 0,
                     boxShadow: `0 0 ${p.boxGlow}px currentColor`,
                     animation: reducedMotion
                        ? "none"
                        : `float3dKF ${p.dur}s ease-in-out infinite`,
                     animationDelay: `${p.delay}s`,
                     "--p1x": `${p.dx1}px`,
                     "--p1y": `${p.dy1}px`,
                     "--p2x": `${p.dx2}px`,
                     "--p2y": `${p.dy2}px`,
                     "--p3x": `${p.dx3}px`,
                     "--p3y": `${p.dy3}px`,
                  } as any
               }
            />
         ))}
         {/* Light streaks (stable styles) */}
         {streakConfigs.map((s, i) => (
            <Box
               key={`streak-${i}`}
               sx={{
                  position: "fixed",
                  width: "2px",
                  height: `${s.h}px`,
                  background:
                     "linear-gradient(180deg, transparent, rgba(0, 102, 204, 0.4), transparent)",
                  left: `${s.left}%`,
                  top: "-200px",
                  pointerEvents: "none",
                  zIndex: 0,
                  animation: reducedMotion
                     ? "none"
                     : `streakKF ${s.dur}s ease-in infinite`,
                  animationDelay: `${s.delay}s`,
               }}
            />
         ))}

         <Container
            maxWidth={false}
            disableGutters
            sx={{
               py: 6,
               px: { xs: 2, sm: 3, md: 4 },
               textAlign: "left",
               overflowX: "hidden",
               position: "relative",
               zIndex: 1,
            }}
         >
            <Box sx={{ maxWidth: 1680, mx: "auto" }}>
               {/* Title Row with Back */}
               <Box
                  sx={{
                     mb: 3,
                     display: "flex",
                     alignItems: "center",
                     gap: 1.5,
                     position: "relative",
                  }}
               >
                  <IconButton
                     aria-label="Back"
                     onClick={onBack}
                     size="medium"
                     sx={{
                        bgcolor: (theme) =>
                           theme.palette.mode === "dark"
                              ? "#1a1f2e"
                              : "#ffffff",
                        border: (theme) =>
                           theme.palette.mode === "dark"
                              ? "1px solid #2d3548"
                              : "1px solid #e5e5e7",
                        boxShadow: (theme) =>
                           theme.palette.mode === "dark"
                              ? "0 2px 8px rgba(0,0,0,0.3)"
                              : "0 2px 8px rgba(0,0,0,0.06)",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        // Shine effect
                        "&::before": {
                           content: '""',
                           position: "absolute",
                           top: 0,
                           left: "-100%",
                           width: "100%",
                           height: "100%",
                           background: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
                                 : "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
                           transition: "left 0.5s",
                        },
                        "&:hover": {
                           bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "#232936"
                                 : "#fafafa",
                           transform: "translateX(-6px) scale(1.05)",
                           boxShadow: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "0 8px 20px rgba(0, 153, 255, 0.25)"
                                 : "0 8px 20px rgba(0, 102, 204, 0.15)",
                           borderColor: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "#0099ff"
                                 : "#06c",
                        },
                        "&:hover::before": {
                           left: "100%",
                        },
                        "&:active": {
                           transform: "translateX(-4px) scale(0.98)",
                        },
                     }}
                  >
                     <ArrowBackIcon
                        sx={{
                           color: "#1d1d1f",
                           transition: "all 0.3s",
                           ".MuiIconButton-root:hover &": {
                              color: "#06c",
                           },
                        }}
                     />
                  </IconButton>
                  <Typography
                     variant="h4"
                     component="h1"
                     sx={{
                        ml: 0.5,
                        fontWeight: 700,
                        fontSize: { xs: 28, sm: 36, md: 42 },
                        color: "#1d1d1f",
                        letterSpacing: "-0.02em",
                        background:
                           "linear-gradient(135deg, #1d1d1f 0%, #06c 50%, #0ea5e9 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        backgroundSize: "200% 100%",
                        animation: "gradientShift 3s ease infinite",
                        position: "relative",
                        // Text shadow layer
                        "&::after": {
                           content: "attr(data-text)",
                           position: "absolute",
                           left: 0,
                           top: 0,
                           zIndex: -1,
                           background:
                              "linear-gradient(135deg, #1d1d1f 0%, #06c 100%)",
                           WebkitBackgroundClip: "text",
                           WebkitTextFillColor: "transparent",
                           backgroundClip: "text",
                           filter: "blur(8px)",
                           opacity: 0.3,
                        },
                        "@keyframes gradientShift": {
                           "0%, 100%": { backgroundPosition: "0% 50%" },
                           "50%": { backgroundPosition: "100% 50%" },
                        },
                     }}
                  >
                     {project.name}
                  </Typography>
               </Box>

               {/* Tag Chips (Category / Semester / Year) */}
               <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mb: 3 }}
               >
                  <Chip
                     label={categoryName}
                     size="medium"
                     sx={{
                        bgcolor: "#ffffff",
                        border: "1px solid #e5e5e7",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#06c",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        // Shimmer effect
                        "&::before": {
                           content: '""',
                           position: "absolute",
                           top: 0,
                           left: "-100%",
                           width: "100%",
                           height: "100%",
                           background:
                              "linear-gradient(90deg, transparent, rgba(0, 102, 204, 0.2), transparent)",
                           animation: "shimmer 2s infinite",
                        },
                        "@keyframes shimmer": {
                           "0%": { left: "-100%" },
                           "100%": { left: "100%" },
                        },
                        "&:hover": {
                           bgcolor: "#f5f5f7",
                           transform: "translateY(-4px) scale(1.05)",
                           boxShadow:
                              "0 8px 16px rgba(0, 102, 204, 0.2), 0 0 0 4px rgba(0, 102, 204, 0.05)",
                           borderColor: "#06c",
                        },
                        "&:active": {
                           transform: "translateY(-2px) scale(1.02)",
                        },
                     }}
                  />
                  {project.semester?.semester && (
                     <Chip
                        label={project.semester.semester}
                        size="medium"
                        sx={{
                           bgcolor: "#ffffff",
                           border: "1px solid #e5e5e7",
                           fontWeight: 500,
                           fontSize: 14,
                           color: "#6e6e73",
                           position: "relative",
                           overflow: "hidden",
                           transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                           "&::after": {
                              content: '""',
                              position: "absolute",
                              bottom: 0,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 0,
                              height: "2px",
                              bgcolor: "#06c",
                              transition: "width 0.3s",
                           },
                           "&:hover": {
                              bgcolor: "#f5f5f7",
                              transform:
                                 "translateY(-4px) scale(1.05) rotate(2deg)",
                              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                              color: "#06c",
                           },
                           "&:hover::after": {
                              width: "80%",
                           },
                        }}
                     />
                  )}
                  {project.semester?.year && (
                     <Chip
                        label={String(project.semester.year)}
                        size="medium"
                        sx={{
                           bgcolor: "#ffffff",
                           border: "1px solid #e5e5e7",
                           fontWeight: 500,
                           fontSize: 14,
                           color: "#6e6e73",
                           position: "relative",
                           overflow: "hidden",
                           transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                           "&::after": {
                              content: '""',
                              position: "absolute",
                              bottom: 0,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 0,
                              height: "2px",
                              bgcolor: "#06c",
                              transition: "width 0.3s",
                           },
                           "&:hover": {
                              bgcolor: "#f5f5f7",
                              transform:
                                 "translateY(-4px) scale(1.05) rotate(-2deg)",
                              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                              color: "#06c",
                           },
                           "&:hover::after": {
                              width: "80%",
                           },
                        }}
                     />
                  )}
                  {!!project.tags?.length && (
                     <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        sx={{ mb: 2, rowGap: 0.5 }}
                     >
                        {project.tags.map((t, idx) => (
                           <Chip
                              key={t._id ?? t.name}
                              label={t.name}
                              size="medium"
                              variant="outlined"
                              clickable
                              onClick={() =>
                                 navigate(
                                    `/projects?tag=${encodeURIComponent(t.name)}`,
                                 )
                              }
                              sx={{
                                 borderColor: "#d2d2d7",
                                 color: "#6e6e73",
                                 fontWeight: 500,
                                 fontSize: 13,
                                 position: "relative",
                                 overflow: "hidden",
                                 transition:
                                    "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                 animationDelay: `${idx * 0.1}s`,
                                 // Magnetic glow effect
                                 "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    inset: "-2px",
                                    background:
                                       "linear-gradient(45deg, #06c, #0ea5e9, #06c)",
                                    backgroundSize: "200% 200%",
                                    borderRadius: "inherit",
                                    opacity: 0,
                                    transition: "opacity 0.3s",
                                    animation: "rotate 4s linear infinite",
                                    zIndex: -1,
                                 },
                                 "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    inset: 0,
                                    background: "#fbfbfd",
                                    borderRadius: "inherit",
                                    zIndex: -1,
                                 },
                                 "@keyframes rotate": {
                                    "0%": { backgroundPosition: "0% 50%" },
                                    "50%": { backgroundPosition: "100% 50%" },
                                    "100%": { backgroundPosition: "0% 50%" },
                                 },
                                 "&:hover": {
                                    borderColor: "transparent",
                                    color: "#06c",
                                    bgcolor: "rgba(0, 102, 204, 0.06)",
                                    transform: "translateY(-4px) scale(1.08)",
                                    boxShadow:
                                       "0 8px 16px rgba(0, 102, 204, 0.2)",
                                 },
                                 "&:hover::before": {
                                    opacity: 1,
                                 },
                                 "&:active": {
                                    transform: "translateY(-2px) scale(1.04)",
                                 },
                              }}
                           />
                        ))}
                     </Stack>
                  )}
               </Stack>

               <Box
                  sx={{
                     display: "grid",
                     gridTemplateColumns: {
                        xs: "1fr",
                        md: "minmax(0, 1fr) 400px",
                     },
                     gap: { xs: 2.5, sm: 3.5, md: 5 },
                     alignItems: "start",
                  }}
               >
                  {/* Main */}
                  <Box sx={{ minWidth: 0 }}>
                     <Stack spacing={3}>
                        <LikeFavorite
                           isLiked={isLiked}
                           likeCount={likeCount}
                           liking={liking}
                           isFavorited={isFavorited}
                           onToggleLike={handleToggleLike}
                           onToggleFavorite={handleToggleFavorite}
                        />

                        <Info project={project} />

                        {/* Comments */}
                        <CommentSection projectId={project._id} />
                     </Stack>
                  </Box>

                  {/* Sidebar */}
                  <ProjectMeta project={project} />
               </Box>
            </Box>
         </Container>
      </Box>
   );
};

const ProjectProfilePage: React.FC = () => {
   const [error, setError] = useState<string | null>(null);
   const navigate = useNavigate();
   const params = useParams();
   const id = params.id ?? null;
   // Ensure page always starts at top when entering/changing project
   useEffect(() => {
      try {
         window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
         // fallback
         window.scrollTo(0, 0);
      }
   }, [id]);
   const cached = useMemo(
      () => (id ? (projectCache.get(id) ?? null) : null),
      [id],
   );
   const [project, setProject] = useState<Project | null>(cached);
   const [loading, setLoading] = useState(!cached);

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
      <ProjectProfileView
         project={project}
         onBack={() => navigate("/projects")}
      />
   );
};

export { ProjectProfileView };
export default ProjectProfilePage;
