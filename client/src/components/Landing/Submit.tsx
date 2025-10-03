import React from "react";
import { Box, Card, CardContent, Container, Typography } from "@mui/material";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import SchoolIcon from "@mui/icons-material/School";

/**
 * SubmitSection component displays the "Everything you need" and "Submit" sections
 * for the landing page.
 * @returns JSX.Element
 */
const SubmitSection: React.FC = () => {
   return (
      <>
         {/* Everything you need */}
         <Box
            sx={{
               bgcolor: "#fff",
               mx: -3,
               py: { xs: 8, md: 12 },
               mt: { xs: -4, md: -6 },
               // extend white background further to cover global light-blue strip
               pb: { xs: 11, md: 18 },
            }}
         >
            <Container
               maxWidth={false}
               sx={{ maxWidth: 1850, px: { xs: 3, sm: 5, md: 8 } }}
            >
               <Typography
                  variant="h4"
                  align="center"
                  sx={{
                     fontWeight: 700,
                     mb: 2,
                     fontSize: { xs: 28, md: 36, lg: 42 },
                  }}
               >
                  Everything you need to showcase your work
               </Typography>
               <Typography
                  variant="body1"
                  align="center"
                  color="text.secondary"
                  sx={{ mb: 6, fontSize: { xs: 22, md: 24 } }}
               >
                  From project submission to community discovery, we've got you
                  covered.
               </Typography>
               <Box
                  sx={{
                     display: "grid",
                     gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                     gap: 9,
                  }}
               >
                  {[
                     {
                        icon: <SchoolIcon color="primary" />,
                        title: "Easy Submission",
                        desc: "Submit your capstone projects with detailed descriptions, technologies used, and project links.",
                     },
                     {
                        icon: <GroupsIcon color="primary" />,
                        title: "Community Discovery",
                        desc: "Explore projects from fellow students, filter by category, and discover innovative solutions.",
                     },
                     {
                        icon: <EmojiEventsIcon color="primary" />,
                        title: "Professional Showcase",
                        desc: "Present your work professionally with project details, live demos, and source code links.",
                     },
                  ].map((f) => (
                     <Card
                        key={f.title}
                        sx={{
                           borderRadius: 3,
                           border: "none",
                           bgcolor: "transparent",
                           boxShadow: "none",
                        }}
                     >
                        <CardContent
                           sx={{ textAlign: "center", p: { xs: 3, md: 4 } }}
                        >
                           <Box
                              sx={{
                                 width: { xs: 64, md: 72 },
                                 height: { xs: 64, md: 72 },
                                 borderRadius: "50%",
                                 bgcolor: "#EAF2FF",
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                                 mx: "auto",
                                 mb: 2.5,
                                 opacity: 1,
                                 "& svg": { fontSize: { xs: 32, md: 36 } },
                              }}
                           >
                              {f.icon}
                           </Box>
                           <Typography
                              variant="subtitle1"
                              sx={{
                                 fontWeight: 700,
                                 mb: 1.25,
                                 fontSize: { xs: 22, md: 24 },
                              }}
                           >
                              {f.title}
                           </Typography>
                           <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                 fontSize: { xs: 17.5, md: 18.5 },
                                 lineHeight: 1.8,
                              }}
                           >
                              {f.desc}
                           </Typography>
                        </CardContent>
                     </Card>
                  ))}
               </Box>
            </Container>
         </Box>

         {/* Submit section removed as requested */}
      </>
   );
};

export default SubmitSection;
