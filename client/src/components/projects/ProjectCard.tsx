import type { Project } from "@types";
interface ProjectCardProps {
   project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
   const projectName = project.name;
   const projectDescription = project.description;
   const categoryName = project.category?.name || "";
   const semesterInfo = project.semester;

   return (
      <div className="max-w-sm rounded overflow-hidden shadow-lg">
         <img
            className="w-full"
            src="../../assets/cat.jpg"
            alt="Sunset in the mountains"
         />
         <div className="px-6 py-4">
            <div className="font-bold text-xl mb-2">{projectName}</div>
            <p className="text-gray-700 text-base">{projectDescription}</p>
         </div>

         {/* TODO: Add tages */}
         {/* <div className="px-6 pt-4 pb-2">
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
               #photography
            </span>
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
               #travel
            </span>
            <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
               #winter
            </span>
         </div> */}
      </div>
   );
}
