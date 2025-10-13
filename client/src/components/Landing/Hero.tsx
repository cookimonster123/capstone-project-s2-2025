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
            bgcolor: "background.default",
            mx: -3,
            pt: { xs: 8, md: 12 },
            pb: { xs: 10, md: 14 },
            display: "flex",
            alignItems: "flex-start",
            position: "relative",
            overflow: "hidden",
            transition: "background-color 0.3s ease",
            "&::before": {
               content: '""',
               position: "absolute",
               top: -200,
               right: -200,
               width: 700,
               height: 700,
               background: (theme) =>
                  theme.palette.mode === "dark"
                     ? "radial-gradient(circle, rgba(0,153,255,0.15) 0%, rgba(0,153,255,0.06) 50%, transparent 70%)"
                     : "radial-gradient(circle, rgba(0,102,204,0.12) 0%, rgba(0,102,204,0.04) 50%, transparent 70%)",
               borderRadius: "50%",
               pointerEvents: "none",
               animation: "pulse 8s ease-in-out infinite",
            },
            "&::after": {
               content: '""',
               position: "absolute",
               bottom: -150,
               left: -150,
               width: 600,
               height: 600,
               background: (theme) =>
                  theme.palette.mode === "dark"
                     ? "radial-gradient(circle, rgba(0,153,255,0.1) 0%, transparent 70%)"
                     : "radial-gradient(circle, rgba(0,102,204,0.08) 0%, transparent 70%)",
               borderRadius: "50%",
               pointerEvents: "none",
               animation: "pulse 8s ease-in-out infinite reverse",
            },
            "@keyframes pulse": {
               "0%, 100%": { transform: "scale(1)", opacity: 1 },
               "50%": { transform: "scale(1.1)", opacity: 0.8 },
            },
            // 添加更多装饰圆点
            "& .decorative-dots": {
               position: "absolute",
               width: "100%",
               height: "100%",
               top: 0,
               left: 0,
               pointerEvents: "none",
               opacity: 0.3,
            },
         }}
      >
         {/* 装饰性圆点 */}
         <Box className="decorative-dots">
            {[...Array(20)].map((_, i) => (
               <Box
                  key={i}
                  sx={{
                     position: "absolute",
                     width: Math.random() * 6 + 2,
                     height: Math.random() * 6 + 2,
                     borderRadius: "50%",
                     bgcolor: "primary.main",
                     opacity: Math.random() * 0.3 + 0.1,
                     top: `${Math.random() * 100}%`,
                     left: `${Math.random() * 100}%`,
                     animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                     animationDelay: `${Math.random() * 5}s`,
                     "@keyframes float": {
                        "0%, 100%": { transform: "translateY(0px)" },
                        "50%": { transform: "translateY(-20px)" },
                     },
                  }}
               />
            ))}
         </Box>

         <Container
            maxWidth={false}
            sx={{
               height: 1,
               // Constrain and center the content for wide screens
               maxWidth: 1850,
               mx: "auto",
               position: "relative",
               zIndex: 1,
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
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        mb: 2.5,
                        fontSize: { xs: 40, sm: 48, md: 56, lg: 64, xl: 72 },
                        lineHeight: 1.08,
                        color: "text.primary",
                        "@media (min-width: 1920px)": { fontSize: 80 },
                        // 文字渐变效果
                        background: (theme) =>
                           theme.palette.mode === "dark"
                              ? "linear-gradient(135deg, #e8eaf0 0%, #0099ff 100%)"
                              : "linear-gradient(135deg, #1d1d1f 0%, #06c 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        position: "relative",
                        "&::after": {
                           content: '"Showcase."',
                           position: "absolute",
                           left: 0,
                           top: 0,
                           zIndex: -1,
                           color: "text.primary",
                           opacity: 0.03,
                           transform: "translate(4px, 4px)",
                        },
                     }}
                  >
                     Showcase.
                  </Typography>
                  <Typography
                     variant="h6"
                     sx={{
                        mb: 6,
                        maxWidth: 580,
                        fontWeight: 400,
                        fontSize: { xs: 19, sm: 21, md: 24, lg: 28 },
                        "@media (min-width: 1920px)": { fontSize: 32 },
                        lineHeight: 1.4,
                        color: "text.secondary",
                        letterSpacing: "-0.01em",
                     }}
                  >
                     Discover exceptional student projects.
                     <br />
                     Innovation starts here.
                  </Typography>
                  <Box
                     component="form"
                     onSubmit={handleSearchSubmit}
                     sx={{
                        width: "100%",
                        maxWidth: { xs: 760, xl: 900 },
                        mt: 4,
                        "@media (min-width: 1920px)": { maxWidth: 960 },
                     }}
                  >
                     <TextField
                        size="medium"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Projects..."
                        InputProps={{
                           startAdornment: (
                              <InputAdornment position="start">
                                 <SearchIcon
                                    sx={{
                                       color: "text.secondary",
                                       fontSize: 20,
                                    }}
                                 />
                              </InputAdornment>
                           ),
                           endAdornment: (
                              <InputAdornment position="end">
                                 <Button
                                    type="submit"
                                    variant="text"
                                    sx={{
                                       ml: 1,
                                       textTransform: "none",
                                       borderRadius: 2,
                                       px: 2.5,
                                       py: 0.75,
                                       color: "primary.main",
                                       fontWeight: 500,
                                       fontSize: 15,
                                       background: (theme) =>
                                          theme.palette.mode === "dark"
                                             ? "linear-gradient(135deg, rgba(0,153,255,0.08) 0%, rgba(0,153,255,0.04) 100%)"
                                             : "linear-gradient(135deg, rgba(0,102,204,0.05) 0%, rgba(0,102,204,0.02) 100%)",
                                       transition:
                                          "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                       "&:hover": {
                                          bgcolor: (theme) =>
                                             theme.palette.mode === "dark"
                                                ? "rgba(0,153,255,0.12)"
                                                : "rgba(0,113,227,0.08)",
                                          transform: "translateX(2px)",
                                          boxShadow: (theme) =>
                                             theme.palette.mode === "dark"
                                                ? "0 2px 8px rgba(0,153,255,0.25)"
                                                : "0 2px 8px rgba(0,102,204,0.15)",
                                       },
                                    }}
                                 >
                                    Search
                                 </Button>
                              </InputAdornment>
                           ),
                        }}
                        sx={{
                           "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                              bgcolor: (theme) =>
                                 theme.palette.mode === "dark"
                                    ? "#1a1f2e"
                                    : "#ffffff",
                              height: 52,
                              border: (theme) =>
                                 theme.palette.mode === "dark"
                                    ? "1px solid #2d3548"
                                    : "1px solid #d2d2d7",
                              transition:
                                 "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: (theme) =>
                                 theme.palette.mode === "dark"
                                    ? "0 1px 3px rgba(0,0,0,0.3)"
                                    : "0 1px 3px rgba(0,0,0,0.04)",
                              "&:hover": {
                                 borderColor: "text.secondary",
                                 boxShadow: (theme) =>
                                    theme.palette.mode === "dark"
                                       ? "0 2px 8px rgba(0,0,0,0.4)"
                                       : "0 2px 8px rgba(0,0,0,0.08)",
                              },
                              "&.Mui-focused": {
                                 borderColor: "primary.main",
                                 boxShadow: (theme) =>
                                    theme.palette.mode === "dark"
                                       ? "0 0 0 4px rgba(0,153,255,0.15), 0 4px 12px rgba(0,153,255,0.25)"
                                       : "0 0 0 4px rgba(0,113,227,0.1), 0 4px 12px rgba(0,102,204,0.15)",
                                 transform: "translateY(-1px)",
                              },
                           },
                           "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                           },
                           "& .MuiInputBase-input": {
                              fontSize: { xs: 15, sm: 16, md: 17 },
                              fontWeight: 400,
                              color: "text.primary",
                              "&::placeholder": {
                                 color: "text.secondary",
                                 opacity: 1,
                              },
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
