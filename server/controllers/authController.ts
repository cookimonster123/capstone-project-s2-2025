import { Request, Response } from "express";
import {
   loginUser,
   registerUser,
   requestRegistrationMagicLink,
   confirmRegistrationMagicLink,
   emailExists,
   requestPasswordResetLink,
   resetPasswordWithToken,
   checkCapstoneStudent,
   getTeamByEmail,
} from "../services/authService";
import { addUserToTeam } from "../services/teamService";
import { OAuth2Client } from "google-auth-library";
import { User } from "@models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
         sameSite:
            process.env.NODE_ENV === "production" ? ("none" as any) : "strict",
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
 * Request a magic link to complete registration
 */
export const requestMagicLink = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      // Build base URL for link (prefer env; fallback current request)
      const base =
         process.env.SERVER_PUBLIC_URL ||
         `${req.protocol}://${req.get("host")}`;
      const result = await requestRegistrationMagicLink(req.body, base);
      if (!result.success) {
         res.status(400).json(result);
         return;
      }
      res.status(200).json(result);
   } catch (error: any) {
      console.error("requestMagicLink controller error:", error.message);
      res.status(500).json({ error: "Server error" });
   }
};

/**
 * Confirm magic link and sign the user in
 */
export const confirmMagicLink = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const token = (req.query.token as string) || "";
      if (!token) {
         res.status(400).json({ success: false, error: "Missing token" });
         return;
      }

      const result = await confirmRegistrationMagicLink(token);
      // Build a robust client base to redirect back to the frontend:
      // 1) Prefer CLIENT_PUBLIC_URL if provided (should be a full origin)
      // 2) Else, if CLIENT_URL looks like a full origin (http/https), use it
      // 3) Else, in development use Vite dev server (5173 default)
      // 4) Else, fallback to server public URL or current request host
      const explicitClient = (process.env.CLIENT_URL || "").trim();
      const hasScheme = /^https?:\/\//i.test(explicitClient);
      const clientBase = hasScheme
         ? explicitClient
         : process.env.NODE_ENV !== "production"
           ? `http://localhost:${process.env.CLIENT_DEV_PORT || 5173}`
           : (
                process.env.SERVER_PUBLIC_URL ||
                `${req.protocol}://${req.get("host")}`
             ).trim();
      const clientUrl = clientBase.replace(/\/$/, "");
      if (!result.success) {
         // Redirect back with error code for better UX
         const reason = encodeURIComponent(result.error || "invalid");
         res.redirect(`${clientUrl}/register?verifyError=${reason}`);
         return;
      }

      // Set cookie and redirect to client with success flag
      res.cookie("token", result.data?.token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite:
            process.env.NODE_ENV === "production" ? ("none" as any) : "strict",
         maxAge: 60 * 60 * 1000,
      });

      res.redirect(`${clientUrl}/register?verified=1`);
   } catch (error: any) {
      console.error("confirmMagicLink controller error:", error.message);
      res.status(500).json({ error: "Server error" });
   }
};

/**
 * Public endpoint to check if an email exists
 */
export const checkEmail = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const email =
         (req.query.email as string) || (req.body?.email as string) || "";
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
         res.status(400).json({ success: false, error: "Invalid email" });
         return;
      }
      const exists = await emailExists(email);
      res.status(200).json({ success: true, data: { exists } });
   } catch (error: any) {
      console.error("checkEmail controller error:", error.message);
      res.status(500).json({ success: false, error: "Server error" });
   }
};

/**
 * Request a password reset magic link
 */
export const requestPasswordReset = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const { email } = req.body as { email: string };
      // Build a robust public client base:
      // 1) If CLIENT_PUBLIC_URL (full origin) is set, use it
      // 2) Else, if CLIENT_URL is a full origin (starts with http), use it
      // 3) Else, in development use Vite dev server (5173 by default)
      // 4) Else, fall back to server public URL or current request host
      const explicitClient = (process.env.CLIENT_URL || "").trim();
      const hasScheme = /^https?:\/\//i.test(explicitClient);
      const clientBase = hasScheme
         ? explicitClient
         : process.env.NODE_ENV !== "production"
           ? `http://localhost:${process.env.CLIENT_DEV_PORT || 5173}`
           : (
                process.env.SERVER_PUBLIC_URL ||
                `${req.protocol}://${req.get("host")}`
             ).trim();
      const result = await requestPasswordResetLink(email, clientBase);
      if (!result.success) {
         res.status(400).json(result);
         return;
      }
      res.status(200).json(result);
   } catch (error: any) {
      console.error("requestPasswordReset controller error:", error.message);
      res.status(500).json({ success: false, error: "Server error" });
   }
};

