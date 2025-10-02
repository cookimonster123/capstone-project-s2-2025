import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
   findAllAwards,
   findAwardById,
   createAward,
   updateAward,
   deleteAward,
   assignAwardToProject,
   deleteAwardFromProject,
} from "../services/awardService";

/**
 * Get all awards
 */
export const getAllAwards = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const result = await findAllAwards();

      if (!result.success) {
         res.status(500).json({ error: result.error });
         return;
      }

      res.status(200).json({ awards: result.data });
   } catch (error) {
      console.error("Error in getAllAwards:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Get award by ID
 */
export const getAwardById = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const { id } = req.params;
      const result = await findAwardById(id);

      if (!result.success) {
         res.status(404).json({ error: result.error });
         return;
      }

      res.status(200).json({ award: result.data });
   } catch (error) {
      console.error("Error in getAwardById:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Create a new award (staff/admin only)
 */
export const createNewAward = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const result = await createAward(req.body);

      if (!result.success) {
         res.status(400).json({ error: result.error });
         return;
      }

      res.status(201).json({
         message: "Award created successfully",
         award: result.data,
      });
   } catch (error) {
      console.error("Error in createNewAward:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Update an award (staff/admin only)
 */
export const updateAwardById = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const { id } = req.params;
      const result = await updateAward(id, req.body);

      if (!result.success) {
         const statusCode = result.error === "Award not found" ? 404 : 400;
         res.status(statusCode).json({ error: result.error });
         return;
      }

      res.status(200).json({
         message: "Award updated successfully",
         award: result.data,
      });
   } catch (error) {
      console.error("Error in updateAwardById:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Delete an award (staff/admin only)
 */
export const deleteAwardById = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const { id } = req.params;
      const result = await deleteAward(id);

      if (!result.success) {
         res.status(404).json({ error: result.error });
         return;
      }

      res.status(200).json({
         message: "Award deleted successfully",
         award: result.data,
      });
   } catch (error) {
      console.error("Error in deleteAwardById:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Assign award to project (staff/admin only)
 */
export const assignAwardToProjectById = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const { awardId, projectId } = req.params;

      const result = await assignAwardToProject(awardId, projectId);

      if (!result.success) {
         const statusCode =
            result.error === "Project not found or failed to assign award"
               ? 404
               : 400;
         res.status(statusCode).json({ error: result.error });
         return;
      }

      res.status(200).json({ message: "Award assigned", data: result.data });
   } catch (error) {
      console.error("Error in assignAwardToProjectById:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

/**
 * Remove award from project (staff/admin only)
 */
export const removeAwardFromProjectById = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const { awardId, projectId } = req.params;

      const result = await deleteAwardFromProject(awardId, projectId);

      if (!result.success) {
         const statusCode =
            result.error === "Project not found or failed to remove award"
               ? 404
               : 400;
         res.status(statusCode).json({ error: result.error });
         return;
      }

      res.status(200).json({ message: result.message });
   } catch (error) {
      console.error("Error in removeAwardFromProjectById:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};
