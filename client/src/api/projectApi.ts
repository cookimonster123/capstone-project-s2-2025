import type { Project } from "@types";
import axios from "axios";
import { BASE_API_URL } from "@/config/api";

export const getAllProjects = async (): Promise<Project[] | undefined> => {
   try {
      const response = await axios.get<{ projects: Project[] }>(
         `${BASE_API_URL}/projects`,
      );
      return response.data.projects;
   } catch (error) {
      console.error("Error fetching projects:", error);
   }
};
