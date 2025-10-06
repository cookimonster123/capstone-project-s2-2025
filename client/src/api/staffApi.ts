import { BASE_API_URL } from "../config/api";
import type { UserSummary } from "./userApi";

// Team type
export interface Team {
   _id: string;
   name: string;
   members: UserSummary[];
   project?: string | { _id: string; name: string };
   createdAt: string;
}

// Award type
export interface Award {
   _id: string;
   name: string;
   description: string;
   createdAt: string;
}

// Comment type
export interface Comment {
   _id: string;
   content: string;
   author?:
      | UserSummary
      | {
           _id?: string;
           name: string;
           email: string;
           profilePicture?: string;
           role?: string;
        };
   project: string | { _id: string; name: string };
   createdAt: string;
}

// Fetch all users (for staff management)
export const fetchAllUsers = async (): Promise<UserSummary[]> => {
   try {
      const response = await fetch(`${BASE_API_URL}/users`, {
         method: "GET",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
      });

      if (!response.ok) {
         throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      return data.users || [];
   } catch (error) {
      console.error("Error fetching users:", error);
      return [];
   }
};

// Update a user
export const updateUser = async (
   userId: string,
   userData: { name: string; email: string; role: string },
): Promise<boolean> => {
   try {
      const response = await fetch(`${BASE_API_URL}/users/${userId}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
         body: JSON.stringify(userData),
      });

      return response.ok;
   } catch (error) {
      console.error("Error updating user:", error);
      return false;
   }
};

// Delete a user
export const deleteUser = async (userId: string): Promise<boolean> => {
   try {
      const response = await fetch(`${BASE_API_URL}/users/${userId}`, {
         method: "DELETE",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
      });

      return response.ok;
   } catch (error) {
      console.error("Error deleting user:", error);
      return false;
   }
};

// Update user role
export const updateUserRole = async (
   userId: string,
   role: string,
): Promise<boolean> => {
   try {
      const response = await fetch(`${BASE_API_URL}/users/${userId}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
         body: JSON.stringify({ role }),
      });

      return response.ok;
   } catch (error) {
      console.error("Error updating user role:", error);
      return false;
   }
};

// Delete a project
export const deleteProject = async (projectId: string): Promise<boolean> => {
   try {
      const response = await fetch(`${BASE_API_URL}/projects/${projectId}`, {
         method: "DELETE",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
      });

      return response.ok;
   } catch (error) {
      console.error("Error deleting project:", error);
      return false;
   }
};

// Fetch all teams
export const fetchAllTeams = async (): Promise<Team[]> => {
   try {
      const response = await fetch(`${BASE_API_URL}/teams`, {
         method: "GET",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
      });

      if (!response.ok) {
         console.warn("Teams API not available yet, returning empty array");
         return [];
      }

      const data = await response.json();
      return data.teams || [];
   } catch (error) {
      console.error("Error fetching teams:", error);
      return [];
   }
};

// Upload teams CSV
export const uploadTeamsCSV = async (csvData: {
   teams: Array<{ name: string; memberEmails: string[] }>;
}): Promise<{ success: boolean; message: string; errors?: any[] }> => {
   try {
      const response = await fetch(`${BASE_API_URL}/teams/upload-csv`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
         body: JSON.stringify(csvData),
      });

      const data = await response.json();
      return data;
   } catch (error) {
      console.error("Error uploading teams CSV:", error);
      return {
         success: false,
         message: "Failed to upload CSV",
      };
   }
};

// Delete a team
export const deleteTeam = async (teamId: string): Promise<boolean> => {
   try {
      const response = await fetch(`${BASE_API_URL}/teams/${teamId}`, {
         method: "DELETE",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
      });

      return response.ok;
   } catch (error) {
      console.error("Error deleting team:", error);
      return false;
   }
};

// Fetch all awards
export const fetchAllAwards = async (): Promise<Award[]> => {
   try {
      const response = await fetch(`${BASE_API_URL}/awards`, {
         method: "GET",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
      });

      if (!response.ok) {
         console.warn("Awards API not available yet, returning empty array");
         return [];
      }

      const data = await response.json();
      return data.awards || [];
   } catch (error) {
      console.error("Error fetching awards:", error);
      return [];
   }
};

// Create a new award
export const createAward = async (awardData: {
   name: string;
   description: string;
   project?: string;
   team?: string;
}): Promise<Award | null> => {
   try {
      const response = await fetch(`${BASE_API_URL}/awards`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
         body: JSON.stringify(awardData),
      });

      if (!response.ok) {
         throw new Error(`Failed to create award: ${response.status}`);
      }

      const data = await response.json();
      return data.award;
   } catch (error) {
      console.error("Error creating award:", error);
      return null;
   }
};

// Delete an award
export const deleteAward = async (awardId: string): Promise<boolean> => {
   try {
      const response = await fetch(`${BASE_API_URL}/awards/${awardId}`, {
         method: "DELETE",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
      });

      return response.ok;
   } catch (error) {
      console.error("Error deleting award:", error);
      return false;
   }
};

// Assign award to project
export const assignAwardToProject = async (
   projectId: string,
   awardId: string,
): Promise<boolean> => {
   try {
      const response = await fetch(
         `${BASE_API_URL}/awards/assign/project/${projectId}/award/${awardId}`,
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            credentials: "include",
         },
      );

      return response.ok;
   } catch (error) {
      console.error("Error assigning award to project:", error);
      return false;
   }
};

// Remove award from project
export const removeAwardFromProject = async (
   projectId: string,
   awardId: string,
): Promise<boolean> => {
   try {
      const response = await fetch(
         `${BASE_API_URL}/awards/remove/project/${projectId}/award/${awardId}`,
         {
            method: "DELETE",
            headers: {
               "Content-Type": "application/json",
            },
            credentials: "include",
         },
      );

      return response.ok;
   } catch (error) {
      console.error("Error removing award from project:", error);
      return false;
   }
};

// Fetch all comments
export const fetchAllComments = async (): Promise<Comment[]> => {
   try {
      const response = await fetch(`${BASE_API_URL}/comments`, {
         method: "GET",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
      });

      if (!response.ok) {
         console.warn("Comments API not available yet, returning empty array");
         return [];
      }

      const data = await response.json();
      return data.comments || [];
   } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
   }
};

// Delete a comment
export const deleteComment = async (commentId: string): Promise<boolean> => {
   try {
      const response = await fetch(`${BASE_API_URL}/comments/${commentId}`, {
         method: "DELETE",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
      });

      return response.ok;
   } catch (error) {
      console.error("Error deleting comment:", error);
      return false;
   }
};
