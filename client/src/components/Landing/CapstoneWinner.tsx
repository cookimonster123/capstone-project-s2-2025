import React from "react";
import { Box, Container, IconButton, Typography } from "@mui/material";
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

const VISIBLE_WINNERS = 3;

const CapstoneWinner: React.FC<CapstoneWinnerProps> = ({
   winners,
   winnersIndex,
   setWinnersIndex,
   handleWinnerCardClick,
}) => {
   // Prefer projects with awards; if none, fall back to the first 3 provided
   const effectiveWinners = React.useMemo(() => {
      const withAwards = winners.filter(
         (p) => Array.isArray(p.awards) && p.awards.length > 0,
      );
      return withAwards.length > 0 ? withAwards : winners.slice(0, 3);
   }, [winners]);

   const winnersMaxIndex = Math.max(
      0,
      effectiveWinners.length - VISIBLE_WINNERS,
   );
   const clampedIndex = Math.min(Math.max(0, winnersIndex), winnersMaxIndex);
   const { isLoggedIn } = useAuth();
   return (
      <Box
         sx={{
            bgcolor: "#ecf9ffff",
            mx: -3,
            pt: { xs: 10, md: 14 },
            pb: { xs: 10, md: 14 },
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
                  mb: { xs: 4, md: 5 },
                  fontSize: { xs: 24, md: 34, lg: 36 },
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
                     left: -24,
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
                        gap: 0,
                        transform: `translateX(-${(100 / VISIBLE_WINNERS) * clampedIndex}%)`,
                        transition: "transform 300ms ease",
                        width: "100%",
                     }}
                  >
                     {effectiveWinners.map((project) => (
                        <Box
                           key={project._id}
                           sx={{
                              flex: "0 0 calc(100% / 3)",
                              boxSizing: "border-box",
                              p: 1,
                              display: "flex",
                              justifyContent: "center",
                           }}
                        >
                           <ProjectCard
                              project={project}
                              onClick={handleWinnerCardClick}
                              isAuthenticated={isLoggedIn}
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
                     right: -24,
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
                           width: 8,
                           height: 8,
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
