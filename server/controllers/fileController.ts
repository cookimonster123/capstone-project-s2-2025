import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { User, Project } from "@models";
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

      /** Check if AWS credentials are configured
      if (
         !process.env.AWS_ACCESS_KEY_ID ||
         !process.env.AWS_SECRET_ACCESS_KEY
      ) {
         console.log(
            "AWS credentials not configured, skipping avatar upload to S3",
         );
         res.status(200).json({
            success: true,
            message: "AWS S3 not configured. Avatar upload skipped.",
         });
         return;
      }
      */

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
      /** Check if AWS credentials are configured 
      if (user.profilePicture) {
         // Check if AWS credentials are configured
         if (
            process.env.AWS_ACCESS_KEY_ID &&
            process.env.AWS_SECRET_ACCESS_KEY
         ) {
            await deleteFileFromS3(user.profilePicture);
         } else {
            console.log("AWS credentials not configured, skipping S3 deletion");
         }
      }
      */

      // Delete avatar URL from user profile
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

/**
 * Upload project images (max 5 images)
 * @param req - Express request object containing logged in user id and image files
 * @param res - Express response object
 * @returns Promise<void> - Sends JSON response with successful upload or error message
 */
export async function uploadProjectImages(
   req: AuthRequest,
   res: Response,
): Promise<void> {
   try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
         res.status(400).json({
            success: false,
            error: "No files uploaded",
         });
         return;
      }

      if (files.length > 5) {
         res.status(400).json({
            success: false,
            error: "Maximum 5 images allowed",
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

      const projectId = req.body.projectId;
      if (!projectId) {
         res.status(400).json({
            success: false,
            error: "Project ID is required",
         });
         return;
      }

      const project = await Project.findById(projectId);
      if (!project) {
         res.status(404).json({
            success: false,
            error: "Project not found",
         });
         return;
      }

      // Delete old images if they exist
      if (project.imageUrl && project.imageUrl.length > 0) {
         for (const url of project.imageUrl) {
            await deleteFileFromS3(url);
         }
      }

      // Upload new images
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
         const file = files[i];
         const result = await uploadFilesToS3(
            file,
            `${projectId}-${i}`,
            "project",
         );
         if (!result.success) {
            res.status(500).json({
               success: false,
               error: result.error,
            });
            return;
         }

         const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${result.data}`;
         uploadedUrls.push(url);
      }

      project.imageUrl = uploadedUrls;
      await project.save();

      res.status(200).json({
         success: true,
         urls: uploadedUrls,
      });
   } catch (error) {
      console.error("Error uploading project images:", error);
      res.status(500).json({ error: "Internal server error" });
   }
}
