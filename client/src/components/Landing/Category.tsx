import React from "react";
import { useNavigate } from "react-router-dom";
import {
   Box,
   Button,
   Card,
   CardContent,
   Container,
   Typography,
} from "@mui/material";
import WebIcon from "@mui/icons-material/Web";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

const categories = [
   {
      title: "Web Application",
      description:
         "Full‑stack sites, APIs, and responsive UIs built for the browser.",
      icon: <WebIcon color="primary" fontSize="inherit" />,
      tag: "WEB APP",
      filter: "Web Application",
   },
   {
      title: "Mobile App",
      description:
         "Native and cross‑platform apps for iOS/Android with modern tooling.",
      icon: <PhoneIphoneIcon color="primary" fontSize="inherit" />,
      tag: "APP",
      filter: "Mobile App",
   },
   {
      title: "Game Development",
      description:
         "Gameplay, engines, real‑time graphics, and interactive experiences.",
      icon: <SportsEsportsIcon color="primary" fontSize="inherit" />,
      tag: "GAME DEV",
      filter: "Game Development",
   },
   {
      title: "AI/ML",
      description:
         "Models, data pipelines, and intelligent systems for real‑world tasks.",
      icon: <SmartToyIcon color="primary" fontSize="inherit" />,
      tag: "AI/ML",
      filter: "AI/ML",
   },
];

interface CategoryProps {
   goToProjects: () => void;
}

