import { RegisteredStudent } from "../models/registeredStudent.model";
import { IBulkUpsertResult } from "../interfaces/registeredStudent";

/**
 * Add multiple students from CSV data
 * @param students Array of student objects with upi and name
 * @returns Promise with operation result
 */
export async function bulkAddStudents(
   students: { upi: string; name: string }[],
): Promise<{ success: boolean; message: string; stats?: any }> {
   try {
      if (!students || students.length === 0) {
         return { success: false, message: "No students provided" };
      }

      // Validate student data
      const validStudents = students.filter((student) => {
         return (
            student &&
            student.upi &&
            student.name &&
            typeof student.upi === "string" &&
            typeof student.name === "string" &&
            student.upi.trim().length > 0 &&
            student.name.trim().length > 0
         );
      });

      if (validStudents.length === 0) {
         return { success: false, message: "No valid students found" };
      }

      const result: IBulkUpsertResult =
         await RegisteredStudent.bulkUpsert(validStudents);

      return {
         success: true,
         message: `Successfully processed ${validStudents.length} students`,
         stats: {
            total: validStudents.length,
            inserted: result.insertedCount,
            updated: result.modifiedCount,
            upserted: result.upsertedCount,
         },
      };
   } catch (error) {
      console.error("Error in bulk add students:", error);
      return {
         success: false,
         message: "Failed to add students to database",
      };
   }
}

/**
 * Check if a UPI is registered
 * @param upi Student UPI
 * @returns Promise<boolean>
 */
export async function isRegistered(upi: string): Promise<boolean> {
   try {
      return await RegisteredStudent.isRegisteredStudent(upi);
   } catch (error) {
      console.error("Error checking student registration:", error);
      return false;
   }
}

/**
 * Get all registered students (for admin purposes)
 * @param page Page number (default: 1)
 * @param limit Items per page (default: 100)
 * @returns Promise with paginated results
 */
export async function getAllStudents(page: number = 1, limit: number = 100) {
   try {
      const skip = (page - 1) * limit;
      const students = await RegisteredStudent.find({})
         .select("upi name")
         .sort({ name: 1 })
         .skip(skip)
         .limit(limit)
         .lean();

      const total = await RegisteredStudent.countDocuments();

      return {
         success: true,
         data: {
            students,
            pagination: {
               currentPage: page,
               totalPages: Math.ceil(total / limit),
               totalItems: total,
               itemsPerPage: limit,
            },
         },
      };
   } catch (error) {
      console.error("Error fetching students:", error);
      return {
         success: false,
         message: "Failed to fetch students",
      };
   }
}

/**
 * Remove a student by UPI
 * @param upi Student UPI to remove
 * @returns Promise with operation result
 */
export async function removeStudent(
   upi: string,
): Promise<{ success: boolean; message: string }> {
   try {
      const result = await RegisteredStudent.deleteOne({
         upi: upi.toLowerCase().trim(),
      });

      if (result.deletedCount === 0) {
         return { success: false, message: "Student not found" };
      }

      return { success: true, message: "Student removed successfully" };
   } catch (error) {
      console.error("Error removing student:", error);
      return { success: false, message: "Failed to remove student" };
   }
}

/**
 * Clear all registered students (use with caution)
 * @returns Promise with operation result
 */
export async function clearAllStudents(): Promise<{
   success: boolean;
   message: string;
}> {
   try {
      const result = await RegisteredStudent.deleteMany({});
      return {
         success: true,
         message: `Removed ${result.deletedCount} students`,
      };
   } catch (error) {
      console.error("Error clearing students:", error);
      return { success: false, message: "Failed to clear students" };
   }
}
