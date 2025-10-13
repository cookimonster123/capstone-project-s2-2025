import React, {
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react";
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
   Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProjectGrid from "../components/projects/ProjectGrid";
import { fetchProjects, fetchProjectById } from "../api/projectApi";
import type { Project } from "../types/project";
import { useDebounce } from "../hooks/useDebounce";
import { projectCache } from "../state/projectCache";

const ROWS_PER_PAGE = 9;

const ProjectGalleryMobilePage: React.FC = () => {
   // Local state
   const [projects, setProjects] = useState<Project[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   const [searchInput, setSearchInput] = useState("");
   const debouncedSearch = useDebounce(searchInput, 200);

   const [category, setCategory] = useState<string>("");
   const [year, setYear] = useState<string>("");
   const [semester, setSemester] = useState<string>("");
   const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
   const navigate = useNavigate();

   const [page, setPage] = useState(1);
   const [searchParams, setSearchParams] = useSearchParams();
   const initializedFromUrl = useRef(false);

   // Initialize search input and category from URL once
   useEffect(() => {
      if (initializedFromUrl.current) return;
      const tag = searchParams.get("tag");
      const q = searchParams.get("q");
      const cat = searchParams.get("category");
      if (tag) setSearchInput(tag);
      else if (q) setSearchInput(q);
      if (cat) setCategory(cat);
      initializedFromUrl.current = true;
   }, [searchParams]);

   // Keep URL in sync when category changes so landing clicks reflect in the UI
   useEffect(() => {
      // Avoid running before initial read
      if (!initializedFromUrl.current) return;
      const params = new URLSearchParams(searchParams);
      const current = params.get("category") ?? "";
      if (current === (category || "")) return;
      if (category) params.set("category", category);
      else params.delete("category");
      setSearchParams(params, { replace: true });
   }, [category]);

   // Load all projects
   useEffect(() => {
      let active = true;
      const load = async () => {
         try {
            setLoading(true);
            setError(null);
            const data = await fetchProjects();
            if (!active) return;
            setProjects(data);
            // derive categories
            const setCat = new Set<string>();
            data.forEach((p) => {
               if (p.category?.name) setCat.add(p.category.name);
            });
            setCategoryOptions(Array.from(setCat).sort());
         } catch (e) {
            if (!active) return;
            setError(
               e instanceof Error ? e.message : "Failed to load projects",
            );
         } finally {
            if (active) setLoading(false);
         }
      };
      load();
      return () => {
         active = false;
      };
   }, []);

   // Basic filters and search (same semantics as desktop)
   const filteredProjects = useMemo(() => {
      const search = debouncedSearch.trim().toLowerCase();
      const selectedCategory = category || null;
      const selectedYear = year ? Number(year) : null;
      const selectedSemester = semester || null;

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
         const catOk =
            !selectedCategory || p.category?.name === selectedCategory;
         const yearOk = !selectedYear || p.semester?.year === selectedYear;
         const semOk =
            !selectedSemester || p.semester?.semester === selectedSemester;
         if (!search) return catOk && yearOk && semOk;
         return (
            catOk &&
            yearOk &&
            semOk &&
            (hasTeamMatch(p) || hasKeywordMatch(p) || hasTagMatch(p))
         );
      });

      // Sort by semester recency (Year desc, S2>S1), then createdAt desc
      const s2 = (s?: string | null) => (s === "S2" ? 2 : s === "S1" ? 1 : 0);
      return filtered.sort((a, b) => {
         const ay = a.semester?.year ?? -Infinity;
         const by = b.semester?.year ?? -Infinity;
         if (by !== ay) return by - ay;
         const as = s2(a.semester?.semester ?? null);
         const bs = s2(b.semester?.semester ?? null);
         if (bs !== as) return bs - as;
         const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
         const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
         return bd - ad;
      });
   }, [projects, debouncedSearch, category, year, semester]);

   // Pagination
   const pagedProjects = useMemo(() => {
      const start = (page - 1) * ROWS_PER_PAGE;
      const end = start + ROWS_PER_PAGE;
      return filteredProjects.slice(start, end);
   }, [filteredProjects, page]);

   useEffect(() => {
      const totalPages = Math.ceil(filteredProjects.length / ROWS_PER_PAGE);
      if (totalPages === 0) {
         if (page !== 1) setPage(1);
         return;
      }
      if (page > totalPages) setPage(totalPages);
   }, [filteredProjects.length]);

   useEffect(() => {
      try {
         window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      } catch {
         window.scrollTo(0, 0);
      }
   }, [page]);

   const yearOptions = useMemo(() => {
      const s = new Set<number>();
      projects.forEach((p) => {
         const y = p.semester?.year;
         if (typeof y === "number") s.add(y);
      });
      return Array.from(s).sort((a, b) => b - a);
   }, [projects]);

   const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
         setSearchInput(e.target.value),
      [],
   );

   const handleProjectClick = useCallback(
      async (project: Project) => {
         try {
            const fresh = await fetchProjectById(project._id);
            if (fresh) projectCache.set(project._id, fresh);
            navigate(`/profile/${project._id}`);
         } catch (e) {
            // ignore for now
         }
      },
      [navigate],
   );

   return (
      <Container maxWidth={false} sx={{ px: 2, py: 3 }}>
         <Stack spacing={2.5}>
            <Box>
               <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Project Gallery
               </Typography>
               <Typography variant="body2" color="text.secondary">
                  Browse capstone projects
               </Typography>
            </Box>

            {/* Filters, stacked for mobile */}
            <Stack spacing={1.5}>
               <TextField
                  placeholder="Search projects, teams..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  InputProps={{
                     startAdornment: (
                        <InputAdornment position="start">
                           <SearchIcon sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                     ),
                  }}
                  fullWidth
               />

               <FormControl fullWidth>
                  <InputLabel id="m-cat-label">Category</InputLabel>
                  <Select
                     labelId="m-cat-label"
                     value={category}
                     onChange={(e) => setCategory(e.target.value)}
                     input={<OutlinedInput label="Category" />}
                  >
                     <MenuItem value="">
                        <em>Any</em>
                     </MenuItem>
                     {/* Provide a fallback item for the current category if it isn't in options yet */}
                     {category && !categoryOptions.includes(category) && (
                        <MenuItem value={category}>{category}</MenuItem>
                     )}
                     {categoryOptions.map((c) => (
                        <MenuItem key={c} value={c}>
                           {c}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>

               <FormControl fullWidth>
                  <InputLabel id="m-year-label">Year</InputLabel>
                  <Select
                     labelId="m-year-label"
                     value={year}
                     onChange={(e) => setYear(e.target.value)}
                     input={<OutlinedInput label="Year" />}
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

               <FormControl fullWidth>
                  <InputLabel id="m-sem-label">Semester</InputLabel>
                  <Select
                     labelId="m-sem-label"
                     value={semester}
                     onChange={(e) => setSemester(e.target.value)}
                     input={<OutlinedInput label="Semester" />}
                  >
                     <MenuItem value="">
                        <em>Any</em>
                     </MenuItem>
                     <MenuItem value="S1">S1</MenuItem>
                     <MenuItem value="S2">S2</MenuItem>
                  </Select>
               </FormControl>
            </Stack>

            {/* Grid */}
            <ProjectGrid
               projects={pagedProjects}
               loading={loading}
               error={error}
               onProjectClick={handleProjectClick}
               showCount={true}
            />

            {/* Pagination */}
            {Math.ceil(filteredProjects.length / ROWS_PER_PAGE) > 1 && (
               <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Pagination
                     count={Math.ceil(filteredProjects.length / ROWS_PER_PAGE)}
                     page={page}
                     onChange={(_e, value) => setPage(value)}
                     color="primary"
                     showFirstButton
                     showLastButton
                  />
               </Box>
            )}
         </Stack>
      </Container>
   );
};

export default ProjectGalleryMobilePage;
