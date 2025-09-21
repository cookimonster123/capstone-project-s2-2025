import Joi from "joi";
import { Tag, Project } from "@models";
import { ServiceResult, TagData, ValidationResult } from "../interfaces";
import mongoose from "mongoose";

/**
 * Validates tag data
 * @param tagData - The tag data to validate
 * @returns Validation result
 */
export function validateTagData(tagData: TagData): ValidationResult<TagData> {
   const schema = Joi.object({
      name: Joi.string().min(1).max(50).required(),
      projects: Joi.array().items(Joi.string()),
      mentions: Joi.number().required(),
   });

   return schema.validate(tagData);
}

/**
 * Create tag
 * @param tagName -  create a new tag
 * @returns Promise<ServiceResult<TagData>> new tag creation result
 * @throws Error or unexpected server errors
 */
export async function addNewTag(
   tagName: string,
): Promise<ServiceResult<TagData>> {
   try {
      const tagExist = await Tag.findOne({ name: tagName });

      if (tagExist) {
         return {
            success: false,
            error: "Tag already exists",
         };
      }

      const tag = new Tag({
         name: tagName,
         projects: [],
         mentions: 0,
      });

      await tag.save();

      return {
         success: true,
         data: {
            name: tag.name,
            projects: [],
            mentions: 0,
         },
      };
   } catch (error) {
      console.error("Error in addNewTag service:", error);
      throw error;
   }
}

/**
 * find all tags
 * @returns Promise<ServiceResult<TagData[]>> tags result
 * @throws Error for unexpected server errors
 */
export async function findAllTags(): Promise<ServiceResult<TagData[]>> {
   try {
      const tags = await Tag.find().lean();

      return {
         success: true,
         data: tags.map((tag) => ({
            name: tag.name,
            projects:
               tag.projects?.map((projectId) => projectId.toString()) ?? [],
            mentions: tag.mentions,
         })),
      };
   } catch (error) {
      console.error("Error in findAllTags service: ", error);
      throw error;
   }
}

/**
 * Find tag by name
 * @param tagName - Name of the tag to retrieve
 * @returns Promise<ServiceResult<TagData>> tag result
 * @throws Error for unexpected server errors
 */
export async function findTagByName(tagName: string): Promise<ServiceResult> {
   try {
      const tag = await Tag.findOne({ name: tagName })
         .populate("projects")
         .lean();

      if (!tag) {
         return {
            success: false,
            error: "Tag not found",
         };
      }

      return {
         success: true,
         data: tag,
      };
   } catch (error) {
      console.error("Error in findTagById service: ", error);
      throw error;
   }
}

/**
 * remove tag
 * @param tagId - ID of the tag to delete
 * @returns Promise<ServiceResult> deletion result
 * @throws Error for unexpected server errors
 */
export async function removeTag(tagName: string): Promise<ServiceResult> {
   try {
      const tag = await Tag.findOne({ name: tagName });

      if (!tag) {
         return {
            success: false,
            error: "Tag not found",
         };
      }

      const tagProjects = tag.projects;

      if (tagProjects.length !== 0) {
         await Promise.all(
            tagProjects.map((projectId) =>
               Project.findByIdAndUpdate(projectId, {
                  $pull: { tags: tag._id },
               }),
            ),
         );
      }

      const deletedTag = await Tag.findByIdAndDelete(tag._id);

      return {
         success: true,
         data: deletedTag,
      };
   } catch (error) {
      console.error("Error in removeTag service: ", error);
      throw error;
   }
}

/**
 * Bind an exisiting tag to the project
 * @param tagName - name of the tag to check in the tag collection
 * @param projectId - Id of the project to be bound by the target tag
 * @returns Promise<Service<TagData>> check result
 * @throws Error for unexpected server errors
 */
