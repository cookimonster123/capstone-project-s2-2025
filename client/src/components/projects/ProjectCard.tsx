/**
 * ProjectCard Component
 * Displays project information in a card format with dark mode support
 * Updated: Fixed dark mode background colors
 */
import * as React from "react";
import {
   Card,
   CardContent,
   Typography,
   Box,
   Stack,
   IconButton,
   Tooltip,
   useTheme,
} from "@mui/material";
import { ThumbUpOffAlt, ThumbUp } from "@mui/icons-material";
import WebIcon from "@mui/icons-material/Web";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import type { Project } from "../../types/project";
import { fetchUserById, fetchCurrentUserId } from "../../api/userApi";
import type { UserSummary } from "../../api/userApi";
import medalIconDefault from "../../assets/medal.svg";
import { BASE_API_URL } from "../../config/api";

type ProjectForCard = Project;
type Props = {
   project: ProjectForCard;
   onClick: (p: ProjectForCard) => void;
   isAuthenticated?: boolean;
   token?: string;
   apiBase?: string;
   height?: number | string;
   width?: number | string;
   dense?: boolean; // compact typography/layout
   hoverLift?: boolean; // raise on hover (for gallery)
};

const DEFAULT_API_BASE = BASE_API_URL;

/** Field resolvers */
function resolveProjectId(p: ProjectForCard): string {
   return (p._id ?? "").toString();
}
function resolveTitle(p: ProjectForCard): string {
   return p.name ?? "Untitled Project";
}
function resolveSemester(p: ProjectForCard): string {
   const s = p.semester;
   if (!s) return "";
   const sem = typeof s === "object" && s.semester ? s.semester : "";
   const yrRaw = typeof s === "object" && s.year ? s.year : "";
   const year = typeof yrRaw === "number" ? String(yrRaw) : String(yrRaw || "");
   return `${sem ? sem + " " : ""}${year ? year.slice(-2) : ""}`.trim();
}
function resolveCategoryName(p: ProjectForCard): string {
   const c = p.category;
   if (!c) return "";
   return typeof c === "string" ? c : (c.name ?? "");
}
function resolveTeamName(p: ProjectForCard): string {
   const t = p.team;
   if (!t) return "";
   return t.name ?? "";
}
function resolveInitialLikes(p: ProjectForCard): number {
   return p.likeCounts ?? 0;
}

