import Joi from "joi";
import { Project, Team, User, Tag, Comment } from "@models";
import {
   ServiceResult,
   ValidationResult,
   ProjectData,
   UpdateProjectData,
} from "../interfaces";
import {
   uploadFilesToS3,
   deleteFileFromS3,
   randomFileFromS3,
} from "../services/fileService";
import mongoose from "mongoose";
import { addTagToProject } from "./tagService";
import type { FilterQuery, SortOrder } from "mongoose";

/**
 * Validates project data
 * @param projectData - The project data to validate
 * @returns Validation result
 */
export function validateProjectData(
   projectData: ProjectData,
): ValidationResult<ProjectData> {
   const schema = Joi.object({
      name: Joi.string().min(1).max(100).required(),
      teamId: Joi.string().required(),
      description: Joi.string().allow(""),
      semester: Joi.string().required(),
      category: Joi.string().allow(""),
      links: Joi.array()
         .items(
            Joi.object({
               type: Joi.string()
                  .valid("github", "deployedWebsite", "videoDemoUrl")
                  .required(),
               value: Joi.string().uri().required(),
            }),
         )
         .optional(),
      imageUrl: Joi.array().items(Joi.string()).optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      likeCounts: Joi.number().integer().min(0).optional(),
      award: Joi.array().items(Joi.string()).optional(),
   });

   return schema.validate(projectData);
}

/**
 * Validates project update data (partial data)
 * @param updateData - The partial project data to validate
 * @returns Validation result
 */
export function validateUpdateProjectData(
   updateData: UpdateProjectData,
): ValidationResult<UpdateProjectData> {
   const schema = Joi.object({
      name: Joi.string().min(1).max(100).optional(),
      teamId: Joi.string().allow("").optional(),
      description: Joi.string().allow("").optional(),
      semester: Joi.string().optional(),
      category: Joi.string().allow("").optional(),
      links: Joi.array()
         .items(
            Joi.object({
               type: Joi.string()
                  .valid("github", "deployedWebsite", "videoDemoUrl")
                  .required(),
               value: Joi.string().uri().required(),
            }),
         )
         .optional(),
   }).min(1); // Ensure at least one field is provided for update

   return schema.validate(updateData);
}

/**
 * Paginated list of projects with optional search and filters
 */
export async function findProjectsPaginated(options: {
   page?: number;
   limit?: number;
   q?: string;
   category?: string;
   semester?: string;
   sort?: string;
   order?: "asc" | "desc";
}): Promise<
   ServiceResult<{
      items: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
   }>
> {
   try {
      const {
         page = 1,
         limit = 20,
         q,
         category,
         semester,
         sort = "createdAt",
         order = "desc",
      } = options || {};

      const skip = (page - 1) * limit;

      const query: FilterQuery<typeof Project> = {} as any;
      if (q && q.trim()) {
         const rx = new RegExp(q.trim(), "i");
         // Search on name and description
         (query as any).$or = [{ name: rx }, { description: rx }];
      }
      if (category) {
         (query as any).category = category;
      }
      if (semester) {
         (query as any).semester = semester;
      }

      const primary = order === "asc" ? 1 : -1;
      const sortSpec: Record<string, SortOrder> =
         sort === "createdAt"
            ? { createdAt: primary, _id: primary }
            : { [sort]: primary, _id: primary };

      const [items, total] = await Promise.all([
         Project.find(query)
            .populate("team")
            .populate("semester")
            .populate("category")
            .populate("tags", "name")
            .populate("awards", "_id iconUrl name")
            .sort(sortSpec)
            .skip(skip)
            .limit(limit),
         Project.countDocuments(query),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / limit));
      return {
         success: true,
         data: { items, total, page, limit, totalPages },
      };
   } catch (error) {
      console.error("Error in findProjectsPaginated service:", error);
      throw error;
   }
}

/**
 * Creates a new project
 * @param projectData - Project data to create
 * @param imageFile - the upload image files
 * @returns Promise<ServiceResult> creation result
 * @throws Error for unexpected server errors
 */
