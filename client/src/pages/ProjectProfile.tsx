import React, { useEffect, useMemo, useState } from "react";
import type { Project } from "../types/project";
import {
   Box,
   Chip,
   Container,
   IconButton,
   Stack,
   Typography,
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
      loadLikeState();
      return () => {
         active = false;
      };
   }, [user?.id, project._id]);

   const handleToggleLike = async () => {
      if (liking) return;
      if (!user?.id) {
         navigate("/sign-in");
         return;
      }
      try {
         setLiking(true);
         const res = await likeProject(project._id);
         setIsLiked(res.data.button);
         if (typeof res.data.likeCounts === "number") {
            setLikeCount(res.data.likeCounts);
         } else {
            // Fallback adjust
            setLikeCount((c) => c + (res.data.button ? 1 : -1));
         }
      } catch (e) {
         if (e instanceof LikeApiError && e.status === 401) {
            navigate("/sign-in");
            return;
         }
      } finally {
         setLiking(false);
      }
   };

   const categoryName = project.category?.name ?? "Uncategorized";

   return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
         <Container
            maxWidth={false}
            disableGutters
            sx={{
               py: 6,
               px: { xs: 2, sm: 3, md: 4 },
               textAlign: "left",
               overflowX: "hidden",
            }}
         >
            <Box sx={{ maxWidth: 1680, mx: "auto" }}>
               {/* Title Row with Back */}
               <Box
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
               >
                  <IconButton aria-label="Back" onClick={onBack} size="small">
                     <ArrowBackIcon />
                  </IconButton>
                  <Typography variant="h4" component="h1" sx={{ ml: 0.5 }}>
                     {project.name}
                  </Typography>
               </Box>

               {/* Tag Chips (Category / Semester / Year) */}
               <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mb: 1 }}
               >
                  <Chip label={categoryName} size="small" />
                  {project.semester?.semester && (
                     <Chip label={project.semester.semester} size="small" />
                  )}
                  {project.semester?.year && (
                     <Chip label={String(project.semester.year)} size="small" />
                  )}
                  {!!project.tags?.length && (
                     <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        sx={{ mb: 2, rowGap: 0.5 }}
                     >
                        {project.tags.map((t) => (
                           <Chip
                              key={t._id ?? t.name}
                              label={t.name}
                              size="small"
                              variant="outlined"
                              clickable
                              onClick={() =>
                                 navigate(
                                    `/projects?tag=${encodeURIComponent(t.name)}`,
                                 )
                              }
                           />
                        ))}
                     </Stack>
                  )}
               </Stack>

               <Box
                  sx={{
                     display: "grid",
                     gridTemplateColumns: {
                        xs: "minmax(0, 1fr) 360px",
                        sm: "minmax(0, 1fr) 380px",
                        md: "minmax(0, 1fr) 400px",
                     },
                     gap: { xs: 3, sm: 4, md: 5 },
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
               projectCache.set(id, data);
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
