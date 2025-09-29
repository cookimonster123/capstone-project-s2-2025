import React, { useEffect, useMemo, useState } from "react";
import type { Project } from "../types/project";
import {
   Avatar,
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Chip,
   Container,
   Divider,
   IconButton,
   Stack,
   TextField,
   Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GitHubIcon from "@mui/icons-material/GitHub";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PersonIcon from "@mui/icons-material/Person";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarIcon from "@mui/icons-material/Star";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SendIcon from "@mui/icons-material/Send";
import { fetchProjectById } from "../api/projectApi";
import { projectCache } from "../state/projectCache";
import { useNavigate, useParams } from "react-router-dom";

interface ProjectProfileProps {
   project: Project;
   onBack: () => void;
}

const ProjectProfileView: React.FC<ProjectProfileProps> = ({
   project,
   onBack,
}) => {
   const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const [isLiked, setIsLiked] = useState(false);
   const [isFavorited, setIsFavorited] = useState(false);
   const [comment, setComment] = useState("");
   const navigate = useNavigate();
   const [comments, setComments] = useState([
      {
         id: "1",
         author: "Sarah Chen",
         content: "Amazing project! The implementation is really impressive.",
         timestamp: "2 hours ago",
      },
      {
         id: "2",
         author: "Mike Johnson",
         content: "Great work on the UI/UX design. Very clean and intuitive.",
         timestamp: "1 day ago",
      },
   ] as Array<{
      id: string;
      author: string;
      content: string;
      timestamp: string;
   }>);

   const handleAddComment = () => {
      if (comment.trim()) {
         const newComment = {
            id: Date.now().toString(),
            author: "You",
            content: comment,
            timestamp: "Just now",
         };
         setComments([newComment, ...comments]);
         setComment("");
      }
   };

   const relatedProjects = [
      { id: "1", title: "E-Commerce Platform", category: "Web Development" },
      {
         id: "2",
         title: "Mobile Health Tracker",
         category: "Mobile Development",
      },
      { id: "3", title: "Data Visualization Tool", category: "Data Science" },
   ];

   const mockImages = [
      "Project Demo Screenshot",
      "Architecture Diagram",
      "User Interface",
      "Database Schema",
   ];

   // Demo presentation slides placeholder
   const presentationSlides = [
      "Demo Slide 1",
      "Demo Slide 2",
      "Demo Slide 3",
      "Demo Slide 4",
   ];

   const categoryName = project.category?.name ?? "Uncategorized";
   const teamName = project.team?.name ?? "Individual";
   const createdAt = project.createdAt ? new Date(project.createdAt) : null;

   const githubUrl = project.links.find((l) => l.type === "github")?.value;
   const liveUrl = project.links.find(
      (l) => l.type === "deployedWebsite",
   )?.value;
   const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

   return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
         <Container
            maxWidth={false}
            disableGutters
            sx={{
               py: 6,
               px: { xs: 2, sm: 3, md: 4 },
               textAlign: "left",
               overflowX: "hidden",
            }}
         >
            <Box sx={{ maxWidth: 1680, mx: "auto" }}>
               {/* Title Row with Back */}
               <Box
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
               >
                  <IconButton aria-label="Back" onClick={onBack} size="small">
                     <ArrowBackIcon />
                  </IconButton>
                  <Typography variant="h4" component="h1" sx={{ ml: 0.5 }}>
                     {project.name}
                  </Typography>
               </Box>

               {/* Tag Chips (Category / Semester / Year) */}
               <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mb: 1 }}
               >
                  <Chip label={categoryName} size="small" />
                  {project.semester?.semester && (
                     <Chip label={project.semester.semester} size="small" />
                  )}
                  {project.semester?.year && (
                     <Chip label={String(project.semester.year)} size="small" />
                  )}
                  {/* Project tags as clickable chips (jump to /projects?tag=...) */}
                  {!!project.tags?.length && (
                     <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        sx={{ mb: 2, rowGap: 0.5 }}
                     >
                        {project.tags.map((t) => (
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
                     </Stack>
                  )}
               </Stack>

               {/* Like / Favorite row will be shown inside main column for alignment */}

               <Box
                  sx={{
                     display: "grid",
                     gridTemplateColumns: {
                        xs: "minmax(0, 1fr) 360px", // slightly wider overall
                        sm: "minmax(0, 1fr) 380px",
                        md: "minmax(0, 1fr) 400px",
                     },
                     gap: { xs: 3, sm: 4, md: 5 },
                     alignItems: "start",
                  }}
               >
                  {/* Main */}
                  <Box sx={{ minWidth: 0 }}>
                     <Stack spacing={3}>
                        {/* Likes/Favorites inline row */}
                        <Stack
                           direction="row"
                           spacing={3}
                           alignItems="center"
                           sx={{ color: "text.secondary" }}
                        >
                           <Box
                              onClick={() => setIsLiked((v) => !v)}
                              sx={{
                                 display: "inline-flex",
                                 alignItems: "center",
                                 gap: 0.5,
                                 cursor: "pointer",
                              }}
                           >
                              <FavoriteIcon
                                 fontSize="small"
                                 color={isLiked ? "error" : "inherit"}
                              />
                              <Typography variant="body2">Like</Typography>
                              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                 (42)
                              </Typography>
                           </Box>
                           <Box
                              onClick={() => setIsFavorited((v) => !v)}
                              sx={{
                                 display: "inline-flex",
                                 alignItems: "center",
                                 gap: 0.5,
                                 cursor: "pointer",
                              }}
                           >
                              <StarIcon
                                 fontSize="small"
                                 color={isFavorited ? "warning" : "inherit"}
                              />
                              <Typography variant="body2">Favorites</Typography>
                           </Box>
                        </Stack>
                        {/* Demo Slides */}
                        <Box>
                           <Box
                              sx={{
                                 position: "relative",
                                 borderRadius: 2,
                                 bgcolor: "grey.100",
                                 overflow: "hidden",
                                 aspectRatio: "16 / 9",
                                 width: { xs: "100%", md: "92%", lg: "88%" },
                                 mr: "auto",
                              }}
                           >
                              <Box
                                 sx={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                    p: 2,
                                 }}
                              >
                                 <Stack alignItems="center" spacing={1}>
                                    <PlayArrowIcon
                                       sx={{
                                          fontSize: 64,
                                          color: "text.disabled",
                                       }}
                                    />
                                    <Typography
                                       variant="body2"
                                       color="text.secondary"
                                    >
                                       {presentationSlides[currentSlideIndex]}
                                    </Typography>
                                 </Stack>
                              </Box>

                              {/* Navigation */}
                              <IconButton
                                 aria-label="Previous"
                                 onClick={() =>
                                    setCurrentSlideIndex((prev) =>
                                       prev > 0
                                          ? prev - 1
                                          : presentationSlides.length - 1,
                                    )
                                 }
                                 sx={{
                                    position: "absolute",
                                    left: 8,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    bgcolor: "background.paper",
                                    boxShadow: 2,
                                    "&:hover": { bgcolor: "background.paper" },
                                 }}
                              >
                                 <ChevronLeftIcon />
                              </IconButton>
                              <IconButton
                                 aria-label="Next"
                                 onClick={() =>
                                    setCurrentSlideIndex((prev) =>
                                       prev < presentationSlides.length - 1
                                          ? prev + 1
                                          : 0,
                                    )
                                 }
                                 sx={{
                                    position: "absolute",
                                    right: 8,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    bgcolor: "background.paper",
                                    boxShadow: 2,
                                    "&:hover": { bgcolor: "background.paper" },
                                 }}
                              >
                                 <ChevronRightIcon />
                              </IconButton>
                           </Box>

                           {/* Indicators centered under the slide box */}
                           <Box
                              sx={{
                                 width: { xs: "100%", md: "92%", lg: "88%" },
                                 mr: "auto",
                                 mt: 2,
                              }}
                           >
                              <Stack
                                 direction="row"
                                 spacing={1}
                                 justifyContent="center"
                              >
                                 {presentationSlides.map((_, i) => (
                                    <Box
                                       key={i}
                                       onClick={() => setCurrentSlideIndex(i)}
                                       sx={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: "50%",
                                          bgcolor:
                                             i === currentSlideIndex
                                                ? "text.primary"
                                                : "text.disabled",
                                          cursor: "pointer",
                                       }}
                                    />
                                 ))}
                              </Stack>
                           </Box>
                        </Box>

                        {/* Overview */}
                        <Box>
                           <Typography
                              variant="h5"
                              fontWeight={700}
                              gutterBottom
                           >
                              Overview
                           </Typography>
                           <Typography
                              variant="body1"
                              color="text.secondary"
                              sx={{
                                 lineHeight: 1.9,
                                 fontSize: { xs: "1.05rem", md: "1.1rem" },
                              }}
                           >
                              {project.description}
                           </Typography>
                        </Box>

                        {/* Problem */}
                        <Box>
                           <Typography
                              variant="h5"
                              fontWeight={700}
                              gutterBottom
                           >
                              Problem
                           </Typography>
                           <Typography
                              variant="body1"
                              color="text.secondary"
                              sx={{
                                 lineHeight: 1.9,
                                 fontSize: { xs: "1.05rem", md: "1.1rem" },
                              }}
                           >
                              This project addresses the critical need for
                              efficient solutions in{" "}
                              {categoryName.toLowerCase()}. The current
                              landscape lacks comprehensive tools that can
                              effectively handle complex requirements while
                              maintaining user-friendly interfaces and strong
                              performance.
                           </Typography>
                        </Box>

                        {/* Solution & Features */}
                        <Box>
                           <Typography
                              variant="h5"
                              fontWeight={700}
                              gutterBottom
                           >
                              Solution & Key Features
                           </Typography>
                           <Typography
                              variant="body1"
                              color="text.secondary"
                              sx={{
                                 mb: 1.5,
                                 fontSize: { xs: "1.05rem", md: "1.1rem" },
                              }}
                           >
                              Our solution leverages modern technologies to
                              deliver a robust and scalable platform. Key
                              features include:
                           </Typography>
                           <Box
                              component="ul"
                              sx={{
                                 m: 0,
                                 pl: 3,
                                 color: "text.secondary",
                                 fontSize: { xs: "1.05rem", md: "1.1rem" },
                                 lineHeight: 1.9,
                              }}
                           >
                              <li>
                                 Intuitive user interface designed for optimal
                                 user experience
                              </li>
                              <li>
                                 Scalable architecture supporting
                                 high-performance operations
                              </li>
                              <li>
                                 Real-time data processing and analytics
                                 capabilities
                              </li>
                              <li>
                                 Cross-platform compatibility and responsive
                                 design
                              </li>
                              <li>
                                 Comprehensive security measures and data
                                 protection
                              </li>
                           </Box>
                        </Box>

                        {/* Demo Video */}
                        <Box>
                           <Typography
                              variant="h5"
                              fontWeight={700}
                              gutterBottom
                           >
                              Demo Video
                           </Typography>
                           <Box
                              sx={{
                                 aspectRatio: "16 / 9",
                                 bgcolor: "grey.100",
                                 borderRadius: 2,
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                                 width: { xs: "100%", md: "92%", lg: "88%" },
                                 mr: "auto",
                              }}
                           >
                              <Stack alignItems="center" spacing={1}>
                                 <OpenInNewIcon
                                    sx={{ color: "text.disabled" }}
                                 />
                                 <Typography
                                    variant="body2"
                                    color="text.secondary"
                                 >
                                    Demo Video
                                 </Typography>
                                 <Typography
                                    variant="caption"
                                    color="text.disabled"
                                 >
                                    Would link to actual video
                                 </Typography>
                              </Stack>
                           </Box>
                        </Box>

                        {/* Comments */}
                        <Box>
                           <Typography
                              variant="h5"
                              fontWeight={700}
                              gutterBottom
                           >
                              Comments
                           </Typography>
                           <Stack spacing={2}>
                              <TextField
                                 placeholder="Share your thoughts about this project..."
                                 value={comment}
                                 onChange={(e) => setComment(e.target.value)}
                                 minRows={4}
                                 multiline
                                 fullWidth
                              />
                              <Box
                                 sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                 }}
                              >
                                 <Button
                                    onClick={handleAddComment}
                                    disabled={!comment.trim()}
                                    startIcon={<SendIcon />}
                                 >
                                    Post Comment
                                 </Button>
                              </Box>
                              <Divider />
                              <Stack spacing={2}>
                                 {comments.map((c) => (
                                    <Stack
                                       key={c.id}
                                       direction="row"
                                       spacing={2}
                                    >
                                       <Avatar sx={{ width: 40, height: 40 }}>
                                          {c.author.charAt(0).toUpperCase()}
                                       </Avatar>
                                       <Box sx={{ flex: 1 }}>
                                          <Stack
                                             direction="row"
                                             spacing={1}
                                             alignItems="center"
                                          >
                                             <Typography
                                                variant="body2"
                                                fontWeight={600}
                                             >
                                                {c.author}
                                             </Typography>
                                             <Typography
                                                variant="caption"
                                                color="text.secondary"
                                             >
                                                {c.timestamp}
                                             </Typography>
                                          </Stack>
                                          <Typography
                                             variant="body2"
                                             color="text.secondary"
                                             sx={{ mt: 0.5 }}
                                          >
                                             {c.content}
                                          </Typography>
                                       </Box>
                                    </Stack>
                                 ))}
                              </Stack>
                           </Stack>
                        </Box>
                     </Stack>
                  </Box>

                  {/* Sidebar */}
                  <Box sx={{ minWidth: 0 }}>
                     <Stack spacing={3} sx={{ position: "sticky", top: 24 }}>
                        {/* Meta */}
                        <Card elevation={1}>
                           <CardHeader
                              title={
                                 <Typography
                                    variant="subtitle1"
                                    fontWeight={700}
                                 >
                                    Project Meta
                                 </Typography>
                              }
                           />
                           <CardContent>
                              <Stack spacing={2}>
                                 <Stack spacing={1}>
                                    <Box>
                                       <Typography
                                          variant="caption"
                                          color="text.secondary"
                                       >
                                          Category
                                       </Typography>
                                       <Typography variant="body2">
                                          {categoryName}
                                       </Typography>
                                    </Box>
                                    <Box>
                                       <Typography
                                          variant="caption"
                                          color="text.secondary"
                                       >
                                          Semester
                                       </Typography>
                                       <Typography variant="body2">
                                          {project.semester
                                             ? `${project.semester.semester} ${project.semester.year}`
                                             : "Not specified"}
                                       </Typography>
                                    </Box>
                                    <Box>
                                       <Typography
                                          variant="caption"
                                          color="text.secondary"
                                       >
                                          Team
                                       </Typography>
                                       <Typography variant="body2">
                                          {teamName}
                                       </Typography>
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
                                             <Stack
                                                spacing={0.5}
                                                sx={{ mt: 0.5 }}
                                             >
                                                {project.team.members.map(
                                                   (m) => (
                                                      <Typography
                                                         key={m._id}
                                                         variant="body2"
                                                      >
                                                         {m.name}
                                                      </Typography>
                                                   ),
                                                )}
                                             </Stack>
                                          </Box>
                                       )}
                                 </Stack>

                                 <Divider />

                                 <Typography variant="subtitle2" sx={{ mt: 2 }}>
                                    Tech Stack
                                 </Typography>
                                 <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                 >
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

                                    {(!project.tags ||
                                       project.tags.length === 0) && (
                                       <Typography
                                          variant="body2"
                                          color="text.secondary"
                                       >
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
                                       {liveUrl ?? "—"}
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

                        {/* Related */}
                        <Card elevation={1}>
                           <CardHeader title="Relative Projects" />
                           <CardContent>
                              <Stack spacing={2}>
                                 {relatedProjects.map((rp) => (
                                    <Card
                                       key={rp.id}
                                       variant="outlined"
                                       sx={{ p: 1.5 }}
                                    >
                                       <Stack
                                          direction="row"
                                          spacing={2}
                                          alignItems="center"
                                       >
                                          <Box
                                             sx={{
                                                width: 100,
                                                height: 70,
                                                bgcolor: "grey.200",
                                                borderRadius: 1,
                                                flexShrink: 0,
                                             }}
                                          />
                                          <Box sx={{ minWidth: 0, flex: 1 }}>
                                             <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                noWrap
                                             >
                                                {rp.title}
                                             </Typography>
                                             <Typography
                                                variant="caption"
                                                color="text.secondary"
                                             >
                                                {rp.category}
                                             </Typography>
                                          </Box>
                                       </Stack>
                                    </Card>
                                 ))}
                              </Stack>
                           </CardContent>
                        </Card>
                     </Stack>
                  </Box>
               </Box>
            </Box>
         </Container>
      </Box>
   );
};

