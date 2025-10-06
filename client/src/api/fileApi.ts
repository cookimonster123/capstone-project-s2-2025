import { BASE_API_URL } from "../config/api";

/**
 * Upload project images (max 5 images)
 * @param projectId - The project ID
 * @param files - Array of image files (max 5)
 * @returns Promise with uploaded image URLs
 */
export const uploadProjectImages = async (
   projectId: string,
   files: File[],
): Promise<{ success: boolean; urls?: string[]; error?: string }> => {
   try {
      if (files.length > 5) {
         return {
            success: false,
            error: "Maximum 5 images allowed",
         };
      }

      const formData = new FormData();
      formData.append("projectId", projectId);

      files.forEach((file) => {
         formData.append("images", file);
      });

      const response = await fetch(
         `${BASE_API_URL}/files/upload/project-images`,
         {
            method: "POST",
            credentials: "include",
            body: formData,
         },
      );

      if (!response.ok) {
         const errorData = await response.json();
         return {
            success: false,
            error: errorData.error || "Failed to upload images",
         };
      }

      const data = await response.json();
      return {
         success: true,
         urls: data.urls,
      };
   } catch (error) {
      console.error("Error uploading project images:", error);
      return {
         success: false,
         error:
            error instanceof Error ? error.message : "Failed to upload images",
      };
   }
};

/**
 * Upload user avatar
 * @param file - The avatar image file
 * @returns Promise with uploaded avatar URL
 */
export const uploadAvatar = async (
   file: File,
): Promise<{ success: boolean; url?: string; error?: string }> => {
   try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${BASE_API_URL}/files/upload/avatar`, {
         method: "POST",
         credentials: "include",
         body: formData,
      });

      if (!response.ok) {
         const errorData = await response.json();
         return {
            success: false,
            error: errorData.error || "Failed to upload avatar",
         };
      }

      const data = await response.json();
      return {
         success: true,
         url: data.url,
      };
   } catch (error) {
      console.error("Error uploading avatar:", error);
      return {
         success: false,
         error:
            error instanceof Error ? error.message : "Failed to upload avatar",
      };
   }
};

/**
 * Remove user avatar
 * @returns Promise indicating success or failure
 */
export const removeAvatar = async (): Promise<{
   success: boolean;
   error?: string;
}> => {
   try {
      const response = await fetch(`${BASE_API_URL}/files/avatar`, {
         method: "DELETE",
         credentials: "include",
      });

      if (!response.ok) {
         const errorData = await response.json();
         return {
            success: false,
            error: errorData.error || "Failed to remove avatar",
         };
      }

      return { success: true };
   } catch (error) {
      console.error("Error removing avatar:", error);
      return {
         success: false,
         error:
            error instanceof Error ? error.message : "Failed to remove avatar",
      };
   }
};
