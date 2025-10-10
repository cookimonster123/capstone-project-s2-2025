import React, { useState } from "react";
import {
   Button,
   Container,
   Box,
   Stack,
   TextField,
   Typography,
   Card,
   CardContent,
   Paper,
   FormControl,
   InputLabel,
   Select,
   MenuItem,
   Chip,
   IconButton,
   LinearProgress,
   Alert,
} from "@mui/material";
import {
   CloudUpload as UploadIcon,
   Add as AddIcon,
   Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
   createProject,
   createProjectWithImages,
   fetchProjects,
} from "../api/projectApi";
import { fetchCategories } from "../api/categoryApi";
import { fetchSemesters, type SemesterDto } from "../api/semesterApi";
import { fetchUserById } from "../api/userApi";
import { motion } from "framer-motion";
import SuccessCelebration from "../components/animations/SuccessCelebration";
import GradientBackground from "../components/animations/GradientBackground";

const UploadProjectPage: React.FC = () => {
   const navigate = useNavigate();
   const { isLoggedIn, user } = useAuth();

   const [formData, setFormData] = useState({
      title: "",
      description: "",
      githubRepo: "",
      liveDemoUrl: "",
      videoDemoUrl: "",
      category: "",
      semester: "",
   });

   const [tagInput, setTagInput] = useState<string>("");
   const [selectedTags, setSelectedTags] = useState<string[]>([]);
   // changed: store full category objects so we can use the _id when submitting
   const [categoryOptions, setCategoryOptions] = useState<
      { _id: string; name: string }[]
   >([]);
   const [categoryLoading, setCategoryLoading] = useState(false);
   const [semesterOptions, setSemesterOptions] = useState<SemesterDto[]>([]);
   const [semesterLoading, setSemesterLoading] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [selectedImages, setSelectedImages] = useState<File[]>([]);
   const [imagePreviews, setImagePreviews] = useState<string[]>([]);
   const [uploadProgress, setUploadProgress] = useState(false);
   const [uploadError, setUploadError] = useState<string | null>(null);
   const [showCelebration, setShowCelebration] = useState(false);
   const [uploadedProjectId, setUploadedProjectId] = useState<string | null>(
      null,
   );

   // Load categories and semesters on mount
   React.useEffect(() => {
      let active = true;
      (async () => {
         try {
            setCategoryLoading(true);
            setSemesterLoading(true);
            const categories = await fetchCategories();
            const semesters = await fetchSemesters();
            if (!active) return;
            // keep full category objects; fetchCategories should return [{ _id, name }, ...]
            setCategoryOptions(categories);
            setSemesterOptions(semesters);
         } catch (e) {
            console.warn("Failed to fetch categories", e);
         } finally {
            setCategoryLoading(false);
            setSemesterLoading(false);
         }
      })();
      return () => {
         active = false;
      };
   }, []);

   const normalizeUrl = (raw: string): string | null => {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      const withProto = /^(https?:)?\/\//i.test(trimmed)
         ? trimmed
         : `https://${trimmed}`;
      try {
         const u = new URL(withProto);
         if (u.protocol !== "http:" && u.protocol !== "https:") return null;
         return u.toString();
      } catch {
         return null;
      }
   };

   const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const fileArray = Array.from(files);

      if (fileArray.length > 5) {
         setUploadError("Maximum 5 images allowed");
         return;
      }

      if (selectedImages.length + fileArray.length > 5) {
         setUploadError(
            `You can only upload ${5 - selectedImages.length} more image(s)`,
         );
         return;
      }

      // Validate file types
      const validTypes = [
         "image/jpeg",
         "image/jpg",
         "image/png",
         "image/gif",
         "image/webp",
         "image/bmp",
         "image/svg",
         "image/svg+xml",
      ];
      const invalidFiles = fileArray.filter(
         (file) => !validTypes.includes(file.type),
      );

      if (invalidFiles.length > 0) {
         setUploadError(
            "Only JPG, JPEG, PNG, GIF, WEBP, BMP, and SVG images are allowed",
         );
         return;
      }

      // Validate file sizes (max 5MB per image)
      const oversizedFiles = fileArray.filter(
         (file) => file.size > 20 * 1024 * 1024,
      );
      if (oversizedFiles.length > 0) {
         setUploadError("Each image must be less than 20MB");
         return;
      }

      setUploadError(null);
      setSelectedImages((prev) => [...prev, ...fileArray]);

      // Create previews
      fileArray.forEach((file) => {
         const reader = new FileReader();
         reader.onloadend = () => {
            setImagePreviews((prev) => [...prev, reader.result as string]);
         };
         reader.readAsDataURL(file);
      });
   };

   const handleRemoveImage = (index: number) => {
      setSelectedImages((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
      setUploadError(null);
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isLoggedIn || !user?.id) {
         alert("Please log in to submit a project.");
         navigate("/login");
         return;
      }

      if (!formData.title.trim()) {
         alert("Project title is required.");
         return;
      }

      // Require semester selection similar to title/description
      if (!formData.semester) {
         alert("Semester is required.");
         return;
      }

      setSubmitting(true);
      try {
         //
         const userRes = await fetchUserById(user.id);
         const teamId = (userRes.user?.team as string) || "";
         if (!teamId) {
            throw new Error(
               "No team assigned to your account. Please contact staff.",
            );
         }

         // Selected semester (required above)
         const semesterId = formData.semester;

         const githubUrlNormalized = formData.githubRepo
            ? normalizeUrl(formData.githubRepo)
            : null;
         const liveDemoUrlNormalized = formData.liveDemoUrl
            ? normalizeUrl(formData.liveDemoUrl)
            : null;
         const videoDemoUrlNormalized = formData.videoDemoUrl
            ? normalizeUrl(formData.videoDemoUrl)
            : null;

         if (formData.githubRepo && !githubUrlNormalized) {
            throw new Error("Please enter a valid GitHub URL (http/https).");
         }
         if (formData.liveDemoUrl && !liveDemoUrlNormalized) {
            throw new Error("Please enter a valid Live Demo URL (http/https).");
         }
         if (formData.videoDemoUrl && !videoDemoUrlNormalized) {
            throw new Error("Please enter a valid Video URL (http/https).");
         }

         const links = [
            githubUrlNormalized && {
               type: "github" as const,
               value: githubUrlNormalized,
            },
            liveDemoUrlNormalized && {
               type: "deployedWebsite" as const,
               value: liveDemoUrlNormalized,
            },
            videoDemoUrlNormalized && {
               type: "videoDemoUrl" as const,
               value: videoDemoUrlNormalized,
            },
         ].filter(Boolean) as Array<{
            type: "github" | "deployedWebsite" | "videoDemoUrl";
            value: string;
         }>;

         const projectPayload = {
            name: formData.title.trim(),
            description: formData.description.trim(),
            teamId,
            semester: semesterId,
            links,
            tags: selectedTags
               .map((t) => t.trim())
               .filter(Boolean)
               .filter((v, i, arr) => arr.indexOf(v) === i)
               .slice(0, 5),
            // this will now be the category _id (string) — server expects ObjectId
            category: formData.category,
         };

         let created;

         // If images are selected, use form-data approach
         if (selectedImages.length > 0) {
            setUploadProgress(true);
            created = await createProjectWithImages(
               projectPayload,
               selectedImages,
            );
            setUploadProgress(false);
         } else {
            // No images, use JSON approach
            created = await createProject(projectPayload);
         }

         try {
            if (created?._id && user?.id) {
               const storageKey = `myProjectId:${user.id}`;
               localStorage.setItem(storageKey, created._id);

               localStorage.removeItem("myProjectId");
            }
         } catch {}

         // Show epic success celebration!
         setUploadedProjectId(created._id);
         setShowCelebration(true);
      } catch (err: any) {
         console.error(err);
         alert(err?.message || "Failed to submit project.");
      } finally {
         setSubmitting(false);
      }
   };

   // Tag cache add/remove using input and plus button
   const handleAddTag = () => {
      const value = tagInput.trim();
      if (!value) return;
      const next = Array.from(new Set([...selectedTags, value])).slice(0, 5);
      setSelectedTags(next);
      setTagInput("");
   };
   const handleRemoveTag = (name: string) => {
      setSelectedTags((prev) => prev.filter((t) => t !== name));
   };

   return (
      <>
         {/* Epic Success Celebration */}
         <SuccessCelebration
            show={showCelebration}
            onClose={() => {
               setShowCelebration(false);
               if (uploadedProjectId) {
                  navigate(`/profile/${uploadedProjectId}`);
               } else {
                  navigate("/profile");
               }
            }}
            projectTitle={formData.title || "Your Project"}
         />

         {/* Gradient Background */}
         <GradientBackground />

         <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            sx={{
               minHeight: "100vh",
               position: "relative",
               overflow: "hidden",
               py: 6,
            }}
         >
            {/* Sparkle particles */}
            {[...Array(15)].map((_, i) => (
               <Box
                  key={`sparkle-${i}`}
                  sx={{
                     position: "fixed",
                     width: `${2 + Math.random() * 4}px`,
                     height: `${2 + Math.random() * 4}px`,
                     bgcolor: i % 2 === 0 ? "#06c" : "#0ea5e9",
                     opacity: 0,
                     borderRadius: "50%",
                     left: `${Math.random() * 100}%`,
                     top: `${Math.random() * 100}%`,
                     pointerEvents: "none",
                     zIndex: 1,
                     boxShadow: `0 0 ${8 + Math.random() * 12}px currentColor`,
                     animation: `sparkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                     animationDelay: `${Math.random() * 5}s`,
                     "@keyframes sparkle": {
                        "0%, 100%": { opacity: 0, transform: "scale(0)" },
                        "50%": { opacity: 0.8, transform: "scale(1.5)" },
                     },
                  }}
               />
            ))}

            <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
               <Card
                  elevation={0}
                  sx={{
                     border: (theme) =>
                        theme.palette.mode === "dark"
                           ? "1px solid #2d3548"
                           : "1px solid #e5e5e7",
                     borderRadius: 3,
                     bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "#0f1419" : "#ffffff",
                     position: "relative",
                     overflow: "hidden",
                     boxShadow: (theme) =>
                        theme.palette.mode === "dark"
                           ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)"
                           : "0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03)",
                     transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                     // Animated gradient border
                     "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: "-2px",
                        background: (theme) =>
                           theme.palette.mode === "dark"
                              ? "linear-gradient(45deg, #0099ff, #0ea5e9, #38bdf8, #0099ff)"
                              : "linear-gradient(45deg, #06c, #0ea5e9, #38bdf8, #06c)",
                        backgroundSize: "300% 300%",
                        borderRadius: "inherit",
                        opacity: 0,
                        animation: "borderGlow 6s linear infinite",
                        transition: "opacity 0.4s",
                        zIndex: -1,
                     },
                     "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background: (theme) =>
                           theme.palette.mode === "dark"
                              ? "#0f1419"
                              : "#ffffff",
                        borderRadius: "inherit",
                        zIndex: -1,
                     },
                     "@keyframes borderGlow": {
                        "0%, 100%": { backgroundPosition: "0% 50%" },
                        "50%": { backgroundPosition: "100% 50%" },
                     },
                     "&:hover": {
                        boxShadow: (theme) =>
                           theme.palette.mode === "dark"
                              ? "0 16px 48px rgba(0, 153, 255, 0.25), 0 4px 12px rgba(0, 153, 255, 0.15)"
                              : "0 16px 48px rgba(0, 102, 204, 0.12), 0 4px 12px rgba(0, 102, 204, 0.08)",
                        transform: "translateY(-4px)",
                     },
                     "&:hover::before": {
                        opacity: 1,
                     },
                  }}
               >
                  <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                     <Typography
                        variant="h4"
                        sx={{
                           mb: 1.5,
                           fontWeight: 700,
                           fontSize: { xs: 28, sm: 32, md: 36 },
                           color: "#1d1d1f",
                           letterSpacing: "-0.02em",
                           background:
                              "linear-gradient(135deg, #1d1d1f 0%, #06c 40%, #0ea5e9 80%, #06c 100%)",
                           backgroundSize: "200% 100%",
                           WebkitBackgroundClip: "text",
                           WebkitTextFillColor: "transparent",
                           backgroundClip: "text",
                           animation: "gradientFlow 4s ease infinite",
                           position: "relative",
                           textAlign: "center",
                           "@keyframes gradientFlow": {
                              "0%, 100%": { backgroundPosition: "0% 50%" },
                              "50%": { backgroundPosition: "100% 50%" },
                           },
                        }}
                     >
                        Submit Your Capstone Project
                     </Typography>
                     <Typography
                        sx={{
                           mb: 4,
                           color: "#6e6e73",
                           fontSize: 16,
                           fontWeight: 400,
                        }}
                     >
                        Share your capstone project with the community. All
                        fields marked with * are required.
                     </Typography>

                     <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                           <TextField
                              label="Project Title"
                              placeholder="My Amazing Capstone Project"
                              required
                              fullWidth
                              value={formData.title}
                              onChange={(e) =>
                                 setFormData((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                 }))
                              }
                              sx={{
                                 "& .MuiInputLabel-asterisk": { color: "red" },
                              }}
                           />

                           <TextField
                              label="Description"
                              placeholder="Describe your project, its purpose, key features, and what you learned..."
                              required
                              multiline
                              rows={4}
                              fullWidth
                              value={formData.description}
                              onChange={(e) =>
                                 setFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                 }))
                              }
                              sx={{
                                 "& .MuiInputLabel-asterisk": { color: "red" },
                              }}
                           />

                           {/* Semester Select (from backend semesters) */}
                           <FormControl
                              fullWidth
                              required
                              sx={{
                                 mb: 2,
                                 "& .MuiInputLabel-asterisk": { color: "red" },
                              }}
                           >
                              <InputLabel required>Semester</InputLabel>
                              <Select
                                 value={formData.semester}
                                 label="Semester"
                                 required
                                 onChange={(e) =>
                                    setFormData((prev) => ({
                                       ...prev,
                                       semester: e.target.value as string,
                                    }))
                                 }
                                 disabled={semesterLoading}
                              >
                                 {semesterOptions.map((s) => (
                                    <MenuItem key={s._id} value={s._id}>
                                       {`${s.semester} ${s.year}`}
                                    </MenuItem>
                                 ))}
                                 {semesterOptions.length === 0 && (
                                    <MenuItem value="__placeholder__" disabled>
                                       No semesters
                                    </MenuItem>
                                 )}
                              </Select>
                           </FormControl>

                           {/* Category Select (from backend categories) */}
                           <FormControl fullWidth>
                              <InputLabel>Category</InputLabel>
                              <Select
                                 value={formData.category}
                                 label="Category"
                                 onChange={(e) =>
                                    setFormData((prev) => ({
                                       ...prev,
                                       category: e.target.value as string,
                                    }))
                                 }
                                 disabled={categoryLoading}
                              >
                                 <MenuItem value="">
                                    <em>None</em>
                                 </MenuItem>
                                 {categoryOptions.map((cat) => (
                                    <MenuItem key={cat._id} value={cat._id}>
                                       {cat.name}
                                    </MenuItem>
                                 ))}
                                 {categoryOptions.length === 0 && (
                                    <MenuItem value="__placeholder__" disabled>
                                       Loading categories...
                                    </MenuItem>
                                 )}
                              </Select>
                           </FormControl>

                           {/* Tags as stack (tech stack) */}
                           <Box>
                              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                 Tag (up to 5 tags)
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                 <TextField
                                    placeholder="React, Python, etc."
                                    size="small"
                                    value={tagInput}
                                    onChange={(e) =>
                                       setTagInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                       if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleAddTag();
                                       }
                                    }}
                                    sx={{ flexGrow: 1 }}
                                 />
                                 <IconButton
                                    onClick={handleAddTag}
                                    color="primary"
                                    sx={{
                                       bgcolor: "#2196f3",
                                       color: "white",
                                       "&:hover": { bgcolor: "#1976d2" },
                                    }}
                                 >
                                    <AddIcon />
                                 </IconButton>
                              </Stack>
                              <Stack
                                 direction="row"
                                 spacing={1}
                                 flexWrap="wrap"
                                 useFlexGap
                              >
                                 {selectedTags.map((name) => (
                                    <Chip
                                       key={name}
                                       label={name}
                                       onDelete={() => handleRemoveTag(name)}
                                       color="primary"
                                       variant="outlined"
                                    />
                                 ))}
                              </Stack>
                           </Box>

                           {/* Removed Autocomplete tag input;*/}

                           <Box
                              sx={{
                                 display: "grid",
                                 gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "1fr 1fr",
                                 },
                                 gap: 2,
                              }}
                           >
                              <TextField
                                 label="GitHub Repository"
                                 placeholder="https://github.com/username/project"
                                 value={formData.githubRepo}
                                 onChange={(e) =>
                                    setFormData((prev) => ({
                                       ...prev,
                                       githubRepo: e.target.value,
                                    }))
                                 }
                              />
                              <TextField
                                 label="Live Demo URL"
                                 placeholder="https://myproject.netlify.app"
                                 value={formData.liveDemoUrl}
                                 onChange={(e) =>
                                    setFormData((prev) => ({
                                       ...prev,
                                       liveDemoUrl: e.target.value,
                                    }))
                                 }
                              />
                           </Box>

                           <TextField
                              label="Video Demo URL"
                              placeholder="https://youtube.com/watch?v=..."
                              value={formData.videoDemoUrl}
                              onChange={(e) =>
                                 setFormData((prev) => ({
                                    ...prev,
                                    videoDemoUrl: e.target.value,
                                 }))
                              }
                           />

                           <Box>
                              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                 Project Images (Optional, max 5)
                              </Typography>

                              {uploadError && (
                                 <Alert severity="error" sx={{ mb: 2 }}>
                                    {uploadError}
                                 </Alert>
                              )}

                              {uploadProgress && (
                                 <Box sx={{ mb: 2 }}>
                                    <LinearProgress />
                                    <Typography
                                       variant="caption"
                                       color="text.secondary"
                                       sx={{ mt: 1 }}
                                    >
                                       Uploading images...
                                    </Typography>
                                 </Box>
                              )}

                              <input
                                 accept="
                                    image/jpeg,
                                    image/jpg,
                                    image/png,
                                    image/gif,
                                    image/webp, 
                                    image/bmp,
                                    image/svg+xml"
                                 style={{ display: "none" }}
                                 id="image-upload-input"
                                 type="file"
                                 multiple
                                 onChange={handleImageSelect}
                                 disabled={selectedImages.length >= 5}
                              />

                              <label htmlFor="image-upload-input">
                                 <Paper
                                    sx={{
                                       p: 4,
                                       textAlign: "center",
                                       border: "2px dashed #ccc",
                                       bgcolor:
                                          selectedImages.length >= 5
                                             ? "#f5f5f5"
                                             : "#f9f9f9",
                                       cursor:
                                          selectedImages.length >= 5
                                             ? "not-allowed"
                                             : "pointer",
                                       "&:hover":
                                          selectedImages.length < 5
                                             ? { bgcolor: "#f0f0f0" }
                                             : {},
                                    }}
                                    component="div"
                                 >
                                    <UploadIcon
                                       sx={{
                                          fontSize: 48,
                                          color: "#ccc",
                                          mb: 1,
                                       }}
                                    />
                                    <Typography
                                       color="text.secondary"
                                       sx={{ mb: 1 }}
                                    >
                                       {selectedImages.length >= 5
                                          ? "Maximum 5 images reached"
                                          : "Click to upload images (JPG, JPEG, PNG, GIF, WEBP, BMP, SVG)"}
                                    </Typography>
                                    <Typography
                                       variant="body2"
                                       color="text.secondary"
                                    >
                                       {selectedImages.length > 0
                                          ? `${selectedImages.length} of 5 images selected`
                                          : "Max 5 images, largest size 20MB each"}
                                    </Typography>
                                 </Paper>
                              </label>

                              {imagePreviews.length > 0 && (
                                 <Box
                                    sx={{
                                       mt: 2,
                                       display: "grid",
                                       gridTemplateColumns:
                                          "repeat(auto-fill, minmax(120px, 1fr))",
                                       gap: 2,
                                    }}
                                 >
                                    {imagePreviews.map((preview, index) => (
                                       <Box
                                          key={index}
                                          sx={{
                                             position: "relative",
                                             paddingTop: "100%",
                                             borderRadius: 2,
                                             overflow: "hidden",
                                             border: "1px solid #e0e0e0",
                                          }}
                                       >
                                          <Box
                                             component="img"
                                             src={preview}
                                             alt={`Preview ${index + 1}`}
                                             sx={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                             }}
                                          />
                                          <IconButton
                                             size="small"
                                             onClick={() =>
                                                handleRemoveImage(index)
                                             }
                                             sx={{
                                                position: "absolute",
                                                top: 4,
                                                right: 4,
                                                bgcolor: "rgba(0,0,0,0.6)",
                                                color: "white",
                                                "&:hover": {
                                                   bgcolor: "rgba(0,0,0,0.8)",
                                                },
                                             }}
                                          >
                                             <CloseIcon fontSize="small" />
                                          </IconButton>
                                       </Box>
                                    ))}
                                 </Box>
                              )}
                           </Box>

                           <Button
                              type="submit"
                              variant="contained"
                              size="large"
                              fullWidth
                              sx={{
                                 mt: 4,
                                 py: 2,
                                 fontSize: 17,
                                 fontWeight: 600,
                                 textTransform: "none",
                                 borderRadius: 2,
                                 position: "relative",
                                 overflow: "hidden",
                                 background:
                                    "linear-gradient(135deg, #06c 0%, #0052a3 100%)",
                                 boxShadow:
                                    "0 6px 20px rgba(0, 102, 204, 0.35), 0 0 0 0 rgba(0, 102, 204, 0.4)",
                                 transition:
                                    "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                 // Ripple effect
                                 "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    inset: 0,
                                    background:
                                       "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                                    transform: "translate(-50%, -50%) scale(0)",
                                    transition: "transform 0.6s",
                                 },
                                 // Pulse animation
                                 "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    inset: "-4px",
                                    borderRadius: "inherit",
                                    background: "inherit",
                                    opacity: 0,
                                    zIndex: -1,
                                    animation: "pulse 2s ease-out infinite",
                                 },
                                 "@keyframes pulse": {
                                    "0%": {
                                       transform: "scale(1)",
                                       opacity: 0.8,
                                    },
                                    "100%": {
                                       transform: "scale(1.1)",
                                       opacity: 0,
                                    },
                                 },
                                 "&:hover": {
                                    background:
                                       "linear-gradient(135deg, #0052a3 0%, #003d7a 100%)",
                                    boxShadow:
                                       "0 12px 32px rgba(0, 102, 204, 0.45), 0 0 40px rgba(0, 102, 204, 0.3)",
                                    transform: "translateY(-3px) scale(1.02)",
                                 },
                                 "&:hover::before": {
                                    transform: "translate(50%, 50%) scale(3)",
                                 },
                                 "&:active": {
                                    transform: "translateY(-1px) scale(0.98)",
                                    boxShadow:
                                       "0 4px 16px rgba(0, 102, 204, 0.4)",
                                 },
                                 "&:disabled": {
                                    background:
                                       "linear-gradient(135deg, #d2d2d7 0%, #b0b0b5 100%)",
                                    color: "#86868b",
                                    boxShadow: "none",
                                 },
                                 "&:disabled::after": {
                                    animation: "none",
                                 },
                              }}
                              disabled={submitting}
                           >
                              {submitting ? "Submitting..." : "Submit Project"}
                           </Button>
                        </Stack>
                     </form>
                  </CardContent>
               </Card>
            </Container>
         </Box>
      </>
   );
};

export default UploadProjectPage;