const Category: React.FC<CategoryProps> = ({ goToProjects }) => {
   const navigate = useNavigate();

   return (
      <Box
         sx={{
            bgcolor: "transparent", // Changed from background.paper to transparent
            mx: -3,
            pt: { xs: 8, md: 10 },
            pb: { xs: 8, md: 12 },
            mt: { xs: 0, md: 0 },
            position: "relative",
            overflow: "hidden",
         }}
      >
         <Container
            maxWidth={false}
            sx={{
               maxWidth: 1850,
               px: { xs: 3, sm: 5, md: 8 },
               position: "relative",
               zIndex: 1,
            }}
         >
            <Box sx={{ mb: 6 }}>
               <Typography
                  variant="h4"
                  sx={{
                     fontWeight: 600,
                     fontSize: { xs: 32, md: 40, lg: 48, xl: 56 },
                     "@media (min-width: 1920px)": { fontSize: 64 },
                     color: (theme) =>
                        theme.palette.mode === "dark"
                           ? "#ffffff"
                           : "text.primary",
                     letterSpacing: "-0.02em",
                     mb: 2,
                  }}
               >
                  Explore by category
               </Typography>
               <Box
                  sx={{
                     display: "flex",
                     alignItems: "baseline",
                     gap: 2,
                     flexWrap: "wrap",
                     justifyContent: "space-between",
                     width: "100%",
                  }}
               >
                  <Typography
                     variant="body2"
                     sx={{
                        fontSize: { xs: 17, md: 19, lg: 21 },
                        lineHeight: 1.5,
                        flex: "1 1 auto",
                        color: "text.secondary",
                        letterSpacing: "-0.01em",
                     }}
                  >
                     Quickly find projects you care about.
                  </Typography>
                  <Button
                     variant="text"
                     onClick={goToProjects}
                     sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        px: 2.5,
                        py: 1,
                        fontSize: { xs: 15, md: 17 },
                        ml: "auto",
                        color: "primary.main",
                        fontWeight: 400,
                        "&:hover": {
                           bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "rgba(0,153,255,0.12)"
                                 : "rgba(0,113,227,0.08)",
                        },
                     }}
                  >
                     View all →
                  </Button>
               </Box>
            </Box>

            <Box
               sx={{
                  display: "grid",
                  gridTemplateColumns: {
                     xs: "1fr",
                     sm: "repeat(2, 1fr)",
                     md: "repeat(4, 1fr)",
                     lg: "repeat(4, 1fr)",
                  },
                  gap: { xs: 4, md: 3, lg: 4 },
                  mt: { xs: 7, md: 8 },
               }}
            >
               {categories.map((c) => (
                  <Box key={c.title} sx={{ minWidth: 0 }}>
                     <Card
                        variant="outlined"
                        onClick={() =>
                           navigate(
                              `/projects?category=${encodeURIComponent(c.filter)}`,
                           )
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                           if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              navigate(
                                 `/projects?category=${encodeURIComponent(c.filter)}`,
                              );
                           }
                        }}
                        sx={{
                           width: "100%",
                           height: "100%",
                           borderRadius: 3,
                           overflow: "hidden",
                           border: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "1px solid #2d3548"
                                 : "1px solid #e5e5e7",
                           bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "#141824"
                                 : "#fafafa",
                           cursor: "pointer",
                           position: "relative",
                           transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                           // 添加光泽效果
                           "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: "-100%",
                              width: "100%",
                              height: "100%",
                              background: (theme) =>
                                 theme.palette.mode === "dark"
                                    ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
                                    : "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                              transition: "left 0.5s ease",
                           },
                           "&:hover": {
                              bgcolor: (theme) =>
                                 theme.palette.mode === "dark"
                                    ? "#1a1f2e"
                                    : "#ffffff",
                              borderColor: (theme) =>
                                 theme.palette.mode === "dark"
                                    ? "#3d4657"
                                    : "#d2d2d7",
                              boxShadow: (theme) =>
                                 theme.palette.mode === "dark"
                                    ? "0 8px 24px rgba(0,0,0,0.5)"
                                    : "0 8px 24px rgba(0,0,0,0.12)",
                              transform: "translateY(-8px) scale(1.02)",
                              "&::before": {
                                 left: "100%",
                              },
                           },
                           "&:focus-visible": {
                              outline: (theme) =>
                                 theme.palette.mode === "dark"
                                    ? "2px solid #0099ff"
                                    : "2px solid #06c",
                              outlineOffset: 2,
                           },
                        }}
                     >
                        <CardContent
                           sx={{
                              p: { xs: 3, md: 3.5 },
                              position: "relative",
                              zIndex: 1,
                           }}
                        >
                           <Box
                              sx={{
                                 width: 56,
                                 height: 56,
                                 borderRadius: 2.5,
                                 bgcolor: (theme) =>
                                    theme.palette.mode === "dark"
                                       ? "#1a1f2e"
                                       : "#f5f5f7",
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                                 mb: 3,
                                 fontSize: 30,
                                 color: "primary.main",
                                 transition:
                                    "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                 boxShadow: (theme) =>
                                    theme.palette.mode === "dark"
                                       ? "0 2px 8px rgba(0,153,255,0.15)"
                                       : "0 2px 8px rgba(0,102,204,0.08)",
                                 "& svg": { fontSize: "inherit" },
                                 ".MuiCard-root:hover &": {
                                    transform: "scale(1.1) rotate(5deg)",
                                    boxShadow: (theme) =>
                                       theme.palette.mode === "dark"
                                          ? "0 4px 16px rgba(0,153,255,0.3)"
                                          : "0 4px 16px rgba(0,102,204,0.2)",
                                 },
                              }}
                           >
                              {c.icon}
                           </Box>
                           <Typography
                              variant="subtitle1"
                              sx={{
                                 fontWeight: 600,
                                 fontSize: { xs: 19, md: 21 },
                                 mb: 1,
                                 color: (theme) =>
                                    theme.palette.mode === "dark"
                                       ? "#ffffff"
                                       : "#1d1d1f",
                                 letterSpacing: "-0.01em",
                              }}
                           >
                              {c.title}
                           </Typography>
                           <Typography
                              variant="body2"
                              sx={{
                                 fontSize: { xs: 15, md: 16 },
                                 lineHeight: 1.5,
                                 color: (theme) =>
                                    theme.palette.mode === "dark"
                                       ? "#b0b0b5"
                                       : "#6e6e73",
                                 letterSpacing: "-0.01em",
                              }}
                           >
                              {c.description}
                           </Typography>
                        </CardContent>
                     </Card>
                  </Box>
               ))}
            </Box>
         </Container>
      </Box>
   );
};

export default Category;
