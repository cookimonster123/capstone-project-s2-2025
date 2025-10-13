import React from "react";
import {
   Box,
   Container,
   Typography,
   Stack,
   Avatar,
   Chip,
   useTheme,
   alpha,
   Divider,
   Grid,
   Paper,
   Button,
} from "@mui/material";
import { keyframes } from "@mui/system";
import { motion } from "framer-motion";
import avatar1 from "../assets/member/avatar_member1.png";
import avatar2 from "../assets/member/avatar_member2.png";
import avatar3 from "../assets/member/avatar_member3.jpg";
import avatar4 from "../assets/member/avatar_member4.png";
import avatar5 from "../assets/member/avatar_member5.png";
import teamLogo from "../assets/logo.svg";

type TeamMember = {
   name: string;
   role: string;
   skills: string[];
   avatar?: string;
};
const teamMembers: TeamMember[] = [
   {
      name: "Yiguang Sun",
      role: "Frontend Developer",
      skills: ["React", "MUI", "TypeScript", "UI/UX Design"],
      avatar: avatar1,
   },
   {
      name: "Andy Guo",
      role: "Frontend Developer",
      skills: ["React", "MUI", "TypeScript", "UI/UX Design"],
      avatar: avatar2,
   },
   {
      name: "Jacob Wang",
      role: "UI/UX Designer & Frontend Developer",
      skills: [
         "React",
         "MUI",
         "TypeScript",
         "UI/UX Design",
         "Motion",
         "Animation",
      ],
      avatar: avatar3,
   },
   {
      name: "Yizhao Yuan",
      role: "Backend Developer",
      skills: [
         "API",
         "Database",
         "Data Scraping",
         "AWS services",
         "Docker deployment",
         "AWS Deployment",
         "MERN Stack",
      ],
      avatar: avatar4,
   },
   {
      name: "Shan-Hai Guan",
      role: "Full Stack Developer",
      skills: ["Auth", "DevOps", "Code Review", "MERN Stack"],
      avatar: avatar5,
   },
];

const stats = [
   {
      value: "Living",
      label: "Project Archive",
      description:
         "A growing showcase of student creativity and collaboration.",
   },

   {
      value: "4",
      label: "Project Types",
      description: "Including AI/ML, games, mobile apps, and web applications.",
   },

   {
      value: "24 / 7",
      label: "Online Access",
      description: "The showcase stays live for everyone to explore anytime.",
   },
   {
      value: "Growing",
      label: "Project Library",
      description: "New teams add their stories every semester.",
   },
];

const pillars = [
   {
      title: "For Students",
      description:
         "Save your project as part of your journey. A space to look back and be proud.",
      accent: "#00f0ff",
   },
   {
      title: "For Mentors",
      description: "See how ideas grew over time and celebrate student growth.",
      accent: "#ff5af1",
   },
   {
      title: "For Industry",
      description:
         "Discover creative projects from UoA students and future collaborators.",
      accent: "#7c5cff",
   },
];

const timeline = [
   {
      phase: "Spark",
      title: "Sketch and pitch",
      description: "Capture early sketches and the reason the problem matters.",
   },
   {
      phase: "Build",
      title: "Iterate in public",
      description:
         "Share sprint wins, design trials, and the tech stack decisions.",
   },
   {
      phase: "Showcase",
      title: "Launch the story",
      description:
         "Publish demos, walkthroughs, and reflections for judges and friends.",
   },
   {
      phase: "Legacy",
      title: "Pass the torch",
      description:
         "Leave lessons learned so the next cohort starts from a stronger base.",
   },
];

const values = [
   "Design boldly",
   "Iterate with intent",
   "Build for others, not just ourselves",
   "Tell the story, not just the code",
   "Leave it better than we found it",
];

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-16px); }
`;

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0.3); }
  50% { box-shadow: 0 0 35px 10px rgba(0, 240, 255, 0.18); }
`;

