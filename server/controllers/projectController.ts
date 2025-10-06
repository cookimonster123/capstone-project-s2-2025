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
      console.log("Request body:", req.body);
      console.log("Request files:", req.files);
      console.log("Content-Type:", req.get("Content-Type"));

      // Files (may be undefined)
      const files = (req.files as Express.Multer.File[]) || undefined;

      // Detect multipart/form-data (prefer req.is if available)
      const isMultipart =
         typeof req.is === "function"
            ? req.is("multipart/form-data")
            : typeof req.headers["content-type"] === "string" &&
              req.headers["content-type"].includes("multipart/form-data");

      // Helper: only JSON.parse when value is a string (form-data)
      const safeParseArray = <T>(val: unknown): T[] => {
         if (typeof val === "string") {
            try {
               const parsed = JSON.parse(val);
               return Array.isArray(parsed) ? parsed : [];
            } catch (err) {
               console.warn("Failed to parse stringified array:", err);
               return [];
            }
         }
         if (Array.isArray(val)) return val as T[];
         return [];
      };

      // Normalize links/tags regardless of incoming content-type
      const links = safeParseArray<any>(req.body?.links);
      const tags = safeParseArray<string>(req.body?.tags);

      // Normalize category: empty string => undefined
      const category =
         typeof req.body?.category === "string" && req.body.category !== ""
            ? req.body.category
            : undefined;

      // Build ProjectData depending on request type
      let projectData: ProjectData;
      if (isMultipart) {
         // form-data fields are strings (we parsed links/tags above)
         projectData = {
            name: req.body?.name,
            description: req.body?.description || "",
            teamId: req.body?.teamId,
            semester: req.body?.semester,
            category,
            links,
            tags,
            likeCounts: 0,
         } as ProjectData;
      } else {
         // JSON body (Express already parsed it). Merge normalized links/tags to be safe.
         projectData = {
            ...(req.body as Partial<ProjectData>),
            category,
            links: links.length ? links : (req.body?.links ?? []),
            tags: tags.length ? tags : (req.body?.tags ?? []),
            likeCounts: 0,
         } as ProjectData;
      }

      console.log("Parsed project data:", projectData);

      // Insert project (service will validate)
      const teamId = projectData.teamId;
      const result = await insertProject(projectData, files);
      if (!result.success) {
         res.status(400).json({ error: result.error });
         return;
      }
      const projectId = result.data?._id;

      // Link project to team and team members
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
