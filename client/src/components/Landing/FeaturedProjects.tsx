import React from "react";
import { Box, Container, Typography } from "@mui/material";
import ProjectCard from "../projects/ProjectCard";
import type { Project } from "../../types/project";

interface FeaturedProjectsProps {
   projects: Project[];
   onProjectClick: (project: Project) => void;
   isAuthenticated: boolean;
}

/**
 * FeaturedProjects component displays a grid of recent/featured projects
 */
const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({
   projects,
   onProjectClick,
   isAuthenticated,
}) => {
   // Show up to 8 recent projects
   const featuredProjects = projects.slice(0, 8);

   if (featuredProjects.length === 0) return null;

   return (
      <Box
         sx={{
            bgcolor: (theme) =>
               theme.palette.mode === "dark" ? "#0a0e17" : "#ffffff",
            mx: -3,
            pt: { xs: 8, md: 10 },
            pb: { xs: 8, md: 12 },
            mt: { xs: 0, md: 0 },
         }}
      >
         <Container
            maxWidth={false}
            sx={{ maxWidth: 1850, px: { xs: 3, sm: 5, md: 8 } }}
         >
            <Box sx={{ mb: 6 }}>
               <Typography
                  variant="h4"
                  sx={{
                     fontWeight: 600,
                     fontSize: { xs: 32, md: 40, lg: 48, xl: 56 },
                     "@media (min-width: 1920px)": { fontSize: 64 },
                     color: (theme) =>
                        theme.palette.mode === "dark" ? "#ffffff" : "#1d1d1f",
                     letterSpacing: "-0.02em",
                     mb: 2,
                  }}
               >
                  Featured Projects
               </Typography>
               <Typography
                  variant="body2"
                  sx={{
                     fontSize: { xs: 17, md: 19, lg: 21 },
                     lineHeight: 1.5,
                     color: (theme) =>
                        theme.palette.mode === "dark" ? "#b0b0b5" : "#6e6e73",
                     letterSpacing: "-0.01em",
                     maxWidth: 720,
                  }}
               >
                  Discover the latest student innovations and creative
                  solutions.
               </Typography>
            </Box>

            <Grid
               container
               spacing={{ xs: 3, sm: 3, md: 4, lg: 4 }}
               sx={{
                  mt: { xs: 4, md: 5 },
               }}
            >
               {featuredProjects.map((project) => (
                  <Grid
                     item
                     xs={12}
                     sm={6}
                     md={4}
                     lg={3}
                     key={project._id}
                     sx={{
                        display: "flex",
                        "& > *": {
                           width: "100%",
                        },
                     }}
                  >
                     <Box
                        sx={{
                           transition:
                              "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                           "&:hover": {
                              transform: "translateY(-8px)",
                           },
                        }}
                     >
                        <ProjectCard
                           project={project}
                           onClick={onProjectClick}
                           isAuthenticated={isAuthenticated}
                           width="100%"
                           height={320}
                        />
                     </Box>
                  </Grid>
               ))}
            </Grid>
         </Container>
      </Box>
   );
};

export default FeaturedProjects;
