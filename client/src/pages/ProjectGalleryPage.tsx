import React, { useMemo, useState, useCallback, useEffect } from "react";
import ProjectGrid from "../components/projects/ProjectGrid";
import {
   Box,
   Container,
   Typography,
   TextField,
   InputAdornment,
   FormControl,
   InputLabel,
   Select,
   MenuItem,
   OutlinedInput,
   Stack,
   Divider,
   Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { NAV_HEIGHT } from "../components/Navbar";
import { useDebounce } from "../hooks/useDebounce";
import { fetchProjects, fetchProjectById } from "../api/projectApi";
import type { Project } from "../types/project";
import { projectCache } from "../state/projectCache";
import { useNavigate } from "react-router-dom";

// MUI-based gallery page that preserves search bar and filters while using ProjectGrid
const ProjectGalleryPage: React.FC = () => {
   // Separate input value and applied search term
   const [searchInput, setSearchInput] = useState("");
   const debouncedSearch = useDebounce(searchInput, 200);
   const [category, setCategory] = useState<string>("");
   const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
   const [openCat, setOpenCat] = useState(false);
   const [projects, setProjects] = useState<Project[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const navigate = useNavigate();

   // Fetch data
   useEffect(() => {
      const loadProjects = async () => {
         try {
            setLoading(true);
            setError(null);
            const projectData = await fetchProjects();
            setProjects(projectData);

            // Expose filter options upward
            const categoriesSet = new Set<string>();
            projectData.forEach((p) => {
               if (p.category?.name) {
                  categoriesSet.add(p.category.name);
               }
            });
            setCategoryOptions(Array.from(categoriesSet).sort());
         } catch (err) {
            setError(
               err instanceof Error ? err.message : "Unknown error occurred",
            );
         } finally {
            setLoading(false);
         }
      };
      loadProjects();
   }, []);

   // Filter data
   const filteredProjects = useMemo(() => {
      const search = debouncedSearch.trim().toLowerCase();
      const selectedCategory = category === "" ? null : category;

      return projects.filter((project) => {
         const name = project.name?.toLowerCase() ?? "";
         const description = project.description?.toLowerCase() ?? "";
         const team = project.team?.name?.toLowerCase() ?? "";

         const matchesSearch =
            !search ||
            name.includes(search) ||
            description.includes(search) ||
            team.includes(search);

         const matchesCategory =
            !selectedCategory || project.category?.name === selectedCategory;

         return matchesSearch && matchesCategory;
      });
   }, [projects, debouncedSearch, category]);

   const handleProjectClick = async (project: Project) => {
      try {
         // Fetch fresh project data to ensure we have the latest information
         const freshProject = await fetchProjectById(project._id);

         // Cache the project for better performance
         projectCache.set(project._id, freshProject);

         // Navigate to the project profile page
         navigate(`/profile/${project._id}`);
      } catch (error) {
         console.error("Error loading project:", error);
         // TODO: UI for error
      }
   };

   return (
      <Box
         sx={{
            bgcolor: "#fff",
            mx: -3, // cover RootLayout's horizontal padding
            px: 3,
            // stretch to bottom and cover RootLayout's main bottom padding
            minHeight: `calc(100dvh - ${NAV_HEIGHT}px)`,
            pb: 6,
            mb: -6,
         }}
      >
         <Container maxWidth={false} sx={{ py: 4, px: 0, textAlign: "left" }}>
            <Box
               sx={{
                  width: "100%",
                  maxWidth: 1750,
                  mx: "auto",
                  px: { xs: 2, sm: 3, md: 4 },
               }}
            >
               <Stack spacing={2} sx={{ width: "100%" }}>
                  {/* Page header */}
                  <Box sx={{ textAlign: "left", width: "100%" }}>
                     <Typography
                        variant="h4"
                        component="h1"
                        fontWeight={700}
                        gutterBottom
                        sx={{ letterSpacing: 0.2 }}
                     >
                        Project Gallery
                     </Typography>
                     <Typography variant="body1" color="text.secondary">
                        Explore amazing capstone projects created by students
                     </Typography>
                  </Box>

                  {/* Filter toolbar (no box, simple row) */}
                  <Box
                     sx={{
                        position: "sticky",
                        top: 12,
                        zIndex: 1,
                        width: "100%",
                     }}
                  >
                     <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        alignItems={{ xs: "stretch", md: "center" }}
                     >
                        <TextField
                           placeholder="Search projects, teams or keywords..."
                           value={searchInput}
                           onChange={(e) => setSearchInput(e.target.value)}
                           InputProps={{
                              startAdornment: (
                                 <InputAdornment position="start">
                                    <SearchIcon color="disabled" />
                                 </InputAdornment>
                              ),
                           }}
                           fullWidth
                           sx={{
                              "& .MuiOutlinedInput-notchedOutline": {
                                 borderWidth: "2px",
                              },
                              "& .MuiOutlinedInput-root:not(.Mui-focused):hover .MuiOutlinedInput-notchedOutline":
                                 {
                                    borderColor: "rgba(0,0,0,0.87)",
                                 },
                           }}
                        />
                        <FormControl
                           variant="outlined"
                           sx={{
                              minWidth: 180,
                              // Hide notch when label not shrunk
                              "& .MuiInputLabel-root:not(.MuiInputLabel-shrink) + .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline legend":
                                 {
                                    width: 0,
                                 },
                              // Default (idle) thickness
                              "& .MuiOutlinedInput-notchedOutline": {
                                 borderWidth: "2px",
                              },
                              // Focus keeps same thickness for consistency
                              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                 {
                                    borderWidth: "2px",
                                 },
                           }}
                        >
                           <InputLabel
                              id="cat-label"
                              shrink={Boolean(category) || openCat}
                              sx={{
                                 "&.Mui-focused": {
                                    color: (theme) =>
                                       Boolean(category) || openCat
                                          ? theme.palette.primary.main
                                          : theme.palette.text.secondary,
                                 },
                                 "&:not(.MuiInputLabel-shrink)": {
                                    color: (theme) =>
                                       theme.palette.text.primary,
                                    fontWeight: 400,
                                 },
                              }}
                           >
                              Category
                           </InputLabel>
                           <Select
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              labelId="cat-label"
                              label="Category"
                              displayEmpty
                              open={openCat}
                              onOpen={() => setOpenCat(true)}
                              onClose={() => {
                                 setOpenCat(false);
                                 // Ensure the element that kept focus (Select display) releases it
                                 requestAnimationFrame(() => {
                                    const el =
                                       document.activeElement as HTMLElement | null;
                                    el?.blur?.();
                                 });
                              }}
                              input={
                                 <OutlinedInput
                                    label="Category"
                                    notched={Boolean(category) || openCat}
                                    sx={{
                                       "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                          {
                                             borderColor:
                                                Boolean(category) || openCat
                                                   ? undefined
                                                   : "rgba(0,0,0,0.23)",
                                             borderWidth:
                                                Boolean(category) || openCat
                                                   ? undefined
                                                   : "1px",
                                          },
                                    }}
                                 />
                              }
                              renderValue={(selected) =>
                                 selected ? (
                                    (selected as string as unknown as React.ReactNode)
                                 ) : openCat ? (
                                    <span style={{ color: "#9aa0a6" }}>
                                       Any
                                    </span>
                                 ) : null
                              }
                           >
                              <MenuItem value="" disabled>
                                 <em>Any</em>
                              </MenuItem>
                              {categoryOptions.map((c) => (
                                 <MenuItem key={c} value={c}>
                                    {c}
                                 </MenuItem>
                              ))}
                           </Select>
                        </FormControl>
                        <Box sx={{ flex: 1 }} />
                        {(searchInput ||
                           debouncedSearch ||
                           category !== "") && (
                           <Button
                              onClick={() => {
                                 setSearchInput("");
                                 setCategory("");
                              }}
                           >
                              Clear
                           </Button>
                        )}
                     </Stack>
                     {/* Quick category chips removed by request */}
                  </Box>

                  {/* Separate toolbar and grid with a horizontal line */}
                  <Divider
                     sx={{
                        my: 2,
                        borderColor: "grey.400",
                        opacity: 1,
                        width: "100%",
                        flexShrink: 0,
                     }}
                  />

                  {/* Summary line(s): Search and Category */}
                  {category && (
                     <Typography
                        variant="h6"
                        color="text.primary"
                        sx={{ fontWeight: 700 }}
                     >
                        Categories by: "{category}"
                     </Typography>
                  )}

                  {/* Grid */}
                  <ProjectGrid
                     projects={filteredProjects}
                     loading={loading}
                     error={error}
                     onProjectClick={handleProjectClick}
                     showCount={true}
                  />
               </Stack>
            </Box>
         </Container>
      </Box>
   );
};

export default ProjectGalleryPage;
