export interface ProjectLink {
   value: string;
   type: "github" | "deployedWebsite" | "videoDemoUrl";
}

export interface TeamMember {
   _id: string;
   name: string;
   email: string;
}

export interface TeamInfo {
   _id: string;
   name: string;
   members: TeamMember[];
}

export interface SemesterInfo {
   _id: string;
   semester: string;
   year: number;
}

export interface CategoryInfo {
   _id: string;
   name: string;
}

export interface TagInfo {
   _id?: string;
   name: string;
}

export interface AwardInfo {
   _id: string;
   name: string;
   iconUrl?: string;
}

export interface Project {
   _id: string;
   name: string;
   description: string;
   team?: TeamInfo | null;
   semester?: SemesterInfo | null;
   category?: CategoryInfo | null;
   tags?: TagInfo[];
   awards?: AwardInfo[];
   likeCounts?: number;
   imageUrl?: string[];

   links: ProjectLink[];
   createdAt: string;
   updatedAt: string;

   likesCount?: number;
   userLiked?: boolean;
}

export interface ProjectsResponse {
   projects: Project[];
}
