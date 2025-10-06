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
   useMediaQuery,
   useTheme,
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
   const theme = useTheme();
   const isSmOnly = useMediaQuery(theme.breakpoints.between("sm", "md"));
   const isMdOnly = useMediaQuery(theme.breakpoints.between("md", "lg"));
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
            pt: { xs: 5, md: 7 },
            pb: { xs: 8, md: 9 },
            display: "flex",
            alignItems: "flex-start",
         }}
      >
         <Container
            maxWidth={false}
            sx={{
               height: 1,
               // Constrain and center the content for wide screens
               maxWidth: 1850,
               mx: "auto",
               pl: { xs: 2, sm: 3, md: 6, lg: 8, xl: 10 },
               pr: { xs: 3, sm: 4, md: 6, lg: 8, xl: 10 },
            }}
         >
            <Box
               sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  alignItems: "center",
                  justifyContent: "center",
                  gap: { xs: 2, sm: 2.5, md: 5, lg: 7, xl: 8 },
               }}
            >
               {/* Left text */}
               <Box
                  sx={{
                     width: "100%",
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
                        fontSize: { xs: 20, sm: 24, md: 34, lg: 40, xl: 46 },
                        lineHeight: 1.15,
                        color: "primary.main",
                        "@media (min-width: 1920px)": { fontSize: 48 },
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
                        fontSize: { xs: 13, sm: 15, md: 18, lg: 19, xl: 20 },
                        "@media (min-width: 1920px)": { fontSize: 21 },
                        lineHeight: 1.8,
                     }}
                  >
                     Explore real-world projects by UoA Computer Science
                     students. Search, filter, and shortlist the teams you love.
                  </Typography>
                  <Box
                     component="form"
                     onSubmit={handleSearchSubmit}
                     sx={{
                        width: "100%",
                        maxWidth: { xs: 760, xl: 900 },
                        mt: 6,
                        "@media (min-width: 1920px)": { maxWidth: 960 },
                     }}
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
                                       px: 2,
                                       py: 0.75,
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
                              height: 48,
                           },
                           "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "divider",
                           },
                           "& .MuiInputBase-input": {
                              fontSize: { xs: 12.5, sm: 13, md: 14 },
                           },
                        }}
                     />
                  </Box>
               </Box>
               {/* Right visual slider */}
               <Box
                  sx={{
                     width: "100%",
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
                        overflow: {
                           xs: "visible",
                           md: "visible",
                           lg: "hidden",
                        },
                     }}
                  >
                     {heroProjects.length > 0 ? (
                        <Box
                           sx={{
                              // Fill the right column (1fr) so left/right are 50/50 visually
                              width: "100%",
                              maxWidth: "100%",
                              position: "relative",
                              height: { xs: 340, md: 400, lg: 460, xl: 500 },
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              "@media (min-width: 1920px)": { height: 540 },
                              "@media (min-width: 2560px)": { height: 580 },
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
                                       md: "scale(1)",
                                       lg: "scale(1)",
                                       xl: "scale(1.06)",
                                    },
                                    transformOrigin: "center",
                                    transition: "transform 300ms ease",
                                    "@media (min-width: 1920px)": {
                                       transform: "scale(1.08)",
                                    },
                                    "@media (min-width: 2560px)": {
                                       transform: "scale(1.14)",
                                    },
                                 }}
                              >
                                 <Box
                                    sx={{
                                       width: {
                                          xs: "clamp(300px, 96%, 520px)",
                                          sm: 320,
                                          md: 400,
                                          lg: 460,
                                          xl: 520,
                                       },
                                       maxWidth: "100%",
                                       "@media (min-width: 1920px)": {
                                          width: 500,
                                       },
                                       "@media (min-width: 2560px)": {
                                          width: 540,
                                       },
                                    }}
                                 >
                                    <ProjectCard
                                       project={heroProjects[heroIndex]}
                                       onClick={handleHeroCardClick}
                                       isAuthenticated={isLoggedIn}
                                       width={"100%"}
                                       height={
                                          isSmOnly ? 320 : isMdOnly ? 340 : 380
                                       }
                                       dense={isSmOnly || isMdOnly}
                                    />
                                 </Box>
                              </Box>
                           </Box>
                        </Box>
                     ) : (
                        <Box
                           sx={{
                              width: "100%",
                              maxWidth: "100%",
                              position: "relative",
                              height: { xs: 340, md: 400, lg: 460, xl: 500 },
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              "@media (min-width: 1920px)": { height: 540 },
                              "@media (min-width: 2560px)": { height: 580 },
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
                                       md: "scale(1)",
                                       lg: "scale(1)",
                                       xl: "scale(1.06)",
                                    },
                                    transformOrigin: "center",
                                    transition: "transform 300ms ease",
                                    "@media (min-width: 1920px)": {
                                       transform: "scale(1.08)",
                                    },
                                    "@media (min-width: 2560px)": {
                                       transform: "scale(1.14)",
                                    },
                                 }}
                              >
                                 <Box
                                    sx={{
                                       width: {
                                          xs: "clamp(300px, 96%, 520px)",
                                          sm: 320,
                                          md: 400,
                                          lg: 460,
                                          xl: 520,
                                       },
                                       maxWidth: "100%",
                                       "@media (min-width: 1920px)": {
                                          width: 500,
                                       },
                                       "@media (min-width: 2560px)": {
                                          width: 540,
                                       },
                                    }}
                                 >
                                    <Card
                                       sx={{
                                          width: "100%",
                                          height: { xs: 300, sm: 320, md: 380 },
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
                                             fontSize: {
                                                xs: 14,
                                                sm: 15,
                                                md: 16,
                                             },
                                          }}
                                       >
                                          Loading projects...
                                       </CardContent>
                                    </Card>
                                 </Box>
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
