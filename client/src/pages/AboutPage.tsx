import React from "react";
import {
   Box,
   Container,
   Typography,
   Stack,
   Card,
   CardContent,
   Avatar,
   Chip,
} from "@mui/material";
import avatar1 from "../assets/member/avatar_member1.png"; // Yiguang Sun
import avatar2 from "../assets/member/avatar_member2.png"; // Andy Guo
import avatar3 from "../assets/member/avatar_member3.png"; // Jacob Wang
import avatar4 from "../assets/member/avatar_member4.png"; // Yizhao Yuan
import avatar5 from "../assets/member/avatar_member5.png"; // Shan-Hai Guan
import teamLogo from "../assets/logo.svg"; // Team logo

// ===== Types & inline data =====
type TeamMember = {
   name: string;
   role: string;
   skills: string[];
   avatar?: string;
   github?: string;
   linkedin?: string;
};

const teamMembers: TeamMember[] = [
   {
      name: "Yiguang Sun",
      role: "Frontend Developer",
      skills: ["React", "MUI", "TypeScript"],
      avatar: avatar1,
   },
   {
      name: "Andy Guo",
      role: "Frontend Developer",
      skills: ["UI/UX", "Components", "Routing"],
      avatar: avatar2,
   },
   {
      name: "Jacob Wang",
      role: "Backend Developer",
      skills: ["REST APIs", "Testing", "Deployment"],
      avatar: avatar3,
   },
   {
      name: "Yizhao Yuan",
      role: "Backend Developer",
      skills: ["API", "Auth", "Database"],
      avatar: avatar4,
   },
   {
      name: "Shan-Hai Guan",
      role: "Full Stack Developer",
      skills: ["Integration", "DevOps", "Code Review"],
      avatar: avatar5,
   },
];

const journey: { when: string; title: string; desc: string }[] = [
   {
      when: "Kickoff",
      title: "Why this website?",
      desc: "An online portfolio where UoA Capstone students showcase projects, connect with peers, and get recognized by teachers and industry.",
   },
   {
      when: "Design",
      title: "From wireframes to hi-fi",
      desc: "Iterated on information architecture and a clean, discoverable gallery tailored to student projects.",
   },
   {
      when: "Build",
      title: "Ship the MVP",
      desc: "React + Vite + TypeScript + MUI; project cards, filters, likes, and award highlights.",
   },
   {
      when: "Improve",
      title: "Polish & user testing",
      desc: "Focus on accessibility, responsiveness, and performance to make browsing delightful.",
   },
];

const values = [
   "Student-first",
   "Discoverable",
   "Accessible",
   "Clean UI",
   "Reliable APIs",
];

/** Visual constants shared by all team cards */
const CARD_HEIGHT = { xs: 220, md: 200 } as const;
const BORDER_WIDTH = 2;
const CARD_RADIUS = 3;
const AVATAR_SIZE = { sm: 64, md: 72 } as const;
const CONTENT_GAP = 25;

