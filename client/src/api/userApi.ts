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

export class ApiError extends Error {
   status: number;
   constructor(message: string, status: number) {
      super(message);
      this.name = "ApiError";
      this.status = status;
   }
}

export const fetchFavoriteProjectIds = async (
   userId: string,
): Promise<string[]> => {
   const res = await fetch(`${BASE_API_URL}/users/${userId}/favorites`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
   });
   if (!res.ok) {
      let msg = `Failed to fetch favorites: ${res.status} ${res.statusText}`;
      try {
         const err = await res.json();
         if (err?.error) msg = err.error;
      } catch {}
      throw new ApiError(msg, res.status);
   }
   const data = await res.json();
   // API returns an array of populated projects; normalize to id list
   const favorites: any[] = data?.favorites ?? [];
   return favorites
      .map((p) => (typeof p === "string" ? p : p?._id))
      .filter((id: any) => typeof id === "string");
};

export const addProjectToFavorites = async (
   userId: string,
   projectId: string,
): Promise<void> => {
   const res = await fetch(`${BASE_API_URL}/users/${userId}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ projectId }),
   });
   if (!res.ok) {
      let msg = `Failed to add favorite: ${res.status} ${res.statusText}`;
      try {
         const err = await res.json();
         if (err?.error) msg = err.error;
      } catch {}
      throw new ApiError(msg, res.status);
   }
};

export const removeProjectFromFavorites = async (
   userId: string,
   projectId: string,
): Promise<void> => {
   const res = await fetch(
      `${BASE_API_URL}/users/${userId}/favorites/${projectId}`,
      {
         method: "DELETE",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
      },
   );
   if (!res.ok) {
      let msg = `Failed to remove favorite: ${res.status} ${res.statusText}`;
      try {
         const err = await res.json();
         if (err?.error) msg = err.error;
      } catch {}
      throw new ApiError(msg, res.status);
   }
};
