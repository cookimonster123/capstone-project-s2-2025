import { BASE_API_URL } from "../config/api";

export interface CategoryDto {
   _id: string;
   name: string;
   description?: string;
}

/**
 * Fetch all categories
 * @returns Promise<CategoryDto[]>
 */
export const fetchCategories = async (): Promise<CategoryDto[]> => {
   const res = await fetch(`${BASE_API_URL}/categories`, {
      credentials: "include",
   });
   if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.status}`);
   }
   const data = await res.json();
   return (data?.categories ?? []) as CategoryDto[];
};
