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
