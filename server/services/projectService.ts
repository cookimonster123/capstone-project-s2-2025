import Joi from "joi";
import { Project, Team, User, Tag } from "@models";
import {
   ServiceResult,
   ValidationResult,
   ProjectData,
   UpdateProjectData,
} from "../interfaces";
import mongoose from "mongoose";
import { addTagToProject } from "./tagService";

/**
 * Validates project data
 * @param projectData - The project data to validate
 * @returns Validation result
 */
export function validateProjectData(
   projectData: ProjectData,
): ValidationResult<ProjectData> {
   const schema = Joi.object({
      name: Joi.string().min(1).max(100).required(),
      teamId: Joi.string().allow(""),
      description: Joi.string().allow(""),
      semester: Joi.string().required(),
      category: Joi.string().allow(""),
      links: Joi.array().items(
         Joi.object({
            type: Joi.string().valid("github", "deployedWebsite").required(),
            value: Joi.string().uri().required(),
         }),
      ),
      tags: Joi.array().items(Joi.string()),
      likeCounts: Joi.number().integer().min(0).required(),
      award: Joi.array().items(Joi.string()).optional(),
   });

   return schema.validate(projectData);
}

/**
 * Validates project update data (partial data)
 * @param updateData - The partial project data to validate
 * @returns Validation result
 */
export function validateUpdateProjectData(
   updateData: UpdateProjectData,
): ValidationResult<UpdateProjectData> {
   const schema = Joi.object({
      name: Joi.string().min(1).max(100).optional(),
      teamId: Joi.string().allow("").optional(),
      description: Joi.string().allow("").optional(),
      semester: Joi.string().optional(),
      category: Joi.string().allow("").optional(),
      links: Joi.array()
         .items(
            Joi.object({
               type: Joi.string().valid("github", "deployedWebsite").required(),
               value: Joi.string().uri().required(),
            }),
         )
         .optional(),
   }).min(1); // Ensure at least one field is provided for update

   return schema.validate(updateData);
}

/**
 * Creates a new project
 * @param projectData - Project data to create
 * @returns Promise<ServiceResult> creation result
 * @throws Error for unexpected server errors
 */
export async function insertProject(
   projectData: ProjectData,
): Promise<ServiceResult> {
   try {
      // Validate input data
      const { error } = validateProjectData(projectData);
      if (error) {
         return {
            success: false,
            error: error.details[0].message,
         };
      }

      const teamId = projectData.teamId;

      // Check if team has a project already
      const hasProject = await teamHasProject(teamId);
      if (hasProject) {
         return {
            success: false,
            error: "This team already has a project",
         };
      }

      // Create new project with proper field mapping
      const { tags, teamId: _, ...projectFields } = projectData;
      const project = new Project({
         ...projectFields,
         team: teamId, // Map teamId to team field required by the schema
      });

      await project.save();

      //add at most first five tags from tags array to the project
      const projectId = project._id.toString();
      if (tags?.length) {
         const slicedTags = tags.slice(0, 5);
         for (const tagName of slicedTags) {
            await addTagToProject(tagName.trim(), projectId);
         }
      }

      const updatedProject = await Project.findById(projectId);

      return {
         success: true,
         data: updatedProject,
      };
   } catch (error) {
      console.error("Error in insertProject service:", error);
      throw error;
   }
}

/**
 * Gets all projects with population
 * @returns Promise<ServiceResult> projects result
 * @throws Error for unexpected server errors
 */
export async function findAllProjects(): Promise<ServiceResult> {
   try {
      const projects = await Project.find()
         .populate("team")
         .populate("semester")
         .populate("category")
         .populate("tags", "name")
         .populate("awards", "_id iconUrl name");

      return {
         success: true,
         data: projects,
      };
   } catch (error) {
      console.error("Error in findAllProjects service:", error);
      throw error;
   }
}

/**
 * Gets project by ID
 * @param projectId - ID of the project to retrieve
 * @returns Promise<ServiceResult> project result
 * @throws Error for unexpected server errors
 */
export async function findProjectById(
   projectId: string,
): Promise<ServiceResult> {
   try {
      const project = await Project.findById(projectId)
         .populate("team")
         .populate("semester")
         .populate("category")
         .populate("tags", "name")
         .populate("awards", "_id iconUrl name");

      if (!project) {
         return {
            success: false,
            error: "Project not found",
         };
      }

      return {
         success: true,
         data: project,
      };
   } catch (error) {
      console.error("Error in findProjectById service:", error);
      throw error;
   }
}

/**
 * Updates a project
 * @param projectId - ID of the project to update
 * @param updateData - Data to update the project with
 * @returns Promise<ServiceResult> update result
 * @throws Error for unexpected server errors
 */
export async function updateProject(
   projectId: string,
   updateData: UpdateProjectData,
): Promise<ServiceResult> {
   try {
      // Validate input data if provided
      if (Object.keys(updateData).length > 0) {
         const { error } = validateUpdateProjectData(updateData);
         if (error) {
            return {
               success: false,
               error: error.details[0].message,
            };
         }
      }

      const project = await Project.findByIdAndUpdate(projectId, updateData, {
         new: true,
         runValidators: true,
      });

      if (!project) {
         return {
            success: false,
            error: "Project not found",
         };
      }

      return {
         success: true,
         data: project,
      };
   } catch (error) {
      console.error("Error in updateProject service:", error);
      throw error;
   }
}

