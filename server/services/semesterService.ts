import Joi from "joi";
import { Semester } from "../models/semester.model";
import { ServiceResult } from "../interfaces/common";
import { GetSemesterQuery, SemesterPayload } from "../interfaces/semester";

const semesterSchema = Joi.object<SemesterPayload>({
   year: Joi.number().integer().min(2000).max(2100).required(),
   semester: Joi.string().valid("S1", "S2").required(),
   isActive: Joi.boolean().optional(),
   startDate: Joi.date().optional(),
   endDate: Joi.date().optional(),
}).custom((value, helpers) => {
   if (value.startDate && value.endDate && value.endDate < value.startDate) {
      return helpers.error("any.invalid");
   }
   return value;
}, "startDate before endDate validation");

export async function createSemester(
   payload: SemesterPayload,
): Promise<ServiceResult> {
   try {
      const { error } = semesterSchema.validate(payload);
      if (error) {
         return { success: false, error: error.details[0].message };
      }

      const exists = await Semester.findOne({
         year: payload.year,
         semester: payload.semester,
      }).lean();
      if (exists) {
         return { success: false, error: "SEMESTER_EXISTS" };
      }

      const created = await Semester.create(payload);
      return { success: true, data: created };
   } catch (err: any) {
      console.error("Error creating semester:", err);
      return { success: false, error: err?.message || "Unknown error" };
   }
}

export async function deleteSemesters(filter: {
   id?: string;
   year?: number;
   semester?: "S1" | "S2";
}): Promise<ServiceResult<{ deletedCount: number }>> {
   try {
      let deletedCount = 0;
      if (filter.id) {
         const res = await Semester.deleteOne({ _id: filter.id });
         deletedCount = res.deletedCount || 0;
         return {
            success: deletedCount > 0,
            data: { deletedCount },
            error: deletedCount ? undefined : "SEMESTER_NOT_FOUND",
         };
      }

      const q: any = {};
      if (typeof filter.year === "number") q.year = filter.year;
      if (filter.semester === "S1" || filter.semester === "S2")
         q.semester = filter.semester;
      if (Object.keys(q).length === 0) {
         return { success: false, error: "DELETE_FILTER_REQUIRED" };
      }

      const res = await Semester.deleteMany(q);
      deletedCount = res.deletedCount || 0;
      return { success: true, data: { deletedCount } };
   } catch (err: any) {
      console.error("Error deleting semesters:", err);
      return { success: false, error: err?.message || "Unknown error" };
   }
}

export async function getSemesters(
   query: GetSemesterQuery = {},
): Promise<ServiceResult> {
   try {
      const filter: any = {};
      if (typeof query.year === "number") filter.year = query.year;
      if (query.semester === "S1" || query.semester === "S2")
         filter.semester = query.semester;
      if (typeof query.isActive === "boolean") filter.isActive = query.isActive;

      const semesters = await Semester.find(filter)
         .sort({ year: -1, semester: 1 })
         .lean();
      return { success: true, data: semesters };
   } catch (err: any) {
      console.error("Error fetching semesters:", err);
      return { success: false, error: err?.message || "Unknown error" };
   }
}

export async function getSemesterById(id: string): Promise<ServiceResult> {
   try {
      const doc = await Semester.findById(id).lean();
      if (!doc) return { success: false, error: "SEMESTER_NOT_FOUND" };
      return { success: true, data: doc };
   } catch (err: any) {
      console.error("Error fetching semester by id:", err);
      return { success: false, error: err?.message || "Unknown error" };
   }
}
