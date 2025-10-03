import React, { useEffect, useState } from "react";
import {
   Avatar,
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Divider,
   Stack,
   Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import UploadIcon from "@mui/icons-material/Upload";

import type { Project } from "../types/project";
import { fetchProjectById, fetchProjects } from "../api/projectApi";
import ProjectCard from "../components/projects/ProjectCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUserById, fetchFavoriteProjectIds } from "../api/userApi.ts";

/**
 * StudentDashboard
 * - Overview of student's profile and their projects
 * - Supports Like and Favorite toggles
 */
const StudentDashboard: React.FC = () => {
   const { isLoggedIn, user } = useAuth();
   const navigate = useNavigate();

   const [activeTab, setActiveTab] = useState<"overview" | "favorites">(
      "overview",
   );

   const [myProjectId, setMyProjectId] = useState<string | null>(null);
   const [myProject, setMyProject] = useState<Project | null>(null);
   const [loading, setLoading] = useState<boolean>(!!myProjectId);
   const [error, setError] = useState<string | null>(null);

   // Projects feed for the Favorites tab (sample)
   const [allProjects, setAllProjects] = useState<Project[]>([]);
   const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([]);
   const [favLoading, setFavLoading] = useState<boolean>(false);
   const [favError, setFavError] = useState<string | null>(null);

   // Load my project for the logged-in user

   useEffect(() => {
      let active = true;
      const init = async () => {
         try {
            setLoading(true);
            const uid = user?.id;
            if (!uid) {
               // not logged in yet
               if (active) {
                  setMyProjectId(null);
                  setMyProject(null);
               }
               return;
            }

            const storageKey = `myProjectId:${uid}`;

            try {
               const u = await fetchUserById(uid);
               const pid = (u.user.project as string | null) || null;
               if (pid) {
                  try {
                     localStorage.setItem(storageKey, pid);
                  } catch {}
                  if (!active) return;
                  setMyProjectId(pid);
                  const p = await fetchProjectById(pid);
                  if (!active) return;
                  setMyProject(p);
                  return; // done
               }
            } catch (e) {}

            const cached = localStorage.getItem(storageKey);
            if (cached) {
               if (!active) return;
               setMyProjectId(cached);
               const p = await fetchProjectById(cached);
               if (!active) return;
               setMyProject(p);
               return;
            }

            // 3) No project
            if (active) {
               setMyProject(null);
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
      init();
      return () => {
         active = false;
      };
   }, [user?.id]);

   // Load projects once for the Favorites tab
   useEffect(() => {
      let active = true;
      const ensureProjects = async () => {
         try {
            const items = await fetchProjects();
            if (active) setAllProjects(items);
         } catch (e) {
            // Ignore list fetch errors for the Favorites sample view
         } finally {
            // no-op
         }
      };
      ensureProjects();
      return () => {
         active = false;
      };
   }, []);

   // Load favorites when switching to Favorites tab or user changes
   useEffect(() => {
      let cancelled = false;
      const loadFavorites = async () => {
         if (activeTab !== "favorites") return;
         if (!user?.id) {
            setFavoriteProjects([]);
            return;
         }
         try {
            setFavLoading(true);
            setFavError(null);
            const ids = await fetchFavoriteProjectIds(user.id);
            const projects = await Promise.all(
               ids.map(async (pid) => {
                  try {
                     return await fetchProjectById(pid);
                  } catch {
                     return null;
                  }
               }),
            );
            if (!cancelled) {
               setFavoriteProjects(projects.filter((p): p is Project => !!p));
            }
         } catch (e) {
            if (!cancelled)
               setFavError(
                  e instanceof Error ? e.message : "Failed to load favorites",
               );
         } finally {
            if (!cancelled) setFavLoading(false);
         }
      };
      loadFavorites();
      return () => {
         cancelled = true;
      };
   }, [activeTab, user?.id]);

   if (!isLoggedIn) {
      return (
         <Box sx={{ py: 8, textAlign: "center", width: "100%" }}>
            <Typography
               sx={{
                  typography: { xs: "h5", md: "h4" },
                  fontWeight: 700,
                  letterSpacing: "0.2px",
                  color: "text.primary",
               }}
               gutterBottom
            >
               Student Dashboard
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
               Sign in to manage your capstone project.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/login")}>
               Sign in
            </Button>
         </Box>
      );
   }

   return (
      <Box
         sx={{
            py: 1,
            width: "100%",
            display: "flex",
            justifyContent: "center",
         }}
      >
         <Box sx={{ width: "100%", maxWidth: 980, ml: 10 }}>
            <Typography
               component="h1"
               sx={{
                  typography: { xs: "h5", md: "h4" },
                  fontWeight: 700,
                  letterSpacing: "0.2px",
                  textAlign: "center",
                  mb: 1,
               }}
            >
               {user?.name
                  ? `${user.name} · Student Dashboard`
                  : "Student Dashboard"}
            </Typography>

            <Box
               sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "300px 600px" },
                  gap: { xs: 2, md: 4 },
                  alignItems: "start",
                  width: "fit-content",
                  mx: "auto",
               }}
            >
               {/* Left profile panel */}
               <Stack spacing={3} mx={2} mt={6}>
                  <Card elevation={1}>
                     <CardHeader title="Profile" />
                     <CardContent>
                        <Stack
                           spacing={2}
                           alignItems="center"
                           textAlign="center"
                        >
                           <Avatar sx={{ width: 96, height: 96 }}>
                              {user?.name
                                 ? user.name
                                      .split(" ")
                                      .map((s: string) => s[0])
                                      .join("")
                                      .slice(0, 2)
                                 : "U"}
                           </Avatar>
                           <Box>
                              <Typography variant="subtitle1" fontWeight={700}>
                                 {user?.name || "—"}
                              </Typography>
                              <Typography
                                 variant="body2"
                                 color="text.secondary"
                              >
                                 Computer Science
                              </Typography>
                              <Typography
                                 variant="body2"
                                 color="text.secondary"
                              >
                                 {user?.email || "—"}
                              </Typography>
                           </Box>
                           <Divider flexItem />
                           {/* Skills/tags could render here when API is available */}
                        </Stack>
                     </CardContent>
                  </Card>
               </Stack>

               {/* Right: Tabs + Content */}
               <Box sx={{ minWidth: 0 }}>
                  {/* Tabs */}
                  <Stack
                     direction="row"
                     spacing={2}
                     sx={{ mb: 2, alignItems: "center", ml: 11 }}
                  >
                     <Button
                        variant="text"
                        size="small"
                        onClick={() => navigate("/")}
                     >
                        Back
                     </Button>
                     {(
                        [
                           { key: "overview", label: "Overview" },
                           { key: "favorites", label: "Favorites" },
                        ] as const
                     ).map((t) => (
                        <Button
                           key={t.key}
                           onClick={() => setActiveTab(t.key)}
                           variant={activeTab === t.key ? "contained" : "text"}
                           size="small"
                           sx={{ textTransform: "none" }}
                        >
                           {t.label}
                        </Button>
                     ))}
                  </Stack>

                  {activeTab === "overview" && (
                     <Card
                        elevation={1}
                        sx={{
                           width: "73%",
                        }}
                     >
                        <CardHeader
                           title={
                              <Stack
                                 direction="row"
                                 alignItems="center"
                                 justifyContent="space-between"
                              >
                                 <Typography variant="h6" fontWeight={700}>
                                    My Projects
                                 </Typography>
                                 <Stack direction="row" spacing={1}>
                                    <Button
                                       variant="outlined"
                                       size="medium"
                                       startIcon={<UploadIcon />}
                                       onClick={() => navigate("/upload")}
                                    >
                                       Upload
                                    </Button>
                                 </Stack>
                              </Stack>
                           }
                        />

                        <CardContent>
                           {/* Loading / Error / Content */}
                           {loading ? (
                              <Typography color="text.secondary">
                                 Loading…
                              </Typography>
                           ) : error ? (
                              <Typography color="error">{error}</Typography>
                           ) : myProject ? (
                              <Stack spacing={2}>
                                 {/* Project card uses same component as gallery; clicking opens profile */}
                                 <ProjectCard
                                    project={myProject}
                                    onClick={() => navigate("/profile")}
                                    isAuthenticated={isLoggedIn}
                                 />
                              </Stack>
                           ) : (
                              <Stack
                                 spacing={2}
                                 alignItems="center"
                                 sx={{ py: 6 }}
                              >
                                 <Typography color="text.secondary">
                                    No Projects yet
                                 </Typography>
                                 <Typography
                                    color="text.secondary"
                                    variant="body2"
                                 >
                                    Get started by submitting your first
                                    capstone project.
                                 </Typography>
                                 <Button
                                    variant="contained"
                                    onClick={() => navigate("/upload")}
                                 >
                                    Submit your first project!
                                 </Button>
                              </Stack>
                           )}
                        </CardContent>
                     </Card>
                  )}

                  {activeTab === "favorites" && (
                     <Card elevation={1}>
                        <CardHeader
                           title={
                              <Typography variant="h6" fontWeight={700}>
                                 My Favorites
                              </Typography>
                           }
                        />
                        <CardContent>
                           {favLoading ? (
                              <Typography color="text.secondary">
                                 Loading favorites…
                              </Typography>
                           ) : favError ? (
                              <Typography color="error">{favError}</Typography>
                           ) : favoriteProjects.length === 0 ? (
                              <Typography color="text.secondary">
                                 No favorites yet.
                              </Typography>
                           ) : (
                              <Stack spacing={2}>
                                 {favoriteProjects.map((p) => (
                                    <ProjectCard
                                       key={p._id}
                                       project={p}
                                       onClick={() =>
                                          navigate(`/profile/${p._id}`)
                                       }
                                       isAuthenticated={isLoggedIn}
                                    />
                                 ))}
                              </Stack>
                           )}
                        </CardContent>
                     </Card>
                  )}
               </Box>
            </Box>
         </Box>
      </Box>
   );
};

export default StudentDashboard;