/**
 * Reset password via token
 */
export const resetPassword = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const { token, password } = req.body as {
         token: string;
         password: string;
      };
      const result = await resetPasswordWithToken(token, password);
      if (!result.success) {
         res.status(400).json(result);
         return;
      }
      res.status(200).json(result);
   } catch (error: any) {
      console.error("resetPassword controller error:", error.message);
      res.status(500).json({ success: false, error: "Server error" });
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
         sameSite:
            process.env.NODE_ENV === "production" ? ("none" as any) : "strict",
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
         sameSite:
            process.env.NODE_ENV === "production" ? ("none" as any) : "strict",
      });

      res.status(200).json({ message: "Logout successful" });
   } catch (error: any) {
      console.error("Logout controller error:", error.message);
      res.status(500).json({ error: "Server error" });
   }
};

/**
 * Google OAuth login: accepts a Google ID token (credential) and logs the user in.
 * Expects req.body.credential (JWT from Google Identity Services)
 */
export const loginWithGoogle = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const { credential } = req.body as { credential?: string };
      if (!credential) {
         res.status(400).json({ success: false, error: "Missing credential" });
         return;
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
         console.error("GOOGLE_CLIENT_ID not configured");
         res.status(500).json({ success: false, error: "Server config error" });
         return;
      }

      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
         idToken: credential,
         audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
         res.status(401).json({
            success: false,
            error: "Invalid Google token",
         });
         return;
      }

      const email = payload.email.toLowerCase();
      const name = payload.name || email.split("@")[0];

      // Find or create user
      let user = await User.findOne({ email }).select(
         "_id email role name profilePicture password team",
      );
      if (!user) {
         const randomPassword =
            bcrypt.genSaltSync(10) + ":" + Math.random().toString(36).slice(2);
         const hashed = await bcrypt.hash(randomPassword, 10);
         user = await User.create({
            name: name.slice(0, 30),
            email,
            password: hashed,
            role: "visitor",
            profilePicture: payload.picture || "",
         });
      }
      if (!user) {
         // Extremely unlikely, but guard for TypeScript and runtime safety
         res.status(500).json({
            success: false,
            error: "Unable to retrieve or create user",
         });
         return;
      }

      // If they're a registered capstone student, promote role and link team
      try {
         const isCapstone = await checkCapstoneStudent(email);
         if (isCapstone) {
            const teamObjectId = await getTeamByEmail(email);
            const updates: any = {};
            if (user.role !== "capstoneStudent")
               updates.role = "capstoneStudent";
            if (
               teamObjectId &&
               (!user.team || user.team.toString() !== teamObjectId.toString())
            ) {
               updates.team = teamObjectId;
            }
            if (Object.keys(updates).length) {
               const updated = await User.findByIdAndUpdate(user._id, updates, {
                  new: true,
               }).select("_id email role name profilePicture team");
               if (updated) user = updated;
            }
            if (teamObjectId) {
               await addUserToTeam(
                  user._id.toString(),
                  teamObjectId.toString(),
               );
            }
         }
      } catch (e) {
         // Non-fatal; proceed with login as visitor/staff/admin
         console.warn(
            "Google login: capstone check/link skipped:",
            (e as any)?.message || e,
         );
      }

      // Update last login timestamp (non-blocking)
      try {
         await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      } catch {}

      // Issue our JWT and set cookie (mirror normal login behavior)
      if (!process.env.JWT_SECRET) {
         console.error("JWT_SECRET is not defined");
         res.status(500).json({
            success: false,
            error: "Server configuration error",
         });
         return;
      }
      const token = jwt.sign(
         {
            user: {
               id: user._id.toString(),
               email: user.email,
               role: user.role,
               name: user.name,
            },
         },
         process.env.JWT_SECRET,
         { expiresIn: "1h" },
      );

      res.cookie("token", token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite:
            process.env.NODE_ENV === "production" ? ("none" as any) : "strict",
         maxAge: 60 * 60 * 1000,
      });

      res.status(200).json({
         success: true,
         data: {
            user: {
               id: user._id.toString(),
               email: user.email,
               role: user.role,
               name: user.name,
               profilePicture: user.profilePicture,
            },
         },
      });
   } catch (error: any) {
      console.error("Google login error:", error?.message || error);
      res.status(401).json({
         success: false,
         error: "Google authentication failed",
      });
   }
};
