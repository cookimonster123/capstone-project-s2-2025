export interface User {
   _id: string;
   name: string;
   email: string;
   role: "visitor" | "admin" | "staff" | "capstoneStudent";
   profilePicture?: string;
   likedProjects: string[];
   favorites?: string[];
   project?: string;
   team?: string;
   lastLogin?: string;
}
