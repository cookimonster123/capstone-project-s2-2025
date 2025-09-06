import Router from "express";
import {
   getAllProjects,
   getProjectById,
   deleteProjectById,
} from "@controllers";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.delete(
   "/:id",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   deleteProjectById,
);

export default router;
