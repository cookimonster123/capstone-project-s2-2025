import React from "react";
import {
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Chip,
   Divider,
   Stack,
   Typography,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";
import type { Project } from "../../types/project";

interface ProjectMetaProps {
   project: Project;
}

const ProjectMeta: React.FC<ProjectMetaProps> = ({ project }) => {
   const navigate = useNavigate();

   const categoryName = project.category?.name ?? "Uncategorized";
   const teamName = project.team?.name ?? "Individual";
   const githubUrl = project.links.find((l) => l.type === "github")?.value;
   const liveUrl = project.links.find(
      (l) => l.type === "deployedWebsite",
   )?.value;

   const awards = project.awards ?? [];

   return (
      <Box sx={{ minWidth: 0 }}>
         <Stack spacing={3} sx={{ position: "sticky", top: 24 }}>
            {/* Meta */}
            <Card
               elevation={1}
               sx={{
                  bgcolor: (theme) =>
                     theme.palette.mode === "dark" ? "#0f1419" : "#ffffff",
                  border: (theme) =>
                     theme.palette.mode === "dark"
                        ? "1px solid #1a1f2e"
                        : "1px solid #e5e5e7",
               }}
            >
               <CardHeader
                  title={
                     <Typography variant="subtitle1" fontWeight={700}>
                        Project Meta
                     </Typography>
                  }
               />
               <CardContent>
                  <Stack spacing={2}>
                     <Stack spacing={1}>
                        <Box>
                           <Typography variant="caption" color="text.secondary">
                              Category
                           </Typography>
                           <Typography variant="body2">
                              {categoryName}
                           </Typography>
                        </Box>
                        <Box>
                           <Typography variant="caption" color="text.secondary">
                              Semester
                           </Typography>
                           <Typography variant="body2">
                              {project.semester
                                 ? `${project.semester.semester} ${project.semester.year}`
                                 : "Not specified"}
                           </Typography>
                        </Box>
                        <Box>
                           <Typography variant="caption" color="text.secondary">
                              Team
                           </Typography>
                           <Typography variant="body2">{teamName}</Typography>
                        </Box>
                        {project.team?.members &&
                           project.team.members.length > 0 && (
                              <Box>
                                 <Typography
                                    variant="caption"
                                    color="text.secondary"
                                 >
                                    Members
                                 </Typography>
                                 <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                    {project.team.members.map((m) => (
                                       <Typography key={m._id} variant="body2">
                                          {m.name}
                                       </Typography>
                                    ))}
                                 </Stack>
                              </Box>
                           )}
                     </Stack>

                     <Divider />

                     <Typography variant="subtitle2" sx={{ mt: 2 }}>
                        Tech Stack
                     </Typography>
                     <Stack direction="row" spacing={1} flexWrap="wrap">
                        {(project.tags ?? []).map((t) => (
                           <Chip
                              key={t._id ?? t.name}
                              label={t.name}
                              size="small"
                              variant="outlined"
                              clickable
                              onClick={() =>
                                 navigate(
                                    `/projects?tag=${encodeURIComponent(t.name)}`,
                                 )
                              }
                           />
                        ))}

                        {(!project.tags || project.tags.length === 0) && (
                           <Typography variant="body2" color="text.secondary">
                              No tags.
                           </Typography>
                        )}
                     </Stack>

                     <Stack spacing={1} sx={{ mt: 2 }}>
                        {githubUrl && (
                           <Button
                              variant="outlined"
                              size="small"
                              startIcon={<GitHubIcon />}
                              component="a"
                              href={githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                 alignSelf: "flex-start",
                                 justifyContent: "center",
                                 px: 2,
                                 width: 160,
                              }}
                           >
                              Github
                           </Button>
                        )}
                     </Stack>

                     {/* Hidden plain link preview */}
                     <Typography
                        variant="subtitle2"
                        sx={{ mt: 2, display: "none" }}
                     >
                        Link
                     </Typography>
                     <Box sx={{ display: "none" }}>
                        <Typography
                           variant="body2"
                           color="text.secondary"
                           noWrap
                        >
                           {liveUrl ?? ""}
                        </Typography>
                     </Box>
                     {liveUrl ? (
                        <Button
                           variant="outlined"
                           size="small"
                           startIcon={<OpenInNewIcon />}
                           component="a"
                           href={liveUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           sx={{
                              alignSelf: "flex-start",
                              justifyContent: "center",
                              px: 2,
                              width: 160,
                           }}
                        >
                           Link Demo
                        </Button>
                     ) : (
                        <Button
                           variant="outlined"
                           size="small"
                           startIcon={<OpenInNewIcon />}
                           disabled
                           sx={{
                              alignSelf: "flex-start",
                              justifyContent: "center",
                              px: 2,
                              width: 160,
                           }}
                        >
                           Link Demo
                        </Button>
                     )}
                  </Stack>
               </CardContent>
            </Card>

            {/* Awards */}
            {awards.length > 0 && (
               <Card elevation={1}>
                  <CardHeader title="Awards" />
                  <CardContent>
                     <Stack spacing={1.25}>
                        {awards.map((a) => (
                           <Stack
                              key={a._id}
                              direction="row"
                              spacing={1.25}
                              alignItems="center"
                           >
                              {a.iconUrl ? (
                                 <Box
                                    component="img"
                                    src={a.iconUrl}
                                    alt={a.name}
                                    sx={{
                                       width: 22,
                                       height: 22,
                                       objectFit: "contain",
                                       borderRadius: 0.5,
                                    }}
                                 />
                              ) : (
                                 <Box sx={{ width: 22, height: 22 }} />
                              )}
                              <Typography
                                 variant="body2"
                                 fontWeight={600}
                                 noWrap
                              >
                                 {a.name}
                              </Typography>
                           </Stack>
                        ))}
                     </Stack>
                  </CardContent>
               </Card>
            )}
         </Stack>
      </Box>
   );
};

export default ProjectMeta;
