import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../models/user.model";
import { RegisteredStudent } from "../../models/registeredStudent.model";
import {
   validateUserRegistration,
   checkCapstoneStudent,
   hashPassword,
   generateToken,
   registerUser,
} from "../../services/authService";

// Mock environment variables
process.env.JWT_SECRET = "test_jwt_secret_key_for_testing_purposes_only";

describe("AuthService", () => {
   describe("validateUserRegistration", () => {
      it("should validate correct user registration data", () => {
         const validData = {
            name: "John Doe",
            email: "john.doe@example.com",
            password: "password123",
            profilePicture: "",
            role: "visitor" as const,
            links: [],
            project: "",
         };

         const result = validateUserRegistration(validData);
         expect(result.error).toBeUndefined();
         expect(result.value).toEqual(validData);
      });

      it("should reject invalid email format", () => {
         const invalidData = {
            name: "John Doe",
            email: "invalid-email",
            password: "password123",
            profilePicture: "",
            role: "visitor" as const,
            links: [],
            project: "",
         };

         const result = validateUserRegistration(invalidData);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("email");
      });

      it("should reject short passwords", () => {
         const invalidData = {
            name: "John Doe",
            email: "john.doe@example.com",
            password: "123",
            profilePicture: "",
            role: "visitor" as const,
            links: [],
            project: "",
         };

         const result = validateUserRegistration(invalidData);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("password");
      });

      it("should reject empty name", () => {
         const invalidData = {
            name: "",
            email: "john.doe@example.com",
            password: "password123",
            profilePicture: "",
            role: "visitor" as const,
            links: [],
            project: "",
         };

         const result = validateUserRegistration(invalidData);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("name");
      });

      it("should reject invalid role", () => {
         const invalidData = {
            name: "John Doe",
            email: "john.doe@example.com",
            password: "password123",
            profilePicture: "",
            role: "invalidRole" as any,
            links: [],
            project: "",
         };

         const result = validateUserRegistration(invalidData);
         expect(result.error).toBeDefined();
         expect(result.error.details[0].message).toContain("role");
      });

      it("should validate links with correct types and values", () => {
         const validData = {
            name: "John Doe",
            email: "john.doe@example.com",
            password: "password123",
            profilePicture: "",
            role: "visitor" as const,
            links: [
               { type: "github" as const, value: "https://github.com/johndoe" },
               {
                  type: "linkedin" as const,
                  value: "https://linkedin.com/in/johndoe",
               },
            ],
            project: "",
         };

         const result = validateUserRegistration(validData);
         expect(result.error).toBeUndefined();
      });
   });

   describe("checkCapstoneStudent", () => {
      beforeEach(async () => {
         // Create a test registered student
         await RegisteredStudent.create({
            upi: "jdoe1234",
            name: "John Doe",
         });
      });

      it("should return true for registered capstone student with aucklanduni.ac.nz domain", async () => {
         const result = await checkCapstoneStudent(
            "jdoe1234@aucklanduni.ac.nz",
         );
         expect(result).toBe(true);
      });

      it("should return true for registered capstone student with auckland.ac.nz domain", async () => {
         const result = await checkCapstoneStudent("jdoe1234@auckland.ac.nz");
         expect(result).toBe(true);
      });

      it("should return false for non-university email domains", async () => {
         const result = await checkCapstoneStudent("jdoe1234@gmail.com");
         expect(result).toBe(false);
      });

      it("should return false for university email not in registered students", async () => {
         const result = await checkCapstoneStudent("unknown@aucklanduni.ac.nz");
         expect(result).toBe(false);
      });

      it("should handle errors gracefully", async () => {
         // Mock RegisteredStudent.isRegisteredStudent to throw an error
         const originalMethod = RegisteredStudent.isRegisteredStudent;
         RegisteredStudent.isRegisteredStudent = jest
            .fn()
            .mockRejectedValue(new Error("Database error"));

         await expect(
            checkCapstoneStudent("test@aucklanduni.ac.nz"),
         ).rejects.toThrow("Failed to verify capstone student status");

         // Restore original method
         RegisteredStudent.isRegisteredStudent = originalMethod;
      });
   });

   describe("hashPassword", () => {
      it("should hash a password correctly", async () => {
         const password = "testPassword123";
         const hashedPassword = await hashPassword(password);

         expect(hashedPassword).toBeDefined();
         expect(hashedPassword).not.toBe(password);
         expect(hashedPassword.length).toBeGreaterThan(50);

         // Verify the hash can be compared
         const isValid = await bcrypt.compare(password, hashedPassword);
         expect(isValid).toBe(true);
      });

      it("should produce different hashes for the same password", async () => {
         const password = "testPassword123";
         const hash1 = await hashPassword(password);
         const hash2 = await hashPassword(password);

         expect(hash1).not.toBe(hash2);
         expect(await bcrypt.compare(password, hash1)).toBe(true);
         expect(await bcrypt.compare(password, hash2)).toBe(true);
      });

      it("should handle bcrypt errors", async () => {
         // Mock bcrypt.genSalt to throw an error
         const originalGenSalt = bcrypt.genSalt;
         bcrypt.genSalt = jest
            .fn()
            .mockRejectedValue(new Error("Bcrypt error"));

         await expect(hashPassword("password")).rejects.toThrow(
            "Failed to hash password",
         );

         // Restore original method
         bcrypt.genSalt = originalGenSalt;
      });
   });

   describe("generateToken", () => {
      it("should generate a valid JWT token", () => {
         const user = {
            id: "507f1f77bcf86cd799439011",
            email: "test@example.com",
            role: "visitor",
         };

         const token = generateToken(user);
         expect(token).toBeDefined();
         expect(typeof token).toBe("string");

         // Verify token can be decoded
         const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
         expect(decoded.user.id).toBe(user.id);
         expect(decoded.user.email).toBe(user.email);
         expect(decoded.user.role).toBe(user.role);
      });

      it("should include expiration time in token", () => {
         const user = {
            id: "507f1f77bcf86cd799439011",
            email: "test@example.com",
            role: "visitor",
         };

         const token = generateToken(user);
         const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

         expect(decoded.exp).toBeDefined();
         expect(decoded.iat).toBeDefined();
         expect(decoded.exp - decoded.iat).toBe(3600); // 1 hour in seconds
      });

      it("should throw error when JWT_SECRET is not defined", () => {
         const originalSecret = process.env.JWT_SECRET;
         delete process.env.JWT_SECRET;

         const user = {
            id: "507f1f77bcf86cd799439011",
            email: "test@example.com",
            role: "visitor",
         };

         expect(() => generateToken(user)).toThrow(
            "Failed to generate authentication token",
         );

         // Restore original secret
         process.env.JWT_SECRET = originalSecret;
      });
   });

   describe("registerUser", () => {
      it("should successfully register a new visitor user", async () => {
         const userData = {
            name: "Jane Doe",
            email: "jane.doe@gmail.com",
            password: "password123",
            profilePicture: "",
            role: "visitor" as const,
            links: [],
            project: "",
         };

         const result = await registerUser(userData);

         expect(result.success).toBe(true);
         expect(result.data).toBeDefined();
         if (result.data) {
            expect(result.data.token).toBeDefined();
            expect(result.data.user!.email).toBe(userData.email);
            expect(result.data.user!.name).toBe(userData.name);
            expect(result.data.user!.role).toBe("visitor");
         }

         // Verify user was created in database
         const savedUser = await User.findOne({ email: userData.email });
         expect(savedUser).toBeDefined();
         expect(savedUser!.name).toBe(userData.name);
         expect(savedUser!.role).toBe("visitor");
      });

      it("should register a capstone student with correct role", async () => {
         // Create a registered student first
         await RegisteredStudent.create({
            upi: "jsmi5678",
            name: "John Smith",
         });

         const userData = {
            name: "John Smith",
            email: "jsmi5678@aucklanduni.ac.nz",
            password: "password123",
            profilePicture: "",
            role: "visitor" as const,
            links: [],
            project: "",
         };

         const result = await registerUser(userData);

         expect(result.success).toBe(true);
         if (result.data?.user) {
            expect(result.data.user.role).toBe("capstoneStudent");
         }
      });

      it("should reject registration with invalid data", async () => {
         const userData = {
            name: "",
            email: "invalid-email",
            password: "123",
            profilePicture: "",
            role: "visitor" as const,
            links: [],
            project: "",
         };

         const result = await registerUser(userData);

         expect(result.success).toBe(false);
         expect(result.error).toBeDefined();
         expect(result.error).toContain("name");
      });

      it("should reject registration for existing user", async () => {
         const userData = {
            name: "John Doe",
            email: "john.doe@example.com",
            password: "password123",
            profilePicture: "",
            role: "visitor" as const,
            links: [],
            project: "",
         };

         // Create user first time
         await registerUser(userData);

         // Try to register same user again
         const result = await registerUser(userData);

         expect(result.success).toBe(false);
         expect(result.error).toBe("User already registered");
      });

      it("should hash password before saving to database", async () => {
         const userData = {
            name: "Test User",
            email: "test.user@example.com",
            password: "plainTextPassword",
            profilePicture: "",
            role: "visitor" as const,
            links: [],
            project: "",
         };

         const result = await registerUser(userData);

         expect(result.success).toBe(true);

         // Check that password is hashed in database
         const savedUser = await User.findOne({ email: userData.email });
         expect(savedUser!.password).not.toBe(userData.password);
         expect(savedUser!.password.length).toBeGreaterThan(50);

         // Verify password can be compared
         const isValid = await bcrypt.compare(
            userData.password,
            savedUser!.password,
         );
         expect(isValid).toBe(true);
      });

      it("should handle database errors gracefully", async () => {
         // Mock User.save to throw an error
         const originalSave = User.prototype.save;
         User.prototype.save = jest
            .fn()
            .mockRejectedValue(new Error("Database error"));

         const userData = {
            name: "Test User",
            email: "test.user@example.com",
            password: "password123",
            profilePicture: "",
            role: "visitor" as const,
            links: [],
            project: "",
         };

         await expect(registerUser(userData)).rejects.toThrow("Database error");

         // Restore original method
         User.prototype.save = originalSave;
      });
   });
});
