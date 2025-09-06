import { Request, Response } from "express";
import {
   findAllProjects,
   findProjectById,
   removeProject,
   updateProject,
} from "../services/projectService";
import { UpdateProjectData } from "interfaces";

/**
 * Retrieves all projects from the database
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with projects array or error message
 */
export const getAllProjects = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const result = await findAllProjects();
      if (result.success) {
         res.status(200).json({ projects: result.data });
      } else {
         res.status(500).json({ error: "Failed to fetch projects" });
      }
   } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Retrieves a specific project by its ID
 * @param req - Express request object containing project ID in params
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with project data or error message
 */
export const getProjectById = async (
   req: Request,
   res: Response,
): Promise<void> => {
   const projectId = req.params.id;
   try {
      const result = await findProjectById(projectId);
      if (!result.success) {
         res.status(404).json({ error: "Project not found" });
         return;
      }
      res.status(200).json({ project: result.data });
   } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Deletes a specific project by its ID
 * @param req - Express request object containing project ID in params
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with success message or error
 */
export const deleteProjectById = async (
   req: Request,
   res: Response,
): Promise<void> => {
   const projectId = req.params.id;
   try {
      const result = await removeProject(projectId);
      if (!result.success) {
         res.status(404).json({ error: "Project not found" });
         return;
      }
      res.status(200).json({ message: "Project deleted successfully" });
   } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Updates a specific project by its ID
 * @param req - Express request object containing project ID in params and update data in body
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with updated project data or error message
 */
export const updateProjectById = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const projectId = req.params.id;
      const updateData: UpdateProjectData = req.body;

      const result = await updateProject(projectId, updateData);
      if (!result.success) {
         if (result.error === "Project not found") {
            res.status(404).json({ error: result.error });
         } else {
            res.status(400).json({ error: result.error });
         }
         return;
      }

      res.status(200).json({ project: result.data });
   } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};
