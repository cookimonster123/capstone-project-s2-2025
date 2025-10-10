import Router from "express";
import { deleteSemester, createSemester, getSemester } from "@controllers";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();

// Get semesters (optionally filter by ?year=2024&semester=S2&isActive=true) or get by id via /:id
router.get("/", getSemester);
router.get("/:id", getSemester);

// Create new semester (admin/staff only)
router.post(
   "/",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   createSemester,
);

// Delete semester(s) (admin/staff only)
router.delete(
   "/:id",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   deleteSemester,
);
router.delete(
   "/",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   deleteSemester,
);

export default router;
