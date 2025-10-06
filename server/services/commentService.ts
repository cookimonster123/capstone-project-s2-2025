import Joi from "joi";
import { Comment, Project, User } from "@models";
import {
   ServiceResult,
   ValidationResult,
   CommentData,
   QueryComment,
   CommentDoc,
} from "../interfaces";
import mongoose from "mongoose";

/**
 * Validates comment data against a Joi schema.
 * @param {Partial<CommentData>} commentData - The comment data including content, author and project to validate.
 * @returns {ValidationResult<CommentData>} The result of the validation
 */
export function validateCommentData(
   commentData: Partial<CommentData>,
): ValidationResult<CommentData> {
   const schema = Joi.object({
      content: Joi.string().max(1000).required(),
      author: Joi.string().required(),
      project: Joi.string().required(),
   });
   return schema.validate(commentData);
}

/**
 * Map a Comment document to CommentData
 * @param comment - the comment document
 * @returns CommentData - comment data result
 */
export const mapCommentToData = (comment: CommentDoc): CommentData => {
   // Handle populated author
   let author: CommentData["author"];
   if (
      comment.author &&
      typeof comment.author === "object" &&
      "name" in comment.author
   ) {
      // Author is populated
      author = {
         _id: comment.author._id.toString(),
         name: comment.author.name,
         email: comment.author.email,
         profilePicture: comment.author.profilePicture,
      };
   } else if (comment.author) {
      // Author is just an ObjectId
      author = comment.author.toString();
   } else {
      author = "";
   }

   // Handle populated project
   let project: CommentData["project"];
   if (
      comment.project &&
      typeof comment.project === "object" &&
      "name" in comment.project
   ) {
      // Project is populated
      project = {
         _id: comment.project._id.toString(),
         name: comment.project.name,
      };
   } else if (comment.project) {
      // Project is just an ObjectId
      project = comment.project.toString();
   } else {
      project = "";
   }

   return {
      _id: comment._id.toString(),
      content: comment.content,
      author,
      project,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
   };
};

/**
 * Find all comments
 * @returns Promise<ServiceResult<CommentData[]>> - all comments data in an array
 * @throws Error for unexpected server errors
 */
export const findAllComments = async (): Promise<
   ServiceResult<CommentData[]>
> => {
   try {
      const comments = await Comment.find()
         .populate("author", "name email role")
         .populate("project", "name")
         .sort({ createdAt: -1 });

      return {
         success: true,
         data: comments.map(mapCommentToData),
      };
   } catch (error) {
      console.error("Error finding comments:", error);
      throw error;
   }
};

/**
 * Find comments by project id
 * @param projectId - the project id
 * @returns Promise<ServiceResult<CommentData[]>> - all comments to this project
 * @throws Error for unexpected server errors
 */
export const findCommentsByProject = async (
   projectId: string,
): Promise<ServiceResult<CommentData[]>> => {
   try {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
         return {
            success: false,
            error: "Invalid project ID",
         };
      }

      if (!(await Project.exists({ _id: projectId }))) {
         return {
            success: false,
            error: "Project not found",
         };
      }

      const query: QueryComment = {
         project: projectId,
      };

      const comments = await Comment.find(query)
         .populate("author", "name email role")
         .sort({ createdAt: -1 });

      const commentsData = comments.map(mapCommentToData);

      return {
         success: true,
         data: commentsData,
      };
   } catch (error) {
      console.error("Error finding comments by project:", error);
      throw error;
   }
};

/**
 * Find comment by ID
 * @param commentId - the id of the comment
 * @returns Promise<ServiceResult<CommentData>> - the comment data
 * @throws Error for unexpected server errors
 */
export const findCommentById = async (
   commentId: string,
): Promise<ServiceResult<CommentData>> => {
   try {
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
         return {
            success: false,
            error: "Invalid comment ID",
         };
      }

      const comment = await Comment.findById(commentId)
         .populate("author", "name email role")
         .populate("project", "name");

      if (!comment) {
         return {
            success: false,
            error: "Comment not found",
         };
      }

      return {
         success: true,
         data: mapCommentToData(comment),
      };
   } catch (error) {
      console.error("Error finding comment:", error);
      throw error;
   }
};

/**
 * Get comments by user
 * @param userId - the author id
 * @returns Promise<ServiceResult<CommentData[]>> - the user's all comments
 * @throws Error for unexpected server errors
 */
export const findCommentsByUser = async (
   userId: string,
): Promise<ServiceResult<CommentData[]>> => {
   try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
         return {
            success: false,
            error: "Invalid user ID",
         };
      }
      if (!(await User.exists({ _id: userId }))) {
         return {
            success: false,
            error: "User not found",
         };
      }

      const query: QueryComment = { author: userId };

      const comments = await Comment.find(query)
         .populate("author", "name email role")
         .populate("project", "name")
         .sort({ createdAt: -1 });

      return {
         success: true,
         data: comments.map(mapCommentToData),
      };
   } catch (error) {
      console.error("Error finding comments by user:", error);
      throw error;
   }
};

/**
 * Create a new comment
 * @param {Partial<CommentData>} commentData - the comment data including the author, content and project
 * @returns Promise<<ServiceResult<CommentData>> - the created comment data
 * @throws Error for unexpected server errors
 */
export const createComment = async (
   commentData: Partial<CommentData>,
): Promise<ServiceResult<CommentData>> => {
   try {
      const { error } = validateCommentData(commentData);
      if (error) {
         return {
            success: false,
            error: error.details[0].message,
         };
      }

      const project = await Project.findById(commentData.project?.toString());
      if (!project) {
         return {
            success: false,
            error: "Project not found",
         };
      }

      const comment = new Comment({
         ...commentData,
      });

      await comment.save();

      await comment.populate("author", "name email profilePicture");

      return {
         success: true,
         data: mapCommentToData(comment),
      };
   } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
   }
};

/**
 * Update comment content
 * @param id - the comment id
 * @param content - the new content
 * @returns Promise<ServiceResult<CommentData>> - the updated comment data
 * @throws Error for unexpected server errors
 */
export const updateComment = async (
   id: string,
   content: string,
): Promise<ServiceResult<CommentData>> => {
   try {
      const comment = await Comment.findById(id);

      if (!comment) {
         return {
            success: false,
            error: "Comment not found",
         };
      }

      comment.content = content;
      await comment.save();
      await comment.populate("author", "name email profilePicture");

      return {
         success: true,
         data: mapCommentToData(comment),
      };
   } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
   }
};

/**
 * Delete a comment
 * @param id - comment id
 * @returns Promise<ServiceResult> - a message says delete successfully
 * @throws Error for unexpected server errors
 */
export const deleteComment = async (id: string): Promise<ServiceResult> => {
   try {
      const comment = await Comment.findById(id);

      if (!comment) {
         return {
            success: false,
            error: "Comment not found",
         };
      }

      await comment.deleteOne();

      return {
         success: true,
         message: "Comment and its replies deleted successfully",
      };
   } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
   }
};
