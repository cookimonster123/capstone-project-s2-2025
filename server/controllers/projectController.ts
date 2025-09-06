import { Request, Response } from "express";
import { findAllProjects, findProjectById } from "../services/projectService";

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