export default function ProjectCard({
   project,
   onClick,
   isAuthenticated,
   apiBase = DEFAULT_API_BASE,
   height = 380,
   width = 408,
   dense = false,
   hoverLift = false,
}: Props) {
   const theme = useTheme();
   const isDark = theme.palette.mode === "dark";

   const [user, setUser] = React.useState<UserSummary | null>(null);
   const [liked, setLiked] = React.useState<boolean>(false);
   const [likes, setLikes] = React.useState<number>(
      resolveInitialLikes(project),
   );

   const [rotateX, setRotateX] = React.useState(0);
   const [rotateY, setRotateY] = React.useState(0);
   const cardRef = React.useRef<HTMLDivElement>(null);

   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hoverLift || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateXValue = ((y - centerY) / centerY) * -8;
      const rotateYValue = ((x - centerX) / centerX) * 8;
      setRotateX(rotateXValue);
      setRotateY(rotateYValue);
   };

   const handleMouseLeave = () => {
      setRotateX(0);
      setRotateY(0);
   };
   const [busy, setBusy] = React.useState(false);

   // Fetch current user on mount
   React.useEffect(() => {
      if (!isAuthenticated) return;

      const fetchUser = async () => {
         try {
            const currentUserId = await fetchCurrentUserId();
            const userData = await fetchUserById(currentUserId);

            setUser(userData.user);
         } catch (error) {
            console.error("Failed to fetch current user:", error);
         }
      };
      fetchUser();
   }, [isAuthenticated]);

   // Sync liked state whenever user or project changes
   React.useEffect(() => {
      if (user && project._id) {
         setLiked(user.likedProjects.map(String).includes(String(project._id)));
      }
   }, [user, project._id]);

   const when = resolveSemester(project);
   const categoryName = resolveCategoryName(project);
   const teamName = resolveTeamName(project);

   // award (show only when list is non-empty; use the first award)
   const firstAward = Array.isArray(project.awards) ? project.awards[0] : null;
   const awardName = firstAward?.name?.trim() ?? "";
   const awardIcon = firstAward?.iconUrl?.trim() || medalIconDefault;
   const hasAward = Boolean(awardName);

   // first project image (use first imageUrl if present)
   const firstImageUrl =
      Array.isArray((project as any).imageUrl) &&
      (project as any).imageUrl.length
         ? (project as any).imageUrl[0]
         : undefined;
   const [imageOk, setImageOk] = React.useState(true);
   React.useEffect(() => {
      setImageOk(true);
   }, [firstImageUrl]);

   /** Like API */
   async function callLikeAPI(projectId: string) {
      const r = await fetch(
         `${apiBase.replace(/\/$/, "")}/projects/${projectId}/like`,
         {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
         },
      );

      if (r.status === 401) {
         alert("Please log in to like projects.");
         throw new Error("Unauthorized");
      }
      if (!r.ok) {
         const msg = await r.text().catch(() => "");
         throw new Error(`HTTP ${r.status} ${r.statusText} ${msg}`);
      }

      const payload: { data?: { button?: boolean; likeCounts?: number } } =
         await r.json();
      return {
         liked: Boolean(payload?.data?.button ?? false),
         likes: Number(payload?.data?.likeCounts ?? 0),
      };
   }

   const handleLikeClick: React.MouseEventHandler<HTMLButtonElement> = async (
      e,
   ) => {
      e.preventDefault();
      e.stopPropagation();
      if (busy) return;
      console.log(isAuthenticated);
      if (!isAuthenticated) {
         alert("Please log in to like projects.");
         return;
      }

      const pid = resolveProjectId(project);
      if (!pid) return;

      setBusy(true);

      const currentlyLiked = liked;
      setLiked(!currentlyLiked);
      setLikes((prev) => prev + (currentlyLiked ? -1 : 1));
      try {
         const res = await callLikeAPI(pid);
         setLiked(res.liked); // backend truth
         setLikes(res.likes); // backend likeCounts
      } catch (err) {
         console.error("[Like] failed:", err);
         alert("Failed to like/unlike project.");
      } finally {
         setBusy(false);
      }
   };

   return (
      <Card
         ref={cardRef}
         onMouseMove={handleMouseMove}
         onMouseLeave={handleMouseLeave}
         onClick={() => onClick(project)}
         sx={{
            width,
            height,
            borderRadius: 2.5,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
            bgcolor: (theme) =>
               theme.palette.mode === "dark" ? "#0f1419" : "#ffffff",
            background: (theme) =>
               theme.palette.mode === "dark"
                  ? "#0f1419 !important"
                  : "#ffffff !important",
            border: (theme) =>
               theme.palette.mode === "dark"
                  ? "1px solid #1a1f2e"
                  : "1px solid #e5e5e7",
            position: "relative",
            transformStyle: "preserve-3d",
            perspective: "1000px",
            transition: hoverLift
               ? "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
               : undefined,
            transform: hoverLift
               ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
               : undefined,
            boxShadow: hoverLift
               ? isDark
                  ? "0 2px 8px rgba(0,0,0,0.3)"
                  : "0 2px 8px rgba(0,0,0,0.04)"
               : undefined,
            "&::before": hoverLift
               ? {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: isDark
                       ? "linear-gradient(90deg, transparent, rgba(0, 204, 255, 0.15), transparent)"
                       : "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
                    transition: "left 0.6s ease",
                    zIndex: 2,
                    pointerEvents: "none",
                 }
               : undefined,
            "&::after": hoverLift
               ? {
                    content: '""',
                    position: "absolute",
                    inset: "-2px",
                    background: isDark
                       ? "linear-gradient(45deg, #0099ff, #00ccff, #33ddff, #0099ff)"
                       : "linear-gradient(45deg, #06c, #0ea5e9, #38bdf8, #06c)",
                    backgroundSize: "300% 300%",
                    borderRadius: "inherit",
                    opacity: 0,
                    zIndex: -1,
                    transition: "opacity 0.4s",
                    animation: "gradientRotate 6s linear infinite",
                    "@keyframes gradientRotate": {
                       "0%": { backgroundPosition: "0% 50%" },
                       "50%": { backgroundPosition: "100% 50%" },
                       "100%": { backgroundPosition: "0% 50%" },
                    },
                 }
               : undefined,
            "&:hover": hoverLift
               ? {
                    transform: `perspective(1000px) translateY(-12px) translateZ(20px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`,
                    boxShadow: isDark
                       ? "0 20px 40px rgba(0, 153, 255, 0.25), 0 8px 16px rgba(0, 0, 0, 0.4)"
                       : "0 20px 40px rgba(0, 102, 204, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)",
                    borderColor: "transparent",
                    "&::before": {
                       left: "100%",
                    },
                    "&::after": {
                       opacity: 1,
                    },
                 }
               : undefined,
            "&:active": hoverLift
               ? {
                    transform: `perspective(1000px) translateY(-8px) translateZ(10px) scale(1.01)`,
                    boxShadow: "0 12px 24px rgba(0,102,204,0.12)",
                 }
               : undefined,
         }}
      >
         {/* image (first of imageUrl) with grey fallback */}
         <Box
            sx={{
               position: "relative",
               height: dense ? 180 : 210,
               bgcolor: (theme) => {
                  if (!firstImageUrl || !imageOk) {
                     return theme.palette.mode === "dark"
                        ? "#1a1f2e"
                        : "#f5f5f7";
                  }
                  return "transparent";
               },
               overflow: "hidden",
               // 添加渐变遮罩
               "&::after":
                  firstImageUrl && imageOk
                     ? {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "40%",
                          background:
                             "linear-gradient(to top, rgba(0,0,0,0.15), transparent)",
                          pointerEvents: "none",
                          zIndex: 1,
                       }
                     : undefined,
            }}
         >
            {firstImageUrl && imageOk && (
               <img
                  src={firstImageUrl}
                  alt={resolveTitle(project)}
                  style={{
                     display: "block",
                     width: "100%",
                     height: "100%",
                     objectFit: "cover",
                     transition: "transform 0.3s ease",
                  }}
                  onError={() => setImageOk(false)}
                  onMouseEnter={(e) => {
                     if (hoverLift) {
                        e.currentTarget.style.transform = "scale(1.05)";
                     }
                  }}
                  onMouseLeave={(e) => {
                     if (hoverLift) {
                        e.currentTarget.style.transform = "scale(1)";
                     }
                  }}
               />
            )}
         </Box>

         <CardContent
            sx={{
               display: "flex",
               flexDirection: "column",
               gap: dense ? 1 : 1.25,
               flexGrow: 1,
               p: dense ? 1.5 : 2,
               pb: dense ? 0.25 : 0.5,
               "&:last-child": { pb: dense ? 0.25 : 0.5 },
               position: "relative",
               zIndex: 2,
               bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "#0f1419" : "#ffffff",
            }}
         >
            {/* Title (left) + Award block (right in the red area) */}
            <Stack
               direction="row"
               alignItems="flex-start"
               justifyContent="space-between"
               sx={{ gap: 1 }}
            >
               {/* Title: when there is an award, limit max width so it wraps earlier */}
               <Typography
                  variant="h6"
                  sx={{
                     flex: "1 1 auto",
                     maxWidth: hasAward ? "calc(100% - 128px)" : "100%",
                     fontWeight: 600,
                     pr: 1,
                     display: "-webkit-box",
                     WebkitLineClamp: 2,
                     WebkitBoxOrient: "vertical",
                     overflow: "hidden",
                     lineHeight: 1.3,
                     minHeight: dense ? 34 : 40,
                     fontSize: dense ? 16 : 18,
                     color: (theme) =>
                        theme.palette.mode === "dark" ? "#e8eaed" : "#1d1d1f",
                     letterSpacing: "-0.01em",
                  }}
               >
                  {resolveTitle(project)}
               </Typography>

               {/* Award box: 2 lines, medal centered above name, whole block centered */}
               {hasAward && (
                  <Box
                     sx={{
                        width: 120,
                        minWidth: 120,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                        pt: 0.25,
                     }}
                  >
                     <img
                        src={awardIcon}
                        alt="award"
                        width={22}
                        height={22}
                        style={{ display: "block" }}
                        onError={(e) => {
                           (e.currentTarget as HTMLImageElement).src =
                              medalIconDefault;
                        }}
                     />
                     <Typography
                        variant="caption"
                        sx={{
                           fontWeight: 600,
                           textAlign: "center",
                           lineHeight: 1.1,
                        }}
                     >
                        {awardName}
                     </Typography>
                  </Box>
               )}
            </Stack>

            {/* Meta row: semester first, then team (as requested) */}
            <Stack direction="row" spacing={2} alignItems="center">
               {when && (
                  <Typography
                     variant="body2"
                     sx={{
                        fontSize: dense ? 12.5 : 14,
                        color: "#6e6e73",
                        fontWeight: 500,
                     }}
                  >
                     {when}
                  </Typography>
               )}
               {teamName && (
                  <Typography
                     variant="body2"
                     sx={{
                        fontSize: dense ? 12.5 : 14,
                        color: "#6e6e73",
                        fontWeight: 500,
                     }}
                  >
                     {teamName}
                  </Typography>
               )}
            </Stack>

            {/* Category + like cluster pinned to bottom */}
            <Stack
               direction="row"
               alignItems="center"
               justifyContent="space-between"
               sx={{
                  mt: "auto",
                  pb: 0.25,
                  mb: 0,
                  pt: 1,
                  borderTop: "1px solid #f5f5f7",
               }}
            >
               <Stack direction="row" alignItems="center" spacing={0.5}>
                  {!!categoryName && (
                     <>
                        <Typography
                           variant="body2"
                           sx={{
                              fontSize: dense
                                 ? { xs: 12, sm: 12.5, md: 13 }
                                 : { xs: 13, md: 14 },
                              color: "#6e6e73",
                              fontWeight: 500,
                           }}
                        >
                           {categoryName}
                        </Typography>
                        {renderCategoryIcon(categoryName, dense)}
                     </>
                  )}
               </Stack>

               <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Tooltip
                     title={
                        isAuthenticated === false
                           ? "Please log in"
                           : liked
                             ? "Unlike"
                             : "Like"
                     }
                  >
                     <span>
                        <IconButton
                           aria-label={
                              liked ? "unlike project" : "like project"
                           }
                           onClick={handleLikeClick}
                           disabled={busy || !isAuthenticated}
                           size="small"
                           sx={{
                              opacity: isAuthenticated === false ? 0.6 : 1,
                              cursor:
                                 isAuthenticated === false
                                    ? "not-allowed"
                                    : "pointer",
                              transition:
                                 "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": {
                                 transform: isAuthenticated
                                    ? "scale(1.1)"
                                    : "none",
                                 bgcolor: isAuthenticated
                                    ? "rgba(0, 102, 204, 0.04)"
                                    : "transparent",
                              },
                              "&:hover svg": {
                                 color:
                                    liked && isAuthenticated
                                       ? "#dc2626"
                                       : isAuthenticated
                                         ? "#06c"
                                         : undefined,
                              },
                           }}
                        >
                           {liked && isAuthenticated ? (
                              <ThumbUp
                                 sx={{ color: "#ef4444", fontSize: 20 }}
                              />
                           ) : (
                              <ThumbUpOffAlt
                                 sx={{ fontSize: 20, color: "#6e6e73" }}
                              />
                           )}
                        </IconButton>
                     </span>
                  </Tooltip>
                  <Typography
                     variant="body2"
                     sx={{
                        color: liked && isAuthenticated ? "#ef4444" : "#6e6e73",
                        fontSize: dense ? 12.5 : 14,
                        fontWeight: 500,
                     }}
                  >
                     {Number.isFinite(likes) ? likes : 0}
                  </Typography>
               </Box>
            </Stack>
         </CardContent>
      </Card>
   );
}
// Choose an icon based on category name (receive values via args)
function renderCategoryIcon(nameRaw: string, isDense: boolean) {
   const name = (nameRaw || "").toLowerCase();
   const iconSx = isDense
      ? {
           ml: 0.5,
           color: "#6e6e73",
           fontSize: { xs: "1.05em", md: "1.1em" },
        }
      : {
           ml: 0.5,
           color: "#6e6e73",
           fontSize: { xs: "1.1em", md: "1.15em", lg: "1.2em" },
        };
   if (name.includes("web")) return <WebIcon sx={iconSx} />;
   if (name.includes("mobile")) return <PhoneIphoneIcon sx={iconSx} />;
   if (name.includes("game")) return <SportsEsportsIcon sx={iconSx} />;
   if (name.includes("ai") || name.includes("ml"))
      return <SmartToyIcon sx={iconSx} />;
   return null;
}
