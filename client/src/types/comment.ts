export interface Comment {
   _id: string;
   content: string;
   author: string; // user id (server maps to string id)
   project: string;
   createdAt: string; // ISO date string
   updatedAt: string; // ISO date string
}

export interface CommentsResponse {
   comments: Comment[];
}

export interface CreateCommentResponse {
   message: string;
   comment: Comment;
}
