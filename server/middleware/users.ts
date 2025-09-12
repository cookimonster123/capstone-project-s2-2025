import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { User } from "@models";

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
