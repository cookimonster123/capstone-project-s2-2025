import Router from "express";
import { getAllTags, getTagByName, deleteTagByName } from "@controllers";
import { authenticateToken, authorizeRoles } from "middleware/auth";

const router = Router();

router.get("/", getAllTags);

router.get("/:tagName", getTagByName);

router.delete(
   "/",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   deleteTagByName,
);

export default router;
