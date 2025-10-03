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
            pt: { xs: 6, md: 8 },
            pb: { xs: 10, md: 14 },
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
                     fontSize: { xs: 34, md: 40, lg: 44 },
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
                        fontSize: { xs: 18, md: 20 },
                        lineHeight: 1.85,
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
                        px: 2.5,
                        py: 1,
                        fontSize: { xs: 14, md: 16 },
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
                  },
                  gap: 7,
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
                           borderRadius: "16px",
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
                        <CardContent>
                           <Box
                              sx={{
                                 display: "flex",
                                 justifyContent: "space-between",
                                 alignItems: "center",
                                 mb: 2,
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
                                 }}
                              />
                              <Box
                                 sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: "50%",
                                    bgcolor: "grey.200",
                                 }}
                              />
                           </Box>
                           <Box
                              sx={{
                                 borderRadius: 2,
                                 bgcolor: "grey.100",
                                 height: { xs: 140, md: 160 },
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                                 mb: 4,
                                 fontSize: { xs: 48, md: 56 },
                                 "& svg": { fontSize: "inherit" },
                              }}
                           >
                              {c.icon}
                           </Box>
                           <Typography
                              variant="subtitle1"
                              sx={{
                                 fontWeight: 600,
                                 fontSize: { xs: 22, md: 24 },
                              }}
                           >
                              {c.title}
                           </Typography>
                           <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                 mb: 1.5,
                                 fontSize: { xs: 17, md: 18 },
                                 lineHeight: 1.8,
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
