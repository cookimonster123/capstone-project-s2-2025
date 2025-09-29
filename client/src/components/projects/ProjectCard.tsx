import * as React from "react";
import {
   Card,
   CardContent,
   Typography,
   Box,
   Stack,
   IconButton,
   Tooltip,
} from "@mui/material";
import { ThumbUpOffAlt, ThumbUp } from "@mui/icons-material";
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
   height?: number;
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
}: Props) {
   const [user, setUser] = React.useState<UserSummary | null>(null);
   const [liked, setLiked] = React.useState<boolean>(false);
   const [likes, setLikes] = React.useState<number>(
      resolveInitialLikes(project),
   );
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
         onClick={() => onClick(project)}
         sx={{
            width: 408,
            height,
            borderRadius: 2,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
         }}
      >
         {/* image placeholder */}
         <Box sx={{ position: "relative", height: 210, bgcolor: "grey.200" }} />

         <CardContent
            sx={{
               display: "flex",
               flexDirection: "column",
               gap: 1.25,
               flexGrow: 1,
               p: 2,
               pb: 0.5,
               "&:last-child": { pb: 0.5 },
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
                     fontWeight: 700,
                     pr: 1,
                     display: "-webkit-box",
                     WebkitLineClamp: 2,
                     WebkitBoxOrient: "vertical",
                     overflow: "hidden",
                     lineHeight: 1.2,
                     minHeight: 40,
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
                  <Typography variant="body2" color="text.secondary">
                     {when}
                  </Typography>
               )}
               {teamName && (
                  <Typography variant="body2" color="text.secondary">
                     {teamName}
                  </Typography>
               )}
            </Stack>

            {/* Category + like cluster pinned to bottom */}
            <Stack
               direction="row"
               alignItems="center"
               justifyContent="space-between"
               sx={{ mt: "auto", pb: 0.25, mb: 0 }}
            >
               <Stack direction="row" alignItems="center" spacing={1.25}>
                  {!!categoryName && (
                     <Typography variant="body2" color="text.secondary">
                        {categoryName}
                     </Typography>
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
                              "&:hover svg": {
                                 color:
                                    liked && isAuthenticated
                                       ? "error.dark"
                                       : undefined,
                              },
                           }}
                        >
                           {liked && isAuthenticated ? (
                              <ThumbUp sx={{ color: "error.main" }} />
                           ) : (
                              <ThumbUpOffAlt />
                           )}
                        </IconButton>
                     </span>
                  </Tooltip>
                  <Typography
                     variant="body2"
                     sx={{
                        color:
                           liked && isAuthenticated
                              ? "error.main"
                              : "text.primary",
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