const ProjectProfilePage: React.FC = () => {
   const [error, setError] = useState<string | null>(null);
   const navigate = useNavigate();
   const params = useParams();
   const id = params.id ?? null;
   const cached = useMemo(
      () => (id ? (projectCache.get(id) ?? null) : null),
      [id],
   );
   const [project, setProject] = useState<Project | null>(cached);
   const [loading, setLoading] = useState(!cached);

   useEffect(() => {
      let active = true;
      const load = async () => {
         if (!id) {
            setError("No project id in URL");
            setLoading(false);
            return;
         }
         try {
            if (!cached) setLoading(true);
            const data = await fetchProjectById(id);
            if (active) {
               setProject(data);
               projectCache.set(id, data);
            }
         } catch (e) {
            if (active)
               setError(
                  e instanceof Error ? e.message : "Failed to load project",
               );
         } finally {
            if (active) setLoading(false);
         }
      };
      load();
      return () => {
         active = false;
      };
   }, [id]);

   if (loading) {
      return (
         <Container
            maxWidth="md"
            sx={{ py: 6, display: "flex", justifyContent: "center" }}
         >
            <Typography>Loading…</Typography>
         </Container>
      );
   }

   if (error) {
      return (
         <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography color="error">{error}</Typography>
         </Container>
      );
   }

   if (!project) {
      return (
         <Container maxWidth="md" sx={{ py: 6 }}>
            <Typography color="text.secondary">Project not found.</Typography>
         </Container>
      );
   }

   return (
      <ProjectProfileView
         project={project}
         onBack={() => navigate("/projects")}
      />
   );
};

export { ProjectProfileView };
export default ProjectProfilePage;
