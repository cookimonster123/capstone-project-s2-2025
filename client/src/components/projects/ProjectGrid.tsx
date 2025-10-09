import React, { useState } from "react";
import { Typography, Box, Alert, Skeleton, Paper } from "@mui/material";
import { SentimentDissatisfied as SadIcon } from "@mui/icons-material";
import ProjectCard from "./ProjectCard";
import type { Project } from "../../types/project";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export interface ProjectGridProps {
   projects: Project[]; // pre-filtered projects to display
   loading?: boolean; // loading state from parent
   error?: string | null; // error message from parent
   onProjectClick: (project: Project) => void;
   showCount?: boolean;
}

/** Small empty-state block for "no results". */
const EmptyState: React.FC = () => (
   <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
   >
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
   </motion.div>
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
                        // Cards grid with stagger animation
                        <Box
                           sx={{
                              display: "grid",
                              gridTemplateColumns:
                                 "repeat(auto-fill, minmax(380px, 1fr))",
                              gap: 2,
                           }}
                        >
                           <AnimatePresence mode="popLayout">
                              {projects.map((project, idx) => (
                                 <motion.div
                                    key={project._id}
                                    layout
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{
                                       duration: 0.5,
                                       delay: idx * 0.05,
                                       ease: [0.6, -0.05, 0.01, 0.99],
                                    }}
                                    whileHover={{
                                       y: -8,
                                       transition: { duration: 0.2 },
                                    }}
                                 >
                                    <ProjectCard
                                       project={project}
                                       onClick={onProjectClick}
                                       isAuthenticated={isLoggedIn}
                                       width={"100%"}
                                       hoverLift
                                    />
                                 </motion.div>
                              ))}
                           </AnimatePresence>
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
