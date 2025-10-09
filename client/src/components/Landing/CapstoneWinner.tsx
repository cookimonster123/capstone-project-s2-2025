import React from "react";
import {
   Box,
   Container,
   IconButton,
   Typography,
   useMediaQuery,
   useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ProjectCard from "../projects/ProjectCard";
import type { Project } from "../../types/project";
import { useAuth } from "../../context/AuthContext";

interface CapstoneWinnerProps {
   winners: Project[];
   winnersIndex: number;
   setWinnersIndex: (i: number) => void;
   handleWinnerCardClick: (project: Project) => void;
}

const CapstoneWinner: React.FC<CapstoneWinnerProps> = ({
   winners,
   winnersIndex,
   setWinnersIndex,
   handleWinnerCardClick,
}) => {
   const theme = useTheme();
   const upMd = useMediaQuery(theme.breakpoints.up("md"));
   const smOnly = useMediaQuery(theme.breakpoints.between("sm", "md"));
   const mdOnly = useMediaQuery(theme.breakpoints.between("md", "lg"));
   // Show 3 cards on sm (>=768) and md+, otherwise 1 on xs
   const visibleCount = React.useMemo(() => {
      if (upMd || smOnly) return 3;
      return 1;
   }, [upMd, smOnly]);
   // Prefer projects with awards; if none, fall back to the first 3 provided
   const effectiveWinners = React.useMemo(() => {
      const withAwards = winners.filter(
         (p) => Array.isArray(p.awards) && p.awards.length > 0,
      );
      return withAwards.length > 0 ? withAwards : winners.slice(0, 3);
   }, [winners]);

   const winnersMaxIndex = Math.max(0, effectiveWinners.length - visibleCount);
   const clampedIndex = Math.min(Math.max(0, winnersIndex), winnersMaxIndex);
   const { isLoggedIn } = useAuth();
   return (
      <Box
         sx={{
            bgcolor: (theme) =>
               theme.palette.mode === "dark" ? "#0a0e17" : "#fbfbfd",
            mx: -3,
            pt: { xs: 10, md: 14 },
            pb: { xs: 10, md: 14 },
            mt: { xs: -4, md: -6 },
            position: "relative",
            overflow: "hidden",
            "&::before": {
               content: '""',
               position: "absolute",
               top: 0,
               left: 0,
               right: 0,
               height: "1px",
               background: (theme) =>
                  theme.palette.mode === "dark"
                     ? "linear-gradient(90deg, transparent, #2d3548 50%, transparent)"
                     : "linear-gradient(90deg, transparent, #e5e5e7 50%, transparent)",
            },
            "&::after": {
               content: '""',
               position: "absolute",
               bottom: 0,
               left: 0,
               right: 0,
               height: "1px",
               background: (theme) =>
                  theme.palette.mode === "dark"
                     ? "linear-gradient(90deg, transparent, #2d3548 50%, transparent)"
                     : "linear-gradient(90deg, transparent, #e5e5e7 50%, transparent)",
            },
         }}
      >
         {/* Floating particles background effect */}
         {[...Array(25)].map((_, i) => (
            <Box
               key={`particle-${i}`}
               sx={{
                  position: "absolute",
                  width: `${2 + Math.random() * 3}px`,
                  height: `${2 + Math.random() * 3}px`,
                  bgcolor: (theme) =>
                     theme.palette.mode === "dark"
                        ? `rgba(0, 153, 255, ${0.2 + Math.random() * 0.3})`
                        : `rgba(0, 102, 204, ${0.15 + Math.random() * 0.2})`,
                  borderRadius: "50%",
                  left: `${Math.random() * 100}%`,
                  top: `${20 + Math.random() * 60}%`,
                  opacity: 0,
                  boxShadow: (theme) =>
                     theme.palette.mode === "dark"
                        ? "0 0 10px rgba(0, 153, 255, 0.5)"
                        : "0 0 8px rgba(0, 102, 204, 0.4)",
                  animation: `floatParticle ${8 + Math.random() * 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                  "@keyframes floatParticle": {
                     "0%, 100%": {
                        opacity: 0,
                        transform: "translateY(0) scale(0.5)",
                     },
                     "50%": {
                        opacity: 1,
                        transform: `translateY(-${30 + Math.random() * 50}px) scale(1.2)`,
                     },
                  },
               }}
            />
         ))}

         {/* Subtle gradient orbs */}
         <Box
            sx={{
               position: "absolute",
               top: "10%",
               left: "5%",
               width: "300px",
               height: "300px",
               borderRadius: "50%",
               background: (theme) =>
                  theme.palette.mode === "dark"
                     ? "radial-gradient(circle, rgba(0, 153, 255, 0.08) 0%, transparent 70%)"
                     : "radial-gradient(circle, rgba(0, 102, 204, 0.05) 0%, transparent 70%)",
               filter: "blur(40px)",
               animation: "pulseOrb1 10s ease-in-out infinite",
               "@keyframes pulseOrb1": {
                  "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
                  "50%": { opacity: 1, transform: "scale(1.3)" },
               },
            }}
         />
         <Box
            sx={{
               position: "absolute",
               bottom: "15%",
               right: "8%",
               width: "350px",
               height: "350px",
               borderRadius: "50%",
               background: (theme) =>
                  theme.palette.mode === "dark"
                     ? "radial-gradient(circle, rgba(0, 153, 255, 0.06) 0%, transparent 70%)"
                     : "radial-gradient(circle, rgba(0, 102, 204, 0.04) 0%, transparent 70%)",
               filter: "blur(50px)",
               animation: "pulseOrb2 12s ease-in-out infinite",
               "@keyframes pulseOrb2": {
                  "0%, 100%": { opacity: 0.5, transform: "scale(1)" },
                  "50%": { opacity: 0.9, transform: "scale(1.2)" },
               },
            }}
         />

         <Container
            maxWidth={false}
            sx={{
               maxWidth: 1850,
               px: { xs: 3, sm: 5, md: 8 },
               position: "relative",
               zIndex: 1,
            }}
         >
            <Typography
               variant="h5"
               align="center"
               sx={{
                  fontWeight: 600,
                  mb: { xs: 4, md: 5 },
                  fontSize: { xs: 28, md: 40, lg: 48, xl: 56 },
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                  position: "relative",
                  display: "inline-block",
                  width: "100%",
                  "@media (min-width: 1920px)": { fontSize: 64 },
                  // 添加装饰下划线
                  "&::after": {
                     content: '""',
                     position: "absolute",
                     bottom: -12,
                     left: "50%",
                     transform: "translateX(-50%)",
                     width: 120,
                     height: 4,
                     borderRadius: 2,
                     background: (theme) =>
                        theme.palette.mode === "dark"
                           ? "linear-gradient(90deg, transparent, #0099ff, transparent)"
                           : "linear-gradient(90deg, transparent, #06c, transparent)",
                     opacity: 0.6,
                  },
               }}
            >
               Capstone Winners
            </Typography>
            <Box sx={{ position: "relative" }}>
               <IconButton
                  aria-label="previous"
                  onClick={() => setWinnersIndex(Math.max(0, clampedIndex - 1))}
                  sx={{
                     position: "absolute",
                     left: -20,
                     top: "50%",
                     transform: "translateY(-50%)",
                     zIndex: 1,
                     color: "text.primary",
                     bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "#1a1f2e" : "#ffffff",
                     border: (theme) =>
                        theme.palette.mode === "dark"
                           ? "1px solid #2d3548"
                           : "1px solid #e5e5e7",
                     width: 40,
                     height: 40,
                     transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                     "&:hover": {
                        bgcolor: (theme) =>
                           theme.palette.mode === "dark"
                              ? "#232936"
                              : "#f5f5f7",
                        borderColor: (theme) =>
                           theme.palette.mode === "dark"
                              ? "#3d4657"
                              : "#d2d2d7",
                        transform: "translateY(-50%) scale(1.05)",
                     },
                  }}
               >
                  <ChevronLeftIcon />
               </IconButton>

               <Box sx={{ overflow: "hidden" }}>
                  <Box
                     sx={{
                        display: "flex",
                        gap: 0, // use per-item horizontal padding to create visual gaps so translateX stays aligned
                        transform: `translateX(-${(100 / visibleCount) * clampedIndex}%)`,
                        transition: "transform 300ms ease",
                        width: "100%",
                        // no container gap ensures exact page-width step alignment
                     }}
                  >
                     {effectiveWinners.map((project) => (
                        <Box
                           key={project._id}
                           sx={{
                              flex: `0 0 calc(100% / ${visibleCount})`,
                              boxSizing: "border-box",
                              px: { xs: 0.5, sm: 1, md: 1.25, lg: 1.75, xl: 2 },
                              display: "flex",
                              justifyContent: "center",
                              transform: {
                                 xs: "scale(0.88)",
                                 sm: "scale(0.92)",
                                 md: "scale(0.95)",
                                 lg: "scale(0.97)",
                                 xl: "scale(0.98)",
                              },
                              transformOrigin: "center",
                              "@media (min-width: 1920px)": {
                                 transform: "scale(0.96)",
                                 px: 2.75,
                              },
                              "@media (min-width: 2560px)": {
                                 transform: "scale(0.96)",
                                 px: 3.5,
                              },
                           }}
                        >
                           <ProjectCard
                              project={project}
                              onClick={handleWinnerCardClick}
                              isAuthenticated={isLoggedIn}
                              width={"100%"}
                              height={smOnly ? 240 : upMd ? 320 : 380}
                              dense={smOnly || mdOnly}
                           />
                        </Box>
                     ))}
                  </Box>
               </Box>

               <IconButton
                  aria-label="next"
                  onClick={() =>
                     setWinnersIndex(
                        Math.min(winnersMaxIndex, clampedIndex + 1),
                     )
                  }
                  sx={{
                     position: "absolute",
                     right: -20,
                     top: "50%",
                     transform: "translateY(-50%)",
                     color: (theme) =>
                        theme.palette.mode === "dark" ? "#ffffff" : "#1d1d1f",
                     bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "#1a2332" : "#ffffff",
                     border: (theme) =>
                        theme.palette.mode === "dark"
                           ? "1px solid #2a3142"
                           : "1px solid #e5e5e7",
                     width: 40,
                     height: 40,
                     transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                     "&:hover": {
                        bgcolor: (theme) =>
                           theme.palette.mode === "dark"
                              ? "#222b3d"
                              : "#f5f5f7",
                        borderColor: (theme) =>
                           theme.palette.mode === "dark"
                              ? "#3d4657"
                              : "#d2d2d7",
                        transform: "translateY(-50%) scale(1.05)",
                     },
                  }}
               >
                  <ChevronRightIcon />
               </IconButton>

               <Box
                  sx={{
                     display: "flex",
                     justifyContent: "center",
                     gap: 1,
                     mt: 3,
                  }}
               >
                  {Array.from({ length: winnersMaxIndex + 1 }).map((_, i) => (
                     <Box
                        key={i}
                        onClick={() => setWinnersIndex(i)}
                        sx={{
                           width: 8,
                           height: 8,
                           borderRadius: "50%",
                           bgcolor: i === clampedIndex ? "#1d1d1f" : "#d2d2d7",
                           opacity: i === clampedIndex ? 1 : 0.5,
                           cursor: "pointer",
                           transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                           "&:hover": {
                              opacity: 0.8,
                              transform: "scale(1.15)",
                           },
                        }}
                     />
                  ))}
               </Box>
            </Box>
         </Container>
      </Box>
   );
};

export default CapstoneWinner;
