import { Router } from "express";
import {
   getAllTeams,
   getTeamById,
   createTeam,
   uploadTeamsCSV,
   deleteTeam,
} from "@controllers/teamController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();

/**
 * @route   GET /api/teams
 * @desc    Get all teams
 * @access  Private (staff, admin)
 */
router.get(
   "/",
   authenticateToken,
   authorizeRoles(["staff", "admin"]),
   getAllTeams,
);

/**
 * @route   GET /api/teams/:id
 * @desc    Get team by ID
 * @access  Private (staff, admin)
 */
router.get(
   "/:id",
   authenticateToken,
   authorizeRoles(["staff", "admin"]),
   getTeamById,
);

/**
 * @route   POST /api/teams
 * @desc    Create a new team
 * @access  Private (staff, admin)
 */
router.post(
   "/",
   authenticateToken,
   authorizeRoles(["staff", "admin"]),
   createTeam,
);

/**
 * @route   POST /api/teams/upload-csv
 * @desc    Upload teams from CSV
 * @access  Private (admin, staff)
 */
router.post(
   "/upload-csv",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   uploadTeamsCSV,
);

/**
 * @route   DELETE /api/teams/:id
 * @desc    Delete a team
 * @access  Private (admin, staff)
 */
router.delete(
   "/:id",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   deleteTeam,
);

export default router;
