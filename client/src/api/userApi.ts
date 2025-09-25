import { BASE_API_URL } from "../config/api";

export type UserLinkType = "github" | "linkedin" | "personalWebsite";

export interface UserLink {
   type: UserLinkType;
   value: string;
}

export interface UserSummary {
   name: string;
   email: string;
   role: "visitor" | "admin" | "staff" | "capstoneStudent";
   profilePicture?: string;
   links?: UserLink[];
   project?: string;
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
