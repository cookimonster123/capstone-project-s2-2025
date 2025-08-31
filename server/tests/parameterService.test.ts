import { Parameter } from "../models/parameter.model";
import {
   validateParameterData,
   createParameter,
   getParametersByType,
   getAllParameters,
} from "../services/parameterService";

describe("ParameterService", () => {
   describe("validateParameterData", () => {
      it("should validate correct parameter data for semester", () => {
         const validData = {
            parameterType: "semester" as const,
         };

         const result = validateParameterData(validData);
         expect(result.error).toBeUndefined();
         expect(result.value).toEqual(validData);
      });

      it("should validate correct parameter data for category", () => {
         const validData = {
            parameterType: "category" as const,
         };

         const result = validateParameterData(validData);
         expect(result.error).toBeUndefined();
         expect(result.value).toEqual(validData);
      });

      it("should reject invalid parameterType", () => {
         const invalidData = {
            parameterType: "invalid" as any,
         };

         const result = validateParameterData(invalidData);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("parameterType");
      });

      it("should require parameterType field", () => {
         const invalidData = {};

         const result = validateParameterData(invalidData as any);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("parameterType");
      });
   });

   describe("createParameter", () => {
      it("should successfully create a semester parameter", async () => {
         const parameterData = {
            parameterType: "semester" as const,
         };

         const result = await createParameter(parameterData);

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(result.data.parameterType).toBe("semester");
         }

         // Verify parameter was saved to database
         const savedParameter = await Parameter.findOne({
            parameterType: "semester",
         });
         expect(savedParameter).toBeDefined();
         expect(savedParameter!.parameterType).toBe("semester");
      });

      it("should successfully create a category parameter", async () => {
         const parameterData = {
            parameterType: "category" as const,
         };

         const result = await createParameter(parameterData);

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(result.data.parameterType).toBe("category");
         }

         // Verify parameter was saved to database
         const savedParameter = await Parameter.findOne({
            parameterType: "category",
         });
         expect(savedParameter).toBeDefined();
         expect(savedParameter!.parameterType).toBe("category");
      });

      it("should reject invalid parameter data", async () => {
         const invalidParameterData = {
            parameterType: "invalid" as any,
         };

         const result = await createParameter(invalidParameterData);

         expect(result.success).toBe(false);
         expect(result.error).toBeDefined();
         expect(result.error).toContain("parameterType");
      });

      it("should handle database errors gracefully", async () => {
         // Mock Parameter.save to throw an error
         const originalSave = Parameter.prototype.save;
         Parameter.prototype.save = jest
            .fn()
            .mockRejectedValue(new Error("Database error"));

         const parameterData = {
            parameterType: "semester" as const,
         };

         await expect(createParameter(parameterData)).rejects.toThrow(
            "Database error",
         );

         // Restore original method
         Parameter.prototype.save = originalSave;
      });
   });

   describe("getParametersByType", () => {
      beforeEach(async () => {
         // Create test parameters
         await Parameter.create([
            { parameterType: "semester", value: "S1 2024" },
            { parameterType: "semester", value: "S2 2024" },
            { parameterType: "category", value: "Web Development" },
            { parameterType: "category", value: "Machine Learning" },
         ]);
      });

      it("should return only semester parameters", async () => {
         const result = await getParametersByType("semester");

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBe(2);
            expect(
               result.data.every(
                  (param: any) => param.parameterType === "semester",
               ),
            ).toBe(true);
         }
      });

      it("should return only category parameters", async () => {
         const result = await getParametersByType("category");

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBe(2);
            expect(
               result.data.every(
                  (param: any) => param.parameterType === "category",
               ),
            ).toBe(true);
         }
      });

      it("should return empty array when no parameters of specified type exist", async () => {
         await Parameter.deleteMany({ parameterType: "semester" });

         const result = await getParametersByType("semester");

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBe(0);
         }
      });

      it("should handle database errors gracefully", async () => {
         // Mock Parameter.find to throw an error
         const originalFind = Parameter.find;
         Parameter.find = jest
            .fn()
            .mockRejectedValue(new Error("Database error"));

         await expect(getParametersByType("semester")).rejects.toThrow(
            "Database error",
         );

         // Restore original method
         Parameter.find = originalFind;
      });
   });

   describe("getAllParameters", () => {
      beforeEach(async () => {
         // Create test parameters
         await Parameter.create([
            { parameterType: "semester", value: "S1 2024" },
            { parameterType: "semester", value: "S2 2024" },
            { parameterType: "category", value: "Web Development" },
            { parameterType: "category", value: "Machine Learning" },
         ]);
      });

      it("should return all parameters regardless of type", async () => {
         const result = await getAllParameters();

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBe(4);

            const semesterParams = result.data.filter(
               (param: any) => param.parameterType === "semester",
            );
            const categoryParams = result.data.filter(
               (param: any) => param.parameterType === "category",
            );

            expect(semesterParams.length).toBe(2);
            expect(categoryParams.length).toBe(2);
         }
      });

      it("should return empty array when no parameters exist", async () => {
         await Parameter.deleteMany({});

         const result = await getAllParameters();

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBe(0);
         }
      });

      it("should handle database errors gracefully", async () => {
         // Mock Parameter.find to throw an error
         const originalFind = Parameter.find;
         Parameter.find = jest
            .fn()
            .mockRejectedValue(new Error("Database error"));

         await expect(getAllParameters()).rejects.toThrow("Database error");

         // Restore original method
         Parameter.find = originalFind;
      });

      it("should return parameters with correct structure", async () => {
         const result = await getAllParameters();

         expect(result.success).toBe(true);
         if (result.data && result.data.length > 0) {
            const parameter = result.data[0];
            expect(parameter).toHaveProperty("parameterType");
            expect(parameter).toHaveProperty("_id");
            expect(["semester", "category"]).toContain(parameter.parameterType);
         }
      });
   });

   describe("Parameter data integrity", () => {
      it("should maintain data consistency across operations", async () => {
         // Create a parameter
         const createResult = await createParameter({
            parameterType: "semester",
         });
         expect(createResult.success).toBe(true);

         // Fetch by type
         const byTypeResult = await getParametersByType("semester");
         expect(byTypeResult.success).toBe(true);
         expect(byTypeResult.data).toHaveLength(1);

         // Fetch all
         const allResult = await getAllParameters();
         expect(allResult.success).toBe(true);
         expect(allResult.data).toHaveLength(1);

         // Verify the same parameter is returned in all cases
         if (createResult.data && byTypeResult.data && allResult.data) {
            expect(createResult.data._id.toString()).toBe(
               byTypeResult.data[0]._id.toString(),
            );
            expect(createResult.data._id.toString()).toBe(
               allResult.data[0]._id.toString(),
            );
         }
      });
   });
});
