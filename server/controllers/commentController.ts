import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
   findAllComments,
   findCommentsByProject,
   findCommentById,
   findCommentsByUser,
   createComment,
   updateComment,
   deleteComment,
} from "../services/commentService";

/**
 * Get all comments
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with comments array or error message
 */
export const getAllComments = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const result = await findAllComments();

      if (!result.success) {
         res.status(500).json({ error: result.error });
         return;
      }

      res.status(200).json({ comments: result.data });
   } catch (error) {
      console.error("Error in getAllComments:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Get comments by project ID
 * @param req - Express request object containing project ID in params
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with comments data or error message
 */
export const getCommentsByProject = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const { projectId } = req.params;
      const result = await findCommentsByProject(projectId);

      if (!result.success) {
         res.status(500).json({ error: result.error });
         return;
      }

      res.status(200).json({ comments: result.data });
   } catch (error) {
      console.error("Error in getCommentsByProject:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Get comment by comment ID
 * @param req - Express request object containing comment ID in params
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with comment data or error message
 */
export const getCommentById = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const { id } = req.params;
      const result = await findCommentById(id);
      if (!result.success) {
         res.status(404).json({ error: result.error });
         return;
      }

      res.status(200).json({ comment: result.data });
   } catch (error) {
      console.error("Error in getCommentById:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Get comments by user ID
 * @param req - Express request object containing user ID in params
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with comment data or error message
 */
export const getCommentsByUser = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const { userId } = req.params;
      const result = await findCommentsByUser(userId);

      if (!result.success) {
         res.status(500).json({ error: result.error });
         return;
      }

      res.status(200).json({ comments: result.data });
   } catch (error) {
      console.error("Error in getCommentsByUser:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Create a new comment
 * @param req - Express request object containing comment data in body and author id
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with created comment data or error message
 */
export const createNewComment = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const authorId = req.user?.id;

      const commentData = {
         ...req.body,
         author: authorId,
      };
      const result = await createComment(commentData);

      if (!result.success) {
         res.status(400).json({ error: result.error });
         return;
      }

      res.status(201).json({
         message: "Comment created successfully",
         comment: result.data,
      });
   } catch (error) {
      console.error("Error in createNewComment:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Update comment content by comment ID
 * @param req - Express request object containing comment data with new content in body and comment id in params
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with updated comment data or error message
 */
export const updateCommentContent = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content) {
         res.status(400).json({ error: "Content is required" });
         return;
      }

      const result = await updateComment(id, content);

      if (!result.success) {
         res.status(404).json({ error: result.error });
         return;
      }

      res.status(200).json({
         message: "Comment updated successfully",
         comment: result.data,
      });
   } catch (error) {
      console.error("Error in updateCommentContent:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Delete a comment
 * @param req - Express request object containing comment ID in params
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with success message or error
 */
export const deleteCommentById = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const { id } = req.params;

      const result = await deleteComment(id);

      if (!result.success) {
         res.status(404).json({ error: result.error });
         return;
      }

      res.status(200).json({
         message: result.message,
      });
   } catch (error) {
      console.error("Error in deleteCommentById:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};
