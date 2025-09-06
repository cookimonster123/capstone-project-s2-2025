import { NextFunction, Response } from "express";
import { User } from "@models";
import { AuthRequest } from "./auth";

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
   } catch (error) {}
};
