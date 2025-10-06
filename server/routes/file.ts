import { Router } from "express";
import multer from "multer";
import {
   uploadAvatar,
   removeSelfAvatar,
   uploadProjectImages,
} from "@controllers";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();
const uploadAvatarSize = multer({
   limits: { fileSize: 3 * 1024 * 1024 }, //3MB limit
});
const uploadProjectImageSize = multer({
   limits: { fileSize: 5 * 1024 * 1024 }, //5MB limit per image
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

//upload project images (max 5 images)
router.post(
   "/upload/project-images",
   authenticateToken,
   uploadProjectImageSize.array("images", 5),
   uploadProjectImages,
);

export default router;
