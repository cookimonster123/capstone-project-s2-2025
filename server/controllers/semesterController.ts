import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
   createSemester as createSemesterSvc,
   getSemesters as getSemestersSvc,
   getSemesterById as getSemesterByIdSvc,
   deleteSemesters as deleteSemestersSvc,
} from "../services/semesterService";

export const createSemester = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const result = await createSemesterSvc(req.body);
      if (!result.success) {
         const status = result.error === "SEMESTER_EXISTS" ? 409 : 400;
         res.status(status).json({ error: result.error });
         return;
      }
      res.status(201).json({
         message: "Semester created",
         semester: result.data,
      });
   } catch (error) {
      console.error("Error in createSemester controller:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

export const deleteSemester = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const { id } = req.params;
      const { year, semester } = req.body || {};

      const result = await deleteSemestersSvc({ id, year, semester });
      if (!result.success) {
         const status = result.error === "SEMESTER_NOT_FOUND" ? 404 : 400;
         res.status(status).json({ error: result.error });
         return;
      }
      res.status(200).json({ message: "Semester(s) deleted", ...result.data });
   } catch (error) {
      console.error("Error in deleteSemester controller:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};

export const getSemester = async (
   req: AuthRequest,
   res: Response,
): Promise<void> => {
   try {
      const { id } = req.params;
      if (id) {
         const result = await getSemesterByIdSvc(id);
         if (!result.success) {
            const status = result.error === "SEMESTER_NOT_FOUND" ? 404 : 400;
            res.status(status).json({ error: result.error });
            return;
         }
         res.status(200).json({ semester: result.data });
         return;
      }

      // Query list
      const year = req.query.year ? Number(req.query.year) : undefined;
      const semester =
         (req.query.semester as "S1" | "S2" | undefined) || undefined;
      const isActive =
         typeof req.query.isActive !== "undefined"
            ? String(req.query.isActive).toLowerCase() === "true"
            : undefined;

      const result = await getSemestersSvc({ year, semester, isActive });
      if (!result.success) {
         res.status(400).json({ error: result.error });
         return;
      }
      res.status(200).json({ semesters: result.data });
   } catch (error) {
      console.error("Error in getSemester controller:", error);
      res.status(500).json({ error: "Internal server error" });
   }
};
