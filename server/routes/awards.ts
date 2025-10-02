import { Router } from "express";
import {
   getAllAwards,
   getAwardById,
   createNewAward,
   updateAwardById,
   deleteAwardById,
   assignAwardToProjectById,
   removeAwardFromProjectById,
} from "@controllers";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();

router.get("/", getAllAwards);

router.get("/:id", getAwardById);

router.post(
   "/",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   createNewAward,
);

router.put(
   "/:id",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   updateAwardById,
);

router.delete(
   "/:id",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   deleteAwardById,
);

router.post(
   "/assign/project/:projectId/award/:awardId",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   assignAwardToProjectById,
);

router.delete(
   "/remove/project/:projectId/award/:awardId",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   removeAwardFromProjectById,
);

export default router;