const AboutPage: React.FC = () => {
   return (
      <Box
         sx={{ bgcolor: "#fbfbfd", position: "relative", overflow: "hidden" }}
      >
         <Box
            sx={{
               position: "absolute",
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               pointerEvents: "none",
               zIndex: 0,
               background: `
                  radial-gradient(circle at 10% 20%, rgba(0,102,204,0.04) 0%, transparent 50%),
                  radial-gradient(circle at 90% 80%, rgba(0,102,204,0.04) 0%, transparent 50%)
               `,
            }}
         />

         <Box
            sx={{
               position: "relative",
               overflow: "hidden",
               py: { xs: 8, md: 12 },
               mb: 4,
               background: `
                  linear-gradient(135deg, rgba(0,102,204,0.08) 0%, rgba(0,102,204,0.02) 50%, transparent 100%),
                  linear-gradient(180deg, #fbfbfd 0%, #ffffff 100%)
               `,
               "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: `
                     linear-gradient(90deg, rgba(0,102,204,0.02) 1px, transparent 1px),
                     linear-gradient(rgba(0,102,204,0.02) 1px, transparent 1px)
                  `,
                  backgroundSize: "60px 60px",
                  opacity: 0.4,
                  pointerEvents: "none",
               },
               "&::after": {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "1000px",
                  height: "1000px",
                  background:
                     "radial-gradient(circle, rgba(0,102,204,0.06) 0%, transparent 70%)",
                  animation: "pulse 10s ease-in-out infinite",
                  pointerEvents: "none",
               },
               "@keyframes pulse": {
                  "0%, 100%": {
                     transform: "translate(-50%, -50%) scale(1)",
                     opacity: 0.6,
                  },
                  "50%": {
                     transform: "translate(-50%, -50%) scale(1.2)",
                     opacity: 0.3,
                  },
               },
            }}
         >
            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
               <Stack spacing={2.5} alignItems="center" textAlign="center">
                  <Typography
                     variant="h2"
                     sx={{
                        fontWeight: 700,
                        lineHeight: 1.15,
                        letterSpacing: "-0.03em",
                        fontSize: { xs: 32, md: 48, lg: 56 },
                        background:
                           "linear-gradient(135deg, #1d1d1f 0%, #06c 70%, #0ea5e9 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        position: "relative",
                        "&::after": {
                           content:
                              '"Spiders Plus — Showcasing excellence at UoA"',
                           position: "absolute",
                           left: 0,
                           top: 0,
                           zIndex: -1,
                           color: "#1d1d1f",
                           opacity: 0.02,
                           transform: "translate(3px, 3px)",
                        },
                     }}
                  >
                     Spiders Plus — Showcasing excellence at UoA
                  </Typography>
                  <Typography
                     variant="h6"
                     maxWidth={900}
                     sx={{
                        color: "#6e6e73",
                        fontSize: { xs: 16, md: 18 },
                        letterSpacing: "-0.01em",
                        lineHeight: 1.6,
                     }}
                  >
                     An online portfolio to showcase capstone projects — where
                     students share their work, connect with others, and get
                     recognized by teachers and industry.
                  </Typography>
               </Stack>
            </Container>
         </Box>

         <Container
            maxWidth="lg"
            sx={{ pb: { xs: 6, md: 10 }, position: "relative", zIndex: 1 }}
         >
            {/* ===== Our Team (centered content, equal spacing, left/right symmetric) ===== */}
            <Typography
               variant="h5"
               sx={{
                  fontWeight: 600,
                  mb: 3,
                  fontSize: { xs: 24, md: 32 },
                  color: "#1d1d1f",
                  letterSpacing: "-0.02em",
                  position: "relative",
                  display: "inline-block",
                  "&::after": {
                     content: '""',
                     position: "absolute",
                     left: 0,
                     bottom: -8,
                     width: "100%",
                     height: 4,
                     borderRadius: 999,
                     background:
                        "linear-gradient(90deg, #06c 0%, #0ea5e9 100%)",
                     opacity: 0.6,
                  },
               }}
            >
               Our Team
            </Typography>
            {(() => {
               // Discriminated union to place a logo card in the 2nd slot
               type GridItem =
                  | { kind: "member"; data: TeamMember }
                  | { kind: "logo" };

               const gridItems: GridItem[] = [
                  { kind: "member", data: teamMembers[0] },
                  { kind: "logo" },
                  ...teamMembers
                     .slice(1)
                     .map<GridItem>((m) => ({ kind: "member", data: m })),
               ];

               // Unified shell for all cards (member + logo)
               const baseCardSx = {
                  height: CARD_HEIGHT,
                  display: "flex",
                  flexDirection: "column" as const,
                  borderRadius: CARD_RADIUS,
                  background:
                     "linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, #1a73e8, #0ea5e9, #ff69b4) border-box",
                  border: `${BORDER_WIDTH}px solid transparent`,
                  boxShadow:
                     "0 8px 22px rgba(17,24,39,.10), 0 2px 6px rgba(17,24,39,.05)",
                  transition: "transform .18s ease, box-shadow .18s ease",
                  "&:hover": {
                     transform: "translateY(-3px)",
                     boxShadow:
                        "0 14px 32px rgba(17,24,39,.14), 0 8px 14px rgba(17,24,39,.06)",
                  },
               };

               return (
                  <Box
                     sx={{
                        display: "grid",
                        gap: 1.75,
                        mb: 5,
                        gridTemplateColumns: {
                           xs: "1fr",
                           sm: "repeat(2, 1fr)",
                           md: "repeat(3, 1fr)",
                        },
                        alignItems: "stretch",
                     }}
                  >
                     {gridItems.map((item, i) =>
                        item.kind === "member" ? (
                           /* Member card */
                           <Card
                              key={`member-${item.data.name}-${i}`}
                              elevation={0}
                              sx={baseCardSx}
                           >
                              <CardContent
                                 sx={{
                                    flex: 1,
                                    px: 2.25,
                                    py: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    textAlign: "center",
                                    gap: `${CONTENT_GAP}px`,
                                 }}
                              >
                                 {/* Header row: avatar + name + role, centered and compact */}
                                 <Stack
                                    direction="row"
                                    spacing={1.2}
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{ width: "100%" }}
                                 >
                                    <Avatar
                                       src={item.data.avatar}
                                       alt={item.data.name}
                                       sx={{
                                          width: AVATAR_SIZE,
                                          height: AVATAR_SIZE,
                                          boxShadow:
                                             "0 0 0 3px rgba(26,115,232,.12), 0 6px 12px rgba(26,115,232,.18)",
                                       }}
                                    />
                                    <Box sx={{ minWidth: 0, maxWidth: "100%" }}>
                                       <Typography
                                          fontWeight={700}
                                          sx={{
                                             fontSize: {
                                                xs: 14.5,
                                                sm: 20,
                                                md: 24,
                                             },
                                             lineHeight: 1.05,
                                             whiteSpace: "nowrap",
                                             overflow: "hidden",
                                             textOverflow: "ellipsis",
                                          }}
                                       >
                                          {item.data.name}
                                       </Typography>
                                       <Typography
                                          color="text.secondary"
                                          sx={{
                                             fontSize: { xs: 15, md: 16 },
                                             lineHeight: 1.15,
                                          }} // larger role
                                       >
                                          {item.data.role}
                                       </Typography>
                                    </Box>
                                 </Stack>

                                 <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                    justifyContent="center"
                                    sx={{
                                       maxHeight: 56,
                                       overflow: "hidden",
                                       width: "100%",
                                    }}
                                 >
                                    {item.data.skills.map((s, idx) => (
                                       <Chip
                                          key={s}
                                          label={s}
                                          size="small"
                                          sx={{
                                             mb: 1,
                                             fontWeight: 700,
                                             fontSize: 13,
                                             px: 1.25,
                                             py: 0.25,
                                             bgcolor:
                                                idx % 3 === 0
                                                   ? "rgba(26,115,232,.10)"
                                                   : idx % 3 === 1
                                                     ? "rgba(14,165,233,.12)"
                                                     : "rgba(255,105,180,.12)",
                                             color:
                                                idx % 3 === 0
                                                   ? "#1a73e8"
                                                   : idx % 3 === 1
                                                     ? "#0ea5e9"
                                                     : "#db2777",
                                             borderRadius: 2,
                                          }}
                                       />
                                    ))}
                                 </Stack>
                              </CardContent>
                           </Card>
                        ) : (
                           /* ------------- Logo card (same shell; content centered) ------------- */
                           <Card
                              key={`team-logo-${i}`}
                              elevation={0}
                              sx={baseCardSx}
                           >
                              <CardContent
                                 sx={{
                                    flex: 1,
                                    px: 2.25,
                                    py: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                 }}
                              >
                                 <Stack spacing={1} alignItems="center">
                                    <Box
                                       component="img"
                                       src={teamLogo}
                                       alt="Spiders Plus Logo"
                                       sx={{
                                          width: {
                                             xs: "28vw",
                                             sm: 116,
                                             md: 124,
                                          },
                                          height: "auto",
                                          filter:
                                             "drop-shadow(0 8px 18px rgba(16,24,40,.14))",
                                       }}
                                    />
                                    <Typography
                                       sx={{
                                          fontSize: {
                                             xs: 14.5,
                                             sm: 15,
                                             md: 15.5,
                                          },
                                          fontWeight: 900,
                                          lineHeight: 1.1,
                                       }}
                                    >
                                       Team 36 — Spiders Plus
                                    </Typography>
                                    <Typography
                                       variant="caption"
                                       color="text.secondary"
                                    >
                                       Showcasing excellence at UoA
                                    </Typography>
                                 </Stack>
                              </CardContent>
                           </Card>
                        ),
                     )}
                  </Box>
               );
            })()}

            {/* ===== Journey ===== */}
            <Typography
               variant="h5"
               sx={{
                  fontWeight: 800,
                  mb: 2.25,
                  position: "relative",
                  display: "inline-block",
                  "&::after": {
                     content: '""',
                     position: "absolute",
                     left: 0,
                     bottom: -6,
                     width: "100%",
                     height: 6,
                     borderRadius: 999,
                     background:
                        "linear-gradient(90deg, rgba(14,165,233,.25), rgba(255,105,180,.25))",
                  },
               }}
            >
               Our Journey
            </Typography>
            <Box
               sx={{
                  display: "grid",
                  gap: 2.25,
                  mb: 6,
                  gridTemplateColumns: {
                     xs: "1fr",
                     sm: "repeat(2, 1fr)",
                     md: "repeat(4, 1fr)",
                  },
               }}
            >
               {journey.map((j, idx) => (
                  <Card
                     key={j.title}
                     elevation={0}
                     sx={{
                        borderRadius: CARD_RADIUS,
                        p: 0.5,
                        background:
                           idx % 4 === 0
                              ? "linear-gradient(135deg, #e0f2fe, #fdf2f8)"
                              : idx % 4 === 1
                                ? "linear-gradient(135deg, #fef9c3, #e0f2fe)"
                                : idx % 4 === 2
                                  ? "linear-gradient(135deg, #f5f3ff, #cffafe)"
                                  : "linear-gradient(135deg, #ffe4e6, #dcfce7)",
                     }}
                  >
                     <CardContent
                        sx={{
                           borderRadius: CARD_RADIUS - 2,
                           bgcolor: "white",
                           height: "100%",
                        }}
                     >
                        <Typography variant="overline" color="text.secondary">
                           {j.when}
                        </Typography>
                        <Typography variant="h6" fontWeight={800}>
                           {j.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                           {j.desc}
                        </Typography>
                     </CardContent>
                  </Card>
               ))}
            </Box>
            {/* ===== Values ===== */}
            <Typography
               variant="h5"
               sx={{
                  fontWeight: 800,
                  mb: 2.25,
                  position: "relative",
                  display: "inline-block",
                  "&::after": {
                     content: '""',
                     position: "absolute",
                     left: 0,
                     bottom: -6,
                     width: "100%",
                     height: 6,
                     borderRadius: 999,
                     background:
                        "linear-gradient(90deg, rgba(99,102,241,.25), rgba(20,184,166,.25))",
                  },
               }}
            >
               How we work
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
               {values.map((v, i) => (
                  <Chip
                     key={v}
                     label={v}
                     sx={{
                        mr: 1,
                        mb: 1,
                        fontWeight: 700,
                        letterSpacing: ".2px",
                        bgcolor:
                           i % 2 === 0
                              ? "rgba(99,102,241,.12)"
                              : "rgba(20,184,166,.12)",
                        color: i % 2 === 0 ? "#6366f1" : "#14b8a6",
                        borderRadius: 3,
                     }}
                  />
               ))}
            </Stack>
         </Container>
      </Box>
   );
};

export default AboutPage;
