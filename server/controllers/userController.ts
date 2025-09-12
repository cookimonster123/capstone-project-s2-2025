import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
   findAllUsers,
   findUserById,
   removeUser,
   updateUser,
   linkUserToProject,
   linkUserToTeam,
} from "../services/userService";
import { UpdateUserData } from "interfaces";

/**
 * Retrieves all users with populated team and project
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with users array or error message
 */
export const getAllUsers = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const result = await findAllUsers();
      if (!result.success) {
         res.status(500).json({ error: "Failed to fetch users" });
         return;
      }

      res.status(200).json({ users: result.data });
   } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Retrieves a specific user by ID
 * @param req - Express request object containing user ID in params
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with user data or error message
 */
export const getUserById = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   const userId = req.params.id;

   try {
      const result = await findUserById(userId);
      if (!result.success) {
         res.status(404).json({ error: "User not found" });
         return;
      }

      res.status(200).json({ user: result.data });
   } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Deletes a user by ID
 * @param req - Express request object containing user ID in params
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with deleted user data or error message
 */
export const deleteUserById = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   const userId = req.params.id;

   try {
      const result = await removeUser(userId);
      if (!result.success) {
         res.status(404).json({ error: result.error });
         return;
      }

      res.status(200).json({
         message: "User deleted successfully",
         user: result.data,
      });
   } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Updates a user by ID
 * @param req - Express request object containing user ID in params and update data in body
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with updated user data or error message
 */
export const updateUserById = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   const userId = req.params.id;
   const updateData: UpdateUserData = req.body;

   try {
      const result = await updateUser(userId, updateData);
      if (!result.success) {
         if (result.error === "User not found") {
            res.status(404).json({ error: result.error });
         } else {
            res.status(400).json({ error: result.error });
         }
         return;
      }

      // Automatically link user to project or team if provided
      if (updateData.project)
         await linkUserToProject(result.data._id, updateData.project);
      if (updateData.team)
         await linkUserToTeam(result.data._id, updateData.team);

      res.status(200).json({
         message: "User updated successfully",
         user: result.data,
      });
   } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};
