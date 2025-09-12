import Joi from "joi";
import { Team, Project, User } from "@models";
import {
   ServiceResult,
   ValidationResult,
   UserData,
   UpdateUserData,
} from "../interfaces";
import mongoose from "mongoose";

/**
 * Validates user data
 * @param userData - The user data to validate
 * @returns Validation result
 */
export function validateUserData(
   userData: UserData,
): ValidationResult<UserData> {
   const schema = Joi.object({
      name: Joi.string().min(1).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      profilePicture: Joi.string().uri().allow("").optional(),
      role: Joi.string()
         .valid("visitor", "admin", "staff", "capstoneStudent")
         .optional(),
      links: Joi.array()
         .items(
            Joi.object({
               type: Joi.string()
                  .valid("github", "linkedin", "personalWebsite")
                  .required(),
               value: Joi.string().uri(),
            }),
         )
         .optional(),
      project: Joi.string().allow("").optional(),
      team: Joi.string().allow("").optional(),
      lastLogin: Joi.date().optional(),
   });

   return schema.validate(userData);
}

/**
 * Validates user update data (partial data)
 * @param updateData - The partial user data to validate
 * @returns Validation result
 */
export function validateUpdateUserData(updateData: UpdateUserData) {
   const schema = Joi.object({
      name: Joi.string().min(1).max(30).optional(),
      email: Joi.string().email().optional(),
      profilePicture: Joi.string().uri().allow("").optional(),
      role: Joi.string()
         .valid("visitor", "admin", "staff", "capstoneStudent")
         .optional(),
      links: Joi.array()
         .items(
            Joi.object({
               type: Joi.string()
                  .valid("github", "linkedin", "personalWebsite")
                  .required(),
               value: Joi.string().uri().required(),
            }),
         )
         .optional(),
      project: Joi.string().allow("").optional(),
      team: Joi.string().allow("").optional(),
      lastLogin: Joi.date().optional(),
   }).min(1); // Ensure at least one field is provided for update

   return schema.validate(updateData);
}

/**
 * Gets all users with population
 * @returns Promise<ServiceResult> users result
 * @throws Error for unexpected server errors
 */
export async function findAllUsers(): Promise<ServiceResult<UserData[]>> {
   try {
      const users = await User.find().populate("project").populate("team");

      return {
         success: true,
         data: users.map((user) => ({
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            links:
               user.links?.map((link) => ({
                  type: link.type,
                  value: link.value,
               })) || [],
            project: user.project?.id?.toString(),
            team: user.team?.id?.toString(),
         })),
      };
   } catch (error) {
      console.error("Error in findAllUsers service:", error);
      throw error;
   }
}

/**
 * Gets user by ID
 * @param userId - ID of the user to retrieve
 * @returns Promise<ServiceResult> user result
 * @throws Error for unexpected server errors
 */
export async function findUserById(
   userId: string,
): Promise<ServiceResult<UserData>> {
   try {
      const user = await User.findById(userId)
         .populate("project")
         .populate("team");

      if (!user) {
         return {
            success: false,
            error: "User not found",
         };
      }

      return {
         success: true,
         data: {
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            links:
               user.links?.map((link) => ({
                  type: link.type,
                  value: link.value,
               })) || [],
            project: user.project?.id?.toString(),
            team: user.team?.id?.toString(),
         },
      };
   } catch (error) {
      console.error("Error in findUserById service:", error);
      throw error;
   }
}

/**
 * Updates a user
 * @param userId - ID of the project to update
 * @param updateData - Data to update the project with
 * @returns Promise<ServiceResult> update result
 * @throws Error for unexpected server errors
 */
export async function updateUser(
   userId: string,
   updateData: UpdateUserData,
): Promise<ServiceResult> {
   try {
      // Ensure at least one field is provided
      if (Object.keys(updateData).length === 0) {
         return {
            success: false,
            error: "No update data provided",
         };
      }

      // Validate input data
      const { error } = validateUpdateUserData(updateData);
      if (error) {
         return {
            success: false,
            error: error.details[0].message,
         };
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
         new: true,
         runValidators: true,
      });

      if (!updatedUser) {
         return {
            success: false,
            error: "User not found",
         };
      }

      return {
         success: true,
         data: updatedUser,
      };
   } catch (error) {
      console.error("Error in updateUser service:", error);
      throw error;
   }
}

/**
 * Removes a user by ID
 * @param userId - ID of the user to remove
 * @returns Promise<ServiceResult> deletion result
 * @throws Error for unexpected server errors
 */
export async function removeUser(userId: string): Promise<ServiceResult> {
   try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
         return {
            success: false,
            error: "Invalid user ID",
         };
      }

      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
         return {
            success: false,
            error: "User not found",
         };
      }

      return {
         success: true,
         data: deletedUser,
      };
   } catch (error) {
      console.error("Error in removeUser service:", error);
      throw error;
   }
}

/**
 * Links a user to a project by updating the user's project reference
 * @param userId - The ID of the user to update
 * @param projectId - The ID of the project to link
 * @returns Promise<void> resolves when the user is successfully updated
 * @throws Error when user or project is not found, or database operation fails
 */
export async function linkUserToProject(
   userId: string,
   projectId: string,
): Promise<void> {
   try {
      const project = await Project.findById(projectId);
      if (!project) {
         throw new Error("Project not found");
      }

      const user = await User.findById(userId);
      if (!user) {
         throw new Error("User not found");
      }

      user.project = new mongoose.Types.ObjectId(projectId);
      await user.save();
   } catch (error) {
      console.error("Error linking user to project:", error);
      throw error;
   }
}

/**
 * Links a user to a team by updating the user's team reference
 * @param userId - The ID of the user to update
 * @param teamId - The ID of the team to link
 * @returns Promise<void> resolves when the user is successfully updated
 * @throws Error when user or team is not found, or database operation fails
 */
export async function linkUserToTeam(
   userId: string,
   teamId: string,
): Promise<void> {
   try {
      const team = await Team.findById(teamId);
      if (!team) {
         throw new Error("Team not found");
      }

      const user = await User.findById(userId);
      if (!user) {
         throw new Error("User not found");
      }

      user.team = new mongoose.Types.ObjectId(teamId);
      await user.save();
   } catch (error) {
      console.error("Error linking user to team:", error);
      throw error;
   }
}
