import Joi from "joi";
import { Award, Project } from "@models";
import { ValidationResult, ServiceResult, AwardData } from "../interfaces";

/**
 * Validates award data
 */
export function validateAwardData(
   awardData: Partial<AwardData>,
): ValidationResult<AwardData> {
   const schema = Joi.object({
      name: Joi.string().required(),
      iconUrl: Joi.string().optional(),
      description: Joi.string().required(),
      category: Joi.string()
         .valid(
            "Innovation",
            "Design",
            "Technical Excellence",
            "Social Impact",
            "Best Overall",
            "People's Choice",
         )
         .required(),
   });

   return schema.validate(awardData);
}

/**
 * Find all awards
 */
export const findAllAwards = async (): Promise<ServiceResult<AwardData[]>> => {
   try {
      const awards = await Award.find().sort({ createdAt: -1 }).lean();

      return {
         success: true,
         data: awards.map((award) => ({
            _id: award._id.toString(),
            name: award.name,
            iconUrl: award.iconUrl,
            description: award.description,
            category: award.category,
            createdAt: award.createdAt,
            updatedAt: award.updatedAt,
         })),
      };
   } catch (error) {
      console.error("Error finding awards:", error);
      return {
         success: false,
         error: "Failed to fetch awards",
      };
   }
};

/**
 * Find award by ID
 */
export const findAwardById = async (
   id: string,
): Promise<ServiceResult<AwardData>> => {
   try {
      const award = await Award.findById(id).lean();

      if (!award) {
         return {
            success: false,
            error: "Award not found",
         };
      }

      return {
         success: true,
         data: {
            name: award.name,
            iconUrl: award.iconUrl,
            description: award.description,
            category: award.category,
            createdAt: award.createdAt,
            updatedAt: award.updatedAt,
         },
      };
   } catch (error) {
      console.error("Error finding award:", error);
      return {
         success: false,
         error: "Failed to fetch award",
      };
   }
};

/**
 * Create a new award
 */
export const createAward = async (
   awardData: Partial<AwardData>,
): Promise<ServiceResult<AwardData>> => {
   try {
      const { error } = validateAwardData(awardData);
      if (error) {
         return {
            success: false,
            error: error.details[0].message,
         };
      }

      const award = await Award.create(awardData);

      return {
         success: true,
         data: {
            name: award.name,
            iconUrl: award.iconUrl,
            description: award.description,
            category: award.category,
            createdAt: award.createdAt,
            updatedAt: award.updatedAt,
         },
      };
   } catch (error: any) {
      if (error.code === 11000) {
         return {
            success: false,
            error: "Award with this name already exists",
         };
      }
      console.error("Error creating award:", error);
      return {
         success: false,
         error: "Failed to create award",
      };
   }
};

/**
 * Update an award
 */
export const updateAward = async (
   id: string,
   updateData: Partial<AwardData>,
): Promise<ServiceResult<AwardData>> => {
   try {
      const updatedAward = await Award.findByIdAndUpdate(id, updateData, {
         new: true,
         runValidators: true,
      });

      if (!updatedAward) {
         return {
            success: false,
            error: "Award not found or failed to update",
         };
      }

      return {
         success: true,
         data: {
            name: updatedAward.name,
            iconUrl: updatedAward.iconUrl,
            description: updatedAward.description,
            category: updatedAward.category,
            createdAt: updatedAward.createdAt,
            updatedAt: updatedAward.updatedAt,
         },
      };
   } catch (error: any) {
      if (error.code === 11000) {
         return {
            success: false,
            error: "Award with this name already exists",
         };
      }
      console.error("Error updating award:", error);
      return {
         success: false,
         error: "Failed to update award",
      };
   }
};

/**
 * Delete an award
 */
export const deleteAward = async (awardId: string): Promise<ServiceResult> => {
   try {
      const award = await Award.findByIdAndDelete(awardId);

      if (!award) {
         return {
            success: false,
            error: "Award not found",
         };
      }

      await Project.updateMany(
         { awards: awardId },
         { $pull: { awards: awardId } },
      );

      return {
         success: true,
         message: "Award deleted successfully",
      };
   } catch (error) {
      console.error("Error deleting award:", error);
      return {
         success: false,
         error: "Failed to delete award",
      };
   }
};

/**
 * Find awards by category
 */
export const findAwardsByCategory = async (
   category: string,
): Promise<ServiceResult<AwardData[]>> => {
   try {
      const awards = await Award.find({ category }).sort({ createdAt: -1 });

      return {
         success: true,
         data: awards.map((award) => ({
            name: award.name,
            iconUrl: award.iconUrl,
            description: award.description,
            category: award.category,
            createdAt: award.createdAt,
            updatedAt: award.updatedAt,
         })),
      };
   } catch (error) {
      console.error("Error finding awards by category:", error);
      return {
         success: false,
         error: "Failed to fetch awards for category",
      };
   }
};

/**
 * Assign an award to a project
 */
export const assignAwardToProject = async (
   awardId: string,
   projectId: string,
): Promise<ServiceResult> => {
   try {
      const award = await Award.findById(awardId);
      if (!award) {
         return {
            success: false,
            error: "Award not found",
         };
      }

      const awardedProject = await Project.findByIdAndUpdate(
         projectId,
         { $addToSet: { awards: awardId } },
         { new: true },
      ).populate("awards");

      if (!awardedProject) {
         return {
            success: false,
            error: "Project not found",
         };
      }

      return {
         success: true,
         data: awardedProject,
      };
   } catch (error) {
      console.error("Error assigning award to project:", error);
      return {
         success: false,
         error: "Failed to assign award to project",
      };
   }
};

/**
 * Remove an award from a project
 */
export const deleteAwardFromProject = async (
   awardId: string,
   projectId: string,
): Promise<ServiceResult> => {
   try {
      const award = await Award.findById(awardId);
      if (!award) {
         return {
            success: false,
            error: "Award not found",
         };
      }

      const unawardedProject = await Project.findByIdAndUpdate(
         projectId,
         { $pull: { awards: awardId } },
         { new: true },
      ).populate("awards");

      if (!unawardedProject) {
         return {
            success: false,
            error: "Project not found",
         };
      }

      return {
         success: true,
         message: "Award removed from project successfully",
      };
   } catch (error) {
      console.error("Error removing award from project:", error);
      return {
         success: false,
         error: "Failed to remove award from project",
      };
   }
};