/**
 * Deletes a project
 * @param projectId - ID of the project to delete
 * @returns Promise<ServiceResult> deletion result
 * @throws Error for unexpected server errors
 */
export async function removeProject(projectId: string): Promise<ServiceResult> {
   try {
      const project = await Project.findById(projectId);

      // Remove the projectId from all users' liked projects arrays
      await User.updateMany(
         { likedProjects: projectId },
         { $pull: { likedProjects: projectId } },
      );
      if (!project) {
         return {
            success: false,
            error: "Project not found",
         };
      }

      //clean up bound tags if project has
      if (project.tags.length > 0) {
         await Tag.updateMany(
            { _id: { $in: project.tags } },
            { $pull: { projects: projectId }, $inc: { mentions: -1 } },
         );

         await Tag.deleteMany({
            _id: { $in: project.tags },
            mentions: { $lte: 0 },
         });
      }

      await Project.findByIdAndDelete(projectId);

      return {
         success: true,
         message: "Project deleted successfully",
      };
   } catch (error) {
      console.error("Error in removeProject service:", error);
      throw error;
   }
}

/**
 * Checks if a team has an existing project (returns boolean)
 * @param teamId - ID of the team to check
 * @returns Promise<boolean> true if team has a project, false otherwise
 * @throws Error for unexpected server errors
 */
export async function teamHasProject(teamId: string): Promise<boolean> {
   try {
      const project = await Project.findOne({ team: teamId });
      return project !== null;
   } catch (error) {
      console.error("Error in teamHasProject service:", error);
      throw error;
   }
}

/**
 * Links a project to a team by updating the team's project reference
 * @param projectId - The ID of the project to link
 * @param teamId - The ID of the team to link the project to
 * @returns Promise<void> resolves when the team is successfully updated
 * @throws Error when team is not found or database operation fails
 */
export async function linkProjectToTeam(
   projectId: string,
   teamId: string,
): Promise<void> {
   try {
      const team = await Team.findById(teamId);
      if (!team) {
         throw new Error("Team not found");
      }
      team.project = new mongoose.Types.ObjectId(projectId);
      await team.save();
   } catch (error) {
      console.error("Error linking project to team:", error);
      throw error;
   }
}

/**
 * Links a project to all members of a team by updating each user's project reference
 * @param projectId - The ID of the project to link
 * @param teamId - The ID of the team whose members should be linked to the project
 * @returns Promise<void> resolves when all team members are successfully updated
 * @throws Error when team is not found, any team member is not found, or database operations fail
 */
export async function linkProjectToTeamMembers(
   projectId: string,
   teamId: string,
): Promise<void> {
   try {
      const team = await Team.findById(teamId).populate("members");
      const teamMembers = team?.members || [];

      await Promise.all(
         teamMembers.map(async (id: mongoose.Types.ObjectId) => {
            const user = await User.findById(id);
            if (!user) {
               throw new Error(`User with ID ${id} not found`);
            }

            user.project = new mongoose.Types.ObjectId(projectId);
            await user.save();
         }),
      );
   } catch (error) {
      console.error("Error linking project to team members:", error);
      throw error;
   }
}

/**
 * LikeButton to record the like counts of a project and user like state to different projects
 * @param userId - The ID of the user
 * @param projectId - The ID of the project
 * @returns Promise<ServiceResult> user's like result to a project by id
 * @throws Error when likeButton runs error.
 */
export async function likeButton(
   userId: string,
   projectId: string,
): Promise<ServiceResult> {
   try {
      const user = await User.findById(userId);
      const project = await Project.findById(projectId);
      if (!user || !project) {
         return {
            success: false,
            error: "Not found",
         };
      }

      const alreadyLiked = user.likedProjects.some((projectID) =>
         projectID.equals(project._id),
      );
      if (alreadyLiked) {
         //Unlike
         await User.updateOne(
            { _id: user._id },
            { $pull: { likedProjects: project._id } },
         );

         await Project.updateOne(
            { _id: project._id },
            { $inc: { likeCounts: -1 } },
         );

         const updatedUser = await User.findById(user._id).lean();
         const updatedProject = await Project.findById(project._id).lean();

         return {
            success: true,
            data: {
               button: false,
               likedProjects: updatedUser?.likedProjects,
               likeCounts: updatedProject?.likeCounts,
            },
         };
      }

      //like
      await User.updateOne(
         { _id: user._id },
         { $addToSet: { likedProjects: project._id } },
      );

      await Project.updateOne(
         { _id: project._id },
         { $inc: { likeCounts: 1 } },
      );

      const updatedUser = await User.findById(user._id).lean();
      const updatedProject = await Project.findById(project._id).lean();

      return {
         success: true,
         data: {
            button: true,
            likedProjects: updatedUser?.likedProjects,
            likeCounts: updatedProject?.likeCounts,
         },
      };
   } catch (error) {
      console.error("Error in likeButton function:", error);
      throw error;
   }
}
