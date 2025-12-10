import type { Project } from "@types";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
   projects: Project[];
   onProjectClick: (project: Project) => void;
}

/**
 * Renders a responsive grid of project cards
 *
 * @param {ProjectGridProps} props - Component props
 * @param {Project[]} props.projects - Array of project objects to display
 * @param {Function} props.onProjectClick - Callback fired when a project is clicked
 * @returns {JSX.Element} A grid layout containing ProjectCard components
 */
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
