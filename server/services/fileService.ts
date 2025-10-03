import { ServiceResult } from "../interfaces";
import {
   S3Client,
   PutObjectCommand,
   DeleteObjectCommand,
   ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// connect to S3 bucket
const s3 = new S3Client({
   region: process.env.AWS_REGION || "",
   credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      sessionToken: process.env.AWS_SESSION_TOKEN || "",
   },
});

/**
 * check if the file is image
 * @param file - multer type file to check
 * @returns boolean result
 */
export async function isImageFile(file: Express.Multer.File): Promise<boolean> {
   const ext = file.originalname.split(".").pop()?.toLowerCase();
   const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
   return !!ext && imageExtensions.includes(ext);
}

/**
 * upload project image to S3 bucket
 * @param file - multer type file to upload
 * @returns  string key of the uploaded image in S3
 */
export async function uploadFilesToS3(
   file: Express.Multer.File,
   objectId: string,
   types: "project" | "avatar" | "other",
): Promise<ServiceResult> {
   const resultImage = await isImageFile(file);
   if (resultImage) {
      const bucketName = process.env.AWS_S3_BUCKET_NAME || "";
      if (!bucketName) throw new Error("S3 bucket name is not configured");

      let folder = "";
      switch (types) {
         case "project":
            folder = "projectImages";
            break;
         case "avatar":
            folder = "avatars";
            break;
         default:
            folder = "otherImages";
            break;
      }
      const key = `assets/${folder}/${objectId}/${Date.now()}_${file.originalname}`;

      const command = new PutObjectCommand({
         Bucket: process.env.AWS_S3_BUCKET_NAME || "",
         Key: key,
         Body: file.buffer,
         ContentType: file.mimetype,
         ServerSideEncryption: "AES256",
      });

      await s3.send(command);
      return {
         success: true,
         data: key,
      };
   }

   //TODO: solving other files upload

   return {
      success: false,
      error: "uploadFailed",
   };
}

/**
 * delete project image while project deleted
 * @param imageUrl - string of S3 image file URL
 * @returns Promise<void> resolves when the user is successfully updated
 */
export async function deleteFileFromS3(imageUrl: string): Promise<void> {
   try {
      if (!process.env.AWS_S3_BUCKET_NAME)
         throw new Error("S3 bucket not configured");

      const url = new URL(imageUrl);
      const key = url.pathname.substring(1);

      // Skip deletion if project using default Images
      if (key.startsWith("assets/projectImages/defaultImages/")) {
         console.log("Skipped deletion default images");
         return;
      }
      const command = new DeleteObjectCommand({
         Bucket: process.env.AWS_S3_BUCKET_NAME || "",
         Key: key,
      });

      await s3.send(command);
      console.log(`Deleted ${key} from S3`);
      return;
   } catch (error) {
      console.error("Error deleting S3 file:", error);
      throw error;
   }
}

/**
 * random a stored default image to the project while project uploaded without images
 * @param prefix - the relative path for stored default images in S3 bucket
 * @returns Promise<string> - a random one image URL from S3
 */
export async function randomFileFromS3(prefix: string): Promise<string> {
   const bucket = process.env.AWS_S3_BUCKET_NAME || "";
   const region = process.env.AWS_REGION || "";

   const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
   });

   const response = await s3.send(command);

   if (!response.Contents || response.Contents.length === 0) {
      throw new Error(`No files found in ${prefix}`);
   }

   // Pick a random object
   const randomObj =
      response.Contents[Math.floor(Math.random() * response.Contents.length)];
   if (!randomObj.Key) {
      throw new Error("Random object has no Key");
   }

   return `https://${bucket}.s3.${region}.amazonaws.com/${randomObj.Key}`;
}
