import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
   mode: ThemeMode;
   toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Custom hook to access theme context
 * Provides current theme mode and toggle function
 *
 * @throws Error if used outside ThemeContextProvider
 */
export const useThemeMode = () => {
   const context = useContext(ThemeContext);
   if (!context) {
      throw new Error("useThemeMode must be used within ThemeContextProvider");
   }
   return context;
};

interface ThemeContextProviderProps {
   children: ReactNode;
}

/**
 * Theme context provider with light/dark mode support
 * Persists theme preference in localStorage
 * Provides Material-UI theme configuration for both modes
 */
export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({
   children,
}) => {
   const [mode, setMode] = useState<ThemeMode>(() => {
      // Load theme from localStorage or default to light
      const savedTheme = localStorage.getItem("themeMode") as ThemeMode;
      return savedTheme || "light";
   });

   useEffect(() => {
      // Persist theme to localStorage
      localStorage.setItem("themeMode", mode);
   }, [mode]);

   const toggleTheme = () => {
      setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
   };

   // Create Material-UI theme based on mode
   const theme: Theme = React.useMemo(
      () =>
         createTheme({
            palette: {
               mode,
               primary: {
                  main: mode === "light" ? "#0066cc" : "#0099ff",
                  light: mode === "light" ? "#0099ff" : "#33b3ff",
                  dark: mode === "light" ? "#004d99" : "#0066cc",
               },
               secondary: {
                  main: mode === "light" ? "#ff3b5c" : "#ff6b88",
                  light: mode === "light" ? "#ff6b88" : "#ff9bb0",
                  dark: mode === "light" ? "#cc2f4a" : "#ff3b5c",
               },
               background: {
                  default: mode === "light" ? "#ffffff" : "#0a0e17",
                  paper: mode === "light" ? "#ffffff" : "#151b2b",
               },
               text: {
                  primary: mode === "light" ? "#1a1a1a" : "#e8eaf0",
                  secondary: mode === "light" ? "#666666" : "#a8abb8",
               },
               divider: mode === "light" ? "#e5e5e7" : "#2a3142",
            },
            typography: {
               fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
               h1: { fontWeight: 700 },
               h2: { fontWeight: 700 },
               h3: { fontWeight: 600 },
               h4: { fontWeight: 600 },
               h5: { fontWeight: 600 },
               h6: { fontWeight: 600 },
            },
            shape: {
               borderRadius: 8,
            },
            components: {
               MuiButton: {
                  styleOverrides: {
                     root: {
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 8,
                     },
                  },
               },
               MuiCard: {
                  styleOverrides: {
                     root: {
                        backgroundImage: "none",
                        borderRadius: 12,
                     },
                  },
               },
               MuiPaper: {
                  styleOverrides: {
                     root: {
                        backgroundImage: "none",
                     },
                  },
               },
            },
         }),
      [mode],
   );

   return (
      <ThemeContext.Provider value={{ mode, toggleTheme }}>
         <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
         </ThemeProvider>
      </ThemeContext.Provider>
   );
};
