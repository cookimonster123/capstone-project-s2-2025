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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { NAV_HEIGHT } from "../components/Navbar";
import { useDebounce } from "../hooks/useDebounce";
import { fetchProjects, fetchProjectById } from "../api/projectApi";
import type { Project } from "../types/project";
import { projectCache } from "../state/projectCache";
import { useNavigate, useSearchParams } from "react-router-dom";

// MUI-based gallery page that preserves search bar and filters while using ProjectGrid
const ProjectGalleryPage: React.FC = () => {
   // Separate input value and applied search term
   const [searchInput, setSearchInput] = useState("");
   const debouncedSearch = useDebounce(searchInput, 200);
   const [category, setCategory] = useState<string>("");
   const [year, setYear] = useState<string>("");
   const [semester, setSemester] = useState<string>("");
   const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
   const [openCat, setOpenCat] = useState(false);
   const [openYear, setOpenYear] = useState<boolean>(false);
   const [openSem, setOpenSem] = useState<boolean>(false);
   const [projects, setProjects] = useState<Project[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [searchParams, setSearchParams] = useSearchParams();
   const navigate = useNavigate();

   // Always start from top when entering the gallery
   useEffect(() => {
      try {
         window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
         window.scrollTo(0, 0);
      }
   }, []);

   useEffect(() => {
      const tag = searchParams.get("tag");
      const q = searchParams.get("q");
      if (tag) {
         setSearchInput(tag);
      } else if (q) {
         setSearchInput(q);
      }
   }, [searchParams]);

   // Initialize category from URL on load / when url changes
   useEffect(() => {
      const cat = searchParams.get("category") ?? "";
      if (cat && cat !== category) {
         setCategory(cat);
      }
   }, [searchParams]);

   // Keep URL in sync when category changes (so clicking from landing passes through)
   useEffect(() => {
      const current = searchParams.get("category") ?? "";
      if (current === (category || "")) return;
      const params = new URLSearchParams(searchParams);
      if (category) params.set("category", category);
      else params.delete("category");
      setSearchParams(params, { replace: true });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [category]);

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

   const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
         const val = e.target.value;
         setSearchInput(val);

         const params = new URLSearchParams(searchParams);
         if (val.trim()) {
            params.set("q", val.trim());
            params.delete("tag");
         } else {
            params.delete("q");
            params.delete("tag");
         }
         setSearchParams(params, { replace: true });
      },
      [searchParams, setSearchParams],
   );

   // Filter data
   const filteredProjects = useMemo(() => {
      const search = debouncedSearch.trim().toLowerCase();
      const selectedCategory = category === "" ? null : category;
      const selectedYear = year === "" ? null : Number(year);
      const selectedSemester = semester === "" ? null : semester;

      // tag / keyword / team helpers
      const hasTagMatch = (p: Project) =>
         (p.tags ?? []).some((t) => t.name.toLowerCase().includes(search));

      const hasKeywordMatch = (p: Project) => {
         const name = p.name?.toLowerCase() ?? "";
         const description = p.description?.toLowerCase() ?? "";
         return (
            !search || name.includes(search) || description.includes(search)
         );
      };

      const hasTeamMatch = (p: Project) => {
         const team = p.team?.name?.toLowerCase() ?? "";
         return !search || team.includes(search);
      };

      const filtered = projects.filter((p) => {
         const matchesCategory =
            !selectedCategory || p.category?.name === selectedCategory;

         const matchesYear = !selectedYear || p.semester?.year === selectedYear;

         const matchesSemester =
            !selectedSemester || p.semester?.semester === selectedSemester;

         if (!search) return matchesCategory && matchesYear && matchesSemester;

         const anyMatch =
            hasTeamMatch(p) || hasKeywordMatch(p) || hasTagMatch(p);
         return matchesCategory && matchesYear && matchesSemester && anyMatch;
      });

      if (!search) return filtered;

      // team > keyword > tag
      const scored = filtered
         .map((p) => {
            const team = search
               ? (p.team?.name?.toLowerCase() ?? "").includes(search)
               : false;
            const keyword = search
               ? p.name?.toLowerCase().includes(search) ||
                 (p.description?.toLowerCase() ?? "").includes(search)
               : false;
            const tag = search ? hasTagMatch(p) : false;

            const score: [number, number, number] = [
               team ? 1 : 0,
               keyword ? 1 : 0,
               tag ? 1 : 0,
            ];
            return { p, score };
         })
         .sort((a, b) => {
            if (b.score[0] !== a.score[0]) return b.score[0] - a.score[0]; // team
            if (b.score[1] !== a.score[1]) return b.score[1] - a.score[1]; // keyword
            if (b.score[2] !== a.score[2]) return b.score[2] - a.score[2]; // tag
            return (a.p.name || "").localeCompare(b.p.name || ""); // stable fallback
         })
         .map((x) => x.p);

      return scored;
   }, [projects, debouncedSearch, category, year, semester]);

   const yearOptions = useMemo(() => {
      const years = new Set<number>();
      for (const p of projects) {
         const y = p.semester?.year;
         if (typeof y === "number") years.add(y);
      }
      return Array.from(years).sort((a, b) => b - a);
   }, [projects]);

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

                  {/* Filter toolbar*/}
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
                        alignItems={{ xs: "stretch", md: "center" }}
                        justifyContent="space-between"
                        spacing={2}
                        sx={{ width: "100%" }}
                     >
                        <Box sx={{ flex: 1, minWidth: 280 }}>
                           <TextField
                              placeholder="Search projects, teams or keywords..."
                              value={searchInput}
                              onChange={handleSearchChange}
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
                                    { borderColor: "rgba(0,0,0,0.87)" },
                              }}
                           />
                        </Box>

                        <Stack
                           direction="row"
                           spacing={2}
                           alignItems="center"
                           flexShrink={0}
                           sx={{
                              flexWrap: { xs: "wrap", md: "nowrap" },
                              rowGap: 1,
                           }}
                        >
                           <FormControl
                              variant="outlined"
                              sx={{
                                 minWidth: 180,
                                 "& .MuiInputLabel-root:not(.MuiInputLabel-shrink) + .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline legend":
                                    { width: 0 },
                                 "& .MuiOutlinedInput-notchedOutline": {
                                    borderWidth: "2px",
                                 },
                                 "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    { borderWidth: "2px" },
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
                                 <MenuItem value="">
                                    <em>Any</em>
                                 </MenuItem>
                                 {categoryOptions.map((c) => (
                                    <MenuItem key={c} value={c}>
                                       {c}
                                    </MenuItem>
                                 ))}
                              </Select>
                           </FormControl>

                           <FormControl
                              variant="outlined"
                              sx={{
                                 minWidth: 180,
                                 "& .MuiInputLabel-root:not(.MuiInputLabel-shrink) ~ .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline legend":
                                    { width: 0 },
                                 "& .MuiOutlinedInput-notchedOutline": {
                                    borderWidth: "2px",
                                 },
                                 "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    { borderWidth: "2px" },
                              }}
                           >
                              <InputLabel
                                 id="year-label"
                                 shrink={Boolean(year) || openYear}
                                 sx={{
                                    "&.Mui-focused": (theme) => ({
                                       color:
                                          Boolean(year) || openYear
                                             ? theme.palette.primary.main
                                             : theme.palette.text.secondary,
                                    }),
                                    "&:not(.MuiInputLabel-shrink)": (
                                       theme,
                                    ) => ({
                                       color: theme.palette.text.primary,
                                       fontWeight: 400,
                                    }),
                                 }}
                              >
                                 Year
                              </InputLabel>
                              <Select
                                 value={year}
                                 onChange={(e) => setYear(e.target.value)}
                                 labelId="year-label"
                                 label="Year"
                                 displayEmpty
                                 open={openYear}
                                 onOpen={() => setOpenYear(true)}
                                 onClose={() => {
                                    setOpenYear(false);
                                    requestAnimationFrame(() =>
                                       (
                                          document.activeElement as HTMLElement | null
                                       )?.blur?.(),
                                    );
                                 }}
                                 input={
                                    <OutlinedInput
                                       label="Year"
                                       notched={Boolean(year) || openYear}
                                       sx={{
                                          "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                             {
                                                borderColor:
                                                   Boolean(year) || openYear
                                                      ? undefined
                                                      : "rgba(0,0,0,0.23)",
                                                borderWidth:
                                                   Boolean(year) || openYear
                                                      ? undefined
                                                      : "1px",
                                             },
                                       }}
                                    />
                                 }
                                 renderValue={(selected) =>
                                    selected ? (
                                       (selected as React.ReactNode)
                                    ) : openYear ? (
                                       <span style={{ color: "#9aa0a6" }}>
                                          Year
                                       </span>
                                    ) : null
                                 }
                              >
                                 <MenuItem value="">
                                    <em>Any</em>
                                 </MenuItem>
                                 {yearOptions.map((y) => (
                                    <MenuItem key={y} value={String(y)}>
                                       {y}
                                    </MenuItem>
                                 ))}
                              </Select>
                           </FormControl>

                           <FormControl
                              variant="outlined"
                              sx={{
                                 minWidth: 180,
                                 "& .MuiInputLabel-root:not(.MuiInputLabel-shrink) ~ .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline legend":
                                    { width: 0 },
                                 "& .MuiOutlinedInput-notchedOutline": {
                                    borderWidth: "2px",
                                 },
                                 "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    { borderWidth: "2px" },
                              }}
                           >
                              <InputLabel
                                 id="semester-label"
                                 shrink={Boolean(semester) || openSem}
                                 sx={{
                                    "&.Mui-focused": (theme) => ({
                                       color:
                                          Boolean(semester) || openSem
                                             ? theme.palette.primary.main
                                             : theme.palette.text.secondary,
                                    }),
                                    "&:not(.MuiInputLabel-shrink)": (
                                       theme,
                                    ) => ({
                                       color: theme.palette.text.primary,
                                       fontWeight: 400,
                                    }),
                                 }}
                              >
                                 Semester
                              </InputLabel>
                              <Select
                                 value={semester}
                                 onChange={(e) => setSemester(e.target.value)}
                                 labelId="semester-label"
                                 label="Semester"
                                 displayEmpty
                                 open={openSem}
                                 onOpen={() => setOpenSem(true)}
                                 onClose={() => {
                                    setOpenSem(false);
                                    requestAnimationFrame(() =>
                                       (
                                          document.activeElement as HTMLElement | null
                                       )?.blur?.(),
                                    );
                                 }}
                                 input={
                                    <OutlinedInput
                                       label="Semester"
                                       notched={Boolean(semester) || openSem}
                                       sx={{
                                          "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                             {
                                                borderColor:
                                                   Boolean(semester) || openSem
                                                      ? undefined
                                                      : "rgba(0,0,0,0.23)",
                                                borderWidth:
                                                   Boolean(semester) || openSem
                                                      ? undefined
                                                      : "1px",
                                             },
                                       }}
                                    />
                                 }
                                 renderValue={(selected) =>
                                    selected ? (
                                       (selected as React.ReactNode)
                                    ) : openSem ? (
                                       <span style={{ color: "#9aa0a6" }}>
                                          Semester
                                       </span>
                                    ) : null
                                 }
                              >
                                 <MenuItem value="">
                                    <em>Any</em>
                                 </MenuItem>
                                 <MenuItem value="S1">S1</MenuItem>
                                 <MenuItem value="S2">S2</MenuItem>
                              </Select>
                           </FormControl>
                        </Stack>
                     </Stack>
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
