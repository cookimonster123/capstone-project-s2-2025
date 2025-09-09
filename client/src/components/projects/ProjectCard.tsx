import React from "react";
import {
   Card,
   CardContent,
   CardMedia,
   Typography,
   Chip,
   Box,
} from "@mui/material";
import { Group as GroupIcon } from "@mui/icons-material";
import type { Project } from "../../types/project";

interface ProjectCardProps {
   project: Project;
   onClick: (project: Project) => void;
}

/**
 * ProjectCard component displays a dummy/placeholder project card
 * @param project - Project data to display
 * @param onClick - Function to handle card click
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
   const handleCardClick = () => {
      onClick(project);
   };

   return (
      <Card
         sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
            transition:
               "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            "&:hover": {
               transform: "translateY(-4px)",
               boxShadow: 4,
            },
         }}
         onClick={handleCardClick}
         role="button"
         tabIndex={0}
         onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
               handleCardClick();
            }
         }}
      >
         {/* Image placeholder */}
         <CardMedia
            sx={{
               height: 200,
               backgroundColor: "grey.200",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
            }}
         >
            <Typography variant="h6" color="text.secondary">
               Project Image
            </Typography>
         </CardMedia>

         <CardContent sx={{ flexGrow: 1, p: 2 }}>
            {/* Project Name */}
            <Typography
               gutterBottom
               variant="h6"
               component="h3"
               sx={{
                  fontWeight: 600,
                  lineHeight: 1.2,
                  mb: 2,
               }}
            >
               {project.name}
            </Typography>

            {/* Team Name */}
            <Box
               sx={{ display: "flex", alignItems: "center", mb: 2, gap: 0.5 }}
            >
               <GroupIcon sx={{ fontSize: 16, color: "text.secondary" }} />
               <Typography variant="body2" color="text.secondary">
                  {project.team?.name || "No team assigned"}
               </Typography>
            </Box>

            {/* Category */}
            {project.category && (
               <Chip
                  label={project.category.name}
                  size="small"
                  color="primary"
                  variant="outlined"
               />
            )}
         </CardContent>
      </Card>
   );
};

export default ProjectCard;
