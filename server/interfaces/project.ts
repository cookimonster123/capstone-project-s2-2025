/**
 * Interface for project data
 */
export interface ProjectData {
   name: string;
   teamname?: string;
   description?: string;
   semester: string;
   category?: string;
   links?: Array<{
      type: "github" | "deployedWebsite";
      value: string;
   }>;
}

/**
 * Interface for project creation data
 */
export interface CreateProjectData extends ProjectData {
   // Additional fields specific to project creation can go here
}

/**
 * Interface for project update data
 */
export interface UpdateProjectData extends Partial<ProjectData> {
   // Additional fields specific to project updates can go here
}
