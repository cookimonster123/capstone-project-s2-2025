import React from "react";
import { useNavigate } from "react-router-dom";
import {
   Box,
   Button,
   Card,
   CardContent,
   Chip,
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
            bgcolor: "#fff",
            mx: -3,
            pt: { xs: 5, md: 7 },
            pb: { xs: 8, md: 12 },
            mt: { xs: -4, md: -6 },
         }}
      >
         <Container
            maxWidth={false}
            sx={{ maxWidth: 1850, px: { xs: 3, sm: 5, md: 8 } }}
         >
            <Box sx={{ mb: 2 }}>
               <Typography
                  variant="h4"
                  sx={{
                     fontWeight: 700,
                     fontSize: { xs: 28, md: 32, lg: 36, xl: 40 },
                     "@media (min-width: 1920px)": { fontSize: 44 },
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
                     color="text.secondary"
                     sx={{
                        fontSize: { xs: 14.5, md: 16, lg: 18, xl: 18 },
                        lineHeight: 1.75,
                        flex: "1 1 auto",
                     }}
                  >
                     Quickly find projects you care about. Browse by focus and
                     dive into curated student work.
                  </Typography>
                  <Button
                     variant="contained"
                     color="primary"
                     onClick={goToProjects}
                     sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        px: 1.75,
                        py: 0.6,
                        fontSize: { xs: 12.5, md: 14, xl: 15 },
                        ml: "auto",
                     }}
                  >
                     View all
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
                           borderRadius: "12px",
                           overflow: "hidden",
                           border: "1px solid",
                           borderColor: "divider",
                           cursor: "pointer",
                           transition:
                              "box-shadow 160ms ease, border-color 160ms ease, transform 120ms ease",
                           "&:hover": {
                              boxShadow: 3,
                              borderColor: "primary.light",
                              transform: "translateY(-2px)",
                           },
                           "&:focus-visible": {
                              outline: "2px solid",
                              outlineColor: "primary.main",
                           },
                        }}
                     >
                        <CardContent sx={{ p: { xs: 2, md: 2, lg: 2.5 } }}>
                           <Box
                              sx={{
                                 display: "flex",
                                 justifyContent: "space-between",
                                 alignItems: "center",
                                 mb: 1.5,
                              }}
                           >
                              <Chip
                                 label={c.tag}
                                 size="small"
                                 variant="filled"
                                 sx={{
                                    borderRadius: 999,
                                    bgcolor: "grey.200",
                                    color: "text.primary",
                                    height: { xs: 22, md: 20 },
                                    "& .MuiChip-label": {
                                       px: 1,
                                       fontSize: { xs: 11, md: 10 },
                                    },
                                 }}
                              />
                              <Box
                                 sx={{
                                    width: { xs: 20, md: 18 },
                                    height: { xs: 20, md: 18 },
                                    borderRadius: "50%",
                                    bgcolor: "grey.200",
                                 }}
                              />
                           </Box>
                           <Box
                              sx={{
                                 borderRadius: 2,
                                 bgcolor: "grey.100",
                                 aspectRatio: "16 / 9",
                                 width: "100%",
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                                 mb: 3,
                                 fontSize: { xs: 30, md: 34, lg: 46, xl: 54 },
                                 "& svg": { fontSize: "inherit" },
                              }}
                           >
                              {c.icon}
                           </Box>
                           <Typography
                              variant="subtitle1"
                              sx={{
                                 fontWeight: 600,
                                 fontSize: { xs: 16, md: 16, xl: 20 },
                              }}
                           >
                              {c.title}
                           </Typography>
                           <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                 mb: 1,
                                 fontSize: { xs: 14, md: 14, lg: 16, xl: 16 },
                                 lineHeight: 1.7,
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
