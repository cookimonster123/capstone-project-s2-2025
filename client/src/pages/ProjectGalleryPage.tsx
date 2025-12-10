import { ProjectGrid } from "@components";
import { getAllProjects } from "@/api";
import type { Project } from "@types";
import { useEffect, useState } from "react";

export function ProjectGalleryPage() {
   const [projects, setProjects] = useState<Project[]>([]);

   const onProjectClick = (project: Project) => {
      console.log("Project clicked:", project.name);
   };

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
