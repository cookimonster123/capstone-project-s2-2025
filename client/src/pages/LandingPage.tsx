import React from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Hero from "../components/Landing/Hero";
import Category from "../components/Landing/Category";
import { fetchProjects } from "../api/projectApi";
import type { Project } from "../types/project";
import CapstoneWinner from "../components/Landing/CapstoneWinner";
import SubmitSection from "../components/Landing/Submit";

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
      // Load projects and keep only first 6 for winners showcase
      fetchProjects()
         .then((p) => setProjects(p.slice(0, 6)))
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
      <Box
         sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 4, md: 6 },
            bgcolor: "#fff", // ensure white background fills the page area
            minHeight: "100vh", // cover viewport height so no base blue shows
            mx: -3, // stretch to full width (RootLayout adds px:3)
            px: 3, // restore inner padding visually
            mb: -6, // offset RootLayout pb:6 so no base background shows below
         }}
      >
         {/* Hero */}
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
      </Box>
   );
};

export default LandingPage;
