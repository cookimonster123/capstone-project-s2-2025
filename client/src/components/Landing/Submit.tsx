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
               py: { xs: 6, md: 10 },
               mt: { xs: -4, md: -6 },
               // extend white background further to cover global light-blue strip
               pb: { xs: 9, md: 14 },
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
                     fontSize: { xs: 24, md: 32, lg: 38, xl: 42 },
                     "@media (min-width: 1920px)": { fontSize: 46 },
                  }}
               >
                  Everything you need to showcase your work
               </Typography>
               <Typography
                  variant="body1"
                  align="center"
                  color="text.secondary"
                  sx={{ mb: 5, fontSize: { xs: 18, md: 20, xl: 22 } }}
               >
                  From project submission to community discovery, we've got you
                  covered.
               </Typography>
               <Box
                  sx={{
                     display: "grid",
                     gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                     },
                     gap: 6,
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
                  ].map((f, i) => (
                     <Card
                        key={f.title}
                        sx={{
                           borderRadius: 3,
                           border: "none",
                           bgcolor: "transparent",
                           boxShadow: "none",
                           // Center the third card on small screens to form a triangle layout
                           gridColumn: {
                              sm: i === 2 ? "1 / -1" : "auto",
                              md: "auto",
                           },
                           justifySelf: { sm: i === 2 ? "center" : "stretch" },
                           maxWidth: { sm: i === 2 ? 460 : "none" },
                        }}
                     >
                        <CardContent
                           sx={{ textAlign: "center", p: { xs: 3, md: 4 } }}
                        >
                           <Box
                              sx={{
                                 width: { xs: 52, md: 60, xl: 72 },
                                 height: { xs: 52, md: 60, xl: 72 },
                                 borderRadius: "50%",
                                 bgcolor: "#EAF2FF",
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                                 mx: "auto",
                                 mb: 2.5,
                                 opacity: 1,
                                 "& svg": {
                                    fontSize: { xs: 26, md: 32, xl: 36 },
                                 },
                              }}
                           >
                              {f.icon}
                           </Box>
                           <Typography
                              variant="subtitle1"
                              sx={{
                                 fontWeight: 700,
                                 mb: 1.25,
                                 fontSize: { xs: 18, md: 20, xl: 22 },
                              }}
                           >
                              {f.title}
                           </Typography>
                           <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                 fontSize: { xs: 15, md: 16.5, xl: 17 },
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
