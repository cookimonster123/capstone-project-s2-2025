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
            bgcolor: "#ecf9ffff",
            mx: -3,
            pt: { xs: 8, md: 12 },
            pb: { xs: 8, md: 12 },
            mt: { xs: -4, md: -6 },
         }}
      >
         <Container
            maxWidth={false}
            sx={{ maxWidth: 1850, px: { xs: 3, sm: 5, md: 8 } }}
         >
            <Typography
               variant="h5"
               align="center"
               sx={{
                  fontWeight: 700,
                  mb: { xs: 3.5, md: 4.5 },
                  fontSize: { xs: 22, md: 30, lg: 32, xl: 36 },
                  "@media (min-width: 1920px)": { fontSize: 40 },
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
                     color: "text.primary",
                  }}
               >
                  <ChevronRightIcon />
               </IconButton>

               <Box
                  sx={{
                     display: "flex",
                     justifyContent: "center",
                     gap: 1,
                     mt: 2,
                  }}
               >
                  {Array.from({ length: winnersMaxIndex + 1 }).map((_, i) => (
                     <Box
                        key={i}
                        onClick={() => setWinnersIndex(i)}
                        sx={{
                           width: 7,
                           height: 7,
                           borderRadius: "50%",
                           bgcolor:
                              i === clampedIndex ? "primary.main" : "grey.400",
                           opacity: i === clampedIndex ? 0.9 : 0.6,
                           cursor: "pointer",
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