export async function bindTagToProject(
   tagName: string,
   projectId: string,
): Promise<ServiceResult<TagData>> {
   try {
      const tag = await Tag.findOne({ name: tagName });

      if (!tag) {
         return {
            success: false,
            error: "TAG_NOT_FOUND",
         };
      }

      const project = await Project.findById(projectId);

      if (!project) {
         return {
            success: false,
            error: "PROJECT_NOT_FOUND",
         };
      }

      if (tag.projects?.includes(project._id)) {
         return {
            success: false,
            error: "TAG_ALREADY_BOUND",
         };
      }

      if (project.tags.length >= 5) {
         return {
            success: false,
            error: "MAX_TAGS_REACHED",
         };
      }

      await Project.findByIdAndUpdate(
         projectId,
         { $push: { tags: tag._id } },
         { new: true },
      ).populate("tags", "name");

      tag.projects?.push(project._id);
      tag.mentions += 1;

      await tag.save();

      return {
         success: true,
         data: {
            name: tag.name,
            projects:
               tag.projects?.map((projectId) => projectId.toString()) ?? [],
            mentions: tag.mentions,
         },
      };
   } catch (error) {
      console.error("Error in bindTagToProject service", error);
      throw error;
   }
}

/**
 * remove a bound tag from its bound project
 * @param tagName - name of the tag to check in the tag collection
 * @param projectId - Id of the bound project
 * @returns Promise<Service<TagData>> check result
 * @throws Error for unexpected server errors
 */
export async function removeTagFromProject(
   tagName: string,
   projectId: string,
): Promise<ServiceResult<TagData>> {
   try {
      const tag = await Tag.findOne({ name: tagName });

      if (!tag) {
         return {
            success: false,
            error: "TAG_NOT_FOUND",
         };
      }

      const project = await Project.findById(projectId);

      if (!project) {
         return {
            success: false,
            error: "PROJECT_NOT_FOUND",
         };
      }

      if (!tag.projects?.includes(project._id)) {
         return {
            success: false,
            error: "TAG_NOT_BOUND",
         };
      }

      await Project.findByIdAndUpdate(
         projectId,
         { $pull: { tags: tag._id } },
         { new: true },
      );

      const updatedTag = await Tag.findByIdAndUpdate(
         tag._id,
         {
            $pull: { projects: new mongoose.Types.ObjectId(projectId) },
            $inc: { mentions: -1 }, // Atomic decrement
         },
         { new: true },
      );
      //If no mentions left, remove tag from tag collection
      if (updatedTag && updatedTag.mentions <= 0) {
         await Tag.findByIdAndDelete(tag._id);
         return {
            success: true,
            message: "Tag removed from project and deleted ",
         };
      }

      if (updatedTag && updatedTag.mentions > 0) {
         return {
            success: true,
            data: {
               name: updatedTag.name,
               projects:
                  updatedTag.projects?.map((projectId) =>
                     projectId.toString(),
                  ) ?? [],
               mentions: updatedTag.mentions,
            },
         };
      }
      return {
         success: false,
         error: "updatedTag does not exist.",
      };
   } catch (error) {
      console.error("Error in removeTagFromProject service", error);
      throw error;
   }
}

/**
 * add tag to project, if tag exists, add it. Otherwise, create one firstly, then add it.
 * @param tagName - name of the tag to check in the tag collection
 * @param projectId - Id of the project that tag will be added to
 * @returns Promise<Service<TagData>> check result
 * @throws Error for unexpected server errors
 */
export async function addTagToProject(
   tagName: string,
   projectId: string,
): Promise<ServiceResult<TagData>> {
   try {
      // Try to bind the tag first
      let result = await bindTagToProject(tagName, projectId);

      if (result.error === "TAG_NOT_FOUND") {
         // Tag doesn't exist, create it
         const newTagResult = await addNewTag(tagName);
         if (!newTagResult.success || !newTagResult.data) {
            return {
               success: false,
               error: newTagResult.error || "Failed to create tag",
            };
         }

         // Bind the newly created tag
         result = await bindTagToProject(tagName, projectId);
      }

      return result;
   } catch (error) {
      console.error("Error in addNewTagToProject service", error);
      throw error;
   }
}
