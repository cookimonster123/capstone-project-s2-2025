import { Project } from "../models/project.model";
import { Parameter } from "../models/parameter.model";
import {
   validateProjectData,
   validateUpdateProjectData,
   insertProject,
   findAllProjects,
   findProjectById,
   updateProject,
   removeProject,
} from "../services/projectService";

describe("ProjectService", () => {
   let semesterParam: any;
   let categoryParam: any;

   beforeEach(async () => {
      // Create test parameters
      semesterParam = await Parameter.create({
         parameterType: "semester",
         value: "S2 2024",
      });
      categoryParam = await Parameter.create({
         parameterType: "category",
         value: "Web Development",
      });
   });

   describe("validateProjectData", () => {
      it("should validate correct project data", () => {
         const validData = {
            name: "Test Project",
            teamname: "Team Alpha",
            description: "A test project description",
            semester: semesterParam._id.toString(),
            category: categoryParam._id.toString(),
            links: [
               {
                  type: "github" as const,
                  value: "https://github.com/user/repo",
               },
               {
                  type: "deployedWebsite" as const,
                  value: "https://example.com",
               },
            ],
         };

         const result = validateProjectData(validData);
         expect(result.error).toBeUndefined();
         expect(result.value).toEqual(validData);
      });

      it("should reject empty project name", () => {
         const invalidData = {
            name: "",
            teamname: "Team Alpha",
            description: "Description",
            semester: semesterParam._id.toString(),
            category: categoryParam._id.toString(),
            links: [],
         };

         const result = validateProjectData(invalidData);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("name");
      });

      it("should reject project name over 100 characters", () => {
         const invalidData = {
            name: "a".repeat(101),
            teamname: "Team Alpha",
            description: "Description",
            semester: semesterParam._id.toString(),
            category: categoryParam._id.toString(),
            links: [],
         };

         const result = validateProjectData(invalidData);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("name");
      });

      it("should require semester field", () => {
         const invalidData = {
            name: "Test Project",
            teamname: "Team Alpha",
            description: "Description",
            category: categoryParam._id.toString(),
            links: [],
         };

         const result = validateProjectData(invalidData as any);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("semester");
      });

      it("should validate links with correct types and URI format", () => {
         const validData = {
            name: "Test Project",
            teamname: "Team Alpha",
            description: "Description",
            semester: semesterParam._id.toString(),
            category: categoryParam._id.toString(),
            links: [
               {
                  type: "github" as const,
                  value: "https://github.com/user/repo",
               },
               {
                  type: "deployedWebsite" as const,
                  value: "https://example.com",
               },
            ],
         };

         const result = validateProjectData(validData);
         expect(result.error).toBeUndefined();
      });

      it("should reject invalid link types", () => {
         const invalidData = {
            name: "Test Project",
            teamname: "Team Alpha",
            description: "Description",
            semester: semesterParam._id.toString(),
            category: categoryParam._id.toString(),
            links: [
               {
                  type: "invalid" as any,
                  value: "https://github.com/user/repo",
               },
            ],
         };

         const result = validateProjectData(invalidData);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("type");
      });

      it("should reject invalid URI format in links", () => {
         const invalidData = {
            name: "Test Project",
            teamname: "Team Alpha",
            description: "Description",
            semester: semesterParam._id.toString(),
            category: categoryParam._id.toString(),
            links: [{ type: "github" as const, value: "not-a-valid-url" }],
         };

         const result = validateProjectData(invalidData);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("uri");
      });

      it("should allow empty optional fields", () => {
         const validData = {
            name: "Test Project",
            teamname: "",
            description: "",
            semester: semesterParam._id.toString(),
            category: "",
            links: [],
         };

         const result = validateProjectData(validData);
         expect(result.error).toBeUndefined();
      });
   });

   describe("validateUpdateProjectData", () => {
      it("should validate partial update data", () => {
         const validUpdateData = {
            name: "Updated Project Name",
            description: "Updated description",
         };

         const result = validateUpdateProjectData(validUpdateData);
         expect(result.error).toBeUndefined();
         expect(result.value).toEqual(validUpdateData);
      });

      it("should allow updating single fields", () => {
         const validUpdateData = {
            name: "New Name Only",
         };

         const result = validateUpdateProjectData(validUpdateData);
         expect(result.error).toBeUndefined();
      });

      it("should reject empty update data", () => {
         const invalidUpdateData = {};

         const result = validateUpdateProjectData(invalidUpdateData);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("least 1 key");
      });

      it("should validate updated links", () => {
         const validUpdateData = {
            links: [
               {
                  type: "github" as const,
                  value: "https://github.com/updated/repo",
               },
            ],
         };

         const result = validateUpdateProjectData(validUpdateData);
         expect(result.error).toBeUndefined();
      });

      it("should reject invalid links in update", () => {
         const invalidUpdateData = {
            links: [{ type: "github" as const, value: "invalid-url" }],
         };

         const result = validateUpdateProjectData(invalidUpdateData);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("uri");
      });
   });

   describe("insertProject", () => {
      it("should successfully create a new project", async () => {
         const projectData = {
            name: "New Test Project",
            teamname: "Team Beta",
            description: "A new test project",
            semester: semesterParam._id.toString(),
            category: categoryParam._id.toString(),
            links: [
               {
                  type: "github" as const,
                  value: "https://github.com/user/newrepo",
               },
            ],
         };

         const result = await insertProject(projectData);

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(result.data.name).toBe(projectData.name);
            expect(result.data.teamname).toBe(projectData.teamname);
            expect(result.data.description).toBe(projectData.description);
         }

         // Verify project was saved to database
         const savedProject = await Project.findOne({ name: projectData.name });
         expect(savedProject).toBeDefined();
         expect(savedProject!.name).toBe(projectData.name);
      });

      it("should reject invalid project data", async () => {
         const invalidProjectData = {
            name: "", // Empty name should fail validation
            teamname: "Team Beta",
            description: "Description",
            semester: semesterParam._id.toString(),
            category: categoryParam._id.toString(),
            links: [],
         };

         const result = await insertProject(invalidProjectData);

         expect(result.success).toBe(false);
         expect(result.error).toBeDefined();
         expect(result.error).toContain("name");
      });

      it("should handle database errors gracefully", async () => {
         // Mock Project.save to throw an error
         const originalSave = Project.prototype.save;
         Project.prototype.save = jest
            .fn()
            .mockRejectedValue(new Error("Database error"));

         const projectData = {
            name: "Test Project",
            teamname: "Team Alpha",
            description: "Description",
            semester: semesterParam._id.toString(),
            category: categoryParam._id.toString(),
            links: [],
         };

         await expect(insertProject(projectData)).rejects.toThrow(
            "Database error",
         );

         // Restore original method
         Project.prototype.save = originalSave;
      });
   });

   describe("findAllProjects", () => {
      beforeEach(async () => {
         // Create test projects
         await Project.create([
            {
               name: "Project 1",
               teamname: "Team 1",
               description: "First project",
               semester: semesterParam._id,
               category: categoryParam._id,
               links: [],
            },
            {
               name: "Project 2",
               teamname: "Team 2",
               description: "Second project",
               semester: semesterParam._id,
               category: categoryParam._id,
               links: [],
            },
         ]);
      });

      it("should return all projects with populated fields", async () => {
         const result = await findAllProjects();

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBe(2);
            expect(result.data[0].name).toBeDefined();
            expect(result.data[1].name).toBeDefined();
         }
      });

      it("should return empty array when no projects exist", async () => {
         await Project.deleteMany({});

         const result = await findAllProjects();

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBe(0);
         }
      });

      it("should handle database errors gracefully", async () => {
         // Mock Project.find to throw an error
         const originalFind = Project.find;
         Project.find = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
               populate: jest
                  .fn()
                  .mockRejectedValue(new Error("Database error")),
            }),
         });

         await expect(findAllProjects()).rejects.toThrow("Database error");

         // Restore original method
         Project.find = originalFind;
      });
   });

   describe("findProjectById", () => {
      let testProject: any;

      beforeEach(async () => {
         testProject = await Project.create({
            name: "Test Project",
            teamname: "Test Team",
            description: "Test description",
            semester: semesterParam._id,
            category: categoryParam._id,
            links: [],
         });
      });

      it("should return project by valid ID", async () => {
         const result = await findProjectById(testProject._id.toString());

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(result.data._id.toString()).toBe(testProject._id.toString());
            expect(result.data.name).toBe(testProject.name);
         }
      });

      it("should return error for non-existent project ID", async () => {
         const nonExistentId = "507f1f77bcf86cd799439011";
         const result = await findProjectById(nonExistentId);

         expect(result.success).toBe(false);
         expect(result.error).toBe("Project not found");
      });

      it("should handle invalid ObjectId format", async () => {
         const invalidId = "invalid-id";

         await expect(findProjectById(invalidId)).rejects.toBeDefined();
      });
   });

   describe("updateProject", () => {
      let testProject: any;

      beforeEach(async () => {
         testProject = await Project.create({
            name: "Original Project",
            teamname: "Original Team",
            description: "Original description",
            semester: semesterParam._id,
            category: categoryParam._id,
            links: [],
         });
      });

      it("should successfully update project fields", async () => {
         const updateData = {
            name: "Updated Project Name",
            description: "Updated description",
         };

         const result = await updateProject(
            testProject._id.toString(),
            updateData,
         );

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(result.data.name).toBe(updateData.name);
            expect(result.data.description).toBe(updateData.description);
            expect(result.data.teamname).toBe(testProject.teamname); // Unchanged
         }

         // Verify update in database
         const updatedProject = await Project.findById(testProject._id);
         expect(updatedProject!.name).toBe(updateData.name);
         expect(updatedProject!.description).toBe(updateData.description);
      });

      it("should update single field only", async () => {
         const updateData = {
            name: "Only Name Updated",
         };

         const result = await updateProject(
            testProject._id.toString(),
            updateData,
         );

         expect(result.success).toBe(true);
         if (result.data) {
            expect(result.data.name).toBe(updateData.name);
            expect(result.data.description).toBe(testProject.description); // Unchanged
         }
      });

      it("should return error for non-existent project", async () => {
         const nonExistentId = "507f1f77bcf86cd799439011";
         const updateData = { name: "Updated Name" };

         const result = await updateProject(nonExistentId, updateData);

         expect(result.success).toBe(false);
         expect(result.error).toBe("Project not found");
      });

      it("should reject invalid update data", async () => {
         const invalidUpdateData = {
            name: "", // Empty name should fail validation
         };

         const result = await updateProject(
            testProject._id.toString(),
            invalidUpdateData,
         );

         expect(result.success).toBe(false);
         expect(result.error).toBeDefined();
         expect(result.error).toContain("name");
      });

      it("should update links correctly", async () => {
         const updateData = {
            links: [
               {
                  type: "github" as const,
                  value: "https://github.com/updated/repo",
               },
               {
                  type: "deployedWebsite" as const,
                  value: "https://updated-site.com",
               },
            ],
         };

         const result = await updateProject(
            testProject._id.toString(),
            updateData,
         );

         expect(result.success).toBe(true);
         if (result.data) {
            expect(result.data.links).toHaveLength(2);
            expect(result.data.links[0].type).toBe("github");
            expect(result.data.links[0].value).toBe(
               "https://github.com/updated/repo",
            );
         }
      });
   });

   describe("removeProject", () => {
      let testProject: any;

      beforeEach(async () => {
         testProject = await Project.create({
            name: "Project To Delete",
            teamname: "Delete Team",
            description: "Will be deleted",
            semester: semesterParam._id,
            category: categoryParam._id,
            links: [],
         });
      });

      it("should successfully delete existing project", async () => {
         const result = await removeProject(testProject._id.toString());

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(result.data.message).toBe("Project deleted successfully");
         }

         // Verify project was deleted from database
         const deletedProject = await Project.findById(testProject._id);
         expect(deletedProject).toBeNull();
      });

      it("should return error for non-existent project", async () => {
         const nonExistentId = "507f1f77bcf86cd799439011";

         const result = await removeProject(nonExistentId);

         expect(result.success).toBe(false);
         expect(result.error).toBe("Project not found");
      });

      it("should handle invalid ObjectId format", async () => {
         const invalidId = "invalid-id";

         await expect(removeProject(invalidId)).rejects.toBeDefined();
      });

      it("should handle database errors gracefully", async () => {
         // Mock Project.findByIdAndDelete to throw an error
         const originalFindByIdAndDelete = Project.findByIdAndDelete;
         Project.findByIdAndDelete = jest
            .fn()
            .mockRejectedValue(new Error("Database error"));

         await expect(
            removeProject(testProject._id.toString()),
         ).rejects.toThrow("Database error");

         // Restore original method
         Project.findByIdAndDelete = originalFindByIdAndDelete;
      });
   });
});
