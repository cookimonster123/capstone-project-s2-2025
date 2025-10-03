import Router from "express";
import {
   getAllProjects,
   getProjectById,
   deleteProjectById,
   updateProjectById,
   createProject,
   likeProject,
   deleteTagFromProject,
   setTagToProject,
} from "@controllers";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { requireTeamOwnership } from "../middleware/projects";
import multer from "multer";

const uploadImageSize = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); //5MB max
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
   uploadImageSize.array("image", 5),
   createProject,
);

router.post("/:id/like", authenticateToken, likeProject);

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
