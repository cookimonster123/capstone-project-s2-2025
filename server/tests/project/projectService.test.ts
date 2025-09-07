import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
   validateProjectData,
   validateUpdateProjectData,
   insertProject,
   findAllProjects,
   findProjectById,
   updateProject,
   removeProject,
   teamHasProject,
   linkProjectToTeam,
   linkProjectToTeamMembers,
} from "../../services/projectService";
import { Project } from "../../models/project.model";
import { Team } from "../../models/team.model";
import { User } from "../../models/user.model";
import { Semester } from "../../models/semester.model";
import { Category } from "../../models/category.model";
import { ProjectData, UpdateProjectData } from "../../interfaces";

describe("Project Service Tests", () => {
   let mongoServer: MongoMemoryServer;
   let testSemester: any;
   let testCategory: any;
   let testTeam: any;
   let testUser: any;
   let testProject: any;

   beforeAll(async () => {
      // Ensure mongoose is disconnected first
      if (mongoose.connection.readyState !== 0) {
         await mongoose.disconnect();
      }

      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
   });

   afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
   });

   beforeEach(async () => {
      // Clear all collections
      await Project.deleteMany({});
      await Team.deleteMany({});
      await User.deleteMany({});
      await Semester.deleteMany({});
      await Category.deleteMany({});

      // Create test data
      testSemester = await Semester.create({
         year: 2024,
         semester: "S2",
         isActive: true,
         startDate: new Date("2024-07-15"),
         endDate: new Date("2024-11-15"),
      });

      testCategory = await Category.create({
         name: "Web Application",
         description: "Full-stack web applications",
      });

      testTeam = await Team.create({
         name: "Test Team",
         members: [],
      });

      testUser = await User.create({
         name: "Test User",
         email: "test@example.com",
         password: "hashedpassword",
         role: "capstoneStudent",
         team: testTeam._id,
      });

      // Update team with user
      await Team.findByIdAndUpdate(testTeam._id, {
         $push: { members: testUser._id },
      });
   });

   afterEach(async () => {
      await Project.deleteMany({});
      await Team.deleteMany({});
      await User.deleteMany({});
      await Semester.deleteMany({});
      await Category.deleteMany({});
   });

   describe("Data Validation Functions", () => {
      describe("validateProjectData()", () => {
         it("should validate correct project data", () => {
            const validData: ProjectData = {
               name: "Test Project",
               teamId: testTeam._id.toString(),
               description: "A test project",
               semester: testSemester._id.toString(),
               category: testCategory._id.toString(),
               links: [
                  {
                     type: "github",
                     value: "https://github.com/test/project",
                  },
               ],
            };

            const result = validateProjectData(validData);
            expect(result.error).toBeUndefined();
            expect(result.value).toEqual(validData);
         });

         it("should reject data with missing required name", () => {
            const invalidData = {
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
            } as ProjectData;

            const result = validateProjectData(invalidData);
            expect(result.error).toBeDefined();
            expect(result.error?.details[0].message).toContain("name");
         });

         it("should reject data with missing required semester", () => {
            const invalidData = {
               name: "Test Project",
               teamId: testTeam._id.toString(),
            } as ProjectData;

            const result = validateProjectData(invalidData);
            expect(result.error).toBeDefined();
            expect(result.error?.details[0].message).toContain("semester");
         });

         it("should reject name that is too long", () => {
            const invalidData: ProjectData = {
               name: "a".repeat(101), // Exceeds 100 character limit
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
            };

            const result = validateProjectData(invalidData);
            expect(result.error).toBeDefined();
            expect(result.error?.details[0].message).toContain("length");
         });

         it("should reject empty name", () => {
            const invalidData: ProjectData = {
               name: "",
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
            };

            const result = validateProjectData(invalidData);
            expect(result.error).toBeDefined();
         });

         it("should reject invalid link types", () => {
            const invalidData: ProjectData = {
               name: "Test Project",
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
               links: [
                  {
                     type: "invalid" as any,
                     value: "https://example.com",
                  },
               ],
            };

            const result = validateProjectData(invalidData);
            expect(result.error).toBeDefined();
         });

         it("should reject invalid URLs in links", () => {
            const invalidData: ProjectData = {
               name: "Test Project",
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
               links: [
                  {
                     type: "github",
                     value: "not-a-url",
                  },
               ],
            };

            const result = validateProjectData(invalidData);
            expect(result.error).toBeDefined();
         });

         it("should accept data with optional fields missing", () => {
            const validData: ProjectData = {
               name: "Test Project",
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
            };

            const result = validateProjectData(validData);
            expect(result.error).toBeUndefined();
         });
      });

      describe("validateUpdateProjectData()", () => {
         it("should validate partial update data", () => {
            const validUpdateData: UpdateProjectData = {
               name: "Updated Project Name",
            };

            const result = validateUpdateProjectData(validUpdateData);
            expect(result.error).toBeUndefined();
         });

         it("should reject empty update object", () => {
            const emptyData = {};

            const result = validateUpdateProjectData(emptyData);
            expect(result.error).toBeDefined();
         });

         it("should validate multiple field updates", () => {
            const validUpdateData: UpdateProjectData = {
               name: "Updated Name",
               description: "Updated description",
               category: testCategory._id.toString(),
            };

            const result = validateUpdateProjectData(validUpdateData);
            expect(result.error).toBeUndefined();
         });
      });
   });

   describe("Core CRUD Operations", () => {
      describe("insertProject()", () => {
         it("should successfully create a new project", async () => {
            const projectData: ProjectData = {
               name: "New Project",
               teamId: testTeam._id.toString(),
               description: "A new test project",
               semester: testSemester._id.toString(),
               category: testCategory._id.toString(),
            };

            const result = await insertProject(projectData);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.name).toBe("New Project");
            expect(result.data?.team.toString()).toBe(testTeam._id.toString());
         });

         it("should reject invalid project data", async () => {
            const invalidData = {
               teamId: testTeam._id.toString(),
               // Missing required name and semester
            } as ProjectData;

            const result = await insertProject(invalidData);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
         });

         it("should reject project for team that already has a project", async () => {
            // First create a project for the team
            const firstProject: ProjectData = {
               name: "First Project",
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
            };

            await insertProject(firstProject);

            // Try to create another project for the same team
            const secondProject: ProjectData = {
               name: "Second Project",
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
            };

            const result = await insertProject(secondProject);

            expect(result.success).toBe(false);
            expect(result.error).toBe("This team already has a project");
         });

         it("should properly map teamId to team field", async () => {
            const projectData: ProjectData = {
               name: "Mapping Test Project",
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
            };

            const result = await insertProject(projectData);

            expect(result.success).toBe(true);

            // Verify the project was saved with the correct team reference
            const savedProject = await Project.findById(result.data?._id);
            expect(savedProject?.team.toString()).toBe(testTeam._id.toString());
         });
      });

      describe("findAllProjects()", () => {
         beforeEach(async () => {
            // Create multiple test projects
            await Project.create({
               name: "Project 1",
               team: testTeam._id,
               semester: testSemester._id,
               category: testCategory._id,
            });

            await Project.create({
               name: "Project 2",
               team: testTeam._id,
               semester: testSemester._id,
            });
         });

         it("should return all projects", async () => {
            const result = await findAllProjects();

            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data?.length).toBe(2);
         });

         it("should populate semester and category fields", async () => {
            const result = await findAllProjects();

            expect(result.success).toBe(true);
            const projects = result.data as any[];

            // Check that populated fields have properties beyond just _id
            const projectWithCategory = projects.find((p) => p.category);
            if (projectWithCategory) {
               expect(projectWithCategory.category.name).toBeDefined();
            }

            expect(projects[0].semester.year).toBeDefined();
         });

         it("should return empty array when no projects exist", async () => {
            await Project.deleteMany({});

            const result = await findAllProjects();

            expect(result.success).toBe(true);
            expect(result.data).toEqual([]);
         });
      });

      describe("findProjectById()", () => {
         let createdProject: any;

         beforeEach(async () => {
            createdProject = await Project.create({
               name: "Test Project",
               team: testTeam._id,
               semester: testSemester._id,
               category: testCategory._id,
            });
         });

         it("should return project by valid ID", async () => {
            const result = await findProjectById(createdProject._id.toString());

            expect(result.success).toBe(true);
            expect(result.data?.name).toBe("Test Project");
            expect(result.data?.semester.year).toBeDefined(); // Check population
         });

         it("should return error for non-existent project", async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const result = await findProjectById(nonExistentId);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Project not found");
         });

         it("should handle invalid ObjectId format", async () => {
            const result = await findProjectById("invalid-id");

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
         });
      });

      describe("updateProject()", () => {
         let createdProject: any;

         beforeEach(async () => {
            createdProject = await Project.create({
               name: "Original Project",
               team: testTeam._id,
               semester: testSemester._id,
               description: "Original description",
            });
         });

         it("should successfully update project", async () => {
            const updateData: UpdateProjectData = {
               name: "Updated Project Name",
               description: "Updated description",
            };

            const result = await updateProject(
               createdProject._id.toString(),
               updateData,
            );

            expect(result.success).toBe(true);
            expect(result.data?.name).toBe("Updated Project Name");
            expect(result.data?.description).toBe("Updated description");
         });

         it("should return error for non-existent project", async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const updateData: UpdateProjectData = {
               name: "Updated Name",
            };

            const result = await updateProject(nonExistentId, updateData);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Project not found");
         });

         it("should reject invalid update data", async () => {
            const invalidUpdateData = {
               name: "", // Empty name should fail validation
            };

            const result = await updateProject(
               createdProject._id.toString(),
               invalidUpdateData,
            );

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
         });

         it("should update only provided fields", async () => {
            const updateData: UpdateProjectData = {
               name: "Only Name Updated",
            };

            const result = await updateProject(
               createdProject._id.toString(),
               updateData,
            );

            expect(result.success).toBe(true);
            expect(result.data?.name).toBe("Only Name Updated");
            expect(result.data?.description).toBe("Original description"); // Should remain unchanged
         });
      });

      describe("removeProject()", () => {
         let createdProject: any;

         beforeEach(async () => {
            createdProject = await Project.create({
               name: "Project to Delete",
               team: testTeam._id,
               semester: testSemester._id,
            });
         });

         it("should successfully delete project", async () => {
            const result = await removeProject(createdProject._id.toString());

            expect(result.success).toBe(true);
            expect(result.data?.message).toBe("Project deleted successfully");

            // Verify project is actually deleted
            const deletedProject = await Project.findById(createdProject._id);
            expect(deletedProject).toBeNull();
         });

         it("should return error for non-existent project", async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const result = await removeProject(nonExistentId);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Project not found");
         });
      });
   });

   describe("Helper Functions", () => {
      describe("teamHasProject()", () => {
         it("should return true when team has a project", async () => {
            await Project.create({
               name: "Team Project",
               team: testTeam._id,
               semester: testSemester._id,
            });

            const result = await teamHasProject(testTeam._id.toString());
            expect(result).toBe(true);
         });

         it("should return false when team has no project", async () => {
            const result = await teamHasProject(testTeam._id.toString());
            expect(result).toBe(false);
         });

         it("should return false for non-existent team", async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            const result = await teamHasProject(nonExistentId);
            expect(result).toBe(false);
         });
      });

      describe("linkProjectToTeam()", () => {
         let createdProject: any;

         beforeEach(async () => {
            createdProject = await Project.create({
               name: "Project to Link",
               team: testTeam._id,
               semester: testSemester._id,
            });
         });

         it("should successfully link project to team", async () => {
            await linkProjectToTeam(
               createdProject._id.toString(),
               testTeam._id.toString(),
            );

            const updatedTeam = await Team.findById(testTeam._id);
            expect(updatedTeam?.project?.toString()).toBe(
               createdProject._id.toString(),
            );
         });

         it("should throw error for non-existent team", async () => {
            const nonExistentTeamId = new mongoose.Types.ObjectId().toString();

            await expect(
               linkProjectToTeam(
                  createdProject._id.toString(),
                  nonExistentTeamId,
               ),
            ).rejects.toThrow("Team not found");
         });
      });

      describe("linkProjectToTeamMembers()", () => {
         let createdProject: any;
         let additionalUser: any;

         beforeEach(async () => {
            createdProject = await Project.create({
               name: "Project for Team Members",
               team: testTeam._id,
               semester: testSemester._id,
            });

            // Create additional user and add to team
            additionalUser = await User.create({
               name: "Additional User",
               email: "additional@example.com",
               password: "hashedpassword",
               role: "capstoneStudent",
               team: testTeam._id,
            });

            await Team.findByIdAndUpdate(testTeam._id, {
               $push: { members: additionalUser._id },
            });
         });

         it("should link project to all team members", async () => {
            await linkProjectToTeamMembers(
               createdProject._id.toString(),
               testTeam._id.toString(),
            );

            const updatedUser1 = await User.findById(testUser._id);
            const updatedUser2 = await User.findById(additionalUser._id);

            expect(updatedUser1?.project?.toString()).toBe(
               createdProject._id.toString(),
            );
            expect(updatedUser2?.project?.toString()).toBe(
               createdProject._id.toString(),
            );
         });

         it("should handle team with no members gracefully", async () => {
            const emptyTeam = await Team.create({
               name: "Empty Team",
               members: [],
            });

            await expect(
               linkProjectToTeamMembers(
                  createdProject._id.toString(),
                  emptyTeam._id.toString(),
               ),
            ).resolves.not.toThrow();
         });

         it("should throw error for non-existent team", async () => {
            const nonExistentTeamId = new mongoose.Types.ObjectId().toString();

            await expect(
               linkProjectToTeamMembers(
                  createdProject._id.toString(),
                  nonExistentTeamId,
               ),
            ).rejects.toThrow("Team not found");
         });
      });
   });

   describe("Integration Tests", () => {
      describe("Complete Project Creation Flow", () => {
         it("should create project and establish all relationships", async () => {
            const projectData: ProjectData = {
               name: "Integration Test Project",
               teamId: testTeam._id.toString(),
               description: "Full workflow test",
               semester: testSemester._id.toString(),
               category: testCategory._id.toString(),
            };

            // Step 1: Create project
            const createResult = await insertProject(projectData);
            expect(createResult.success).toBe(true);

            const projectId = createResult.data?._id?.toString();
            expect(projectId).toBeDefined();

            // Step 2: Link to team
            await linkProjectToTeam(projectId!, testTeam._id.toString());

            // Step 3: Link to team members
            await linkProjectToTeamMembers(projectId!, testTeam._id.toString());

            // Verify all relationships
            const updatedTeam = await Team.findById(testTeam._id);
            const updatedUser = await User.findById(testUser._id);
            const createdProject = await Project.findById(projectId);

            expect(updatedTeam?.project?.toString()).toBe(projectId);
            expect(updatedUser?.project?.toString()).toBe(projectId);
            expect(createdProject?.team?.toString()).toBe(
               testTeam._id.toString(),
            );
         });
      });

      describe("Team Project Constraint", () => {
         it("should enforce one project per team rule", async () => {
            // Create first project
            const firstProjectData: ProjectData = {
               name: "First Project",
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
            };

            const firstResult = await insertProject(firstProjectData);
            expect(firstResult.success).toBe(true);

            // Attempt to create second project for same team
            const secondProjectData: ProjectData = {
               name: "Second Project",
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
            };

            const secondResult = await insertProject(secondProjectData);
            expect(secondResult.success).toBe(false);
            expect(secondResult.error).toBe("This team already has a project");
         });
      });
   });

   describe("Error Handling & Edge Cases", () => {
      describe("Database Error Scenarios", () => {
         it("should handle database connection issues gracefully", async () => {
            // Close the connection to simulate network failure
            await mongoose.disconnect();

            const projectData: ProjectData = {
               name: "Test Project",
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
            };

            await expect(insertProject(projectData)).rejects.toThrow();

            // Reconnect for cleanup
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
         });
      });

      describe("Input Edge Cases", () => {
         it("should handle extremely long strings", async () => {
            const projectData: ProjectData = {
               name: "a".repeat(1000), // Very long name
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
            };

            const result = await insertProject(projectData);
            expect(result.success).toBe(false);
         });

         it("should handle special characters in project names", async () => {
            const projectData: ProjectData = {
               name: "Project with émojis 🚀 and spëcial çharacters",
               teamId: testTeam._id.toString(),
               semester: testSemester._id.toString(),
            };

            const result = await insertProject(projectData);
            expect(result.success).toBe(true);
            expect(result.data?.name).toBe(projectData.name);
         });

         it("should handle null/undefined in optional fields", async () => {
            const projectData: ProjectData = {
               name: "Test Project",
               teamId: testTeam._id.toString(),
               description: undefined,
               semester: testSemester._id.toString(),
               category: undefined,
               links: undefined,
            };

            const result = await insertProject(projectData);
            expect(result.success).toBe(true);
         });
      });
   });

   describe("Performance Tests", () => {
      describe("Large Dataset Operations", () => {
         it("should handle querying large number of projects", async () => {
            // Create multiple projects
            const projects = Array.from({ length: 50 }, (_, i) => ({
               name: `Project ${i}`,
               team: testTeam._id,
               semester: testSemester._id,
            }));

            await Project.insertMany(projects);

            const startTime = Date.now();
            const result = await findAllProjects();
            const endTime = Date.now();

            expect(result.success).toBe(true);
            expect(result.data?.length).toBe(50);
            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
         });

         it("should efficiently update many team members", async () => {
            // Create team with many members
            const users = Array.from({ length: 20 }, (_, i) => ({
               name: `User ${i}`,
               email: `user${i}@example.com`,
               password: "hashedpassword",
               role: "capstoneStudent",
               team: testTeam._id,
            }));

            const createdUsers = await User.insertMany(users);

            await Team.findByIdAndUpdate(testTeam._id, {
               members: createdUsers.map((u) => u._id),
            });

            const project = await Project.create({
               name: "Performance Test Project",
               team: testTeam._id,
               semester: testSemester._id,
            });

            const startTime = Date.now();
            await linkProjectToTeamMembers(
               project._id.toString(),
               testTeam._id.toString(),
            );
            const endTime = Date.now();

            // Verify all users were updated
            const updatedUsers = await User.find({ team: testTeam._id });
            const usersWithProject = updatedUsers.filter(
               (u) => u.project?.toString() === project._id.toString(),
            );

            expect(usersWithProject.length).toBe(20); // 20 new users (testUser is not in the same team)
            expect(endTime - startTime).toBeLessThan(500); // Should be fast with bulk update
         });
      });
   });
});
