/**
 * Interface for user data
 */
export interface UserData {
   _id?: string;
   name: string;
   email: string;
   password?: string;
   profilePicture?: string;
   role?: "visitor" | "admin" | "staff" | "capstoneStudent";
   links?: Array<{
      type: "github" | "linkedin" | "personalWebsite";
      value: string;
   }>;
   project?: string; // Project ID
   team?: string; // Team ID
   lastLogin?: Date;
   likedProjects?: string[];
   favorites?: string[];
}

/**
 * Interface for user update
 */
export type UpdateUserData = Omit<UserData, "password">;
