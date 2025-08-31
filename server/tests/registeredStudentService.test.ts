import { RegisteredStudent } from "../models/registeredStudent.model";
import {
   bulkAddStudents,
   isRegistered,
   getAllStudents,
   removeStudent,
   clearAllStudents,
} from "../services/registeredStudentService";

describe("RegisteredStudentService", () => {
   describe("bulkAddStudents", () => {
      it("should successfully add valid students", async () => {
         const students = [
            { upi: "jdoe1234", name: "John Doe" },
            { upi: "jsmi5678", name: "Jane Smith" },
            { upi: "bmil9012", name: "Bob Miller" },
         ];

         const result = await bulkAddStudents(students);

         expect(result.success).toBe(true);
         expect(result.message).toContain("Successfully processed 3 students");
         expect(result.stats).toBeDefined();
         if (result.stats) {
            expect(result.stats.total).toBe(3);
            // For new students, they should be upserted (not inserted since we use upsert: true)
            expect(result.stats.upserted).toBeGreaterThan(0);
         }

         // Verify students were saved to database
         const savedStudents = await RegisteredStudent.find({});
         expect(savedStudents.length).toBe(3);
      });

      it("should filter out invalid students and process valid ones", async () => {
         const students = [
            { upi: "jdoe1234", name: "John Doe" }, // Valid
            { upi: "", name: "Invalid Student" }, // Invalid: empty UPI
            { upi: "jsmi5678", name: "" }, // Invalid: empty name
            { upi: "bmil9012", name: "Bob Miller" }, // Valid
            null as any, // Invalid: null entry
            { upi: "ause3456", name: "Alice User" }, // Valid
         ];

         const result = await bulkAddStudents(students);

         expect(result.success).toBe(true);
         expect(result.message).toContain("Successfully processed 3 students");
         expect(result.stats).toBeDefined();
         if (result.stats) {
            expect(result.stats.total).toBe(3);
            // For new students, they should be upserted (not inserted since we use upsert: true)
            expect(result.stats.upserted).toBeGreaterThan(0);
         }

         // Verify valid students were saved to database
         const savedStudents = await RegisteredStudent.find({});
         expect(savedStudents.length).toBe(3);

         // Check that the correct students were saved
         const upis = savedStudents.map((s) => s.upi);
         expect(upis).toContain("jdoe1234");
         expect(upis).toContain("bmil9012");
         expect(upis).toContain("ause3456");
      });
   });
});