const orbit = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(8deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionStack = motion(Stack);

const easing: [number, number, number, number] = [0.16, 1, 0.3, 1];
const viewportConfig = { once: true, amount: 0.35 } as const;

const AboutPage: React.FC = () => {
   const theme = useTheme();
   const isDark = theme.palette.mode === "dark";

   // Measure the timeline area so the vertical line spans exactly from
   // the first timeline item to the last.
   const containerRef = React.useRef<HTMLDivElement | null>(null);
   const timelineRef = React.useRef<HTMLDivElement | null>(null);
   const [lineOffsets, setLineOffsets] = React.useState({ top: 0, bottom: 0 });

   React.useEffect(() => {
      const updateOffsets = () => {
         const c = containerRef.current;
         const t = timelineRef.current;
         if (!c || !t) return;
         const cr = c.getBoundingClientRect();
         const tr = t.getBoundingClientRect();
         const top = Math.max(0, tr.top - cr.top);
         const bottom = Math.max(0, cr.bottom - tr.bottom);
         setLineOffsets((prev) => {
            if (prev.top === top && prev.bottom === bottom) return prev;
            return { top, bottom };
         });
      };

      updateOffsets();
      const ro = new ResizeObserver(() => updateOffsets());
      if (containerRef.current) ro.observe(containerRef.current);
      if (timelineRef.current) ro.observe(timelineRef.current);
      window.addEventListener("resize", updateOffsets);
      const id = window.setInterval(updateOffsets, 300); // catch async layout changes
      return () => {
         ro.disconnect();
         window.removeEventListener("resize", updateOffsets);
         window.clearInterval(id);
      };
   }, []);

   const loopConfigs = React.useMemo(
      () => [
         {
            id: "loop-1",
            style: { top: "-24%", left: "-18%" } as const,
            size: 520,
            opacity: 0.55,
            duration: 28,
            initialRotate: 0,
            background: isDark
               ? "linear-gradient(135deg, rgba(0, 240, 255, 0.55), rgba(167, 139, 250, 0.35))"
               : "linear-gradient(135deg, rgba(0, 102, 204, 0.28), rgba(118, 75, 162, 0.22))",
         },
         {
            id: "loop-2",
            style: { bottom: "-28%", right: "-12%" } as const,
            size: 620,
            opacity: 0.45,
            duration: 36,
            initialRotate: 60,
            background: isDark
               ? "linear-gradient(135deg, rgba(255, 90, 241, 0.4), rgba(0, 240, 255, 0.28))"
               : "linear-gradient(135deg, rgba(236, 72, 153, 0.22), rgba(0, 102, 204, 0.2))",
         },
         {
            id: "loop-3",
            style: { top: "18%", right: "-20%" } as const,
            size: 420,
            opacity: 0.4,
            duration: 22,
            initialRotate: -120,
            background: isDark
               ? "linear-gradient(135deg, rgba(167, 139, 250, 0.38), rgba(0, 240, 255, 0.25))"
               : "linear-gradient(135deg, rgba(118, 75, 162, 0.22), rgba(102, 126, 234, 0.18))",
         },
      ],
      [isDark],
   );

   const lineGradient = isDark
      ? "linear-gradient(180deg, rgba(0, 240, 255, 0.7) 0%, rgba(255, 90, 241, 0.4) 100%)"
      : "linear-gradient(180deg, rgba(0, 102, 204, 0.55) 0%, rgba(236, 72, 153, 0.35) 100%)";
   return (
      <Box
         sx={{
            position: "relative",
            minHeight: "100vh",
            overflow: "hidden",
            py: { xs: 8, md: 12 },
            background: isDark
               ? "radial-gradient(circle at 10% 20%, rgba(0, 240, 255, 0.08), transparent 55%), radial-gradient(circle at 85% 10%, rgba(255, 90, 241, 0.08), transparent 60%), linear-gradient(180deg, #05060d 0%, #11142b 50%, #05060d 100%)"
               : "radial-gradient(circle at 15% 15%, rgba(0, 102, 204, 0.12), transparent 55%), radial-gradient(circle at 90% 10%, rgba(236, 72, 153, 0.08), transparent 60%), linear-gradient(180deg, #f4f6ff 0%, #ffffff 60%, #eef2ff 100%)",
         }}
      >
         <MotionBox
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: isDark ? 0.65 : 0.5 }}
            transition={{ duration: 1.2, ease: easing }}
            sx={{
               position: "absolute",
               inset: "-10% -10% -15% -10%",
               overflow: "hidden",
               pointerEvents: "none",
               zIndex: 0,
            }}
         >
            {loopConfigs.map((loop) => (
               <MotionBox
                  key={loop.id}
                  initial={{ rotate: loop.initialRotate }}
                  animate={{ rotate: loop.initialRotate + 360 }}
                  transition={{
                     duration: loop.duration,
                     ease: "linear",
                     repeat: Infinity,
                  }}
                  sx={{
                     position: "absolute",
                     ...loop.style,
                     width: loop.size,
                     height: loop.size,
                     background: loop.background,
                     opacity: loop.opacity,
                     filter: "blur(160px)",
                     borderRadius: "50%",
                  }}
               />
            ))}
         </MotionBox>
         <Box
            sx={{
               position: "absolute",
               top: { xs: -160, md: -220 },
               right: { xs: -120, md: -180 },
               width: { xs: 320, md: 460 },
               height: { xs: 320, md: 460 },
               borderRadius: "50%",
               background: isDark
                  ? "linear-gradient(135deg, rgba(0, 240, 255, 0.5), rgba(167, 139, 250, 0.4))"
                  : "linear-gradient(135deg, rgba(0, 102, 204, 0.3), rgba(118, 75, 162, 0.28))",
               filter: "blur(140px)",
               opacity: 0.75,
               animation: `${orbit} 18s ease-in-out infinite`,
            }}
         />
         <Box
            sx={{
               position: "absolute",
               bottom: { xs: -200, md: -240 },
               left: { xs: -120, md: -180 },
               width: { xs: 360, md: 520 },
               height: { xs: 360, md: 520 },
               borderRadius: "50%",
               background: isDark
                  ? "linear-gradient(135deg, rgba(255, 90, 241, 0.45), rgba(0, 240, 255, 0.35))"
                  : "linear-gradient(135deg, rgba(102, 126, 234, 0.28), rgba(236, 72, 153, 0.26))",
               filter: "blur(150px)",
               opacity: 0.65,
               animation: `${orbit} 22s ease-in-out infinite reverse`,
            }}
         />

         <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
            <Stack
               spacing={6}
               alignItems="center"
               textAlign="center"
               sx={{ mb: { xs: 10, md: 14 } }}
            >
               <Box
                  sx={{
                     px: 3,
                     py: 1,
                     borderRadius: "999px",
                     backdropFilter: "blur(12px)",
                     backgroundColor: alpha(
                        isDark ? "#0c1626" : "#ffffff",
                        isDark ? 0.4 : 0.75,
                     ),
                     border: `1px solid ${alpha(isDark ? "#00f0ff" : theme.palette.primary.main, 0.4)}`,
                     animation: `${pulse} 6s ease-in-out infinite`,
                  }}
               >
                  <Typography
                     variant="overline"
                     sx={{
                        letterSpacing: "0.22em",
                        fontWeight: 700,
                        color: isDark ? "#00f0ff" : theme.palette.primary.main,
                     }}
                  >
                     University of Auckland
                  </Typography>
               </Box>

               <Box sx={{ animation: `${float} 5s ease-in-out infinite` }}>
                  <Box
                     component="img"
                     src={teamLogo}
                     alt="Spiders Plus Logo"
                     sx={{
                        width: { xs: 180, md: 240 },
                        height: "auto",
                        transition: "transform 0.4s ease, filter 0.4s ease",
                        filter: isDark
                           ? "drop-shadow(0 0 28px rgba(0, 240, 255, 0.45))"
                           : "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.15))",
                        "&:hover": {
                           transform: "scale(1.08) rotate(4deg)",
                           filter: isDark
                              ? "drop-shadow(0 0 38px rgba(0, 240, 255, 0.65))"
                              : "drop-shadow(0 18px 36px rgba(0, 0, 0, 0.2))",
                        },
                     }}
                  />
               </Box>

               <Stack spacing={3} alignItems="center">
                  <Typography
                     variant="h1"
                     sx={{
                        fontFamily:
                           "'Space Grotesk', 'Poppins', 'Roboto', sans-serif",
                        fontWeight: 800,
                        fontSize: { xs: "2.8rem", md: "4.3rem", lg: "4.9rem" },
                        letterSpacing: "-0.03em",
                        textTransform: "uppercase",
                        background: isDark
                           ? "linear-gradient(120deg, #00f0ff 10%, #a78bfa 45%, #ff5af1 80%)"
                           : "linear-gradient(120deg, #0066cc 10%, #667eea 45%, #ec4899 80%)",
                        backgroundSize: "200% 200%",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        animation: `${shimmer} 12s ease infinite`,
                        lineHeight: 1.05,
                        maxWidth: 960,
                     }}
                  >
                     Capstone stories that keep breathing after demo day
                  </Typography>

                  <Typography
                     variant="h6"
                     sx={{
                        maxWidth: 840,
                        color: alpha(
                           theme.palette.text.primary,
                           isDark ? 0.82 : 0.86,
                        ),
                        fontSize: { xs: "1.05rem", md: "1.22rem" },
                        lineHeight: 1.9,
                     }}
                  >
                     Spiders Plus is Team 36's living archive. We designed a
                     showcase that feels premium, honours the craft, and gives
                     every UoA Computer Science student a place to launch their
                     capstone story.
                  </Typography>
               </Stack>
               <Stack
                  direction="row"
                  flexWrap="wrap"
                  justifyContent="center"
                  spacing={2}
                  sx={{ gap: 1.5 }}
               >
                  {[
                     "Share boldly",
                     "Inspire the next cohort",
                     "Celebrate Team 36",
                  ].map((tag, index) => (
                     <Chip
                        key={tag}
                        label={tag}
                        sx={{
                           px: 2.4,
                           py: 1.8,
                           fontWeight: 700,
                           letterSpacing: "0.08em",
                           textTransform: "uppercase",
                           borderRadius: "999px",
                           bgcolor: alpha(
                              index === 0
                                 ? isDark
                                    ? "#00f0ff"
                                    : theme.palette.primary.main
                                 : index === 1
                                   ? isDark
                                      ? "#a78bfa"
                                      : theme.palette.secondary.main
                                   : isDark
                                     ? "#ff5af1"
                                     : alpha("#ec4899", 0.85),
                              0.14,
                           ),
                           color:
                              index === 0
                                 ? isDark
                                    ? "#00f0ff"
                                    : theme.palette.primary.main
                                 : index === 1
                                   ? isDark
                                      ? "#a78bfa"
                                      : theme.palette.secondary.main
                                   : isDark
                                     ? "#ff5af1"
                                     : "#db2777",
                           border: `1px solid ${alpha(
                              index === 0
                                 ? isDark
                                    ? "#00f0ff"
                                    : theme.palette.primary.main
                                 : index === 1
                                   ? isDark
                                      ? "#a78bfa"
                                      : theme.palette.secondary.main
                                   : isDark
                                     ? "#ff5af1"
                                     : "#ec4899",
                              0.45,
                           )}`,
                           animation: `${fadeInUp} 0.7s ease-out ${index * 0.1}s backwards`,
                        }}
                     />
                  ))}
               </Stack>

               <Grid
                  container
                  spacing={3}
                  justifyContent="center"
                  sx={{ maxWidth: 960 }}
               >
                  {stats.map((item, index) => (
                     <Grid item xs={12} sm={6} md={3} key={item.label}>
                        <MotionPaper
                           elevation={0}
                           initial={{ opacity: 0, y: 32 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={viewportConfig}
                           transition={{
                              duration: 0.7,
                              delay: index * 0.08,
                              ease: easing,
                           }}
                           sx={{
                              position: "relative",
                              p: { xs: 3, md: 4 },
                              borderRadius: 4,
                              backgroundColor: alpha(
                                 isDark ? "#0d1321" : "#ffffff",
                                 isDark ? 0.6 : 0.9,
                              ),
                              border: `1px solid ${alpha(isDark ? "#00f0ff" : theme.palette.primary.main, 0.18)}`,
                              backdropFilter: "blur(14px)",
                              overflow: "hidden",
                           }}
                        >
                           <Typography
                              variant="h3"
                              sx={{
                                 fontFamily:
                                    "'Space Grotesk', 'Poppins', sans-serif",
                                 fontWeight: 800,
                                 letterSpacing: "-0.04em",
                                 color: isDark
                                    ? "#00f0ff"
                                    : theme.palette.primary.main,
                                 mb: 0.5,
                              }}
                           >
                              {item.value}
                           </Typography>
                           <Typography
                              variant="subtitle1"
                              sx={{
                                 fontWeight: 700,
                                 letterSpacing: "0.12em",
                                 textTransform: "uppercase",
                                 mb: 1.5,
                              }}
                           >
                              {item.label}
                           </Typography>
                           <Typography
                              variant="body2"
                              sx={{
                                 color: alpha(
                                    theme.palette.text.secondary,
                                    0.9,
                                 ),
                                 lineHeight: 1.7,
                              }}
                           >
                              {item.description}
                           </Typography>
                        </MotionPaper>
                     </Grid>
                  ))}
               </Grid>
            </Stack>

            <Divider sx={{ mb: { xs: 10, md: 14 } }} />

            <Grid
               container
               spacing={6}
               alignItems="stretch"
               sx={{ mb: { xs: 12, md: 16 } }}
            >
               <Grid item xs={12} md={6}>
                  <Stack spacing={3} sx={{ height: "100%" }}>
                     <Typography
                        variant="h3"
                        sx={{
                           fontWeight: 900,
                           fontSize: { xs: "2.2rem", md: "2.9rem" },
                           lineHeight: 1.1,
                           background: isDark
                              ? "linear-gradient(120deg, #00f0ff 0%, #ff5af1 50%, #a78bfa 100%)"
                              : "linear-gradient(120deg, #0066cc 0%, #ec4899 50%, #8b5cf6 100%)",
                           WebkitBackgroundClip: "text",
                           backgroundClip: "text",
                           WebkitTextFillColor: "transparent",
                        }}
                     >
                        We built a showcase that keeps every capstone story
                        alive.
                     </Typography>
                     <Typography
                        variant="body1"
                        sx={{
                           color: alpha(
                              theme.palette.text.primary,
                              isDark ? 0.82 : 0.88,
                           ),
                           fontSize: { xs: "1.06rem", md: "1.16rem" },
                           lineHeight: 1.9,
                        }}
                     >
                        Every project tells a story — late nights, team debates,
                        and small wins that mattered to us. We wanted to make a
                        place where those memories don’t disappear after demo
                        day. The showcase lets students preserve their projects,
                        reflect on the journey, and leave something meaningful
                        for the next cohort to see.
                     </Typography>
                     <Typography
                        variant="body1"
                        sx={{
                           color: alpha(
                              theme.palette.text.primary,
                              isDark ? 0.72 : 0.78,
                           ),
                           fontSize: { xs: "1.02rem", md: "1.12rem" },
                           lineHeight: 1.85,
                        }}
                     >
                        It’s more than a gallery — it’s a living record of what
                        we learned, built by students, for students.
                     </Typography>
                  </Stack>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                     {pillars.map((pillar, index) => (
                        <MotionPaper
                           key={pillar.title}
                           elevation={0}
                           initial={{ opacity: 0, y: 36 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={viewportConfig}
                           transition={{
                              duration: 0.68,
                              delay: index * 0.08,
                              ease: easing,
                           }}
                           sx={{
                              p: { xs: 3, md: 4 },
                              borderRadius: 4,
                              border: `1px solid ${alpha(pillar.accent, 0.35)}`,
                              backgroundColor: alpha(
                                 isDark ? "#0a1020" : "#ffffff",
                                 isDark ? 0.5 : 0.95,
                              ),
                              backdropFilter: "blur(16px)",
                           }}
                        >
                           <Typography
                              variant="subtitle2"
                              sx={{
                                 color: pillar.accent,
                                 fontWeight: 700,
                                 letterSpacing: "0.18em",
                                 textTransform: "uppercase",
                                 mb: 1.5,
                              }}
                           >
                              {pillar.title}
                           </Typography>
                           <Typography
                              variant="body1"
                              sx={{
                                 color: alpha(
                                    theme.palette.text.primary,
                                    isDark ? 0.84 : 0.9,
                                 ),
                                 lineHeight: 1.85,
                              }}
                           >
                              {pillar.description}
                           </Typography>
                        </MotionPaper>
                     ))}
                  </Stack>
               </Grid>
            </Grid>
            <Box
               ref={containerRef}
               sx={{
                  position: "relative",
                  mb: { xs: 12, md: 16 },
                  borderRadius: 5,
                  px: { xs: 4, md: 7 },
                  py: { xs: 6, md: 8 },
                  backgroundColor: alpha(
                     isDark ? "#0b111f" : "#f8fafc",
                     isDark ? 0.75 : 0.9,
                  ),
                  border: `1px solid ${alpha(isDark ? "#00f0ff" : theme.palette.primary.main, 0.18)}`,
                  backdropFilter: "blur(18px)",
                  overflow: "hidden",
               }}
            >
               <MotionBox
                  initial={{ opacity: 0, scaleY: 0 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1.1, ease: easing }}
                  sx={{
                     position: "absolute",
                     left: { xs: "11px", md: "50%" },
                     top: lineOffsets.top,
                     bottom: lineOffsets.bottom,
                     width: "2px",
                     background: lineGradient,
                     transformOrigin: "top",
                     borderRadius: 999,
                     filter: isDark
                        ? "drop-shadow(0 0 16px rgba(0, 240, 255, 0.42))"
                        : "drop-shadow(0 0 16px rgba(0, 102, 204, 0.32))",
                     opacity: 0.85,
                  }}
               />

               <Stack
                  spacing={3}
                  alignItems="center"
                  textAlign="center"
                  sx={{ mb: 6 }}
               >
                  <Typography
                     variant="overline"
                     sx={{
                        letterSpacing: "0.22em",
                        fontWeight: 700,
                        color: isDark ? "#00f0ff" : theme.palette.primary.main,
                     }}
                  >
                     The journey
                  </Typography>
                  <Typography
                     variant="h3"
                     sx={{
                        fontWeight: 900,
                        fontSize: { xs: "2.3rem", md: "3rem" },
                     }}
                  >
                     Trace the project from first sketch to final hand-off.
                  </Typography>
                  <Typography
                     variant="body1"
                     sx={{
                        maxWidth: 720,
                        color: alpha(
                           theme.palette.text.primary,
                           isDark ? 0.78 : 0.82,
                        ),
                        fontSize: { xs: "1.02rem", md: "1.12rem" },
                        lineHeight: 1.8,
                     }}
                  >
                     We laid things out the same way we move through the
                     capstone—kickoff, build, demo, reflect. It keeps the story
                     easy to follow without digging through docs.
                  </Typography>
               </Stack>

               <Stack spacing={5} ref={timelineRef}>
                  {timeline.map((item, index) => (
                     <MotionStack
                        key={item.title}
                        direction={{
                           xs: "column",
                           md: index % 2 === 0 ? "row" : "row-reverse",
                        }}
                        spacing={{ xs: 3, md: 6 }}
                        alignItems="center"
                        sx={{ position: "relative", pl: { xs: 4, md: 0 } }}
                        initial={{ opacity: 0, y: 48 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={viewportConfig}
                        transition={{
                           duration: 0.75,
                           delay: index * 0.08,
                           ease: easing,
                        }}
                     >
                        <MotionBox
                           initial={{ scale: 0.5 }}
                           whileInView={{ scale: 1 }}
                           viewport={viewportConfig}
                           transition={{
                              duration: 0.6,
                              delay: index * 0.08,
                              ease: easing,
                           }}
                           sx={{
                              position: "absolute",
                              left: { xs: 0, md: "50%" },
                              transform: { md: "translateX(-50%)" },
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              border: `3px solid ${alpha(isDark ? "#00f0ff" : theme.palette.primary.main, 0.6)}`,
                              backgroundColor: isDark ? "#05060d" : "#ffffff",
                              boxShadow: isDark
                                 ? "0 0 18px rgba(0, 240, 255, 0.4)"
                                 : "0 0 18px rgba(0, 102, 204, 0.35)",
                           }}
                        />
                        <Paper
                           elevation={0}
                           sx={{
                              flex: 1,
                              p: { xs: 3, md: 4 },
                              borderRadius: 4,
                              backgroundColor: alpha(
                                 isDark ? "#0c1526" : "#ffffff",
                                 isDark ? 0.55 : 0.95,
                              ),
                              border: `1px solid ${alpha(isDark ? "#00f0ff" : theme.palette.primary.main, 0.2)}`,
                              backdropFilter: "blur(16px)",
                           }}
                        >
                           <Typography
                              variant="overline"
                              sx={{
                                 fontWeight: 700,
                                 letterSpacing: "0.28em",
                                 color: alpha(
                                    isDark
                                       ? "#00f0ff"
                                       : theme.palette.primary.main,
                                    0.85,
                                 ),
                              }}
                           >
                              {item.phase}
                           </Typography>
                           <Typography
                              variant="h5"
                              sx={{
                                 fontWeight: 800,
                                 mt: 1,
                                 mb: 2,
                                 letterSpacing: "-0.01em",
                              }}
                           >
                              {item.title}
                           </Typography>
                           <Typography
                              variant="body1"
                              sx={{
                                 color: alpha(
                                    theme.palette.text.primary,
                                    isDark ? 0.78 : 0.85,
                                 ),
                                 lineHeight: 1.8,
                              }}
                           >
                              {item.description}
                           </Typography>
                        </Paper>
                     </MotionStack>
                  ))}
               </Stack>
            </Box>

            <Divider sx={{ mb: { xs: 10, md: 14 } }} />
            <Box sx={{ mb: { xs: 12, md: 14 } }}>
               <Stack
                  spacing={2}
                  alignItems="center"
                  textAlign="center"
                  sx={{ mb: 8 }}
               >
                  <Typography
                     variant="overline"
                     sx={{
                        letterSpacing: "0.2em",
                        fontWeight: 700,
                        color: isDark
                           ? "#ff5af1"
                           : theme.palette.secondary.main,
                     }}
                  >
                     Team 36
                  </Typography>
                  <Typography
                     variant="h2"
                     sx={{
                        fontWeight: 900,
                        fontSize: { xs: "2.2rem", md: "3.2rem" },
                        textTransform: "uppercase",
                        letterSpacing: "-0.03em",
                        color: isDark
                           ? alpha("#f4f6ff", 0.9)
                           : theme.palette.text.primary,
                     }}
                  >
                     Meet the crew behind the build
                  </Typography>
                  <Typography
                     variant="body1"
                     sx={{
                        maxWidth: 700,
                        color: alpha(
                           theme.palette.text.primary,
                           isDark ? 0.75 : 0.82,
                        ),
                        fontSize: { xs: "1.02rem", md: "1.12rem" },
                        lineHeight: 1.8,
                     }}
                  >
                     Five people, one capstone, shared ambition: craft a
                     platform that treats student projects like the premium work
                     they are.
                  </Typography>
               </Stack>

               <Box
                  sx={{
                     display: "grid",
                     // Mobile-first: any viewport < 768px uses single column
                     gridTemplateColumns: {
                        xs: "1fr",
                     },
                     justifyItems: "center",
                     // Tablet-and-up (>=768px) gets 3 columns
                     "@media (min-width: 768px)": {
                        gridTemplateColumns: "repeat(3, 1fr)",
                        justifyItems: "stretch",
                     },
                     // Desktop-and-up (>=900px) gets 5 columns
                     "@media (min-width: 900px)": {
                        gridTemplateColumns: "repeat(5, 1fr)",
                        justifyItems: "stretch",
                     },
                     gap: { xs: 4, md: 6 },
                     // Fallback to a single centered column on very small screens or short viewports
                     "@media (max-width: 374px)": {
                        gridTemplateColumns: "1fr",
                        justifyItems: "center",
                        paddingInline: 3,
                        gap: 16,
                     },
                     "@media (max-height: 684px)": {
                        gridTemplateColumns: "1fr",
                        justifyItems: "center",
                        paddingInline: 8,
                        gap: 16,
                     },
                  }}
               >
                  {teamMembers.map((member, index) => (
                     <Stack
                        key={member.name}
                        spacing={2}
                        alignItems="center"
                        sx={{
                           animation: `${fadeInUp} 0.8s ease-out ${index * 0.1}s backwards`,
                           transition: "transform 0.3s ease",
                           "&:hover": { transform: "translateY(-10px)" },
                        }}
                     >
                        <Avatar
                           src={member.avatar}
                           alt={member.name}
                           sx={{
                              width: { xs: 108, md: 140 },
                              height: { xs: 108, md: 140 },
                              border: `3px solid ${alpha(isDark ? "#00f0ff" : theme.palette.primary.main, 0.6)}`,
                              boxShadow: isDark
                                 ? "0 0 32px rgba(0, 240, 255, 0.4)"
                                 : `0 20px 36px ${alpha(theme.palette.primary.main, 0.25)}`,
                              "@media (max-width: 374px)": {
                                 width: 92,
                                 height: 92,
                              },
                              "@media (max-height: 684px)": {
                                 width: 92,
                                 height: 92,
                              },
                           }}
                        />
                        <Box textAlign="center">
                           <Typography
                              variant="h6"
                              sx={{ fontWeight: 800, mb: 0.6 }}
                           >
                              {member.name}
                           </Typography>
                           <Typography
                              variant="body2"
                              sx={{
                                 color: isDark
                                    ? "#00f0ff"
                                    : theme.palette.primary.main,
                                 fontWeight: 600,
                                 letterSpacing: "0.08em",
                                 textTransform: "uppercase",
                                 mb: 1.2,
                              }}
                           >
                              {member.role}
                           </Typography>
                           <Stack
                              direction="row"
                              spacing={0.6}
                              sx={{ columnGap: 2.2, rowGap: 1 }}
                              flexWrap="wrap"
                              justifyContent="center"
                           >
                              {member.skills.map((skill) => (
                                 <Chip
                                    key={skill}
                                    label={skill}
                                    size="small"
                                    sx={{
                                       bgcolor: isDark
                                          ? alpha("#111934", 0.9)
                                          : alpha(
                                               theme.palette.primary.main,
                                               0.1,
                                            ),
                                       color: isDark
                                          ? alpha("#f4f6ff", 0.85)
                                          : theme.palette.primary.main,
                                       fontWeight: 700,
                                       letterSpacing: "0.05em",
                                       textTransform: "uppercase",
                                       border: `1px solid ${alpha(
                                          theme.palette.primary.main,
                                          isDark ? 0.45 : 0.3,
                                       )}`,
                                    }}
                                 />
                              ))}
                           </Stack>
                        </Box>
                     </Stack>
                  ))}
               </Box>
            </Box>

            <Divider sx={{ mb: { xs: 10, md: 14 } }} />
            <Box sx={{ mb: { xs: 12, md: 14 }, textAlign: "center" }}>
               <Typography
                  variant="h3"
                  sx={{
                     fontWeight: 900,
                     fontSize: { xs: "2.2rem", md: "2.8rem" },
                     mb: 5,
                     color: isDark
                        ? alpha("#f4f6ff", 0.9)
                        : theme.palette.text.primary,
                  }}
               >
                  The mindset powering every release
               </Typography>
               <Stack
                  direction="row"
                  spacing={1.5}
                  justifyContent="center"
                  flexWrap="wrap"
                  sx={{ gap: 1.5 }}
               >
                  {values.map((value, index) => (
                     <Chip
                        key={value}
                        label={value}
                        sx={{
                           px: 3,
                           py: 2.2,
                           borderRadius: "999px",
                           fontSize: "1rem",
                           fontWeight: 800,
                           letterSpacing: "0.08em",
                           textTransform: "uppercase",
                           bgcolor: isDark
                              ? alpha("#0f172a", 0.82)
                              : alpha(theme.palette.primary.main, 0.08),
                           color: isDark
                              ? alpha("#f8fafc", 0.88)
                              : theme.palette.text.primary,
                           border: `1px solid ${alpha(
                              theme.palette.primary.main,
                              isDark ? 0.35 : 0.28,
                           )}`,
                           animation: `${fadeInUp} 0.8s ease-out ${index * 0.08}s backwards`,
                           transition: "transform 0.3s ease",
                           "&:hover": {
                              transform: "scale(1.05)",
                              boxShadow: isDark
                                 ? `0 16px 34px ${alpha("#1d4ed8", 0.28)}`
                                 : `0 16px 34px ${alpha(theme.palette.primary.main, 0.25)}`,
                           },
                        }}
                     />
                  ))}
               </Stack>
            </Box>

            <Stack
               spacing={5}
               alignItems="center"
               textAlign="center"
               sx={{ mb: { xs: 10, md: 12 }, px: { xs: 3, md: 6 } }}
            >
               <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="center"
                  alignItems="center"
               >
                  <Button
                     variant="contained"
                     color="primary"
                     size="large"
                     href="/upload"
                     sx={{
                        px: 4.5,
                        py: 1.6,
                        borderRadius: "999px",
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        boxShadow: isDark
                           ? "0 18px 45px rgba(0, 240, 255, 0.25)"
                           : "0 18px 45px rgba(0, 102, 204, 0.28)",
                     }}
                  >
                     Upload Your Project
                  </Button>
                  <Button
                     variant="outlined"
                     color="secondary"
                     size="large"
                     href="/projects"
                     sx={{
                        px: 4.5,
                        py: 1.6,
                        borderRadius: "999px",
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        borderWidth: 2,
                     }}
                  >
                     Explore The Showcase
                  </Button>
               </Stack>
            </Stack>
         </Container>
      </Box>
   );
};

export default AboutPage;
