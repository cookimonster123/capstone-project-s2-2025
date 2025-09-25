import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
   insertProjectToFavorites,
   removeProjectFromFavorites,
   getFavoritesByUserId,
} from "../services/favoriteService";

/**
 * Add a project to the user's favorites
 * @param req - Express request object containing user ID in params and project ID in body
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with updated user data or error message
 */
export const addProjectToFavorites = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const userId = req.params.id;
      const { projectId } = req.body;

      const result = await insertProjectToFavorites(userId, projectId);

      if (!result.success) {
         res.status(400).json({ error: result.error });
         return;
      }

      res.status(200).json({ user: result.data });
   } catch (error) {
      console.error("Error adding project to favorites:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Remove a project from the user's favorites
 * @param req - Express request object containing user ID in params and project ID in body
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with success message or error message
 */
export const deleteProjectFromFavorites = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const userId = req.params.id;
      const projectId = req.params.projectId;

      const result = await removeProjectFromFavorites(userId, projectId);
      if (!result.success) {
         res.status(400).json({ error: result.error });
         return;
      }

      res.status(200).json({ message: result.message });
   } catch (error) {
      console.error("Error removing project from favorites:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Get the user's favorite projects
 * @param req - Express request object containing user ID in params
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with user's favorite projects or error message
 */
export const getUserFavoritesByUserId = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const userId = req.params.id;

      const result = await getFavoritesByUserId(userId);
      if (!result.success) {
         res.status(400).json({ error: result.error });
         return;
      }

      res.status(200).json({ favorites: result.data });
   } catch (error) {
      console.error("Error fetching user favorites:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};
