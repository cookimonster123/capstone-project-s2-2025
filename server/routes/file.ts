import { Router } from "express";
import multer from "multer";
import { uploadAvatar, removeSelfAvatar } from "@controllers";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();
const uploadAvatarSize = multer({
   limits: { fileSize: 2 * 1024 * 1024 }, //2MB limit
});

//user upload/update own avatar
router.post(
   "/upload/avatar",
   authenticateToken,
   uploadAvatarSize.single("image"),
   uploadAvatar,
);

//user remove own avatar
router.delete("/avatar", authenticateToken, removeSelfAvatar);

export default router;