export async function insertProject(
   projectData: ProjectData,
   imageFiles?: Express.Multer.File[],
): Promise<ServiceResult> {
   try {
      // Validate input data
      const { error } = validateProjectData(projectData);
      if (error) {
         return {
            success: false,
            error: error.details[0].message,
         };
      }

      const teamId = projectData.teamId;

      const findTeam = await Team.findById(teamId);
      if (!findTeam) {
         return {
            success: false,
            error: "This team does not exist",
         };
      }

      // Check if team has a project already
      const hasProject = await teamHasProject(teamId);
      if (hasProject) {
         return {
            success: false,
            error: "This team already has a project",
         };
      }

      // Create new project with proper field mapping
      const { tags, teamId: _, ...projectFields } = projectData;
      const project = new Project({
         ...projectFields,
         team: teamId, // Map teamId to team field required by the schema
      });

      // Persist the bare project first so tag-binding (and other services) can find it.
      // This ensures calls like Project.findById(projectId) inside tagService succeed.
      await project.save();
      const projectId = project._id.toString();

      // add at most first five tags from tags array to the project (create/bind)
      if (tags?.length) {
         const slicedTags = tags.slice(0, 5);
         for (const tagName of slicedTags) {
            try {
               const result = await addTagToProject(tagName.trim(), projectId);
               if (!result.success) {
                  // Non-fatal: log and continue (project creation should still succeed)
                  console.warn(
                     `Failed to bind tag "${tagName}" to project ${projectId}: ${result.error}`,
                  );
               }
            } catch (err) {
               console.warn(
                  `Error binding tag "${tagName}" to project ${projectId}:`,
                  err,
               );
            }
         }
      }

      // add at most five images or randomize one image by default
      await (imageFiles?.length
         ? HandleProjectImageUpload(project, imageFiles)
         : HandleProjectImageDefault(project));

      // Save again to persist any imageUrl changes made by HandleProjectImageUpload
      await project.save();

      const updatedProject = await Project.findById(projectId);
      return {
         success: true,
         data: updatedProject,
      };
   } catch (error) {
      console.error("Error in insertProject service:", error);
      throw error;
   }
}

/**
 * Gets all projects with population
 * @returns Promise<ServiceResult> projects result
 * @throws Error for unexpected server errors
 */
export async function findAllProjects(): Promise<ServiceResult> {
   try {
      const projects = await Project.find()
         .populate("team")
         .populate("semester")
         .populate("category")
         .populate("tags", "name")
         .populate("awards", "_id iconUrl name");

      return {
         success: true,
         data: projects,
      };
   } catch (error) {
      console.error("Error in findAllProjects service:", error);
      throw error;
   }
}

/**
 * Gets project by ID
 * @param projectId - ID of the project to retrieve
 * @returns Promise<ServiceResult> project result
 * @throws Error for unexpected server errors
 */
export async function findProjectById(
   projectId: string,
): Promise<ServiceResult> {
   try {
      const project = await Project.findById(projectId)
         .populate({
            path: "team",
            populate: {
               path: "members",
               select: "name email profilePicture",
            },
         })
         .populate("semester")
         .populate("category")
         .populate("tags", "name")
         .populate("awards", "_id iconUrl name");

      if (!project) {
         return {
            success: false,
            error: "Project not found",
         };
      }

      return {
         success: true,
         data: project,
      };
   } catch (error) {
      console.error("Error in findProjectById service:", error);
      throw error;
   }
}

/**
 * Updates a project
 * @param projectId - ID of the project to update
 * @param updateData - Data to update the project with
 * @returns Promise<ServiceResult> update result
 * @throws Error for unexpected server errors
 */
