import { BASE_API_URL } from "../config/api";
import type {
   Comment,
   CommentsResponse,
   CreateCommentResponse,
} from "../types/comment";

export class ApiError extends Error {
   status: number;
   constructor(message: string, status: number) {
      super(message);
      this.name = "ApiError";
      this.status = status;
   }
}

export const fetchCommentsByProject = async (
   projectId: string,
): Promise<Comment[]> => {
   const res = await fetch(`${BASE_API_URL}/comments/project/${projectId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
   });
   if (!res.ok) {
      let msg = `Failed to fetch comments: ${res.status} ${res.statusText}`;
      try {
         const err = await res.json();
         if (err?.error) msg = err.error;
      } catch {}
      throw new Error(msg);
   }
   const data: CommentsResponse = await res.json();
   return data.comments ?? [];
};

export const createComment = async (
   projectId: string,
   content: string,
): Promise<Comment> => {
   const res = await fetch(`${BASE_API_URL}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ project: projectId, content }),
   });
   if (!res.ok) {
      let msg = `Failed to post comment: ${res.status} ${res.statusText}`;
      try {
         const err = await res.json();
         if (err?.error) msg = err.error;
      } catch {}
      throw new ApiError(msg, res.status);
   }
   const data: CreateCommentResponse = await res.json();
   return data.comment;
};

/**
 * Delete a comment by id (author or privileged roles only).
 */
export const deleteComment = async (id: string): Promise<void> => {
   const res = await fetch(`${BASE_API_URL}/comments/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
   });
   if (!res.ok) {
      let msg = `Failed to delete comment: ${res.status} ${res.statusText}`;
      try {
         const err = await res.json();
         if (err?.error) msg = err.error;
      } catch {}
      throw new ApiError(msg, res.status);
   }
};
