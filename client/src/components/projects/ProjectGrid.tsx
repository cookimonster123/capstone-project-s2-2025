import React, { useState } from "react";
import { Typography, Box, Alert, Skeleton, Paper, Grow } from "@mui/material";
import { SentimentDissatisfied as SadIcon } from "@mui/icons-material";
import ProjectCard from "./ProjectCard";
import type { Project } from "../../types/project";

export interface ProjectGridProps {
   projects: Project[]; // Pre-filtered projects
   loading?: boolean; // Loading state from parent
   error?: string | null; // Error state from parent
   onProjectClick: (project: Project) => void;
   showCount?: boolean;
}

/**
 * ProjectGrid - A responsive grid component for displaying project cards
 *
 * This is a pure presentation component that renders a grid of project cards
 * with support for loading states, error handling, and user interactions.
 * All data fetching and filtering should be handled by parent components.
 *
 * @param props - The component props
 * @param props.projects - Array of pre-filtered projects to display
 * @param props.loading - Optional loading state from parent component
 * @param props.error - Optional error message from parent component
 * @param props.onProjectClick - Callback function when a project card is clicked
 * @param props.showCount - Whether to display the project count (defaults to true)
 *
 * @returns A responsive grid of project cards with loading and error states
 *
 * @example
 * ```tsx
 * <ProjectGrid
 *   projects={filteredProjects}
 *   loading={isLoading}
 *   error={errorMessage}
 *   onProjectClick={handleProjectClick}
 *   showCount={true}
 * />
 * ```
 */
const ProjectGrid: React.FC<ProjectGridProps> = ({
   projects,
   loading = false,
   error = null,
   onProjectClick,
   showCount = true,
}) => {
   const [navError, setNavError] = useState<string | null>(null);

   // Loading skeleton component
   const ProjectSkeleton = () => (
      <Paper
         elevation={1}
         sx={{ height: "100%", overflow: "hidden", borderRadius: 2 }}
      >
         <Skeleton variant="rectangular" height={200} animation="wave" />
         <Box sx={{ p: 2 }}>
            <Skeleton variant="text" height={28} width="76%" animation="wave" />
            <Skeleton
               variant="text"
               height={20}
               width="58%"
               sx={{ mb: 1 }}
               animation="wave"
            />
            <Skeleton variant="text" height={56} animation="wave" />
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
               <Skeleton
                  variant="rounded"
                  width={80}
                  height={24}
                  animation="wave"
               />
               <Skeleton
                  variant="rounded"
                  width={100}
                  height={24}
                  animation="wave"
               />
            </Box>
         </Box>
      </Paper>
   );

   // Empty state component
   const EmptyState = () => {
      return (
         <Paper
            elevation={0}
            sx={{
               py: 6,
               px: 3,
               textAlign: "center",
               bgcolor: "transparent",
               border: "1px dashed",
               borderColor: "divider",
               borderRadius: 2,
            }}
         >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
               <SadIcon sx={{ fontSize: 48, color: "text.disabled" }} />
            </Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
               No results found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
               Try adjusting your search or filters to find matching projects.
            </Typography>

            {/* Removed chips and action buttons per request */}
         </Paper>
      );
   };

   return (
      <>
         <Box sx={{ width: "100%", pt: 0.5, pb: 3, px: 0 }}>
            <Box
               sx={{
                  width: "100%",
                  maxWidth: 1700,
                  mx: "auto",
                  px: { xs: 2, sm: 3, md: 4 },
               }}
            >
               {/* Header removed by request */}

               {/* Error State */}
               {error && (
                  <Alert severity="error" sx={{ mb: 4 }}>
                     {error}
                  </Alert>
               )}
               {navError && (
                  <Alert
                     severity="error"
                     sx={{ mb: 2 }}
                     onClose={() => setNavError(null)}
                  >
                     {navError}
                  </Alert>
               )}

               {/* Loading State */}
               <Box sx={{ width: "100%", minHeight: "50vh" }}>
                  {loading && (
                     <Box
                        sx={{
                           display: "grid",
                           gridTemplateColumns: {
                              xs: "repeat(1, 1fr)",
                              sm: "repeat(2, 1fr)",
                              md: "repeat(3, 1fr)",
                              lg: "repeat(4, 1fr)",
                              xl: "repeat(4, 1fr)",
                           },
                           gap: { xs: 2, md: 3 },
                           width: "100%",
                        }}
                     >
                        {Array.from(new Array(8)).map((_, index) => (
                           <ProjectSkeleton key={index} />
                        ))}
                     </Box>
                  )}

                  {/* Empty State */}
                  {!loading && !error && projects.length === 0 && (
                     <EmptyState />
                  )}

                  {/* Projects Grid */}
                  {!loading && !error && projects.length > 0 && (
                     <>
                        {showCount && (
                           <Typography
                              variant="body1"
                              color="text.secondary"
                              sx={{ mt: 0.5, mb: 1.5, textAlign: "left" }}
                           >
                              Showing {projects.length} project
                              {projects.length !== 1 ? "s" : ""}
                           </Typography>
                        )}

                        <Box
                           sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                 xs: "repeat(1, 1fr)",
                                 sm: "repeat(2, 1fr)",
                                 md: "repeat(3, 1fr)",
                                 lg: "repeat(4, 1fr)",
                                 xl: "repeat(4, 1fr)",
                              },
                              gap: { xs: 2, md: 3 },
                              width: "100%",
                              justifyItems: "stretch",
                              alignItems: "start",
                           }}
                        >
                           {projects.length === 0 ? (
                              <Box
                                 sx={{
                                    gridColumn: "1 / -1",
                                    width: "100%",
                                    display: "block",
                                 }}
                              >
                                 <EmptyState />
                              </Box>
                           ) : (
                              projects.map((project, idx) => (
                                 <Grow
                                    in
                                    timeout={300 + idx * 40}
                                    key={project._id}
                                 >
                                    <Box>
                                       <ProjectCard
                                          project={project}
                                          onClick={onProjectClick}
                                       />
                                    </Box>
                                 </Grow>
                              ))
                           )}
                        </Box>
                     </>
                  )}
               </Box>
            </Box>
         </Box>
      </>
   );
};

export default ProjectGrid;
