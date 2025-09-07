import Router from "express";
import {
   getAllProjects,
   getProjectById,
   deleteProjectById,
   updateProjectById,
   createProject,
} from "@controllers";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { requireTeamOwnership } from "../middleware/projects";

const router = Router();

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.delete(
   "/:id",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   deleteProjectById,
);

router.put(
   "/:id",
   authenticateToken,
   authorizeRoles(["admin", "staff", "capstoneStudent"]),
   requireTeamOwnership,
   updateProjectById,
);

router.post(
   "/",
   authenticateToken,
   authorizeRoles(["admin", "staff", "capstoneStudent"]),
   createProject,
);

export default router;
