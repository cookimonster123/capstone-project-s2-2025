import React from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Hero from "../components/Landing/Hero";
import Category from "../components/Landing/Category";
import { fetchProjects } from "../api/projectApi";
import type { Project } from "../types/project";
import CapstoneWinner from "../components/Landing/CapstoneWinner";
import SubmitSection from "../components/Landing/Submit";
import ParticlesBackground from "../components/animations/ParticlesBackground";
import GradientBackground from "../components/animations/GradientBackground";
import FloatingElements from "../components/animations/FloatingElements";
import { motion } from "framer-motion";

const LandingPage: React.FC = () => {
   const navigate = useNavigate();
   const [searchQuery, setSearchQuery] = React.useState("");
   const [winnersIndex, setWinnersIndex] = React.useState(0);
   const [projects, setProjects] = React.useState<Project[]>([]);

   // Always start from top when entering the landing page
   React.useEffect(() => {
      try {
         window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch {
         window.scrollTo(0, 0);
      }
   }, []);
   React.useEffect(() => {
      // Load all awarded projects
      fetchProjects()
         .then((p) => setProjects(p))
         .catch(() => setProjects([]));
   }, []);
   const winners = projects; // first 6 already

   const goToProjects = () => navigate("/projects");

   const handleSearchSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      if (!searchQuery.trim()) return;
      // Pass the search text to ProjectGalleryPage via the unified `q` param
      navigate(`/projects?q=${encodeURIComponent(searchQuery.trim())}`);
   };

   // Hero part of the ProjectCard jumps to the corresponding ProjectProfilePage
   const handleHeroCardClick = (project: Project) => {
      navigate(`/profile/${project._id}`);
   };

   // Capstone Winner part of the ProjectCard jumps to the corresponding ProjectProfilePage
   const handleWinnerCardClick = (project: Project) => {
      navigate(`/profile/${project._id}`);
   };

   return (
      <>
         {/* Epic Background Layers */}
         <GradientBackground />
         <ParticlesBackground />

         <Box
            sx={{
               display: "flex",
               flexDirection: "column",
               gap: { xs: 3, md: 5 },
               minHeight: "100vh",
               mx: -3,
               px: 3,
               mb: -6,
               position: "relative",
            }}
         >
            {/* Floating geometric shapes */}
            <FloatingElements />

            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1 }}
               style={{ position: "relative", zIndex: 1 }}
            >
               <Hero
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleSearchSubmit={handleSearchSubmit}
                  projects={projects}
                  handleHeroCardClick={handleHeroCardClick}
               />

               {/* Explore by category */}
               <Category goToProjects={goToProjects} />

               {/* Capstone Winners */}
               <CapstoneWinner
                  winners={winners}
                  winnersIndex={winnersIndex}
                  setWinnersIndex={setWinnersIndex}
                  handleWinnerCardClick={handleWinnerCardClick}
               />

               {/* Everything you need */}
               <SubmitSection />
            </motion.div>
         </Box>
      </>
   );
};

export default LandingPage;
