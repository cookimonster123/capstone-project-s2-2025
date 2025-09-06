import Joi from "joi";
import { Project } from "@models";
import {
   ServiceResult,
   ValidationResult,
   ProjectData,
   UpdateProjectData,
} from "../interfaces";

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
      teamname: Joi.string().allow(""),
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
      teamname: Joi.string().allow("").optional(),
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

      // Create new project
      const project = new Project(projectData);
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
