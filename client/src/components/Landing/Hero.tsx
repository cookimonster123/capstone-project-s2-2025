import React from "react";
import {
   Box,
   Button,
   Card,
   CardContent,
   Container,
   InputAdornment,
   TextField,
   Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ProjectCard from "../projects/ProjectCard";
import type { Project } from "../../types/project";
import { useAuth } from "../../context/AuthContext";
interface HeroProps {
   searchQuery: string;
   setSearchQuery: (q: string) => void;
   handleSearchSubmit: (e: React.FormEvent) => void;
   projects: Project[];
   handleHeroCardClick: (project: Project) => void;
}

const Hero: React.FC<HeroProps> = ({
   searchQuery,
   setSearchQuery,
   handleSearchSubmit,
   projects,
   handleHeroCardClick,
}) => {
   const { isLoggedIn } = useAuth();
   // Hero slider logic: prefer projects with awards; fallback to all awarded projects
   const heroProjects = React.useMemo(() => {
      const awarded = projects.filter(
         (p) => Array.isArray(p.awards) && p.awards.length > 0,
      );
      const source = awarded.length > 0 ? awarded : projects;
      return source;
   }, [projects]);
   const [heroIndex, setHeroIndex] = React.useState(0);
   const [fadeState, setFadeState] = React.useState<"visible" | "fading">(
      "visible",
   );

   React.useEffect(() => {
      if (heroProjects.length > 1) {
         const interval = setInterval(() => {
            setFadeState("fading");
            setTimeout(() => {
               setHeroIndex((i) => (i + 1) % heroProjects.length);
               setFadeState("visible");
            }, 500);
         }, 6000);
         return () => clearInterval(interval);
      }
   }, [heroProjects.length]);

   return (
      <Box
         sx={{
            bgcolor: "#ecf9ffff",
            mx: -3,
            pt: { xs: 8, md: 10 },
            pb: { xs: 11, md: 12 },
            display: "flex",
            alignItems: "flex-start",
         }}
      >
         <Container
            maxWidth={false}
            sx={{
               height: 1,
               pl: { xs: 2, sm: 3, md: 6 },
               pr: { xs: 3, sm: 4, md: 6 },
            }}
         >
            <Box
               sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 3, sm: 4, md: 8, lg: 10, xl: 12 },
                  flexWrap: "nowrap",
               }}
            >
               {/* Left text */}
               <Box
                  sx={{
                     width: { xs: "100%", md: "48%", lg: "44%" },
                     pl: { xs: 0, sm: 1, md: 2 },
                  }}
               >
                  <Typography
                     variant="h3"
                     component="h1"
                     sx={{
                        fontWeight: 800,
                        letterSpacing: "-0.3px",
                        mb: 4,
                        fontSize: { xs: 30, sm: 36, md: 44, lg: 50 },
                        lineHeight: 1.15,
                        color: "primary.main",
                     }}
                  >
                     Showcase Capstone Projects
                  </Typography>
                  <Typography
                     variant="h6"
                     color="text.primary"
                     sx={{
                        mb: 5.5,
                        maxWidth: 640,
                        fontWeight: 400,
                        fontSize: { xs: 18, sm: 20, md: 22 },
                        lineHeight: 1.8,
                     }}
                  >
                     Explore real-world projects by UoA Computer Science
                     students. Search, filter, and shortlist the teams you love.
                  </Typography>
                  <Box
                     component="form"
                     onSubmit={handleSearchSubmit}
                     sx={{ width: "100%", maxWidth: 900, mt: 9 }}
                  >
                     <TextField
                        size="medium"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search projects, tech, or teams"
                        InputProps={{
                           startAdornment: (
                              <InputAdornment position="start">
                                 <SearchIcon color="action" />
                              </InputAdornment>
                           ),
                           endAdornment: (
                              <InputAdornment position="end">
                                 <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                       ml: 1,
                                       textTransform: "none",
                                       borderRadius: 2,
                                       px: 2.5,
                                       py: 1,
                                    }}
                                 >
                                    Search
                                 </Button>
                              </InputAdornment>
                           ),
                        }}
                        sx={{
                           "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: "#E3F2FD",
                              height: 64,
                           },
                           "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "divider",
                           },
                           "& .MuiInputBase-input": {
                              fontSize: { xs: 14, sm: 15, md: 16 },
                           },
                        }}
                     />
                  </Box>
               </Box>
               {/* Right visual slider */}
               <Box
                  sx={{
                     width: { xs: "100%", md: "44%", lg: "50%" },
                     minWidth: 0,
                  }}
               >
                  <Box
                     sx={{
                        position: "relative",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                     }}
                  >
                     {heroProjects.length > 0 ? (
                        <Box
                           sx={{
                              width: { xs: 620, md: 800, lg: 900 },
                              maxWidth: "100%",
                              position: "relative",
                              height: { xs: 410, md: 470, lg: 530 },
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                           }}
                        >
                           <Box
                              sx={{
                                 width: "100%",
                                 height: "100%",
                                 position: "absolute",
                                 top: 0,
                                 left: 0,
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                                 transition: "opacity 500ms, filter 500ms",
                                 opacity: fadeState === "visible" ? 1 : 0,
                                 filter:
                                    fadeState === "visible"
                                       ? "none"
                                       : "blur(16px)",
                              }}
                           >
                              <Box
                                 sx={{
                                    transform: {
                                       xs: "scale(1)",
                                       md: "scale(1.15)",
                                       lg: "scale(1.25)",
                                    },
                                    transformOrigin: "center",
                                    transition: "transform 300ms ease",
                                 }}
                              >
                                 <ProjectCard
                                    project={heroProjects[heroIndex]}
                                    onClick={handleHeroCardClick}
                                    isAuthenticated={isLoggedIn}
                                    width={470}
                                 />
                              </Box>
                           </Box>
                        </Box>
                     ) : (
                        <Box
                           sx={{
                              width: { xs: 620, md: 800, lg: 900 },
                              maxWidth: "100%",
                              position: "relative",
                              height: { xs: 410, md: 470, lg: 530 },
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                           }}
                        >
                           <Box
                              sx={{
                                 width: "100%",
                                 height: "100%",
                                 position: "absolute",
                                 top: 0,
                                 left: 0,
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                              }}
                           >
                              <Box
                                 sx={{
                                    transform: {
                                       xs: "scale(1)",
                                       md: "scale(1.15)",
                                       lg: "scale(1.25)",
                                    },
                                    transformOrigin: "center",
                                    transition: "transform 300ms ease",
                                 }}
                              >
                                 <Card
                                    sx={{
                                       width: 448,
                                       height: 380,
                                       borderRadius: 2,
                                       display: "flex",
                                       alignItems: "center",
                                       justifyContent: "center",
                                    }}
                                 >
                                    <CardContent
                                       sx={{
                                          width: "100%",
                                          height: "100%",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "text.secondary",
                                          fontSize: { xs: 18, md: 20 },
                                       }}
                                    >
                                       Loading projects...
                                    </CardContent>
                                 </Card>
                              </Box>
                           </Box>
                        </Box>
                     )}
                  </Box>
               </Box>
            </Box>
         </Container>
      </Box>
   );
};

export default Hero;
