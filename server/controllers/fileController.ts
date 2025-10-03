import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "@models";
import { uploadFilesToS3, deleteFileFromS3 } from "../services/fileService";

/**
 * user upload/replace an image as the Avatar
 * @param req - Express request object containing logged in user id and image file
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with successful upload or error message
 */
export async function uploadAvatar(
   req: AuthRequest,
   res: Response,
): Promise<void> {
   try {
      const file = req.file;
      if (!file) {
         res.status(400).json({
            success: false,
            error: "No file uploaded",
         });
         return;
      }

      const userId = req.user?.id;
      if (!userId) {
         res.status(401).json({
            success: false,
            error: "Unauthorized",
         });
         return;
      }
      const user = await User.findById(userId);
      if (!user) {
         res.status(404).json({
            success: false,
            error: "User not found",
         });
         return;
      }

      //Delete old avatar if exists (optional)
      if (user.profilePicture) {
         await deleteFileFromS3(user.profilePicture);
      }
      const result = await uploadFilesToS3(file, userId, "avatar");
      if (!result.success) {
         res.status(500).json({
            success: false,
            error: result.error,
         });
         return;
      }

      const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${result.data}`;
      user.profilePicture = url;
      await user.save();

      res.status(200).json({
         success: true,
         key: result.data,
         url,
      });
   } catch (error) {
      console.error("Error upload avatar:", error);
      res.status(500).json({ error: "Internal server error" });
   }
}

/**
 * user delete the avatar (they do not want use any image anymore)
 * @param req - Express request object containing logged in user id
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with successful upload or error message
 */
export async function removeSelfAvatar(
   req: AuthRequest,
   res: Response,
): Promise<void> {
   try {
      const userId = req.user?.id;
      if (!userId) {
         res.status(401).json({
            success: false,
            error: "Unauthorized",
         });
         return;
      }

      const user = await User.findById(userId);

      if (!user) {
         res.status(404).json({
            success: false,
            error: "User not found",
         });
         return;
      }

      if (user.profilePicture) {
         await deleteFileFromS3(user.profilePicture);
      }
      user.profilePicture = "";
      await user.save();

      res.status(200).json({
         success: true,
         message: "Your Avatar is removed successfully",
      });
   } catch (error) {
      console.error("Error remove avatar:", error);
      res.status(500).json({ error: "Internal server error" });
   }
}
