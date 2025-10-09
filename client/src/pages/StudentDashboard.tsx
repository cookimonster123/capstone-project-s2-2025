import React, { useEffect, useState } from "react";
import {
   Avatar,
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Container,
   Divider,
   Stack,
   Typography,
   Pagination,
   IconButton,
   CircularProgress,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";

import type { Project } from "../types/project";
import { fetchProjectById } from "../api/projectApi";
import ProjectCard from "../components/projects/ProjectCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUserById, fetchFavoriteProjects } from "../api/userApi.ts";
import { uploadAvatar, removeAvatar } from "../api/fileApi";
import { motion } from "framer-motion";
import GradientBackground from "../components/animations/GradientBackground";
import FloatingElements from "../components/animations/FloatingElements";

/**
 * StudentDashboard
 * - Overview of student's profile and their projects
 * - Supports Like and Favorite toggles
 */
const StudentDashboard: React.FC = () => {
   const { isLoggedIn, user, signIn } = useAuth();
   const navigate = useNavigate();

   const [activeTab, setActiveTab] = useState<"overview" | "favorites">(
      "overview",
   );

   const [myProjectId, setMyProjectId] = useState<string | null>(null);
   const [myProject, setMyProject] = useState<Project | null>(null);
   const [loading, setLoading] = useState<boolean>(!!myProjectId);
   const [error, setError] = useState<string | null>(null);

   const [allProjects, setAllProjects] = useState<Project[]>([]);

   const [favPage, setFavPage] = useState(1);
   const itemsPerPage = 3;

   const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
   const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

               // Load user's profile picture
               if (u.user.profilePicture) {
                  if (active) setAvatarUrl(u.user.profilePicture);
               }

               if (pid) {
                  try {
                     localStorage.setItem(storageKey, pid);
                  } catch {}
                  if (!active) return;
                  setMyProjectId(pid);
                  const p = await fetchProjectById(pid);
                  if (!active) return;
                  setMyProject(p);

                  return;
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

   // Load favorite projects for the Favorites tab
   useEffect(() => {
      let active = true;
      const loadFavorites = async () => {
         try {
            if (!user?.id) {
               if (active) setAllProjects([]);
               return;
            }
            const favoriteProjects = await fetchFavoriteProjects(user.id);
            if (active) setAllProjects(favoriteProjects);
         } catch (e) {
            console.error("Error loading favorite projects:", e);
            if (active) setAllProjects([]);
         }
      };
      loadFavorites();
      return () => {
         active = false;
      };
   }, [user?.id]);

   // Handle avatar upload
   const handleAvatarUpload = async (
      event: React.ChangeEvent<HTMLInputElement>,
   ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
         alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
         return;
      }

      // Validate file size (3MB)
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
               alert("Avatar uploaded successfully!");
               // Refresh user data to get updated avatar
               if (user?.id) {
                  const userData = await fetchUserById(user.id);
                  if (userData.user.profilePicture) {
                     setAvatarUrl(userData.user.profilePicture);
                  }
               }
            } else {
               // AWS not configured
               alert(
                  "Avatar upload skipped: AWS S3 is not configured. Please configure AWS credentials to enable image uploads.",
               );
            }
         } else {
            alert(result.error || "Failed to upload avatar");
         }
      } catch (error) {
         console.error("Error uploading avatar:", error);
         alert("Failed to upload avatar");
      } finally {
         setUploadingAvatar(false);
      }
   };

   // Handle avatar removal
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
            alert("Avatar removed successfully!");
            // Refresh user data
            if (user?.id) {
               await fetchUserById(user.id);
            }
         } else {
            alert(result.error || "Failed to remove avatar");
         }
      } catch (error) {
         console.error("Error removing avatar:", error);
         alert("Failed to remove avatar");
      } finally {
         setUploadingAvatar(false);
      }
   };

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
      <>
         <GradientBackground />
         <FloatingElements />
         <Container
            maxWidth={false}
            disableGutters
            sx={{
               minHeight: "100vh",
               position: "relative",
               display: "flex",
               justifyContent: "center",
               pt: { xs: 4, sm: 8 },
            }}
         >
            <Box
               sx={{
                  width: "100%",
                  maxWidth: 1600,
                  px: 2,
                  position: "relative",
                  zIndex: 1,
               }}
            >
               {/* Header Card - Clean Apple/Meta Style */}
               <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
               >
                  <Card
                     elevation={0}
                     sx={{
                        mb: 4,
                        bgcolor: (theme) =>
                           theme.palette.mode === "dark"
                              ? "#1a2332"
                              : "#ffffff",
                        border: (theme) =>
                           theme.palette.mode === "dark"
                              ? "1px solid #2a3142"
                              : "1px solid #e5e5e7",
                        borderRadius: 2.5,
                        boxShadow: (theme) =>
                           theme.palette.mode === "dark"
                              ? "0 4px 16px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)"
                              : "0 4px 16px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                           boxShadow: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "0 8px 24px rgba(0, 153, 255, 0.15), 0 2px 6px rgba(0, 0, 0, 0.4)"
                                 : "0 8px 24px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.03)",
                        },
                     }}
                  >
                     <CardContent sx={{ py: 4 }}>
                        <Typography
                           component="h1"
                           variant="h4"
                           fontWeight={600}
                           textAlign="center"
                           color="text.primary"
                           sx={{ mb: 1 }}
                        >
                           {user?.name
                              ? `${user.name} · Student Dashboard`
                              : "Student Dashboard"}
                        </Typography>
                        <Typography
                           textAlign="center"
                           variant="body1"
                           color="text.secondary"
                        >
                           Manage your capstone project and track your progress
                        </Typography>
                     </CardContent>
                  </Card>
               </motion.div>

               {/* Main Content Area */}
               <Box
                  sx={{
                     maxWidth: "1200px",
                     mx: "auto",
                     px: { xs: 2, sm: 3 },
                  }}
               >
                  {/* Tabs */}
                  <Stack
                     direction="row"
                     spacing={2}
                     sx={{ mb: 4, alignItems: "center" }}
                  >
                     <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate("/")}
                        sx={{
                           textTransform: "none",
                           fontWeight: 600,
                        }}
                     >
                        ← Back
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
                           variant={
                              activeTab === t.key ? "contained" : "outlined"
                           }
                           size="small"
                           sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              minWidth: 100,
                           }}
                        >
                           {t.label}
                        </Button>
                     ))}
                  </Stack>

                  {activeTab === "overview" && (
                     <Stack spacing={4}>
                        {/* Profile and Stats Row */}
                        <Box
                           sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                 xs: "1fr",
                                 md: "320px 1fr",
                              },
                              gap: 3,
                           }}
                        >
                           {/* Profile Card */}
                           <motion.div
                              initial={{ opacity: 0, x: -30 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5 }}
                           >
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
                                       "& .MuiCardHeader-title": {
                                          fontWeight: 600,
                                          fontSize: "1.1rem",
                                       },
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
                                                width: 96,
                                                height: 96,
                                                bgcolor: "primary.main",
                                                fontSize: "2rem",
                                                fontWeight: 700,
                                             }}
                                          >
                                             {!avatarUrl &&
                                             !(user as any)?.profilePicture
                                                ? user?.name
                                                   ? user.name
                                                        .split(" ")
                                                        .map(
                                                           (s: string) => s[0],
                                                        )
                                                        .join("")
                                                        .slice(0, 2)
                                                   : "U"
                                                : null}
                                          </Avatar>
                                          {uploadingAvatar && (
                                             <CircularProgress
                                                size={96}
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
                                       <Divider flexItem />
                                    </Stack>
                                 </CardContent>
                              </Card>
                           </motion.div>

                           {/* My Project Card */}
                           <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6, delay: 0.5 }}
                           >
                              <Card
                                 elevation={0}
                                 sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    height: "100%",
                                 }}
                              >
                                 <CardHeader
                                    sx={{
                                       borderBottom: "1px solid",
                                       borderColor: "divider",
                                    }}
                                    title={
                                       <Stack
                                          direction="row"
                                          alignItems="center"
                                          justifyContent="space-between"
                                       >
                                          <Typography
                                             variant="h6"
                                             fontWeight={600}
                                          >
                                             My Projects
                                          </Typography>
                                          <Button
                                             variant="outlined"
                                             size="small"
                                             startIcon={<UploadIcon />}
                                             onClick={() => navigate("/upload")}
                                             sx={{
                                                borderRadius: 2,
                                             }}
                                          >
                                             Upload
                                          </Button>
                                       </Stack>
                                    }
                                 />

                                 <CardContent
                                    sx={{
                                       display: "flex",
                                       alignItems: "center", // vertical center
                                       justifyContent: "center", // horizontal center
                                       minHeight: 300, // optional: gives space so centering is visible
                                    }}
                                 >
                                    {loading ? (
                                       <Typography color="text.secondary">
                                          Loading…
                                       </Typography>
                                    ) : error ? (
                                       <Typography color="error">
                                          {error}
                                       </Typography>
                                    ) : myProject ? (
                                       <ProjectCard
                                          project={myProject}
                                          onClick={() =>
                                             navigate(
                                                `/profile/${myProject._id}`,
                                             )
                                          }
                                          isAuthenticated={isLoggedIn}
                                       />
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
                                             Get started by submitting your
                                             first capstone project.
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
                           </motion.div>
                        </Box>
                     </Stack>
                  )}

                  {activeTab === "favorites" && (
                     <Card
                        elevation={0}
                        sx={{
                           border: "1px solid",
                           borderColor: "divider",
                           borderRadius: 2,
                        }}
                     >
                        <CardHeader
                           sx={{
                              borderBottom: "1px solid",
                              borderColor: "divider",
                           }}
                           title={
                              <Typography variant="h6" fontWeight={600}>
                                 My Favorites
                              </Typography>
                           }
                        />
                        <CardContent>
                           <Stack spacing={2}>
                              {(() => {
                                 if (!allProjects || allProjects.length === 0) {
                                    return (
                                       <Typography color="text.secondary">
                                          No favorite projects yet. Start
                                          exploring and save your favorites!
                                       </Typography>
                                    );
                                 }

                                 // Calculate pagination (no need to sort, API returns in order)
                                 const totalPages = Math.ceil(
                                    allProjects.length / itemsPerPage,
                                 );
                                 const startIndex =
                                    (favPage - 1) * itemsPerPage;
                                 const endIndex = startIndex + itemsPerPage;
                                 const paginatedProjects = allProjects.slice(
                                    startIndex,
                                    endIndex,
                                 );

                                 return (
                                    <>
                                       <Box
                                          sx={{
                                             display: "grid",
                                             gridTemplateColumns: {
                                                xs: "1fr", // phones
                                                sm: "repeat(2, 1fr)", // small tablets
                                                md: "repeat(3, 1fr)", // desktops
                                             },
                                             gap: 2,
                                          }}
                                       >
                                          {paginatedProjects.map((p) => (
                                             <Box
                                                key={p._id}
                                                sx={{
                                                   minWidth: 0,
                                                   display: "flex",
                                                   justifyContent: "center", // center the wrapper in the grid cell
                                                }}
                                             >
                                                <Box
                                                   sx={{
                                                      width: "100%",
                                                      maxWidth: {
                                                         xs: 300,
                                                         sm: 320,
                                                         md: 340,
                                                      }, // slightly smaller card
                                                      "& > *": {
                                                         width: "100%",
                                                      }, // make ProjectCard fill wrapper
                                                      "& .MuiCard-root": {
                                                         width: "100%",
                                                         maxWidth: "inherit",
                                                      }, // if ProjectCard uses MUI Card
                                                   }}
                                                >
                                                   <ProjectCard
                                                      project={p}
                                                      onClick={() =>
                                                         navigate(
                                                            `/profile/${p._id}`,
                                                         )
                                                      }
                                                      isAuthenticated={
                                                         isLoggedIn
                                                      }
                                                   />
                                                </Box>
                                             </Box>
                                          ))}
                                       </Box>

                                       {totalPages > 1 && (
                                          <Box
                                             sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                flexWrap: "wrap",
                                                gap: 1,
                                                mt: 3,
                                             }}
                                          >
                                             {/* First / Prev */}
                                             <Button
                                                variant="outlined"
                                                size="large"
                                                disabled={favPage === 1}
                                                onClick={() => setFavPage(1)}
                                             >
                                                First
                                             </Button>
                                             <Button
                                                variant="outlined"
                                                size="large"
                                                disabled={favPage === 1}
                                                onClick={() =>
                                                   setFavPage(
                                                      Math.max(1, favPage - 1),
                                                   )
                                                }
                                             >
                                                Prev
                                             </Button>

                                             {(() => {
                                                const PAGE_WINDOW = 4;
                                                const start = Math.max(
                                                   1,
                                                   Math.min(
                                                      favPage,
                                                      totalPages -
                                                         PAGE_WINDOW +
                                                         1,
                                                   ),
                                                );
                                                const end = Math.min(
                                                   totalPages,
                                                   start + PAGE_WINDOW - 1,
                                                );
                                                const pages = Array.from(
                                                   { length: end - start + 1 },
                                                   (_, i) => start + i,
                                                );

                                                return (
                                                   <>
                                                      {start > 1 && (
                                                         <Button
                                                            variant="text"
                                                            size="large"
                                                            disabled
                                                         >
                                                            …
                                                         </Button>
                                                      )}

                                                      {pages.map((p) => (
                                                         <Button
                                                            key={p}
                                                            variant={
                                                               p === favPage
                                                                  ? "contained"
                                                                  : "outlined"
                                                            }
                                                            size="large"
                                                            onClick={() =>
                                                               setFavPage(p)
                                                            }
                                                         >
                                                            {p}
                                                         </Button>
                                                      ))}

                                                      {end < totalPages && (
                                                         <Button
                                                            variant="text"
                                                            size="large"
                                                            disabled
                                                         >
                                                            …
                                                         </Button>
                                                      )}
                                                   </>
                                                );
                                             })()}

                                             {/* Next / Last */}
                                             <Button
                                                variant="outlined"
                                                size="large"
                                                disabled={
                                                   favPage === totalPages
                                                }
                                                onClick={() =>
                                                   setFavPage(
                                                      Math.min(
                                                         totalPages,
                                                         favPage + 1,
                                                      ),
                                                   )
                                                }
                                             >
                                                Next
                                             </Button>
                                             <Button
                                                variant="outlined"
                                                size="large"
                                                disabled={
                                                   favPage === totalPages
                                                }
                                                onClick={() =>
                                                   setFavPage(totalPages)
                                                }
                                             >
                                                Last
                                             </Button>
                                          </Box>
                                       )}
                                    </>
                                 );
                              })()}
                           </Stack>
                        </CardContent>
                     </Card>
                  )}
               </Box>
            </Box>
         </Container>
      </>
   );
};

export default StudentDashboard;
