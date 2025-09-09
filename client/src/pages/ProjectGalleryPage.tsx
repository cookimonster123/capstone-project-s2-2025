import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ProjectGrid from "../components/projects/ProjectGrid";

// Create a theme for consistent styling
const theme = createTheme({
   palette: {
      primary: {
         main: "#1976d2",
      },
      secondary: {
         main: "#dc004e",
      },
   },
   typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h3: {
         fontWeight: 700,
      },
      h6: {
         fontWeight: 500,
      },
   },
});

/**
 * ProjectGalleryPage - Main page component for displaying the project gallery
 */
const ProjectGalleryPage: React.FC = () => {
   return (
      <ThemeProvider theme={theme}>
         <CssBaseline />
         <ProjectGrid />
      </ThemeProvider>
   );
};

export default ProjectGalleryPage;
