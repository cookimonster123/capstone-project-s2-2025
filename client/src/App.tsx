import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AuthProvider } from "./context/AuthContext";
import { ThemeContextProvider } from "./context/ThemeContext";
import { ToastContainer } from "./utils/toast";
import MouseRipple from "./components/animations/MouseRipple";
import CursorFollower from "./components/animations/CursorFollower";
import MouseTrail from "./components/animations/MouseTrail";
import StarTrail from "./components/animations/StarTrail";
import ParticleExplosion from "./components/animations/ParticleExplosion";
import BackgroundShootingStars from "./components/animations/BackgroundShootingStars";
import { Box, useTheme } from "@mui/material";

function AppContent() {
   const theme = useTheme();
   const isDark = theme.palette.mode === "dark";

   return (
      <Box
         sx={{
            transition:
               "background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            minHeight: "100vh",
            bgcolor: theme.palette.background.default,
            color: theme.palette.text.primary,
         }}
      >
         <ToastContainer />

         <MouseRipple />
         <CursorFollower />
         <MouseTrail />
         <StarTrail />
         <ParticleExplosion />
         {isDark && <BackgroundShootingStars />}

         <RouterProvider router={router} />
      </Box>
   );
}

export default function App() {
   return (
      <ThemeContextProvider>
         <AuthProvider>
            <AppContent />
         </AuthProvider>
      </ThemeContextProvider>
   );
}
