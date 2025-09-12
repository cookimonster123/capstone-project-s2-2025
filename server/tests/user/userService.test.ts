// tests/userService.test.ts
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
   validateUserData,
   validateUpdateUserData,
   insertUser,
   findAllUsers,
   findUserById,
   updateUser,
   removeUser,
   linkUserToProject,
   linkUserToTeam,
} from "../../services/userService";
import { Project } from "../../models/project.model";
import { Team } from "../../models/team.model";
import { User } from "../../models/user.model";
import { UserData, UpdateUserData } from "../../interfaces";
import bcrypt from "bcryptjs";

describe("User Service Tests", () => {
   let mongoServer: MongoMemoryServer;
   let testUser: any;

   beforeAll(async () => {
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
      await User.deleteMany({});

      // Create a default test user
      testUser = await User.create({
         name: "Test User",
         email: "test@example.com",
         password: "hashedpassword",
         role: "capstoneStudent",
      });
   });

   afterEach(async () => {
      await User.deleteMany({});
   });

   describe("Data Validation Functions", () => {
      it("validateUserData should accept valid user data", () => {
         const userData: UserData = {
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
            profilePicture: "",
            role: "visitor",
            links: [{ type: "github", value: "https://github.com/john" }],
            project: "",
            team: "",
            lastLogin: new Date(),
         };

         const result = validateUserData(userData);
         expect(result.error).toBeUndefined();
         expect(result.value).toEqual(userData);
      });

      it("validateUserData should reject invalid email", () => {
         const userData: UserData = {
            name: "John Doe",
            email: "not-an-email",
            password: "password123",
            profilePicture: "",
            role: "visitor",
         } as any;

         const result = validateUserData(userData);
         expect(result.error).toBeDefined();
         expect(result.error?.details[0].message).toContain("email");
      });

      it("validateUpdateUserData should accept partial update data", () => {
         const updateData: UpdateUserData = { name: "Updated Name" };
         const result = validateUpdateUserData(updateData);
         expect(result.error).toBeUndefined();
      });

      it("validateUpdateUserData should reject empty update object", () => {
         const result = validateUpdateUserData({});
         expect(result.error).toBeDefined();
      });
   });

   describe("Core CRUD Operations", () => {
      it("insertUser should create a new user", async () => {
         const userData: UserData = {
            name: "Jane Doe",
            email: "jane@example.com",
            password: "password123",
            role: "visitor",
            profilePicture: "",
         };

         const result = await insertUser(userData);
         expect(result.success).toBe(true);
         expect(result.data).toHaveProperty("name", "Jane Doe");
         expect(result.data.password).toBeUndefined();

         const dbUser = await User.findOne({ email: "jane@example.com" });
         expect(dbUser).not.toBeNull();
         expect(dbUser!.password).not.toBe(userData.password);
      });

      it("insertUser should fail if email already exists", async () => {
         const userData: UserData = {
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            role: "visitor",
            profilePicture: "",
         };

         const result = await insertUser(userData);
         expect(result.success).toBe(false);
         expect(result.error).toBe("A user with this email already exists");
      });

      it("findAllUsers should return all users", async () => {
         const result = await findAllUsers();
         expect(result.success).toBe(true);
         expect(Array.isArray(result.data)).toBe(true);
         expect(result.data.length).toBe(1);
         expect(result.data[0].password).toBeUndefined();
      });

      it("findUserById should return a user by valid ID", async () => {
         const result = await findUserById(testUser._id.toString());
         expect(result.success).toBe(true);
         expect(result.data.email).toBe("test@example.com");
         expect(result.data.password).toBeUndefined();
      });

      it("findUserById should return error for non-existent user", async () => {
         const result = await findUserById(
            new mongoose.Types.ObjectId().toString(),
         );
         expect(result.success).toBe(false);
         expect(result.error).toBe("User not found");
      });

      it("updateUser should update user fields", async () => {
         const updateData: UpdateUserData = {
            name: "Updated Name",
            password: "newpass123",
         };
         const result = await updateUser(testUser._id.toString(), updateData);

         expect(result.success).toBe(true);
         expect(result.data.name).toBe("Updated Name");
         expect(result.data.password).toBeUndefined();

         const dbUser = await User.findById(testUser._id).select("+password");
         expect(await bcrypt.compare("newpass123", dbUser!.password));
      });

      it("updateUser should return error for non-existent user", async () => {
         const result = await updateUser(
            new mongoose.Types.ObjectId().toString(),
            { name: "X" },
         );
         expect(result.success).toBe(false);
         expect(result.error).toBe("User not found");
      });

      it("updateUser should reject invalid data", async () => {
         const result = await updateUser(testUser._id.toString(), {
            email: "invalid-email",
         } as any);
         expect(result.success).toBe(false);
         expect(result.error).toBeDefined();
      });
   });

   describe("Edge Cases", () => {
      it("insertUser should handle missing optional fields", async () => {
         const userData: UserData = {
            name: "No Optional Fields",
            email: "noopt@example.com",
            password: "password123",
         } as any;

         const result = await insertUser(userData);
         expect(result.success).toBe(true);
         expect(result.data.name).toBe("No Optional Fields");
      });

      it("updateUser should reject empty update object", async () => {
         const result = await updateUser(testUser._id.toString(), {});
         expect(result.success).toBe(false);
         expect(result.error).toBe("No update data provided");
      });
   });

   describe("User-Service with Team & Project Relations", () => {
      let testTeam: any;
      let testProject: any;

      beforeEach(async () => {
         // Clear previous Teams and Projects
         await Team.deleteMany({});
         await Project.deleteMany({});

         // Create a test team
         testTeam = await Team.create({ name: "Alpha Team", members: [] });

         // Create a test project linked to the team
         testProject = await Project.create({
            name: "Alpha Project",
            team: testTeam._id,
            semester: new mongoose.Types.ObjectId(), // dummy semester
         });

         // Assign project to team
         testTeam.project = testProject._id;
         await testTeam.save();

         // Link the existing testUser to team & project
         testUser.team = testTeam._id;
         testUser.project = testProject._id;
         await testUser.save();

         // Update team members array
         await Team.findByIdAndUpdate(testTeam._id, {
            $push: { members: testUser._id },
         });
      });

      afterEach(async () => {
         // Cleanup Teams and Projects after each test
         await Team.deleteMany({});
         await Project.deleteMany({});
      });

      it("findAllUsers should populate team and project", async () => {
         const result = await findAllUsers();
         expect(result.success).toBe(true);
         const user = result.data[0];
         expect(user.team._id.toString()).toBe(testTeam._id.toString());
         expect(user.project._id.toString()).toBe(testProject._id.toString());
      });

      it("findUserById should return populated team and project", async () => {
         const result = await findUserById(testUser._id.toString());
         expect(result.success).toBe(true);
         expect(result.data.team._id.toString()).toBe(testTeam._id.toString());
         expect(result.data.project._id.toString()).toBe(
            testProject._id.toString(),
         );
      });

      it("updateUser should allow changing team and project", async () => {
         const newTeam = await Team.create({ name: "Beta Team", members: [] });
         const newProject = await Project.create({
            name: "Beta Project",
            team: newTeam._id,
            semester: new mongoose.Types.ObjectId(),
         });

         const updateData = {
            team: newTeam._id.toString(),
            project: newProject._id.toString(),
         };

         const result = await updateUser(testUser._id.toString(), updateData);
         expect(result.success).toBe(true);
         expect(result.data.team._id.toString()).toBe(newTeam._id.toString());
         expect(result.data.project._id.toString()).toBe(
            newProject._id.toString(),
         );
      });
   });

   describe("Remove User", () => {
      it("should remove a user by valid ID", async () => {
         const user = new User({
            name: "Delete Me",
            email: "delete@example.com",
            password: "password123",
            role: "visitor",
         });
         await user.save();

         const result = await removeUser(user._id.toString());

         expect(result.success).toBe(true);
         expect(result.data).toHaveProperty("email", "delete@example.com");

         const dbUser = await User.findById(user._id);
         expect(dbUser).toBeNull();
      });

      it("should return error if user does not exist", async () => {
         const fakeId = new mongoose.Types.ObjectId().toString();
         const result = await removeUser(fakeId);

         expect(result.success).toBe(false);
         expect(result.error).toBe("User not found");
      });

      it("should return error for invalid user ID", async () => {
         const result = await removeUser("invalid-id");

         expect(result.success).toBe(false);
         expect(result.error).toBe("Invalid user ID");
      });
   });

   describe("User-Service Linking Functions", () => {
      let testTeam: any;
      let testProject: any;

      beforeEach(async () => {
         // Clear previous Teams and Projects
         await Team.deleteMany({});
         await Project.deleteMany({});

         // Create a test team
         testTeam = await Team.create({ name: "Alpha Team", members: [] });

         // Create a test project
         testProject = await Project.create({
            name: "Alpha Project",
            team: testTeam._id,
            semester: new mongoose.Types.ObjectId(),
         });

         // Assign project to team
         testTeam.project = testProject._id;
         await testTeam.save();

         // Link the existing testUser to team & project
         testUser.team = testTeam._id;
         testUser.project = testProject._id;
         await testUser.save();
      });

      afterEach(async () => {
         await Team.deleteMany({});
         await Project.deleteMany({});
      });

      describe("linkUserToProject", () => {
         it("should link a user to a project", async () => {
            await linkUserToProject(
               testUser._id.toString(),
               testProject._id.toString(),
            );

            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser!.project?.toString()).toBe(
               testProject._id.toString(),
            );
         });

         it("should throw error if project does not exist", async () => {
            const fakeProjectId = new mongoose.Types.ObjectId().toString();
            await expect(
               linkUserToProject(testUser._id.toString(), fakeProjectId),
            ).rejects.toThrow("Project not found");
         });

         it("should throw error if user does not exist", async () => {
            const fakeUserId = new mongoose.Types.ObjectId().toString();
            await expect(
               linkUserToProject(fakeUserId, testProject._id.toString()),
            ).rejects.toThrow("User not found");
         });
      });

      describe("linkUserToTeam", () => {
         it("should link a user to a team", async () => {
            await linkUserToTeam(
               testUser._id.toString(),
               testTeam._id.toString(),
            );

            const updatedUser = await User.findById(testUser._id);
            expect(updatedUser!.team?.toString()).toBe(testTeam._id.toString());
         });

         it("should throw error if team does not exist", async () => {
            const fakeTeamId = new mongoose.Types.ObjectId().toString();
            await expect(
               linkUserToTeam(testUser._id.toString(), fakeTeamId),
            ).rejects.toThrow("Team not found");
         });

         it("should throw error if user does not exist", async () => {
            const fakeUserId = new mongoose.Types.ObjectId().toString();
            await expect(
               linkUserToTeam(fakeUserId, testTeam._id.toString()),
            ).rejects.toThrow("User not found");
         });
      });
   });
});
