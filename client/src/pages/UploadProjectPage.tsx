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
import { fetchUserById } from "../api/userApi";

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
   });

   const [tagInput, setTagInput] = useState<string>("");
   const [selectedTags, setSelectedTags] = useState<string[]>([]);
   // changed: store full category objects so we can use the _id when submitting
   const [categoryOptions, setCategoryOptions] = useState<
      { _id: string; name: string }[]
   >([]);
   const [categoryLoading, setCategoryLoading] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [selectedImages, setSelectedImages] = useState<File[]>([]);
   const [imagePreviews, setImagePreviews] = useState<string[]>([]);
   const [uploadProgress, setUploadProgress] = useState(false);
   const [uploadError, setUploadError] = useState<string | null>(null);

   // Load categories on mount
   React.useEffect(() => {
      let active = true;
      (async () => {
         try {
            setCategoryLoading(true);
            const categories = await fetchCategories();
            if (!active) return;
            // keep full category objects; fetchCategories should return [{ _id, name }, ...]
            setCategoryOptions(categories);
         } catch (e) {
            console.warn("Failed to fetch categories", e);
         } finally {
            setCategoryLoading(false);
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
      ];
      const invalidFiles = fileArray.filter(
         (file) => !validTypes.includes(file.type),
      );

      if (invalidFiles.length > 0) {
         setUploadError("Only JPEG, PNG, GIF, and WebP images are allowed");
         return;
      }

      // Validate file sizes (max 5MB per image)
      const oversizedFiles = fileArray.filter(
         (file) => file.size > 5 * 1024 * 1024,
      );
      if (oversizedFiles.length > 0) {
         setUploadError("Each image must be less than 5MB");
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

         //
         const all = await fetchProjects();
         const semesters = all
            .map((p) => p.semester)
            .filter((s): s is NonNullable<typeof s> => Boolean(s));
         const latest = semesters.slice().sort((a, b) => b.year - a.year)[0];
         if (!latest?._id) {
            throw new Error(
               "Could not determine a semester. Please seed data or contact staff.",
            );
         }

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
            semester: latest._id,
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

         alert("Project submitted successfully!");
         navigate("/profile");
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
      <Container maxWidth="md" sx={{ py: 4 }}>
         <Card
            elevation={2}
            sx={{ border: "2px solid #2196f3", borderRadius: 2 }}
         >
            <CardContent sx={{ p: 4 }}>
               <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ mb: 1, color: "#2196f3" }}
               >
                  Submit Your Capstone Project
               </Typography>
               <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Share your capstone project with the community. All fields
                  marked with * are required.
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
                        sx={{ "& .MuiInputLabel-asterisk": { color: "red" } }}
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
                        sx={{ "& .MuiInputLabel-asterisk": { color: "red" } }}
                     />

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
                              onChange={(e) => setTagInput(e.target.value)}
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
                           gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
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
                           accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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
                                 sx={{ fontSize: 48, color: "#ccc", mb: 1 }}
                              />
                              <Typography color="text.secondary" sx={{ mb: 1 }}>
                                 {selectedImages.length >= 5
                                    ? "Maximum 5 images reached"
                                    : "Click to upload images (JPEG, PNG, GIF, WebP)"}
                              </Typography>
                              <Typography
                                 variant="body2"
                                 color="text.secondary"
                              >
                                 {selectedImages.length > 0
                                    ? `${selectedImages.length} of 5 images selected`
                                    : "Max 5 images, 5MB each"}
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
                                       onClick={() => handleRemoveImage(index)}
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
                           mt: 3,
                           py: 1.5,
                           bgcolor: "#2196f3",
                           "&:hover": { bgcolor: "#1976d2" },
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
   );
};

export default UploadProjectPage;