export async function updateProject(
   projectId: string,
   updateData: UpdateProjectData,
): Promise<ServiceResult> {
   try {
      // Validate input data if provided
      if (Object.keys(updateData).length > 0) {
         const { error } = validateUpdateProjectData(updateData);
         if (error) {
            return {
               success: false,
               error: error.details[0].message,
            };
         }
      }

      const project = await Project.findByIdAndUpdate(projectId, updateData, {
         new: true,
         runValidators: true,
      });

      if (!project) {
         return {
            success: false,
            error: "Project not found",
         };
      }

      return {
         success: true,
         data: project,
      };
   } catch (error) {
      console.error("Error in updateProject service:", error);
      throw error;
   }
}

/**
 * Deletes a project
 * @param projectId - ID of the project to delete
 * @returns Promise<ServiceResult> deletion result
 * @throws Error for unexpected server errors
 */
export async function removeProject(projectId: string): Promise<ServiceResult> {
   try {
      const project = await Project.findById(projectId);

      // Remove the projectId from all users' liked projects arrays
      await User.updateMany(
         { likedProjects: projectId },
         { $pull: { likedProjects: projectId } },
      );
      if (!project) {
         return {
            success: false,
            error: "Project not found",
         };
      }

      //auto delete image file from S3 bucket
      if (project.imageUrl.length > 0) {
         for (const url of project.imageUrl) {
            await deleteFileFromS3(url);
         }
      }

      //clean up bound tags if project has
      if (project.tags.length > 0) {
         await Tag.updateMany(
            { _id: { $in: project.tags } },
            { $pull: { projects: projectId }, $inc: { mentions: -1 } },
         );

         await Tag.deleteMany({
            _id: { $in: project.tags },
            mentions: { $lte: 0 },
         });
      }

      // unset project references from teams and users
      await Team.updateMany(
         { project: projectId },
         { $unset: { project: null } },
      );

      await User.updateMany(
         { project: projectId },
         { $unset: { project: null } },
      );

      // COMMENTS cleanup: remove comments associated with this project
      try {
         await Comment.deleteMany({ project: projectId });
      } catch (error) {
         console.error("Error deleting comments:", error);
      }

      await Project.findByIdAndDelete(projectId);
      return {
         success: true,
         message: "Project deleted successfully",
      };
   } catch (error) {
      console.error("Error in removeProject service:", error);
      throw error;
   }
}

/**
 * Checks if a team has an existing project (returns boolean)
 * @param teamId - ID of the team to check
 * @returns Promise<boolean> true if team has a project, false otherwise
 * @throws Error for unexpected server errors
 */
export async function teamHasProject(teamId: string): Promise<boolean> {
   try {
      const project = await Project.findOne({ team: teamId });
      return project !== null;
   } catch (error) {
      console.error("Error in teamHasProject service:", error);
      throw error;
   }
}

/**
 * Links a project to a team by updating the team's project reference
 * @param projectId - The ID of the project to link
 * @param teamId - The ID of the team to link the project to
 * @returns Promise<void> resolves when the team is successfully updated
 * @throws Error when team is not found or database operation fails
 */
export async function linkProjectToTeam(
   projectId: string,
   teamId: string,
): Promise<void> {
   try {
      const team = await Team.findById(teamId);
      if (!team) {
         throw new Error("Team not found");
      }
      team.project = new mongoose.Types.ObjectId(projectId);
      await team.save();
   } catch (error) {
      console.error("Error linking project to team:", error);
      throw error;
   }
}

/**
 * Links a project to all members of a team by updating each user's project reference
 * @param projectId - The ID of the project to link
 * @param teamId - The ID of the team whose members should be linked to the project
 * @returns Promise<void> resolves when all team members are successfully updated
 * @throws Error when team is not found, any team member is not found, or database operations fail
 */
export async function linkProjectToTeamMembers(
   projectId: string,
   teamId: string,
): Promise<void> {
   try {
      const team = await Team.findById(teamId).populate("members");
      const teamMembers = team?.members || [];

      await Promise.all(
         teamMembers.map(async (id: mongoose.Types.ObjectId) => {
            const user = await User.findById(id);
            if (!user) {
               throw new Error(`User with ID ${id} not found`);
            }

            user.project = new mongoose.Types.ObjectId(projectId);
            await user.save();
         }),
      );
   } catch (error) {
      console.error("Error linking project to team members:", error);
      throw error;
   }
}

