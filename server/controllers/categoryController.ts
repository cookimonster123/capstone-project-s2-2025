import { Response } from "express";
import { AuthRequest } from "middleware/auth";
import { findAllCategories } from "../services/categoryService";

export const getAllCategories = async (req: AuthRequest, res: Response) => {
   try {
      const result = await findAllCategories();
      if (!result.success) {
         res.status(500).json({
            error: result.error || "Failed to fetch categories",
         });
         return;
      }
      res.status(200).json({ categories: result.data });
   } catch (error) {
      console.error("Error in getAllCategories controller:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};
