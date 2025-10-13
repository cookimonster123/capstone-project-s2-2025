import React, {
   useMemo,
   useState,
   useCallback,
   useEffect,
   useRef,
} from "react";
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
   Pagination,
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
   const [reducedMotion, setReducedMotion] = useState(false);
   // Gallery pagination
   const [page, setPage] = useState(1);
   const rowsPerPage = 9;

   // Always start from top when entering the gallery
   useEffect(() => {
      try {
         window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
         window.scrollTo(0, 0);
      }
   }, []);

   // Observe prefers-reduced-motion to optionally disable background animations
   useEffect(() => {
      if (typeof window === "undefined" || !window.matchMedia) return;
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
      const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      try {
         mq.addEventListener("change", onChange);
         return () => mq.removeEventListener("change", onChange);
      } catch {
         // Safari fallback
         (mq as any).addListener(onChange);
         return () => {
            (mq as any).removeListener(onChange);
         };
      }
   }, []);

   // Initialize search input from URL only once (avoid overwriting while typing)
   const initializedFromUrl = useRef(false);
   useEffect(() => {
      if (initializedFromUrl.current) return;
      const tag = searchParams.get("tag");
      const q = searchParams.get("q");
      if (tag) {
         setSearchInput(tag);
      } else if (q) {
         setSearchInput(q);
      }
      initializedFromUrl.current = true;
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
         // Update only local state for immediate input responsiveness.
         setSearchInput(e.target.value);
      },
      [],
   );

   // Sync debounced search value into the URL (?q=) to avoid router churn per keystroke
   useEffect(() => {
      const nextQ = debouncedSearch.trim();
      const currentQ = searchParams.get("q") ?? "";
      const params = new URLSearchParams(searchParams);
      if (nextQ) {
         if (nextQ !== currentQ) {
            params.set("q", nextQ);
            params.delete("tag");
            setSearchParams(params, { replace: true });
         }
      } else if (currentQ) {
         params.delete("q");
         params.delete("tag");
         setSearchParams(params, { replace: true });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [debouncedSearch]);

   // Filter data
   const filteredProjects = useMemo(() => {
      const cmpBySemester = (a: Project, b: Project) => {
         const ay = a.semester?.year ?? -Infinity;
         const by = b.semester?.year ?? -Infinity;
         if (by !== ay) return by - ay; // year desc

         const as =
            a.semester?.semester === "S2"
               ? 2
               : a.semester?.semester === "S1"
                 ? 1
                 : 0;
         const bs =
            b.semester?.semester === "S2"
               ? 2
               : b.semester?.semester === "S1"
                 ? 1
                 : 0;
         if (bs !== as) return bs - as; // S2 before S1

         const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
         const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
         return bd - ad; // newer first
      };
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

      if (!search) return filtered.sort(cmpBySemester);

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
            // When scores are equal, sort by Year desc, Semester (S2>S1), then createdAt desc
            return cmpBySemester(a.p, b.p);
         })
         .map((x) => x.p);

      return scored;
   }, [projects, debouncedSearch, category, year, semester]);

   // Derive paginated slice (client-side)
   const pagedProjects = useMemo(() => {
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      return filteredProjects.slice(start, end);
   }, [filteredProjects, page]);

   // Clamp page if filters change and current page is out of range
   useEffect(() => {
      const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
      if (totalPages === 0) {
         if (page !== 1) setPage(1);
         return;
      }
      if (page > totalPages) setPage(totalPages);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filteredProjects.length]);

   // Handle pagination with scroll to top
   const handlePageChange = useCallback(
      (_e: React.ChangeEvent<unknown>, value: number) => {
         setPage(value);
      },
      [],
   );

   // Scroll to top when page changes (after state update)
   useEffect(() => {
      // Skip scroll on initial load
      if (page === 1 && filteredProjects.length === 0) return;

      // Scroll to top when page changes
      try {
         window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      } catch {
         window.scrollTo(0, 0);
      }
   }, [page]); // Only run when page changes

   const yearOptions = useMemo(() => {
      const years = new Set<number>();
      for (const p of projects) {
         const y = p.semester?.year;
         if (typeof y === "number") years.add(y);
      }
      return Array.from(years).sort((a, b) => b - a);
   }, [projects]);

   // Precompute decorative animation configs to avoid remounting on each render
   const rand = (min: number, max: number) => Math.random() * (max - min) + min;
   const glowCfgs = useMemo(() => {
      const colors = ["0,102,204", "14,165,233", "56,189,248"];
      const count = 5; // slightly reduced for perf
      return Array.from({ length: count }).map((_, i) => {
         const w = Math.round(rand(150, 400));
         const h = Math.round(rand(150, 400));
         const color = colors[i % colors.length];
         const opacity = parseFloat(rand(0.1, 0.18).toFixed(2));
         return {
            w,
            h,
            color,
            opacity,
            top: `${Math.round(rand(0, 100))}%`,
            left: `${Math.round(rand(0, 100))}%`,
            dur: Math.round(rand(30, 70)),
            delay: parseFloat(rand(0, 10).toFixed(2)),
            dx1: Math.round(rand(-100, 100)),
            dy1: Math.round(rand(-100, 100)),
            dx2: Math.round(rand(-150, 150)),
            dy2: Math.round(rand(-80, 160)),
            s1: 1.3,
            s2: 0.9,
         };
      });
   }, []);

   const particleCfgs = useMemo(() => {
      const colors = ["#06c", "#0ea5e9", "#38bdf8"];
      const count = 15; // reduced for perf
      return Array.from({ length: count }).map((_, i) => {
         const color = colors[i % colors.length];
         return {
            w: Math.round(rand(2, 7)),
            h: Math.round(rand(2, 7)),
            color,
            op: parseFloat(rand(0.2, 0.5).toFixed(2)),
            top: `${Math.round(rand(0, 100))}%`,
            left: `${Math.round(rand(0, 100))}%`,
            blur: Math.round(rand(8, 23)),
            twinkle: parseFloat(rand(2, 6).toFixed(2)),
            floatDur: Math.round(rand(15, 35)),
            delay: parseFloat(rand(0, 5).toFixed(2)),
            dxA: Math.round(rand(-30, 30)),
            dyA: Math.round(rand(-70, -10)),
            dxB: Math.round(rand(-40, 40)),
            dyB: Math.round(rand(-100, -20)),
            dxC: Math.round(rand(-20, 20)),
            dyC: Math.round(rand(-50, -10)),
         };
      });
   }, []);

   const meteorCfgs = useMemo(() => {
      const count = 3; // reduced for perf
      return Array.from({ length: count }).map((_, i) => ({
         h: Math.round(rand(120, 300)),
         left: `${15 + i * 25}%`,
         dur: parseFloat(rand(2.5, 4.5).toFixed(2)),
         delay: parseFloat((i * 3 + rand(0, 4)).toFixed(2)),
      }));
   }, []);

   const handleProjectClick = async (project: Project) => {
      try {
         // Fetch fresh project data to ensure we have the latest information
         const freshProject = await fetchProjectById(project._id);

         // Cache the project for better performance if present
         if (freshProject) {
            projectCache.set(project._id, freshProject);
         }

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
            bgcolor: "background.default",
            mx: -3,
            px: 3,
            overflowX: "clip",
            minHeight: `calc(100dvh - ${NAV_HEIGHT}px)`,
            pb: 6,
            mb: -6,
            position: "relative",
            "&::before": {
               content: '""',
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background: `
                  radial-gradient(circle 1000px at 25% 15%, rgba(0,102,204,0.12), transparent),
                  radial-gradient(circle 800px at 75% 50%, rgba(14,165,233,0.09), transparent),
                  radial-gradient(circle 600px at 50% 80%, rgba(56,189,248,0.07), transparent)
               `,
               animation: reducedMotion
                  ? "none"
                  : "backgroundPulse 12s ease-in-out infinite",
               pointerEvents: "none",
               zIndex: 0,
               "@keyframes backgroundPulse": {
                  "0%, 100%": {
                     opacity: 1,
                     transform: "scale(1) rotate(0deg)",
                  },
                  "50%": {
                     opacity: 0.8,
                     transform: "scale(1.1) rotate(2deg)",
                  },
               },
            },
            "&::after": {
               content: '""',
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background: `
                  linear-gradient(90deg, rgba(0,102,204,0.03) 2px, transparent 2px),
                  linear-gradient(rgba(0,102,204,0.03) 2px, transparent 2px)
               `,
               backgroundSize: "80px 80px",
               opacity: 0.5,
               pointerEvents: "none",
               zIndex: 0,
               animation: reducedMotion
                  ? "none"
                  : "gridFlow 25s linear infinite",
               "@keyframes gridFlow": {
                  "0%": { transform: "translate(0, 0)" },
                  "100%": { transform: "translate(80px, 80px)" },
               },
            },
         }}
      >
         {/* 光晕装饰 - 改为fixed全屏 */}
         <Box
            sx={{
               position: "fixed",
               top: 0,
               left: 0,
               width: "100%",
               height: "100vh",
               pointerEvents: "none",
               zIndex: 0,
               overflow: "hidden",
            }}
         >
            {/* 发光大球（稳定配置） */}
            {glowCfgs.map((g, i) => (
               <Box
                  key={`glow-${i}`}
                  sx={{
                     position: "absolute",
                     width: `${g.w}px`,
                     height: `${g.h}px`,
                     borderRadius: "50%",
                     background: `radial-gradient(circle, rgba(${g.color}, ${g.opacity}), transparent)`,
                     filter: "blur(60px)",
                     top: g.top,
                     left: g.left,
                     "--dx1": `${g.dx1}px`,
                     "--dy1": `${g.dy1}px`,
                     "--dx2": `${g.dx2}px`,
                     "--dy2": `${g.dy2}px`,
                     "--s1": g.s1,
                     "--s2": g.s2,
                     animation: reducedMotion
                        ? "none"
                        : `glowFloatVar ${g.dur}s ease-in-out infinite`,
                     animationDelay: `${g.delay}s`,
                     "@keyframes glowFloatVar": {
                        "0%, 100%": { transform: "translate(0, 0) scale(1)" },
                        "33%": {
                           transform:
                              "translate(var(--dx1), var(--dy1)) scale(var(--s1))",
                        },
                        "66%": {
                           transform:
                              "translate(var(--dx2), var(--dy2)) scale(var(--s2))",
                        },
                     },
                  }}
               />
            ))}

            {/* 闪烁粒子（稳定配置） */}
            {particleCfgs.map((p, i) => (
               <Box
                  key={`particle-${i}`}
                  sx={{
                     position: "absolute",
                     width: `${p.w}px`,
                     height: `${p.h}px`,
                     borderRadius: "50%",
                     bgcolor: p.color,
                     opacity: p.op,
                     top: p.top,
                     left: p.left,
                     boxShadow: `0 0 ${p.blur}px currentColor`,
                     "--dxA": `${p.dxA}px`,
                     "--dyA": `${p.dyA}px`,
                     "--dxB": `${p.dxB}px`,
                     "--dyB": `${p.dyB}px`,
                     "--dxC": `${p.dxC}px`,
                     "--dyC": `${p.dyC}px`,
                     animation: reducedMotion
                        ? "none"
                        : `twinkle ${p.twinkle}s ease-in-out infinite, float3dVar ${p.floatDur}s ease-in-out infinite`,
                     animationDelay: `${p.delay}s`,
                     "@keyframes twinkle": {
                        "0%, 100%": { opacity: 0.2 },
                        "50%": { opacity: 0.8 },
                     },
                     "@keyframes float3dVar": {
                        "0%, 100%": {
                           transform: "translate(0, 0) rotate(0deg)",
                        },
                        "25%": {
                           transform:
                              "translate(var(--dxA), var(--dyA)) rotate(90deg)",
                        },
                        "50%": {
                           transform:
                              "translate(var(--dxB), var(--dyB)) rotate(180deg)",
                        },
                        "75%": {
                           transform:
                              "translate(var(--dxC), var(--dyC)) rotate(270deg)",
                        },
                     },
                  }}
               />
            ))}

            {/* 流星效果（稳定配置） */}
            {meteorCfgs.map((m, i) => (
               <Box
                  key={`meteor-${i}`}
                  sx={{
                     position: "absolute",
                     width: "3px",
                     height: `${m.h}px`,
                     background:
                        "linear-gradient(180deg, transparent, rgba(0, 102, 204, 0.5), transparent)",
                     top: "-200px",
                     left: m.left,
                     animation: reducedMotion
                        ? "none"
                        : `meteorFallVar ${m.dur}s ease-in infinite`,
                     animationDelay: `${m.delay}s`,
                     transform: "rotate(20deg)",
                     "@keyframes meteorFallVar": {
                        "0%": {
                           transform: "translateY(0) rotate(20deg) scaleY(0)",
                           opacity: 0,
                        },
                        "10%": { opacity: 1 },
                        "90%": { opacity: 0.6 },
                        "100%": {
                           transform:
                              "translateY(130vh) rotate(20deg) scaleY(1)",
                           opacity: 0,
                        },
                     },
                  }}
               />
            ))}
         </Box>

         <Container
            maxWidth={false}
            sx={{
               py: 6,
               px: 0,
               textAlign: "left",
               position: "relative",
               zIndex: 1,
            }}
         >
            <Box
               sx={{
                  width: "100%",
                  maxWidth: 1750,
                  mx: "auto",
                  pl: { xs: 1, sm: 1.5, md: 2 },
                  pr: { xs: 2, sm: 2.5, md: 3 },
                  boxSizing: "border-box",
               }}
            >
               <Stack spacing={3} sx={{ width: "100%" }}>
                  {/* Page header */}
                  <Box sx={{ textAlign: "left", width: "100%", mb: 2 }}>
                     <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                           fontWeight: 600,
                           fontSize: { xs: 32, md: 40, lg: 48 },
                           color: "text.primary",
                           letterSpacing: "-0.02em",
                           mb: 1.5,
                           background: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "linear-gradient(135deg, #e8eaf0 0%, #0099ff 100%)"
                                 : "linear-gradient(135deg, #1d1d1f 0%, #06c 100%)",
                           WebkitBackgroundClip: "text",
                           WebkitTextFillColor: "transparent",
                           backgroundClip: "text",
                        }}
                     >
                        Project Gallery
                     </Typography>
                     <Typography
                        variant="body1"
                        sx={{
                           color: "text.secondary",
                           fontSize: { xs: 15, md: 17 },
                           letterSpacing: "-0.01em",
                        }}
                     >
                        Explore amazing capstone projects created by students
                     </Typography>
                  </Box>

                  {/* Filter toolbar*/}
                  <Box
                     sx={{
                        position: "sticky",
                        top: NAV_HEIGHT + 12,
                        zIndex: 10,
                        width: "100%",
                        bgcolor: (theme) =>
                           theme.palette.mode === "dark"
                              ? "rgba(20,24,36,0.8)"
                              : "rgba(251,251,253,0.8)",
                        backdropFilter: "saturate(180%) blur(20px)",
                        borderRadius: 2.5,
                        border: (theme) =>
                           theme.palette.mode === "dark"
                              ? "1px solid #2d3548"
                              : "1px solid #e5e5e7",
                        p: { xs: 2, md: 2.5 },
                        boxShadow: (theme) =>
                           theme.palette.mode === "dark"
                              ? "0 4px 16px rgba(0,0,0,0.3)"
                              : "0 4px 16px rgba(0,0,0,0.06)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                           boxShadow: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "0 8px 24px rgba(0,0,0,0.5)"
                                 : "0 8px 24px rgba(0,0,0,0.1)",
                        },
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
                                       <SearchIcon
                                          sx={{ color: "text.secondary" }}
                                       />
                                    </InputAdornment>
                                 ),
                              }}
                              fullWidth
                              sx={{
                                 "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    bgcolor: (theme) =>
                                       theme.palette.mode === "dark"
                                          ? "#1a1f2e"
                                          : "#ffffff",
                                    position: "relative",
                                    overflow: "hidden",
                                    transition:
                                       "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    boxShadow: (theme) =>
                                       theme.palette.mode === "dark"
                                          ? "0 2px 8px rgba(0,0,0,0.3)"
                                          : "0 2px 8px rgba(0,0,0,0.04)",
                                    // 扫光效果
                                    "&::before": {
                                       content: '""',
                                       position: "absolute",
                                       top: 0,
                                       left: "-100%",
                                       width: "100%",
                                       height: "100%",
                                       background: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "linear-gradient(90deg, transparent, rgba(0,153,255,0.15), transparent)"
                                             : "linear-gradient(90deg, transparent, rgba(0,102,204,0.1), transparent)",
                                       transition: "left 0.6s ease",
                                       pointerEvents: "none",
                                    },
                                    "&:hover": {
                                       boxShadow: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "0 4px 16px rgba(0,0,0,0.5)"
                                             : "0 4px 16px rgba(0,0,0,0.08)",
                                       transform: "translateY(-1px)",
                                       "&::before": {
                                          left: "100%",
                                       },
                                    },
                                    "&.Mui-focused": {
                                       boxShadow: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "0 0 0 4px rgba(0,153,255,0.2), 0 8px 24px rgba(0,153,255,0.3), 0 0 20px rgba(0,153,255,0.2)"
                                             : "0 0 0 4px rgba(0,102,204,0.12), 0 8px 24px rgba(0,102,204,0.2), 0 0 20px rgba(0,102,204,0.15)",
                                       transform:
                                          "translateY(-2px) scale(1.01)",
                                       "&::after": {
                                          content: '""',
                                          position: "absolute",
                                          inset: "-3px",
                                          borderRadius: "inherit",
                                          background: (theme) =>
                                             theme.palette.mode === "dark"
                                                ? "linear-gradient(45deg, #0099ff, #00d4ff, #0099ff)"
                                                : "linear-gradient(45deg, #06c, #0ea5e9, #06c)",
                                          backgroundSize: "200% 200%",
                                          opacity: 0.3,
                                          zIndex: -1,
                                          animation:
                                             "borderPulse 3s ease-in-out infinite",
                                       },
                                       "@keyframes borderPulse": {
                                          "0%, 100%": {
                                             backgroundPosition: "0% 50%",
                                             opacity: 0.3,
                                          },
                                          "50%": {
                                             backgroundPosition: "100% 50%",
                                             opacity: 0.5,
                                          },
                                       },
                                    },
                                 },
                                 "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: (theme) =>
                                       theme.palette.mode === "dark"
                                          ? "#2d3548"
                                          : "#e5e5e7",
                                    borderWidth: "1.5px",
                                 },
                                 "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                                    {
                                       borderColor: "primary.main",
                                    },
                                 "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                       borderColor: "primary.main",
                                       borderWidth: "2px",
                                    },
                                 "& .MuiInputBase-input": {
                                    color: "text.primary",
                                    fontSize: 15,
                                    fontWeight: 500,
                                 },
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
                                 "& .MuiOutlinedInput-root": {
                                    borderRadius: 1.5,
                                    bgcolor: (theme) =>
                                       theme.palette.mode === "dark"
                                          ? "#1a1f2e"
                                          : "#ffffff",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                       bgcolor: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "#22293a"
                                             : "#fafafa",
                                    },
                                    "&.Mui-focused": {
                                       bgcolor: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "#1a1f2e"
                                             : "#ffffff",
                                       boxShadow: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "0 0 0 3px rgba(0,153,255,0.2)"
                                             : "0 0 0 3px rgba(0,113,227,0.1)",
                                    },
                                 },
                                 "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: (theme) =>
                                       theme.palette.mode === "dark"
                                          ? "#2d3548"
                                          : "#d2d2d7",
                                 },
                                 "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                                    {
                                       borderColor: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "#4a5568"
                                             : "#86868b",
                                    },
                                 "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                       borderColor: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "#0099ff"
                                             : "#06c",
                                       borderWidth: "2px",
                                    },
                                 "& .MuiInputLabel-root": {
                                    color: "text.secondary",
                                    fontSize: 15,
                                 },
                                 "& .MuiSelect-select": {
                                    color: "text.primary",
                                    fontSize: 15,
                                 },
                                 "& .MuiInputLabel-root:not(.MuiInputLabel-shrink) ~ .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline legend":
                                    { width: 0 },
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
                                       (selected as React.ReactNode)
                                    ) : openCat ? (
                                       <span style={{ color: "#9aa0a6" }}>
                                          Category
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
                                 "& .MuiOutlinedInput-root": {
                                    borderRadius: 1.5,
                                    bgcolor: (theme) =>
                                       theme.palette.mode === "dark"
                                          ? "#1a1f2e"
                                          : "#ffffff",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                       bgcolor: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "#22293a"
                                             : "#fafafa",
                                    },
                                    "&.Mui-focused": {
                                       bgcolor: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "#1a1f2e"
                                             : "#ffffff",
                                       boxShadow: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "0 0 0 3px rgba(0,153,255,0.2)"
                                             : "0 0 0 3px rgba(0,113,227,0.1)",
                                    },
                                 },
                                 "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: (theme) =>
                                       theme.palette.mode === "dark"
                                          ? "#2d3548"
                                          : "#d2d2d7",
                                 },
                                 "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                                    {
                                       borderColor: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "#4a5568"
                                             : "#86868b",
                                    },
                                 "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                       borderColor: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "#0099ff"
                                             : "#06c",
                                       borderWidth: "2px",
                                    },
                                 "& .MuiInputLabel-root": {
                                    color: "text.secondary",
                                    fontSize: 15,
                                 },
                                 "& .MuiSelect-select": {
                                    color: "text.primary",
                                    fontSize: 15,
                                 },
                                 "& .MuiInputLabel-root:not(.MuiInputLabel-shrink) ~ .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline legend":
                                    { width: 0 },
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
                                 "& .MuiOutlinedInput-root": {
                                    borderRadius: 1.5,
                                    bgcolor: (theme) =>
                                       theme.palette.mode === "dark"
                                          ? "#1a1f2e"
                                          : "#ffffff",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                       bgcolor: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "#22293a"
                                             : "#fafafa",
                                    },
                                    "&.Mui-focused": {
                                       bgcolor: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "#1a1f2e"
                                             : "#ffffff",
                                       boxShadow: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "0 0 0 3px rgba(0,153,255,0.2)"
                                             : "0 0 0 3px rgba(0,113,227,0.1)",
                                    },
                                 },
                                 "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: (theme) =>
                                       theme.palette.mode === "dark"
                                          ? "#2d3548"
                                          : "#d2d2d7",
                                 },
                                 "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                                    {
                                       borderColor: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "#4a5568"
                                             : "#86868b",
                                    },
                                 "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                       borderColor: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "#0099ff"
                                             : "#06c",
                                       borderWidth: "2px",
                                    },
                                 "& .MuiInputLabel-root": {
                                    color: "text.secondary",
                                    fontSize: 15,
                                 },
                                 "& .MuiSelect-select": {
                                    color: "text.primary",
                                    fontSize: 15,
                                 },
                                 "& .MuiInputLabel-root:not(.MuiInputLabel-shrink) ~ .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline legend":
                                    { width: 0 },
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
                     projects={pagedProjects}
                     loading={loading}
                     error={error}
                     onProjectClick={handleProjectClick}
                     showCount={true}
                  />

                  {/* Pagination */}
                  {Math.ceil(filteredProjects.length / rowsPerPage) > 1 && (
                     <Box
                        sx={{
                           display: "flex",
                           justifyContent: "center",
                           mt: 3,
                        }}
                     >
                        <Pagination
                           count={Math.ceil(
                              filteredProjects.length / rowsPerPage,
                           )}
                           page={page}
                           onChange={handlePageChange}
                           color="primary"
                           showFirstButton
                           showLastButton
                        />
                     </Box>
                  )}
               </Stack>
            </Box>
         </Container>
      </Box>
   );
};

export default ProjectGalleryPage;
