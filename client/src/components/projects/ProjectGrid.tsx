import React, { useState, useEffect } from "react";
import {
   Container,
   Typography,
   Box,
   Alert,
   Skeleton,
   Paper,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import ProjectCard from "./ProjectCard";
import { fetchProjects } from "../../api/projectApi";
import type { Project } from "../../types/project";

/**
 * ProjectGrid component displays a responsive grid of project cards
 * Handles loading, error states, and project selection
 */
const ProjectGrid: React.FC = () => {
   const [projects, setProjects] = useState<Project[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const loadProjects = async () => {
         try {
            setLoading(true);
            setError(null);
            const projectData = await fetchProjects();
            setProjects(projectData);
         } catch (err) {
            setError(
               err instanceof Error ? err.message : "Failed to load projects",
            );
            console.error("Error loading projects:", err);
         } finally {
            setLoading(false);
         }
      };

      loadProjects();
   }, []);

   const handleProjectClick = (project: Project) => {
      // TODO: Navigate to project detail page
      console.log("Navigate to project:", project._id);
   };

   // Loading skeleton component
   const ProjectSkeleton = () => (
      <Paper elevation={2} sx={{ height: "100%" }}>
         <Skeleton variant="rectangular" height={200} />
         <Box sx={{ p: 2 }}>
            <Skeleton variant="text" height={32} width="80%" />
            <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
            <Skeleton variant="text" height={60} />
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
               <Skeleton variant="rounded" width={80} height={24} />
               <Skeleton variant="rounded" width={100} height={24} />
            </Box>
         </Box>
      </Paper>
   );

   // Empty state component
   const EmptyState = () => (
      <Box
         sx={{
            textAlign: "center",
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
         }}
      >
         <SearchIcon sx={{ fontSize: 64, color: "text.secondary" }} />
         <Typography variant="h5" color="text.secondary">
            No Projects Found
         </Typography>
         <Typography variant="body1" color="text.secondary">
            There are currently no projects to display. Check back later!
         </Typography>
      </Box>
   );

   return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
         {/* Header */}
         <Box sx={{ mb: 4 }}>
            <Typography
               variant="h3"
               component="h1"
               gutterBottom
               sx={{
                  fontWeight: 700,
                  background:
                     "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
               }}
            >
               Student Projects
            </Typography>
         </Box>

         {/* Error State */}
         {error && (
            <Alert
               severity="error"
               sx={{ mb: 4 }}
               onClose={() => setError(null)}
            >
               {error}
            </Alert>
         )}

         {/* Loading State */}
         {loading && (
            <Box
               sx={{
                  display: "grid",
                  gridTemplateColumns: {
                     xs: "repeat(1, 1fr)",
                     sm: "repeat(2, 1fr)",
                     md: "repeat(3, 1fr)",
                     lg: "repeat(4, 1fr)",
                  },
                  gap: 3,
               }}
            >
               {Array.from(new Array(8)).map((_, index) => (
                  <ProjectSkeleton key={index} />
               ))}
            </Box>
         )}

         {/* Empty State */}
         {!loading && !error && projects.length === 0 && <EmptyState />}

         {/* Projects Grid */}
         {!loading && !error && projects.length > 0 && (
            <>
               <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
               >
                  Showing {projects.length} project
                  {projects.length !== 1 ? "s" : ""}
               </Typography>

               <Box
                  sx={{
                     display: "grid",
                     gridTemplateColumns: {
                        xs: "repeat(1, 1fr)",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: "repeat(4, 1fr)",
                     },
                     gap: 3,
                  }}
               >
                  {projects.map((project) => (
                     <ProjectCard
                        key={project._id}
                        project={project}
                        onClick={handleProjectClick}
                     />
                  ))}
               </Box>
            </>
         )}
      </Container>
   );
};

export default ProjectGrid;
