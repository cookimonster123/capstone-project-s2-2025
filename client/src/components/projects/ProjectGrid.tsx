import type { Project } from "@types";

interface ProjectGridProps {
   projects?: Project[];
   onProjectClick: (project: Project) => void;
   isLoading?: boolean;
}

export function ProjectGrid({
   projects,
   onProjectClick,
   isLoading,
}: ProjectGridProps) {}
