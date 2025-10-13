import React, { useEffect, useState } from "react";
import {
   Avatar,
   Box,
   Button,
   Divider,
   Stack,
   TextField,
   Typography,
   IconButton,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
   fetchCommentsByProject,
   createComment as apiCreateComment,
   deleteComment as apiDeleteComment,
   ApiError,
} from "../../api/commentApi";
import type { Comment as ProjectComment } from "../../types/comment";
import { fetchUserById } from "../../api/userApi";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type AuthorInfo = {
   id: string;
   name: string;
   email?: string;
   profilePicture?: string;
};

interface CommentProps {
   projectId: string;
}

const CommentSection: React.FC<CommentProps> = ({ projectId }) => {
   const navigate = useNavigate();
   const { user, isLoggedIn } = useAuth();
   const [comment, setComment] = useState("");
   const [comments, setComments] = useState<ProjectComment[]>([]);
   const [commentsLoading, setCommentsLoading] = useState(true);
   const [commentsError, setCommentsError] = useState<string | null>(null);
   const [posting, setPosting] = useState(false);
   const [authorMap, setAuthorMap] = useState<Record<string, AuthorInfo>>({});
   const [deletingId, setDeletingId] = useState<string | null>(null);
   const [confirmOpen, setConfirmOpen] = useState(false);
   const [targetId, setTargetId] = useState<string | null>(null);

   const computeInitials = (name?: string) => {
      if (!name) return "U";
      return name
         .split(" ")
         .filter(Boolean)
         .map((s) => s[0]!)
         .join("")
         .slice(0, 2)
         .toUpperCase();
   };

   const handleDelete = async (id: string) => {
      if (!isLoggedIn) {
         navigate("/sign-in");
         return;
      }
      try {
         setDeletingId(id);
         await apiDeleteComment(id);
         setComments((prev) => prev.filter((cm) => cm._id !== id));
      } catch (e) {
         if (e instanceof ApiError && e.status === 401) {
            navigate("/sign-in");
            return;
         }
         const msg =
            e instanceof Error ? e.message : "Failed to delete comment";
         setCommentsError(msg);
      } finally {
         setDeletingId(null);
      }
   };

   const confirmDelete = (id: string) => {
      if (!isLoggedIn) {
         navigate("/sign-in");
         return;
      }
      setTargetId(id);
      setConfirmOpen(true);
   };

   // Try to extract a 24-hex ObjectId string from various shapes
   const extractAuthorId = (a: unknown): string | null => {
      if (!a) return null;
      if (typeof a === "string") {
         const s = a.trim();
         // simple 24-hex id
         if (/^[a-f\d]{24}$/i.test(s)) return s;
         // patterns like ObjectId('...') or _id: new ObjectId('...')
         const m1 = s.match(/ObjectId\('([a-f\d]{24})'\)/i);
         if (m1) return m1[1];
         const m2 = s.match(/_id\s*:\s*new\s+ObjectId\('([a-f\d]{24})'\)/i);
         if (m2) return m2[1];
         // try to find "_id":"..." in a JSON-ish string
         const m3 = s.match(/"?_id"?\s*:\s*"([a-f\d]{24})"/i);
         if (m3) return m3[1];
         return null;
      }
      if (typeof a === "object") {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const obj: any = a;
         if (typeof obj._id === "string" && /^[a-f\d]{24}$/i.test(obj._id))
            return obj._id;
         if (obj._id && typeof obj._id.toString === "function") {
            const s = obj._id.toString();
            if (/^[a-f\d]{24}$/i.test(s)) return s;
         }
         if (typeof (a as any).toString === "function") {
            const s = (a as any).toString();
            if (/^[a-f\d]{24}$/i.test(s)) return s;
         }
      }
      return null;
   };

   useEffect(() => {
      let active = true;
      const loadComments = async () => {
         try {
            setCommentsLoading(true);
            setCommentsError(null);
            const list = await fetchCommentsByProject(projectId);
            if (active) setComments(list);
         } catch (e) {
            if (active)
               setCommentsError(
                  e instanceof Error ? e.message : "Failed to load comments",
               );
         } finally {
            if (active) setCommentsLoading(false);
         }
      };
      loadComments();
      return () => {
         active = false;
      };
   }, [projectId]);

   // Hydrate author display info for each unique author id
   useEffect(() => {
      const ids = new Set<string>();
      for (const c of comments) {
         const authorId = extractAuthorId((c as any)?.author);
         if (!authorId) continue;
         ids.add(authorId);
      }
      // include current user in map to avoid refetch
      if (user?.id && user.name) {
         setAuthorMap((prev) => ({
            ...prev,
            [user.id]: {
               id: user.id,
               name: user.name,
               email: user.email,
               profilePicture: user.profilePicture,
            },
         }));
      }
      const missing = Array.from(ids).filter(
         (id) => !(id in authorMap) && id !== user?.id,
      );
      if (missing.length === 0) return;
      let cancelled = false;
      (async () => {
         try {
            const results = await Promise.allSettled(
               missing.map((id) => fetchUserById(id)),
            );
            const next: Record<string, AuthorInfo> = {};
            results.forEach((res) => {
               if (res.status === "fulfilled") {
                  const info = res.value.user;
                  if (!info._id) return;
                  next[info._id] = {
                     id: info._id,
                     name: info.name,
                     email: info.email,
                     profilePicture: info?.profilePicture,
                  };
               }
            });
            if (!cancelled && Object.keys(next).length > 0) {
               setAuthorMap((prev) => ({ ...prev, ...next }));
            }
         } catch {}
      })();
      return () => {
         cancelled = true;
      };
   }, [comments, user?.id, user?.name]);

   const handleAddComment = async () => {
      const text = comment.trim();
      if (!isLoggedIn) {
         navigate("/sign-in");
         return;
      }
      if (!text) return;
      try {
         setPosting(true);
         const created = await apiCreateComment(projectId, text);
         // Normalize author so newly created comment is recognized as mine
         const normalized = {
            ...created,
            author: user?.id ?? created.author,
         } as ProjectComment;
         if (user?.id && user.name) {
            setAuthorMap((prev) => ({
               ...prev,
               [user.id]: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  profilePicture: (user as any)?.profilePicture,
               },
            }));
         }
         setComments((prev) => [normalized, ...prev]);
         setComment("");
      } catch (e) {
         if (e instanceof ApiError && e.status === 401) {
            navigate("/sign-in");
            return;
         }
         const msg = e instanceof Error ? e.message : "Failed to post comment";
         setCommentsError(msg);
      } finally {
         setPosting(false);
      }
   };

   return (
      <Box>
         <Typography variant="h5" fontWeight={700} gutterBottom>
            Comments
         </Typography>
         <Stack spacing={2}>
            <TextField
               placeholder={
                  isLoggedIn
                     ? "Share your thoughts about this project..."
                     : "Sign in to comment..."
               }
               value={comment}
               onChange={(e) => setComment(e.target.value)}
               minRows={4}
               multiline
               fullWidth
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
               <Button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || posting}
                  startIcon={<SendIcon />}
               >
                  {posting ? "Posting..." : "Post Comment"}
               </Button>
            </Box>
            {commentsError && (
               <Typography color="error" variant="body2">
                  {commentsError}
               </Typography>
            )}
            <Divider />
            {commentsLoading ? (
               <Typography color="text.secondary">
                  Loading comments...
               </Typography>
            ) : (
               <Stack spacing={2}>
                  {comments.length > 0 ? (
                     comments.map((c) => {
                        const authorId =
                           extractAuthorId((c as any)?.author) ?? "";
                        const isMine = !!user?.id && authorId === user.id;
                        const authorInfo = authorMap[authorId];
                        const displayName =
                           authorInfo?.name ||
                           (isMine ? user?.name : undefined) ||
                           "User";
                        const initials = computeInitials(
                           authorInfo?.name ||
                              (isMine ? user?.name : undefined),
                        );
                        return (
                           <Stack key={c._id} direction="row" spacing={2}>
                              <Avatar
                                 src={authorMap[authorId]?.profilePicture}
                                 sx={{ width: 40, height: 40 }}
                                 imgProps={{
                                    style: {
                                       willChange: "transform",
                                       transform: "translateZ(0)",
                                       imageRendering: "auto",
                                    },
                                 }}
                              >
                                 {!authorMap[authorId]?.profilePicture &&
                                    initials}
                              </Avatar>
                              <Box
                                 sx={{
                                    flex: 1,
                                    position: "relative",
                                    pr: isMine ? 7 : 0,
                                 }}
                              >
                                 <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                 >
                                    <Stack
                                       direction="row"
                                       spacing={1}
                                       alignItems="center"
                                    >
                                       <Typography
                                          variant="body2"
                                          fontWeight={600}
                                       >
                                          {displayName}
                                       </Typography>
                                       <Typography
                                          variant="caption"
                                          color="text.secondary"
                                       >
                                          {new Date(
                                             c.createdAt,
                                          ).toLocaleString()}
                                       </Typography>
                                    </Stack>
                                    {isMine && (
                                       <span>
                                          <IconButton
                                             aria-label="Delete comment"
                                             onClick={() =>
                                                confirmDelete(c._id)
                                             }
                                             disabled={deletingId === c._id}
                                             sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 1,
                                                position: "absolute",
                                                right: 0,
                                                top: 2,
                                                color: "text.secondary",
                                                "&:hover": {
                                                   color: "primary.main",
                                                   bgcolor: "action.hover",
                                                },
                                                "&.Mui-disabled": {
                                                   opacity: 0.5,
                                                },
                                             }}
                                          >
                                             <DeleteOutlineIcon fontSize="medium" />
                                          </IconButton>
                                       </span>
                                    )}
                                 </Stack>
                                 <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                       mt: 0.5,
                                       overflowWrap: "anywhere",
                                       wordBreak: "break-word",
                                       maxWidth: {
                                          xs: "100%",
                                          md: "140ch",
                                          lg: "160ch",
                                       },
                                    }}
                                 >
                                    {c.content}
                                 </Typography>
                              </Box>
                           </Stack>
                        );
                     })
                  ) : (
                     <Typography color="text.secondary">
                        No comments yet.
                     </Typography>
                  )}
               </Stack>
            )}
         </Stack>
         {/* Confirm delete dialog */}
         <Dialog
            open={confirmOpen}
            onClose={() => {
               if (!deletingId) setConfirmOpen(false);
            }}
            aria-labelledby="confirm-delete-title"
         >
            <DialogTitle id="confirm-delete-title">Confirm Delete</DialogTitle>
            <DialogContent>
               <Typography variant="body2">
                  Do you want to delete this comment?
               </Typography>
            </DialogContent>
            <DialogActions>
               <Button
                  onClick={() => setConfirmOpen(false)}
                  disabled={!!deletingId}
               >
                  No
               </Button>
               <Button
                  color="primary"
                  variant="contained"
                  onClick={async () => {
                     if (targetId) {
                        await handleDelete(targetId);
                     }
                     setConfirmOpen(false);
                  }}
                  disabled={!!deletingId}
               >
                  Yes
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
   );
};

export { CommentSection };
export default CommentSection;
