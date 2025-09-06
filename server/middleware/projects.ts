import { NextFunction, Response } from "express";
import { User } from "@models";
import { AuthRequest } from "./auth";

/**
 * Middleware to verify that a user has permission to access/modify a project.
 *
 * Authorization rules:
 * - Admin and staff users have full access to all projects
 * - Capstone students can only access projects assigned to their team
 * - Visitors have no project modification access
 *
 * @param req - Express request object with authenticated user data
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 *
 * @throws {401} When user is not authenticated
 * @throws {403} When user doesn't have permission to access the project
 * @throws {500} When database query fails or other server error occurs
 */
export const requireTeamOwnership = async (
   req: AuthRequest,
   res: Response,
   next: NextFunction,
) => {
   try {
      const projectId = req.params.id;
      const userId = req.user?.id;

      // Find the user's role
      const userRole = req.user?.role;
      if (userRole === "admin" || userRole === "staff") {
         // Admins and staff have full access
         next();
         return;
      }

      // Find the user's team
      const userTeam = (await User.findById(userId)
         .select("team")
         .populate("team")) as any; //TODO: define a proper type

      if (!userTeam) {
         res.status(403).json({ error: "User is not assigned to a team" });
         return;
      }

      // Find the team's project
      const teamProjectId = userTeam?.team?.project;

      // Compare projectId with the user's team projectId
      if (teamProjectId?.toString() !== projectId) {
         res.status(403).json({
            error: "User does not have permission to modify this project",
         });
         return;
      }

      next();
   } catch (error) {
      console.error("Error in requireTeamOwnership middleware:", error);
      res.status(500).json({
         error: "Internal server error while verifying project permissions",
      });
      return;
   }
};
