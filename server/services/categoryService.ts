import { Category } from "../models/category.model";

export const findAllCategories = async () => {
   try {
      const categories = await Category.find({}).sort({ name: 1 }).lean();
      return { success: true as const, data: categories };
   } catch (error: any) {
      console.error("Error fetching categories:", error);
      return {
         success: false as const,
         error: error?.message || "Unknown error",
      };
   }
};
