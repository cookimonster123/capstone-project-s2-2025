import React, { useEffect, useMemo, useState } from "react";
import {
   Avatar,
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   CircularProgress,
   Container,
   IconButton,
   Stack,
   Typography,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUserById, fetchFavoriteProjects } from "../api/userApi.ts";
import { uploadAvatar, removeAvatar } from "../api/fileApi";
import { fetchProjectById } from "../api/projectApi";
import type { Project } from "../types/project";
import ProjectCard from "../components/projects/ProjectCard";

const StudentDashboardMobilePage: React.FC = () => {
   const { isLoggedIn, user, signIn } = useAuth();
   const navigate = useNavigate();

   const [activeTab, setActiveTab] = useState<"overview" | "favorites">(
      "overview",
   );

   const [myProjectId, setMyProjectId] = useState<string | null>(null);
   const [myProject, setMyProject] = useState<Project | null>(null);
   const [loading, setLoading] = useState<boolean>(!!myProjectId);
   const [error, setError] = useState<string | null>(null);
   const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
   const [uploadingAvatar, setUploadingAvatar] = useState(false);

   const [allProjects, setAllProjects] = useState<Project[]>([]);
   const [favPage, setFavPage] = useState(1);
   const itemsPerPage = 3;

   // NOTE: Do not early-return before hooks; render a login prompt conditionally in JSX below.

   // Load my project and avatar
   useEffect(() => {
      let active = true;
      const init = async () => {
         try {
            // If logged out, reset state and stop.
            if (!isLoggedIn || !user?.id) {
               if (active) {
                  setMyProjectId(null);
                  setMyProject(null);
                  setAvatarUrl(null);
                  setError(null);
                  setLoading(false);
               }
               return;
            }

            setLoading(true);
            const uid = user.id;
            if (!uid) return;
            const storageKey = `myProjectId:${uid}`;

            try {
               const u = await fetchUserById(uid);
               const pid = (u.user.project as string | null) || null;
               if (u.user.profilePicture) setAvatarUrl(u.user.profilePicture);
               if (pid) {
                  localStorage.setItem(storageKey, pid);
                  if (!active) return;
                  setMyProjectId(pid);
                  const p = await fetchProjectById(pid);
                  if (!active) return;
                  setMyProject(p);
                  return;
               }
            } catch {}

            const cached = localStorage.getItem(storageKey);
            if (cached) {
               if (!active) return;
               setMyProjectId(cached);
               const p = await fetchProjectById(cached);
               if (!active) return;
               setMyProject(p);
               return;
            }
            if (active) setMyProject(null);
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
   }, [isLoggedIn, user?.id]);

   // Load favorites
   useEffect(() => {
      let active = true;
      const load = async () => {
         try {
            if (!isLoggedIn || !user?.id) {
               if (active) setAllProjects([]);
               return;
            }
            const favorites = await fetchFavoriteProjects(user.id);
            if (active) setAllProjects(favorites);
         } catch {
            if (active) setAllProjects([]);
         }
      };
      load();
      return () => {
         active = false;
      };
   }, [isLoggedIn, user?.id]);

   // Avatar actions
   const handleAvatarUpload = async (
      event: React.ChangeEvent<HTMLInputElement>,
   ) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
         alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
         return;
      }
      if (file.size > 3 * 1024 * 1024) {
         alert("Image size must be less than 3MB");
         return;
      }
      try {
         setUploadingAvatar(true);
         const result = await uploadAvatar(file);
         if (result.success) {
            if (result.url) {
               setAvatarUrl(result.url);
               if (user && signIn) {
                  signIn({
                     id: user.id,
                     name: user.name,
                     email: user.email,
                     role: user.role,
                     profilePicture: result.url,
                  });
               }
               if (user?.id) {
                  const userData = await fetchUserById(user.id);
                  if (userData.user.profilePicture)
                     setAvatarUrl(userData.user.profilePicture);
               }
               alert("Avatar uploaded successfully!");
            } else {
               alert("Avatar upload skipped: AWS S3 is not configured.");
            }
         } else {
            alert(result.error || "Failed to upload avatar");
         }
      } catch {
         alert("Failed to upload avatar");
      } finally {
         setUploadingAvatar(false);
      }
   };

   const handleAvatarRemove = async () => {
      if (!window.confirm("Are you sure you want to remove your avatar?"))
         return;
      try {
         setUploadingAvatar(true);
         const result = await removeAvatar();
         if (result.success) {
            setAvatarUrl(null);
            if (user && signIn) {
               signIn({
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  profilePicture: "",
               });
            }
            if (user?.id) await fetchUserById(user.id);
            alert("Avatar removed successfully!");
         } else {
            alert(result.error || "Failed to remove avatar");
         }
      } catch {
         alert("Failed to remove avatar");
      } finally {
         setUploadingAvatar(false);
      }
   };

   const totalPages = useMemo(
      () => Math.ceil(allProjects.length / itemsPerPage) || 1,
      [allProjects.length],
   );
   const paginatedFavorites = useMemo(() => {
      const startIndex = (favPage - 1) * itemsPerPage;
      return allProjects.slice(startIndex, startIndex + itemsPerPage);
   }, [allProjects, favPage]);

   return (
      <Container maxWidth={false} sx={{ px: 2, py: 3 }}>
         {!isLoggedIn ? (
            <Box sx={{ py: 6, textAlign: "center", px: 2 }}>
               <Typography variant="h5" fontWeight={700} gutterBottom>
                  Student Dashboard
               </Typography>
               <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Sign in to manage your capstone project.
               </Typography>
               <Button variant="contained" onClick={() => navigate("/login")}>
                  Sign in
               </Button>
            </Box>
         ) : (
            <>
               {/* Tabs */}
               <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                  <Button
                     variant="outlined"
                     size="small"
                     onClick={() => navigate("/")}
                  >
                     ← Back
                  </Button>
                  <Button
                     size="small"
                     variant={
                        activeTab === "overview" ? "contained" : "outlined"
                     }
                     onClick={() => setActiveTab("overview")}
                  >
                     Overview
                  </Button>
                  <Button
                     size="small"
                     variant={
                        activeTab === "favorites" ? "contained" : "outlined"
                     }
                     onClick={() => setActiveTab("favorites")}
                  >
                     Favorites
                  </Button>
               </Stack>

               {activeTab === "overview" && (
                  <Stack spacing={2.5}>
                     {/* Profile */}
                     <Card
                        elevation={0}
                        sx={{
                           border: "1px solid",
                           borderColor: "divider",
                           borderRadius: 2,
                        }}
                     >
                        <CardHeader
                           title="Profile"
                           sx={{
                              borderBottom: "1px solid",
                              borderColor: "divider",
                           }}
                        />
                        <CardContent>
                           <Stack
                              spacing={2}
                              alignItems="center"
                              textAlign="center"
                           >
                              <Box sx={{ position: "relative" }}>
                                 <Avatar
                                    src={
                                       avatarUrl ||
                                       (user as any)?.profilePicture ||
                                       undefined
                                    }
                                    sx={{
                                       width: 88,
                                       height: 88,
                                       bgcolor: "primary.main",
                                       fontSize: 24,
                                       fontWeight: 700,
                                    }}
                                 >
                                    {!avatarUrl &&
                                    !(user as any)?.profilePicture
                                       ? user?.name
                                          ? user.name
                                               .split(" ")
                                               .map((s: string) => s[0])
                                               .join("")
                                               .slice(0, 2)
                                          : "U"
                                       : null}
                                 </Avatar>
                                 {uploadingAvatar && (
                                    <CircularProgress
                                       size={88}
                                       sx={{
                                          position: "absolute",
                                          top: 0,
                                          left: 0,
                                       }}
                                    />
                                 )}
                              </Box>
                              <Stack direction="row" spacing={1}>
                                 <Button
                                    component="label"
                                    variant="outlined"
                                    size="small"
                                    startIcon={<PhotoCamera />}
                                    disabled={uploadingAvatar}
                                 >
                                    Upload
                                    <input
                                       type="file"
                                       hidden
                                       accept="image/jpeg,image/png,image/gif,image/webp"
                                       onChange={handleAvatarUpload}
                                    />
                                 </Button>
                                 {(avatarUrl ||
                                    (user as any)?.profilePicture) && (
                                    <IconButton
                                       size="small"
                                       color="error"
                                       onClick={handleAvatarRemove}
                                       disabled={uploadingAvatar}
                                    >
                                       <DeleteIcon fontSize="small" />
                                    </IconButton>
                                 )}
                              </Stack>
                              <Box>
                                 <Typography
                                    variant="subtitle1"
                                    fontWeight={700}
                                 >
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
                           </Stack>
                        </CardContent>
                     </Card>

                     {/* My Projects */}
                     <Card
                        elevation={0}
                        sx={{
                           border: "1px solid",
                           borderColor: "divider",
                           borderRadius: 2,
                        }}
                     >
                        <CardHeader
                           title={
                              <Stack
                                 direction="row"
                                 alignItems="center"
                                 justifyContent="space-between"
                              >
                                 <Typography variant="h6" fontWeight={600}>
                                    My Projects
                                 </Typography>
                                 <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<UploadIcon />}
                                    onClick={() => navigate("/upload")}
                                 >
                                    Upload
                                 </Button>
                              </Stack>
                           }
                           sx={{
                              borderBottom: "1px solid",
                              borderColor: "divider",
                           }}
                        />
                        <CardContent
                           sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              minHeight: 260,
                           }}
                        >
                           {loading ? (
                              <Typography color="text.secondary">
                                 Loading…
                              </Typography>
                           ) : error ? (
                              <Typography color="error">{error}</Typography>
                           ) : myProject ? (
                              <ProjectCard
                                 project={myProject}
                                 onClick={() =>
                                    navigate(`/profile/${myProject._id}`)
                                 }
                                 isAuthenticated={isLoggedIn}
                              />
                           ) : (
                              <Stack
                                 spacing={1.5}
                                 alignItems="center"
                                 sx={{ py: 4 }}
                              >
                                 <Typography color="text.secondary">
                                    No projects yet
                                 </Typography>
                                 <Typography
                                    color="text.secondary"
                                    variant="body2"
                                    textAlign="center"
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
                  </Stack>
               )}

               {activeTab === "favorites" && (
                  <Stack spacing={2.5}>
                     <Typography variant="h6" fontWeight={600}>
                        My Favorites
                     </Typography>
                     <Box
                        sx={{
                           display: "grid",
                           gridTemplateColumns: "1fr",
                           gap: 2,
                        }}
                     >
                        {paginatedFavorites.map((p) => (
                           <ProjectCard
                              key={p._id}
                              project={p}
                              onClick={() => navigate(`/profile/${p._id}`)}
                              isAuthenticated={isLoggedIn}
                           />
                        ))}
                     </Box>
                     {totalPages > 1 && (
                        <Stack
                           direction="row"
                           justifyContent="center"
                           spacing={1}
                        >
                           <Button
                              variant="outlined"
                              size="small"
                              disabled={favPage === 1}
                              onClick={() => setFavPage(1)}
                           >
                              First
                           </Button>
                           <Button
                              variant="outlined"
                              size="small"
                              disabled={favPage === 1}
                              onClick={() =>
                                 setFavPage((p) => Math.max(1, p - 1))
                              }
                           >
                              Prev
                           </Button>
                           <Typography
                              variant="body2"
                              sx={{ px: 1, alignSelf: "center" }}
                           >
                              {favPage} / {totalPages}
                           </Typography>
                           <Button
                              variant="outlined"
                              size="small"
                              disabled={favPage === totalPages}
                              onClick={() =>
                                 setFavPage((p) => Math.min(totalPages, p + 1))
                              }
                           >
                              Next
                           </Button>
                           <Button
                              variant="outlined"
                              size="small"
                              disabled={favPage === totalPages}
                              onClick={() => setFavPage(totalPages)}
                           >
                              Last
                           </Button>
                        </Stack>
                     )}
                  </Stack>
               )}
            </>
         )}
      </Container>
   );
};

export default StudentDashboardMobilePage;
