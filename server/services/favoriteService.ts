import { Project, User } from "@models";
import { ProjectData, ServiceResult } from "../interfaces";
import mongoose from "mongoose";

/**
 * insert the project to user's favorite list
 * @param userId - the id of the user
 * @param projectId - the id of the project
 * @returns Promise<ServiceResult> insertion result
 * @throws Error for unexpected server errors
 */
export async function insertProjectToFavorites(
   userId: string,
   projectId: string,
): Promise<ServiceResult> {
   try {
      const project = await Project.findById(projectId);
      if (!project) {
         return {
            success: false,
            error: "Project not found",
         };
      }

      const addFavoriteUser = await User.findByIdAndUpdate(
         userId,
         { $addToSet: { favorites: project?._id } },
         { new: true },
      );

      return {
         success: true,
         data: addFavoriteUser,
      };
   } catch (error) {
      console.error("Error in insertProjectToFavorites service:", error);
      throw error;
   }
}

/**
 * remove the added project from user's favorite list
 * @param userId - the id of the user
 * @param projectId - the id of the project
 * @returns Promise<ServiceResult> remove result
 * @throws Error for unexpected server errors
 */
export async function removeProjectFromFavorites(
   userId: string,
   projectId: string,
): Promise<ServiceResult> {
   try {
      const projectObjectId = new mongoose.Types.ObjectId(projectId);

      const removeFavoriteUser = await User.updateOne(
         { _id: userId, favorites: projectObjectId },
         { $pull: { favorites: projectObjectId } },
      );

      if (removeFavoriteUser.matchedCount === 0) {
         return {
            success: false,
            error: "User not found or Project is not in user's favorites",
         };
      }

      return {
         success: true,
         message: "Project removed from favorites successfully",
      };
   } catch (error) {
      console.error("Error in removeProjectFromFavorites service:", error);
      throw error;
   }
}

/**
 * get the user's favorite projects
 * @param userId - the id of the user
 * @return Promise<ServiceResult> user's favorite projects array result
 * @throws Error for unexpected server errors
 */

export async function getFavoritesByUserId(
   userId: string,
): Promise<ServiceResult> {
   try {
      const user = await User.findById(userId)
         .populate({
            path: "favorites",
            populate: [
               { path: "tags", select: "name" },
               { path: "team", select: "name" },
               { path: "semester", select: "semester year" },
               { path: "category", select: "name" },
               { path: "awards", select: "_id iconUrl name" },
            ],
         })
         .lean();

      if (!user) {
         return {
            success: false,
            error: "User not found",
         };
      }

      return {
         success: true,
         data: user.favorites || [],
      };
   } catch (error) {
      console.error("Error in getFavoritesByUserId service:", error);
      throw error;
   }
}
