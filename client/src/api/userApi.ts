import { BASE_API_URL } from "../config/api";

export type UserLinkType = "github" | "linkedin" | "personalWebsite";

export interface UserLink {
   type: UserLinkType;
   value: string;
}

export interface UserSummary {
   _id: string;
   name: string;
   email: string;
   role: "visitor" | "admin" | "staff" | "capstoneStudent";
   profilePicture?: string;
   links?: UserLink[];
   project?: string;
   likedProjects: string[];
   team?: string;
}

export interface UserByIdResponse {
   user: UserSummary;
}

export const fetchUserById = async (id: string): Promise<UserByIdResponse> => {
   try {
      const response = await fetch(`${BASE_API_URL}/users/${id}`, {
         method: "GET",
         headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
         throw new Error(
            `Failed to fetch user: ${response.status} ${response.statusText}`,
         );
      }

      const data: UserByIdResponse = await response.json();
      return data;
   } catch (error) {
      console.error("Error fetching user by id:", error);
      throw error;
   }
};

export const fetchCurrentUserId = async (): Promise<string> => {
   try {
      const response = await fetch(`${BASE_API_URL}/users/me`, {
         method: "GET",
         headers: { "Content-Type": "application/json" },
         // Include credentials if your token is in HttpOnly cookies
         credentials: "include",
      });

      if (!response.ok) {
         throw new Error(
            `Failed to fetch current user: ${response.status} ${response.statusText}`,
         );
      }

      const data = await response.json();
      return data;
   } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
   }
};
