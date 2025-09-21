import Router from "express";
import {
   getAllProjects,
   getProjectById,
   deleteProjectById,
   updateProjectById,
   createProject,
   deleteTagFromProject,
   setTagToProject,
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

router.post(
   "/:id/tags",
   authenticateToken,
   authorizeRoles(["admin", "staff", "capstoneStudent"]),
   requireTeamOwnership,
   setTagToProject,
);

router.delete(
   "/:id/tags",
   authenticateToken,
   authorizeRoles(["admin", "staff", "capstoneStudent"]),
   requireTeamOwnership,
   deleteTagFromProject,
);

export default router;
