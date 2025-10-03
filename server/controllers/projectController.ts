import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
   findAllProjects,
   findProjectById,
   removeProject,
   updateProject,
   insertProject,
   linkProjectToTeam,
   linkProjectToTeamMembers,
   likeButton,
} from "../services/projectService";
import { UpdateProjectData, ProjectData } from "interfaces";

/**
 * Retrieves all projects from the database
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with projects array or error message
 */
export const getAllProjects = async (
   req: AuthRequest,
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
   req: AuthRequest,
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
   req: AuthRequest,
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
   req: AuthRequest,
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

/**
 * Creates a new project
 * @param req - Express request object containing project data in body and user info
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with created project data or error message
 */
export const createProject = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const projectData: ProjectData = req.body;
      const teamId = projectData.teamId;
      const files = req.files as Express.Multer.File[];
      const result = await insertProject(projectData, files);
      if (!result.success) {
         res.status(400).json({ error: result.error });
         return;
      }
      const projectId = result.data?._id;

      await linkProjectToTeam(projectId, teamId);
      await linkProjectToTeamMembers(projectId, teamId);

      res.status(201).json({
         message: "Project created successfully",
         project: result.data,
      });
   } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * like a project
 * @param req - Express request object containing project id in params and user id in body
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with created project data or error message
 */
export const likeProject = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      //from auth/session
      if (!req.user || !req.user.id) {
         res.status(401).json({ error: "unauthorised" });
         return;
      }
      const userId = req.user.id;
      const projectId = req.params.id;

      const result = await likeButton(userId, projectId);

      if (!result.success) {
         res.status(404).json({ error: result.error });
         return;
      }

      res.status(200).json({
         message: result.data.button
            ? "Successfully liked the project"
            : "Successfully unliked the project",
         data: result.data,
      });
   } catch (error) {
      console.error("Error liking project:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};
