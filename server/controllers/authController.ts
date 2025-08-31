import { Request, Response } from "express";
import { registerUser } from "../services/authService";

/**
 * Controller for user registration
 * @param req - Express request object containing user registration data
 * @param res - Express response object
 * @returns Promise<void>
 */
export const register = async (req: Request, res: Response): Promise<void> => {
   try {
      const result = await registerUser(req.body);

      if (!result.success) {
         res.status(400).json({ error: result.error });
         return;
      }

      res.status(201).json({ token: result.data?.token });
   } catch (error: any) {
      console.error("Registration controller error:", error.message);
      res.status(500).json({ error: "Server error" });
   }
};
