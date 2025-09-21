import { Response } from "express";
import { AuthRequest } from "middleware/auth";
import {
   findAllTags,
   findTagByName,
   addTagToProject,
   removeTag,
   removeTagFromProject,
} from "../services/tagService";

/**
 * Retrieves all tags from the database
 * @param req Express request object
 * @param res Express response object
 * @returns Promise<void> - Sends JSON response with tags array or error message
 */
export const getAllTags = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const result = await findAllTags();
      if (result.success) {
         res.status(200).json({ tags: result.data });
      } else {
         res.status(500).json({ error: "Failed to fetch tags" });
      }
   } catch (error) {
      console.error("Error fetching tags controller: ", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Retrieves a specific tag by its name
 * @param req Express request object containing tag name in body
 * @param res Express response object
 * @returns Promise<void> - Sends JSON response with tag data or error message
 */
export const getTagByName = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   const { tagName } = req.params;
   try {
      const result = await findTagByName(tagName);
      if (!result.success) {
         res.status(404).json({ error: result.error });
         return;
      }
      res.status(200).json({ tag: result.data });
   } catch (error) {
      console.error("Error fetching tag by its name controller: ", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Delete a specific tag by its name
 * @param req Express request object containing tag name in body
 * @param res Express response object
 * @returns Promise<void> - Sends JSON response with success deletion message or error
 */
export const deleteTagByName = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   const { tagName } = req.body;
   try {
      const result = await removeTag(tagName);
      if (!result.success) {
         res.status(404).json({ error: result.error });
         return;
      }
      res.status(200).json({ message: "Tag deleted successfully" });
   } catch (error) {
      console.error("Error deleting tag controller:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * add tag to the project and create a new tag if there is no tag in the tags array
 * @param req Express request object containing tag name in body and projectId in params
 * @param res Express response object
 * @returns Promise<void> - Sends JSON response with bound tag data or error
 */
export const setTagToProject = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const id = req.params?.id;
      const { tagName } = req.body;

      if (!tagName || !id) {
         res.status(400).json({ error: "tagName and projectId are required" });
         return;
      }

      const result = await addTagToProject(tagName, id);

      if (!result.success) {
         switch (result.error) {
            case "MAX_TAGS_REACHED":
               res.status(400).json({
                  error: "Only can add at most 5 tags to the project",
               });
               break;
            case "TAG_ALREADY_BOUND":
               res.status(400).json({
                  error: "Tag is already bound to this project",
               });
               break;
            case "PROJECT_NOT_FOUND":
               res.status(404).json({ error: "Project not found" });
               break;
            default:
               res.status(500).json({ error: result.error });
         }
         return;
      }

      res.status(200).json({ data: result.data });
   } catch (error) {
      console.error("Error in set tag to the project controller: ", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * remove tag from the binding project
 * @param req Express request object containing tag name in body and projectId in params
 * @param res Express response object
 * @returns Promise<void> - Sends JSON response with success remove message or error
 */
export const deleteTagFromProject = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const id = req.params?.id;
      const { tagName } = req.body;
      const result = await removeTagFromProject(tagName, id);

      if (!result.success) {
         switch (result.error) {
            case "TAG_NOT_FOUND":
            case "PROJECT_NOT_FOUND":
               res.status(404).json({ error: result.error });
               return;
            case "TAG_NOT_BOUND":
               res.status(400).json({ error: result.error });
               return;
            default:
               res.status(500).json({ error: "Unknown error" });
               return;
         }
      }

      res.status(200).json({
         message: "Tag is removed from the project successfully",
      });
   } catch (error) {
      console.error("Error removing tag from the project controller: ", error);
      res.status(500).json({ error: "Internal server error" });
   }
};
