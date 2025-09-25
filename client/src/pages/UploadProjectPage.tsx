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
} from "@mui/material";
import { CloudUpload as UploadIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createProject, fetchProjects } from "../api/projectApi";
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
   const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
   const [categoryLoading, setCategoryLoading] = useState(false);
   const [submitting, setSubmitting] = useState(false);

   // Load categories on mount
   React.useEffect(() => {
      let active = true;
      (async () => {
         try {
            setCategoryLoading(true);
            const categories = await fetchCategories();
            if (!active) return;
            setCategoryOptions(categories.map((c) => c.name));
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

         if (formData.githubRepo && !githubUrlNormalized) {
            throw new Error("Please enter a valid GitHub URL (http/https).");
         }
         if (formData.liveDemoUrl && !liveDemoUrlNormalized) {
            throw new Error("Please enter a valid Live Demo URL (http/https).");
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
         ].filter(Boolean) as Array<{
            type: "github" | "deployedWebsite";
            value: string;
         }>;

         const created = await createProject({
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
         });

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
                              <MenuItem key={cat} value={cat}>
                                 {cat}
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
                           Tech Stack (up to 5 tags)
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
                           Project Images
                        </Typography>
                        <Paper
                           sx={{
                              p: 4,
                              textAlign: "center",
                              border: "2px dashed #ccc",
                              bgcolor: "#f9f9f9",
                              cursor: "pointer",
                              "&:hover": { bgcolor: "#f0f0f0" },
                           }}
                        >
                           <UploadIcon
                              sx={{ fontSize: 48, color: "#ccc", mb: 1 }}
                           />
                           <Typography color="text.secondary" sx={{ mb: 1 }}>
                              Image upload functionality would be implemented
                              with real backend
                           </Typography>
                           <Typography variant="body2" color="text.secondary">
                              For now you can add image URLs in the description
                           </Typography>
                        </Paper>
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
