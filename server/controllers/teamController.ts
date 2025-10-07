import type { Request, Response } from "express";
import { Team, User } from "@models";

/**
 * Get all teams
 */
export const getAllTeams = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const teams = await Team.find()
         .populate("members", "name email")
         .populate("project", "name");

      res.status(200).json({
         success: true,
         teams,
      });
   } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({
         success: false,
         message: "Failed to fetch teams",
      });
   }
};

/**
 * Get team by ID
 */
export const getTeamById = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const { id } = req.params;
      const team = await Team.findById(id)
         .populate("members", "name email")
         .populate("project", "name");

      if (!team) {
         res.status(404).json({
            success: false,
            message: "Team not found",
         });
         return;
      }

      res.status(200).json({
         success: true,
         team,
      });
   } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({
         success: false,
         message: "Failed to fetch team",
      });
   }
};

// create a new team with empty members and no project
export const createTeam = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const { name } = req.body;

      if (!name || String(name).trim() === "") {
         res.status(400).json({
            success: false,
            message: "Team name is required",
         });
         return;
      }

      // Create team with empty members and no project.
      // Members will be assigned later via the user management flows.
      const team = await Team.create({
         name: String(name).trim(),
         members: [],
         project: null,
      });

      // Return an explicit, consistent shape without an extra DB query
      const teamObj = team.toObject();

      res.status(201).json({
         success: true,
         team: teamObj,
      });
   } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({
         success: false,
         message: "Failed to create team",
      });
   }
};

/**
 * Upload teams from CSV
 * CSV format: teamName, member1Email, member2Email, member3Email...
 */
export const uploadTeamsCSV = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const { teams: teamsData } = req.body;

      if (!teamsData || !Array.isArray(teamsData)) {
         res.status(400).json({
            success: false,
            message: "Invalid CSV data format",
         });
         return;
      }

      const createdTeams = [];
      const errors = [];

      for (const teamData of teamsData) {
         try {
            const { name, memberEmails } = teamData;

            if (!name) {
               errors.push({ row: teamData, error: "Team name is required" });
               continue;
            }

            // Find users by email
            const members = [];
            if (memberEmails && Array.isArray(memberEmails)) {
               for (const email of memberEmails) {
                  const user = await User.findOne({ email: email.trim() });
                  if (user) {
                     members.push(user._id);
                  } else {
                     errors.push({
                        row: teamData,
                        error: `User not found: ${email}`,
                     });
                  }
               }
            }

            // Create team
            const team = await Team.create({
               name: name.trim(),
               members,
            });

            // Update users' team field
            await User.updateMany(
               { _id: { $in: members } },
               { $set: { team: team._id } },
            );

            createdTeams.push(team);
         } catch (error) {
            errors.push({
               row: teamData,
               error: error instanceof Error ? error.message : "Unknown error",
            });
         }
      }

      res.status(200).json({
         success: true,
         message: `Created ${createdTeams.length} teams`,
         createdTeams,
         errors: errors.length > 0 ? errors : undefined,
      });
   } catch (error) {
      console.error("Error uploading teams CSV:", error);
      res.status(500).json({
         success: false,
         message: "Failed to upload teams CSV",
      });
   }
};

/**
 * Delete a team
 */
export const deleteTeam = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const { id } = req.params;

      const team = await Team.findById(id);
      if (!team) {
         res.status(404).json({
            success: false,
            message: "Team not found",
         });
         return;
      }

      // Remove team reference from users
      await User.updateMany({ team: id }, { $set: { team: null } });

      await Team.findByIdAndDelete(id);

      res.status(200).json({
         success: true,
         message: "Team deleted successfully",
      });
   } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({
         success: false,
         message: "Failed to delete team",
      });
   }
};
