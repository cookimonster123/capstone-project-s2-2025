import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { User, Comment } from "@models";

/**
 * Middleware to enforce access control on deleteUserById
 * RBAC rules:
 * - Admin can delete any user except self
 * - Staff can delete any user except admin and other staff
 * @param req - Express request object with potential user data
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 */
export const deleteUsersWithLimitedRole = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const targetUserId = req.params.id;

      const targetUserRole = await User.findById(targetUserId)
         .select("role")
         .then((user) => user?.role);

      if (userRole === "admin") {
         if (userId === targetUserId || targetUserRole === "admin") {
            res.status(403).json({
               error: "Access denied: You can't delete this account",
            });
            return;
         }

         next();
         return;
      }

      if (
         targetUserRole === "capstoneStudent" ||
         targetUserRole === "visitor"
      ) {
         next();
         return;
      }
      res.status(403).json({
         error: "Access denied: You can't delete this account",
      });
      return;
   } catch (error) {
      console.error("Error in deleteUsersWithLimitedRole middleware:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
   }
};

/**
 * Middleware to enforce access control on updateUserById
 * RBAC rules:
 * - Admin can update any user account except admin
 * - Staff can update any user account except admin or other staff
 * @param req - Express request object with potential user data
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 */
export const updateUserContent = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const targetUserId = req.params.id;
      const updateData = req.body;

      if (userRole === "admin") {
         next();
         return;
      }

      if (
         updateData.role &&
         (updateData.role === "admin" || updateData.role === "staff")
      ) {
         res.status(403).json({
            error: "Access denied: You have no rights to set this role",
         });
         return;
      }

      const targetUserRole = await User.findById(targetUserId)
         .select("role")
         .then((user) => user?.role);

      if (targetUserRole === "admin" || targetUserRole === "staff") {
         res.status(403).json({
            error: "Access denied: You can't update this account",
         });
         return;
      }
      next();
      return;
   } catch (error) {
      console.error("Error in updateUserContent middleware:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
   }
};

/**
 * Middleware to ensure that the user can only access their own favorites
 * RBAC rules:
 * - Users can only access their own favorite projects
 * @param req - Express request object with potential user data
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 */
export const accessOwnFavoritesOnly = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id;
      const targetUserId = req.params.id;

      if (userId !== targetUserId) {
         res.status(403).json({
            error: "Access denied: You can only access your own favorite projects",
         });
         return;
      }

      next();
      return;
   } catch (error) {
      console.error("Error in accessOwnFavoritesOnly middleware:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
   }
};

/**
 * Middleware to ensure that users can only delete comment by their own permissions
 * RBAC rules:
 * - users can only delete their own comments
 * - admin/staff can delete any comments
 * @param req - Express request object with potential user data
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 */
export const canDeleteComment = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id;
      const role = req.user?.role;
      const commentId = req.params.id;

      const comment = await Comment.findById(commentId);

      if (!comment) {
         res.status(404).json({ error: "Comment not found" });
         return;
      }

      if (
         role !== "admin" &&
         role !== "staff" &&
         comment.author._id.toString() !== userId
      ) {
         res.status(403).json({
            error: "Access denied: You can only delete your own comments",
         });
         return;
      }

      next();
   } catch (error) {
      console.error("Error in canDeleteComment middleware:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Middleware to ensure that users can only update own comments
 * RBAC rules:
 * - users can only update their own comments (author only)
 * @param req - Express request object with potential user data
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 */
export const canUpdateComment = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      const userId = req.user?.id;
      const commentId = req.params.id;

      const comment = await Comment.findById(commentId);

      if (!comment) {
         res.status(404).json({ error: "Comment not found" });
         return;
      }

      // Only author can update
      if (comment.author._id.toString() !== userId) {
         res.status(403).json({
            error: "You can only update your own comment",
         });
         return;
      }

      next();
   } catch (error) {
      console.error("Error in canUpdateComment middleware:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};
