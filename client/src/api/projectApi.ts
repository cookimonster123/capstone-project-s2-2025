import type { Project, ProjectsResponse } from "../types/project";
import { BASE_API_URL } from "../config/api";

/**
 * Fetches all projects from the API
 * @returns Promise<Project[]> - Array of projects
 * @throws Error if the API request fails
 */
export const fetchProjects = async (): Promise<Project[]> => {
   try {
      const response = await fetch(`${BASE_API_URL}/projects`, {
         method: "GET",
         headers: {
            "Content-Type": "application/json",
         },
      });

      if (!response.ok) {
         throw new Error(
            `Failed to fetch projects: ${response.status} ${response.statusText}`,
         );
      }

      const data: ProjectsResponse = await response.json();
      return data.projects;
   } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
   }
};

/**
 * Fetches a single project by ID
 * @param id - Project ID
 * @returns Promise<Project> - Single project
 * @throws Error if the API request fails
 */
export const fetchProjectById = async (id: string): Promise<Project> => {
   try {
      const response = await fetch(`${BASE_API_URL}/projects/${id}`, {
         method: "GET",
         headers: {
            "Content-Type": "application/json",
         },
      });

      if (!response.ok) {
         throw new Error(
            `Failed to fetch project: ${response.status} ${response.statusText}`,
         );
      }

      const data = await response.json();
      return data.project;
   } catch (error) {
      console.error("Error fetching project:", error);
      throw error;
   }
};

/**
 * Create a new project
 *
 */
export type CreateProjectRequest = {
   name: string;
   teamId: string; // teamId is mapped to team
   description?: string;
   semester: string;
   category?: string;
   links?: Array<{
      type: "github" | "deployedWebsite";
      value: string;
   }>;
   /** Up to 5 tags; server will slice and bind */
   tags?: string[];
};

/**
 * Sends POST /projects to create a project.
 */
export const createProject = async (
   payload: CreateProjectRequest,
): Promise<Project> => {
   try {
      const response = await fetch(`${BASE_API_URL}/projects`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         credentials: "include",
         body: JSON.stringify(payload),
      });

      if (!response.ok) {
         let msg = `Failed to create project: ${response.status} ${response.statusText}`;
         try {
            const err = await response.json();
            if (err?.error) msg = err.error;
         } catch {}
         throw new Error(msg);
      }

      const data = await response.json();
      return data.project as Project;
   } catch (error) {
      console.error("Error creating project:", error);
      throw error;
   }
};

/**
 * Response payload for like/unlike an individual project
 */
export interface LikeProjectResponse {
   message: string;
   data: {
      /** true if project is now liked, false if it was unliked */
      button: boolean;
      /** updated likeCounts on the project (if returned by API) */
      likeCounts?: number;
      /** optional list of liked project ids for the current user */
      likedProjects?: string[];
   };
}

/**
 * Toggles like state for a project for the current user.
 * Requires authentication (relies on cookie/session). Returns the new state and counts.
 */
export const likeProject = async (
   projectId: string,
): Promise<LikeProjectResponse> => {
   try {
      const response = await fetch(
         `${BASE_API_URL}/projects/${projectId}/like`,
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            credentials: "include",
         },
      );

      if (!response.ok) {
         let msg = `Failed to like project: ${response.status} ${response.statusText}`;
         try {
            const err = await response.json();
            if (err?.error) msg = err.error;
         } catch {}
         throw new Error(msg);
      }

      const data: LikeProjectResponse = await response.json();
      return data;
   } catch (error) {
      console.error("Error liking project:", error);
      throw error;
   }
};
