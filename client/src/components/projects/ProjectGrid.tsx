import React, { useState } from "react";
import { Typography, Box, Alert, Skeleton, Paper, Grow } from "@mui/material";
import { SentimentDissatisfied as SadIcon } from "@mui/icons-material";
import ProjectCard from "./ProjectCard";
import type { Project } from "../../types/project";
import { useAuth } from "../../context/AuthContext"; // read global login state

export interface ProjectGridProps {
   projects: Project[]; // pre-filtered projects to display
   loading?: boolean; // loading state from parent
   error?: string | null; // error message from parent
   onProjectClick: (project: Project) => void;
   showCount?: boolean;
}

/** Small empty-state block for "no results". */
const EmptyState: React.FC = () => (
   <Paper
      elevation={0}
      sx={{
         p: 4,
         display: "flex",
         alignItems: "center",
         gap: 2,
         bgcolor: "grey.50",
         border: "1px dashed",
         borderColor: "divider",
      }}
   >
      <SadIcon />
      <Typography variant="body1" color="text.secondary">
         No projects match your current filters.
      </Typography>
   </Paper>
);

/** Main responsive grid of project cards. */
const ProjectGrid: React.FC<ProjectGridProps> = ({
   projects,
   loading = false,
   error = null,
   onProjectClick,
   showCount = true,
}) => {
   // Read global auth state provided by <AuthProvider> in App.tsx
   const { isLoggedIn } = useAuth();

   const [skeletonCount] = useState(8);

   return (
      <>
         <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Header: count + optional error */}
            <Box
               sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
               }}
            >
               {showCount && (
                  <Typography
                     variant="body2"
                     color="text.secondary"
                     data-testid="project-count"
                  >
                     Showing {projects.length} projects
                  </Typography>
               )}
               {!!error && (
                  <Alert severity="error" sx={{ ml: "auto" }}>
                     {error}
                  </Alert>
               )}
            </Box>

            {/* Grid area */}
            <Box>
               {loading ? (
                  // Skeletons while loading
                  <Box
                     sx={{
                        display: "grid",
                        gridTemplateColumns:
                           "repeat(auto-fill, minmax(380px, 1fr))",
                        gap: 2,
                     }}
                  >
                     {Array.from({ length: skeletonCount }).map((_, i) => (
                        <Skeleton
                           key={i}
                           variant="rectangular"
                           height={380}
                           sx={{ borderRadius: 2 }}
                        />
                     ))}
                  </Box>
               ) : (
                  <>
                     {projects.length === 0 ? (
                        // Empty state
                        <Box sx={{ mt: 2 }}>
                           <EmptyState />
                        </Box>
                     ) : (
                        // Cards grid
                        <Box
                           sx={{
                              display: "grid",
                              gridTemplateColumns:
                                 "repeat(auto-fill, minmax(380px, 1fr))",
                              gap: 2,
                           }}
                        >
                           {projects.map((project, idx) => (
                              <Grow
                                 in
                                 timeout={300 + idx * 40}
                                 key={project._id}
                              >
                                 <Box sx={{ width: "100%" }}>
                                    <ProjectCard
                                       project={project}
                                       onClick={onProjectClick}
                                       // Pass auth state down so the card can block likes when not logged in
                                       isAuthenticated={isLoggedIn}
                                       width={"100%"}
                                       hoverLift
                                    />
                                 </Box>
                              </Grow>
                           ))}
                        </Box>
                     )}
                  </>
               )}
            </Box>
         </Box>
      </>
   );
};

export default ProjectGrid;
