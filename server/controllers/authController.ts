import { Request, Response } from "express";
import { loginUser, registerUser } from "../services/authService";
import { LoginUserData } from "../interfaces";

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
         res.status(400).json(result);
         return;
      }

      // Set cookie with JWT token
      res.cookie("token", result.data?.token, {
         httpOnly: true, // Prevents XSS attacks
         secure: process.env.NODE_ENV === "production", // HTTPS only in production
         sameSite: "strict", // CSRF protection
         maxAge: 60 * 60 * 1000, // 1 hour (matches JWT expiration)
      });

      res.status(201).json({
         success: true,
         data: {
            user: result.data?.user,
         },
      });
   } catch (error: any) {
      console.error("Registration controller error:", error.message);
      res.status(500).json({ error: "Server error" });
   }
};

/**
 * Controller for user login
 * @param req - Express request object containing user login credentials
 * @param res - Express response object
 * @returns Promise<void>
 */
export const login = async (req: Request, res: Response): Promise<void> => {
   try {
      const { email, password }: LoginUserData = req.body;

      // Call service layer for authentication
      const result = await loginUser({ email, password });

      if (!result.success) {
         if (
            // 400: validation errors
            result.error?.includes("email") ||
            result.error?.includes("password") ||
            result.error?.includes("required")
         ) {
            res.status(400).json({
               success: false,
               error: result.error,
            });
            return;
         } else {
            // 401: authentication errors
            res.status(401).json({
               success: false,
               error: result.error,
            });
            return;
         }
      }

      // Set JWT token in HttpOnly cookie
      res.cookie("token", result.data?.token, {
         httpOnly: true, // Prevents XSS attacks
         secure: process.env.NODE_ENV === "production", // HTTPS only in production
         sameSite: "strict", // CSRF protection
         maxAge: 60 * 60 * 1000, // 1 hour (matches JWT expiration)
      });

      // Return user data without token (token is in cookie)
      res.status(200).json({
         success: true,
         data: {
            user: result.data?.user,
         },
      });
   } catch (error: any) {
      console.error("Login controller error:", error.message);
      res.status(500).json({ error: "Server error" });
   }
};

/**
 * Controller for user logout
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise<void>
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
   try {
      // Clear the HttpOnly cookie
      res.clearCookie("token", {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "strict",
      });

      res.status(200).json({ message: "Logout successful" });
   } catch (error: any) {
      console.error("Logout controller error:", error.message);
      res.status(500).json({ error: "Server error" });
   }
};
