import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Extended Request interface to include user information
 */
export interface AuthRequest extends Request {
   user?: {
      id: string;
      email: string;
      role: string;
   };
}

/**
 * Middleware to authenticate user using JWT token from HttpOnly cookie
 * @param req - Express request object with potential user data
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 */
export const authenticateToken = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
): Promise<void> => {
   try {
      // Get token from HttpOnly cookie
      const token = req.cookies?.token;

      if (!token) {
         res.status(401).json({ error: "Access denied. No token provided." });
         return;
      }

      if (!process.env.JWT_SECRET) {
         console.error("JWT_SECRET is not defined");
         res.status(500).json({ error: "Server configuration error" });
         return;
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

      if (!decoded.user) {
         res.status(401).json({ error: "Invalid token format" });
         return;
      }

      // Add user info to request object
      req.user = {
         id: decoded.user.id,
         email: decoded.user.email,
         role: decoded.user.role,
      };

      next();
   } catch (error) {
      console.error("Token verification error:", error);

      if (error instanceof jwt.JsonWebTokenError) {
         res.status(401).json({ error: "Invalid token" });
      } else if (error instanceof jwt.TokenExpiredError) {
         res.status(401).json({ error: "Token expired" });
      } else {
         res.status(500).json({ error: "Server error" });
      }
   }
};

/**
 * Middleware to authorize user based on roles
 * @param roles - Array of allowed roles
 * @returns Express middleware function
 */
export const authorizeRoles = (roles: string[]) => {
   return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
         res.status(401).json({ error: "Authentication required" });
         return;
      }

      if (!roles.includes(req.user.role)) {
         res.status(403).json({
            error: "Access denied. Insufficient permissions.",
         });
         return;
      }

      next();
   };
};
