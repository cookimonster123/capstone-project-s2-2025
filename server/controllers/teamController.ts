import type { Request, Response } from "express";
import { Team, User, RegisteredStudent } from "@models";
import { findTeamsPaginated } from "../services/teamService";
import csvParser from "csv-parser";
import { Readable } from "stream";

/**
 * Get all teams
 */
export const getAllTeams = async (
   req: Request,
   res: Response,
): Promise<void> => {
   try {
      const { page, limit, q, sort, order } = req.query as any;

      if (page || limit || q || sort || order) {
         const p = Number(page) || 1;
         const l = Math.min(Math.max(Number(limit) || 20, 1), 200);
         const result = await findTeamsPaginated({
            page: p,
            limit: l,
            q: q as string | undefined,
            sort: (sort as string) || "createdAt",
            order: (order as string) === "asc" ? "asc" : "desc",
         });
         if (!result.success || !result.data) {
            res.status(500).json({
               success: false,
               message: "Failed to fetch teams",
            });
            return;
         }
         const { items, total, totalPages } = result.data;
         res.status(200).json({
            success: true,
            teams: items,
            pagination: {
               total,
               page: p,
               limit: l,
               totalPages,
               hasNext: p < totalPages,
               hasPrev: p > 1,
            },
         });
         return;
      }

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
      // Prefer multipart file upload
      if (!req.file || !req.file.buffer) {
         res.status(400).json({
            success: false,
            message:
               "Missing CSV file. Please upload a .csv file with columns: name,login_id,group_name,canvas_group_id",
         });
         return;
      }

      const rows: Array<{
         name: string;
         login_id: string;
         group_name: string;
         canvas_group_id: string;
      }> = [];

      // Parse CSV using csv-parser
      await new Promise<void>((resolve, reject) => {
         const stream = Readable.from(req.file!.buffer);
         stream
            .pipe(csvParser())
            .on("data", (data) => {
               rows.push({
                  name: String(data.name ?? "").trim(),
                  login_id: String(data.login_id ?? "").trim(),
                  group_name: String(data.group_name ?? "").trim(),
                  canvas_group_id: String(data.canvas_group_id ?? "").trim(),
               });
            })
            .on("end", () => resolve())
            .on("error", (err) => reject(err));
      });

      // Validate and process
      const errors: any[] = [];
      const teamsMap = new Map<string, any>();
      const json_data: Array<{
         teamId: string;
         group_name: string;
         canvas_group_id: string;
      }> = [];

      for (const row of rows) {
         const { name, login_id, group_name, canvas_group_id } = row;
         if (!name || !login_id || !group_name || !canvas_group_id) {
            errors.push({ row, error: "Missing required columns" });
            continue;
         }

         const key = `${group_name}__${canvas_group_id}`;
         if (!teamsMap.has(key)) {
            // find or create team by (name, canvasGroupId)
            const team = await Team.findOneAndUpdate(
               { name: group_name, canvasGroupId: canvas_group_id },
               {
                  $setOnInsert: {
                     name: group_name,
                     canvasGroupId: canvas_group_id,
                  },
               },
               { new: true, upsert: true },
            ).lean();
            teamsMap.set(key, team);
            json_data.push({
               teamId: team._id.toString(),
               group_name,
               canvas_group_id,
            });
         }
      }

      // Prepare students upsert
      const students = rows
         .filter(
            (r) => r.name && r.login_id && r.group_name && r.canvas_group_id,
         )
         .map((r) => {
            const key = `${r.group_name}__${r.canvas_group_id}`;
            const team = teamsMap.get(key);
            const upi = r.login_id.toLowerCase();
            return {
               upi,
               name: r.name,
               teamName: r.group_name,
               email: `${upi}@aucklanduni.ac.nz`,
               team: team?._id,
            };
         });

      if (students.length === 0) {
         res.status(400).json({
            success: false,
            message: "No valid rows found in CSV",
         });
         return;
      }

      // Bulk upsert registered students
      await RegisteredStudent.bulkUpsert(students as any);

      res.status(200).json({
         success: true,
         message: `Processed ${rows.length} rows, created ${teamsMap.size} teams, registered ${students.length} students`,
         json_data,
         errors: errors.length ? errors : undefined,
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