/**
 * Handles project image upload
 * @param project - The corresponding project
 * @param imageFile - The upload image files
 * @returns Promise<void> resolves when image uploaded
 * @throws Error when handle failed
 */
export async function HandleProjectImageUpload(
   project: InstanceType<typeof Project>,
   imageFiles: Express.Multer.File[],
): Promise<void> {
   try {
      // Skip if AWS is not configured
      if (
         !process.env.AWS_ACCESS_KEY_ID ||
         !process.env.AWS_SECRET_ACCESS_KEY
      ) {
         console.log("AWS credentials not configured, skipping image upload");
         return;
      }

      const projectId = project._id.toString();

      for (const imageFile of imageFiles) {
         const uploadResult = await uploadFilesToS3(
            imageFile,
            projectId,
            "project",
         );

         if (uploadResult.success) {
            const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadResult.data}`;
            project.imageUrl.push(url);
         } else {
            console.warn("Image upload failed:", uploadResult.error);
         }
      }
   } catch (error) {
      console.error("Handle Upload Project Image Error: ", error);
      // Don't throw error, just log it so project creation can continue
      console.log("Continuing without uploaded images");
   }
}

/**
 * Handles default project image if no image upload
 * @param project - The corresponding project
 * @returns Promise<void> resolves when default image bound to the project
 * @throws Error when handle failed
 */
export async function HandleProjectImageDefault(
   project: InstanceType<typeof Project>,
): Promise<void> {
   try {
      // Skip if AWS is not configured
      if (
         !process.env.AWS_ACCESS_KEY_ID ||
         !process.env.AWS_SECRET_ACCESS_KEY
      ) {
         console.log(
            "AWS credentials not configured, skipping default image upload",
         );
         return;
      }

      if (project.imageUrl.length === 0) {
         const prefix = "assets/projectImages/defaultImages/";
         const url = await randomFileFromS3(prefix);
         project.imageUrl.push(url);
      }
   } catch (error) {
      console.error("Handle default Project Image Error: ", error);
      // Don't throw error, just log it so project creation can continue
      console.log("Continuing without default image");
   }
}

/**
 * LikeButton to record the like counts of a project and user like state to different projects
 * @param userId - The ID of the user
 * @param projectId - The ID of the project
 * @returns Promise<ServiceResult> user's like result to a project by id
 * @throws Error when likeButton runs error.
 */
export async function likeButton(
   userId: string,
   projectId: string,
): Promise<ServiceResult> {
   try {
      const user = await User.findById(userId);
      const project = await Project.findById(projectId);
      if (!user || !project) {
         return {
            success: false,
            error: "Not found",
         };
      }

      const alreadyLiked = user.likedProjects.some((projectID) =>
         projectID.equals(project._id),
      );
      if (alreadyLiked) {
         //Unlike
         await User.updateOne(
            { _id: user._id },
            { $pull: { likedProjects: project._id } },
         );

         await Project.updateOne(
            { _id: project._id },
            { $inc: { likeCounts: -1 } },
         );

         const updatedUser = await User.findById(user._id).lean();
         const updatedProject = await Project.findById(project._id).lean();

         return {
            success: true,
            data: {
               button: false,
               likedProjects: updatedUser?.likedProjects,
               likeCounts: updatedProject?.likeCounts,
            },
         };
      }

      //like
      await User.updateOne(
         { _id: user._id },
         { $addToSet: { likedProjects: project._id } },
      );

      await Project.updateOne(
         { _id: project._id },
         { $inc: { likeCounts: 1 } },
      );

      const updatedUser = await User.findById(user._id).lean();
      const updatedProject = await Project.findById(project._id).lean();

      return {
         success: true,
         data: {
            button: true,
            likedProjects: updatedUser?.likedProjects,
            likeCounts: updatedProject?.likeCounts,
         },
      };
   } catch (error) {
      console.error("Error in likeButton function:", error);
      throw error;
   }
}
