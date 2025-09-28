import { Router } from "express";
import {
   getAllComments,
   getCommentsByProject,
   getCommentById,
   getCommentsByUser,
   createNewComment,
   updateCommentContent,
   deleteCommentById,
} from "@controllers";
import { authenticateToken } from "../middleware/auth";
import { canDeleteComment, canUpdateComment } from "../middleware/users";
import { commentLimiter } from "../middleware/rateLimiter";

const router = Router();

/**
 * Public routes
 */
router.get("/", getAllComments);

router.get("/project/:projectId", getCommentsByProject);

router.get("/:id", getCommentById);

router.get("/user/:userId", getCommentsByUser);

/**
 * Protected routes
 */
router.post("/", authenticateToken, commentLimiter, createNewComment);

/**
 * Author
 * update their own comment content
 */
router.put("/:id", authenticateToken, canUpdateComment, updateCommentContent);

/**
 * Author can delete their own comment
 * Admin/Staff can delete any comment
 */
router.delete("/:id", authenticateToken, canDeleteComment, deleteCommentById);

export default router;
