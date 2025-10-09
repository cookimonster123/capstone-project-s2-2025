import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "../../context/ThemeContext";

/**
 * Animated dark mode toggle button
 * Switches between sun (light) and moon (dark) icons with smooth rotation
 * Displays tooltip on hover
 */
const DarkModeToggle: React.FC = () => {
   const { mode, toggleTheme } = useThemeMode();
   const isDark = mode === "dark";

   return (
      <Tooltip
         title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
         arrow
      >
         <IconButton
            onClick={toggleTheme}
            sx={{
               color: isDark ? "#ffd700" : "#ff9800",
               transition: "all 0.3s ease",
               "&:hover": {
                  bgcolor: isDark
                     ? "rgba(255, 215, 0, 0.1)"
                     : "rgba(255, 152, 0, 0.1)",
                  transform: "scale(1.1)",
               },
            }}
         >
            <motion.div
               key={mode}
               initial={{ rotate: -180, scale: 0 }}
               animate={{ rotate: 0, scale: 1 }}
               exit={{ rotate: 180, scale: 0 }}
               transition={{
                  duration: 0.5,
                  ease: "easeInOut",
               }}
               style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               {isDark ? (
                  <DarkModeIcon sx={{ fontSize: 24 }} />
               ) : (
                  <LightModeIcon sx={{ fontSize: 24 }} />
               )}
            </motion.div>
         </IconButton>
      </Tooltip>
   );
};

export default DarkModeToggle;
