import type { Project } from "@types";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
   projects: Project[];
   onProjectClick: (project: Project) => void;
}

export function ProjectGrid({
   projects = [],
   onProjectClick,
}: ProjectGridProps) {
   return (
      <div className="grid grid-cols-4 gap-4">
         {projects.map((project) => (
            <ProjectCard
               key={project._id}
               project={project}
               onProjectClick={() => onProjectClick(project)}
            />
         ))}
      </div>
   );
}
