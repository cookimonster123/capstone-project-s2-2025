export interface ProjectLink {
   value: string;
   type: "github" | "deployedWebsite";
}

export interface Project {
   _id: string;
   name: string;
   description: string;
   team?: {
      _id: string;
      name: string;
      members: Array<{
         _id: string;
         name: string;
         email: string;
      }>;
   } | null;
   semester?: {
      _id: string;
      name: string;
      year: number;
   } | null;
   category?: {
      _id: string;
      name: string;
   } | null;
   links: ProjectLink[];
   createdAt: string;
   updatedAt: string;
}

export interface ProjectsResponse {
   projects: Project[];
}
