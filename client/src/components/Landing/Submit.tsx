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
               bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "#0a0e17" : "#fbfbfd",
               mx: -3,
               py: { xs: 8, md: 12 },
               mt: { xs: -4, md: -6 },
               pb: { xs: 10, md: 14 },
               position: "relative",
               overflow: "hidden",
               "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -100,
                  left: "20%",
                  width: 500,
                  height: 500,
                  background: (theme) =>
                     theme.palette.mode === "dark"
                        ? "radial-gradient(circle, rgba(0,153,255,0.15) 0%, rgba(0,153,255,0.05) 50%, transparent 70%)"
                        : "radial-gradient(circle, rgba(0,102,204,0.1) 0%, rgba(0,102,204,0.03) 50%, transparent 70%)",
                  borderRadius: "50%",
                  pointerEvents: "none",
                  animation: "rotate 20s linear infinite",
               },
               "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -100,
                  right: "20%",
                  width: 500,
                  height: 500,
                  background: (theme) =>
                     theme.palette.mode === "dark"
                        ? "radial-gradient(circle, rgba(0,153,255,0.15) 0%, rgba(0,153,255,0.05) 50%, transparent 70%)"
                        : "radial-gradient(circle, rgba(0,102,204,0.1) 0%, rgba(0,102,204,0.03) 50%, transparent 70%)",
                  borderRadius: "50%",
                  pointerEvents: "none",
                  animation: "rotate 20s linear infinite reverse",
               },
               "@keyframes rotate": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
               },
               // 添加几何装饰图案
               "& .geometric-pattern": {
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "80%",
                  height: "80%",
                  opacity: 0.03,
                  background: (theme) =>
                     theme.palette.mode === "dark"
                        ? `repeating-linear-gradient(
                           45deg,
                           transparent,
                           transparent 50px,
                           rgba(0,153,255,0.5) 50px,
                           rgba(0,153,255,0.5) 51px
                        )`
                        : `repeating-linear-gradient(
                           45deg,
                           transparent,
                           transparent 50px,
                           rgba(0,102,204,0.5) 50px,
                           rgba(0,102,204,0.5) 51px
                        )`,
                  pointerEvents: "none",
               },
            }}
         >
            <Box className="geometric-pattern" />
            <Container
               maxWidth={false}
               sx={{
                  maxWidth: 1850,
                  px: { xs: 3, sm: 5, md: 8 },
                  position: "relative",
                  zIndex: 1,
               }}
            >
               <Typography
                  variant="h4"
                  align="center"
                  sx={{
                     fontWeight: 600,
                     mb: 2,
                     fontSize: { xs: 32, md: 48, lg: 56, xl: 64 },
                     color: "text.primary",
                     letterSpacing: "-0.02em",
                     "@media (min-width: 1920px)": { fontSize: 72 },
                  }}
               >
                  Everything you need to showcase your work
               </Typography>
               <Typography
                  variant="body1"
                  align="center"
                  sx={{
                     mb: 6,
                     fontSize: { xs: 17, md: 19, xl: 21 },
                     color: "text.secondary",
                     maxWidth: 720,
                     mx: "auto",
                     lineHeight: 1.5,
                  }}
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
                     gap: { xs: 4, md: 5 },
                  }}
               >
                  {[
                     {
                        icon: <SchoolIcon />,
                        title: "Easy Submission",
                        desc: "Submit your capstone projects with detailed descriptions, technologies used, and project links.",
                     },
                     {
                        icon: <GroupsIcon />,
                        title: "Community Discovery",
                        desc: "Explore projects from fellow students, filter by category, and discover innovative solutions.",
                     },
                     {
                        icon: <EmojiEventsIcon />,
                        title: "Professional Showcase",
                        desc: "Present your work professionally with project details, live demos, and source code links.",
                     },
                  ].map((f, i) => (
                     <Card
                        key={f.title}
                        sx={{
                           borderRadius: 3,
                           border: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "1px solid #2d3548"
                                 : "1px solid #e5e5e7",
                           bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "#141824"
                                 : "#fafafa",
                           boxShadow: "none",
                           position: "relative",
                           overflow: "hidden",
                           transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                           gridColumn: {
                              sm: i === 2 ? "1 / -1" : "auto",
                              md: "auto",
                           },
                           justifySelf: { sm: i === 2 ? "center" : "stretch" },
                           maxWidth: { sm: i === 2 ? 460 : "none" },
                           // 添加渐变边框效果
                           "&::before": {
                              content: '""',
                              position: "absolute",
                              inset: 0,
                              borderRadius: 3,
                              padding: "1px",
                              background: (theme) =>
                                 theme.palette.mode === "dark"
                                    ? "linear-gradient(135deg, rgba(0,153,255,0.3), transparent, rgba(0,153,255,0.3))"
                                    : "linear-gradient(135deg, rgba(0,102,204,0.2), transparent, rgba(0,102,204,0.2))",
                              WebkitMask:
                                 "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                              WebkitMaskComposite: "xor",
                              maskComposite: "exclude",
                              opacity: 0,
                              transition: "opacity 0.3s ease",
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
                                    ? "0 12px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,153,255,0.15)"
                                    : "0 12px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,102,204,0.08)",
                              transform: "translateY(-12px) scale(1.03)",
                              "&::before": {
                                 opacity: 1,
                              },
                           },
                        }}
                     >
                        <CardContent
                           sx={{
                              textAlign: "center",
                              p: { xs: 3.5, md: 4.5 },
                              position: "relative",
                              zIndex: 1,
                           }}
                        >
                           <Box
                              sx={{
                                 width: { xs: 56, md: 64, xl: 72 },
                                 height: { xs: 56, md: 64, xl: 72 },
                                 borderRadius: 2.5,
                                 bgcolor: (theme) =>
                                    theme.palette.mode === "dark"
                                       ? "#1a1f2e"
                                       : "#f5f5f7",
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                                 mx: "auto",
                                 mb: 2.5,
                                 color: "primary.main",
                                 position: "relative",
                                 transition:
                                    "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                 boxShadow: (theme) =>
                                    theme.palette.mode === "dark"
                                       ? "0 4px 12px rgba(0,153,255,0.2)"
                                       : "0 4px 12px rgba(0,102,204,0.1)",
                                 // 添加光环效果
                                 "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    inset: -8,
                                    borderRadius: "50%",
                                    background: (theme) =>
                                       theme.palette.mode === "dark"
                                          ? "radial-gradient(circle, rgba(0,153,255,0.25) 0%, transparent 70%)"
                                          : "radial-gradient(circle, rgba(0,102,204,0.15) 0%, transparent 70%)",
                                    opacity: 0,
                                    transition: "opacity 0.4s ease",
                                 },
                                 "& svg": {
                                    fontSize: { xs: 28, md: 32, xl: 36 },
                                    transition:
                                       "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                 },
                                 ".MuiCard-root:hover &": {
                                    transform: "scale(1.15) rotate(10deg)",
                                    boxShadow:
                                       "0 8px 24px rgba(0,102,204,0.25)",
                                    "&::before": {
                                       opacity: 1,
                                    },
                                    "& svg": {
                                       transform: "scale(1.1)",
                                    },
                                 },
                              }}
                           >
                              {f.icon}
                           </Box>
                           <Typography
                              variant="subtitle1"
                              sx={{
                                 fontWeight: 600,
                                 mb: 1.25,
                                 fontSize: { xs: 19, md: 21, xl: 23 },
                                 color: (theme) =>
                                    theme.palette.mode === "dark"
                                       ? "#ffffff"
                                       : "#1d1d1f",
                              }}
                           >
                              {f.title}
                           </Typography>
                           <Typography
                              variant="body2"
                              sx={{
                                 fontSize: { xs: 15, md: 16, xl: 17 },
                                 lineHeight: 1.6,
                                 color: (theme) =>
                                    theme.palette.mode === "dark"
                                       ? "#b0b0b5"
                                       : "#6e6e73",
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
