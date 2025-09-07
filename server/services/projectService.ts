import Joi from "joi";
import { Project, Team, User } from "@models";
import {
   ServiceResult,
   ValidationResult,
   ProjectData,
   UpdateProjectData,
} from "../interfaces";
import mongoose from "mongoose";

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
      const { teamId: _, ...projectFields } = projectData;
      const project = new Project({
         ...projectFields,
         team: teamId, // Map teamId to team field required by the schema
      });
      await project.save();

      return {
         success: true,
         data: project,
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
         .populate("semester")
         .populate("category");

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
         .populate("semester")
         .populate("category");

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
      const project = await Project.findByIdAndDelete(projectId);

      if (!project) {
         return {
            success: false,
            error: "Project not found",
         };
      }

      return {
         success: true,
         data: { message: "Project deleted successfully" },
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
