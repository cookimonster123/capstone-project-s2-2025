import { ProjectGrid } from "@components";
import { getAllProjects } from "@/api";
import type { Project } from "@types";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks";
import TextField from "@mui/material/TextField";

export function ProjectGalleryPage() {
   const [projects, setProjects] = useState<Project[]>([]);
   const searchedProjects = useDebounce(projects, 500);

   const onProjectClick = (project: Project) => {
      console.log("Project clicked:", project.name);
   };

   // First render
   useEffect(() => {
      const fetchProjects = async () => {
         try {
            const data = await getAllProjects();
            setProjects(data ?? []);
         } catch (err) {
            // TODO
         }
      };
      fetchProjects();
   }, []);

   return <ProjectGrid projects={projects} onProjectClick={onProjectClick} />;
}
