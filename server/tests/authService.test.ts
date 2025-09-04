import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { RegisteredStudent } from "../models/registeredStudent.model";
import {
   validateUserLogin,
   hashPassword,
   generateToken,
   checkCapstoneStudent,
   loginUser,
} from "../services/authService";

// Mock the models
jest.mock("../models/user.model");
jest.mock("../models/registeredStudent.model");

// Mock bcrypt
jest.mock("bcryptjs", () => ({
   genSalt: jest.fn(),
   hash: jest.fn(),
   compare: jest.fn(),
}));

// Mock jwt
jest.mock("jsonwebtoken", () => ({
   sign: jest.fn(),
   verify: jest.fn(),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe("Auth Service", () => {
   beforeEach(() => {
      jest.clearAllMocks();
      process.env.JWT_SECRET = "test-secret-key";
   });

   describe("validateUserLogin", () => {
      it("should validate correct login data", () => {
         const validData = {
            email: "test@example.com",
            password: "password123",
         };

         const result = validateUserLogin(validData);

         expect(result.error).toBeUndefined();
         expect(result.value).toEqual(validData);
      });

      it("should reject missing email", () => {
         const invalidData = {
            password: "password123",
         } as any;

         const result = validateUserLogin(invalidData);

         expect(result.error).toBeDefined();
         expect(result.error?.details[0].message).toContain("email");
         expect(result.error?.details[0].message).toContain("required");
      });

      it("should reject missing password", () => {
         const invalidData = {
            email: "test@example.com",
         } as any;

         const result = validateUserLogin(invalidData);

         expect(result.error).toBeDefined();
         expect(result.error?.details[0].message).toContain("password");
         expect(result.error?.details[0].message).toContain("required");
      });

      it("should reject invalid email format", () => {
         const invalidData = {
            email: "invalid-email",
            password: "password123",
         };

         const result = validateUserLogin(invalidData);

         expect(result.error).toBeDefined();
         expect(result.error?.details[0].message).toContain("valid email");
      });

      it("should reject password shorter than 6 characters", () => {
         const invalidData = {
            email: "test@example.com",
            password: "123",
         };

         const result = validateUserLogin(invalidData);

         expect(result.error).toBeDefined();
         expect(result.error?.details[0].message).toContain(
            "at least 6 characters",
         );
      });

      it("should reject empty email string", () => {
         const invalidData = {
            email: "",
            password: "password123",
         };

         const result = validateUserLogin(invalidData);

         expect(result.error).toBeDefined();
         expect(result.error?.details[0].message).toContain(
            "not allowed to be empty",
         );
      });

      it("should reject empty password string", () => {
         const invalidData = {
            email: "test@example.com",
            password: "",
         };

         const result = validateUserLogin(invalidData);

         expect(result.error).toBeDefined();
         expect(result.error?.details[0].message).toContain(
            "not allowed to be empty",
         );
      });
   });

   describe("hashPassword", () => {
      beforeEach(() => {
         (mockedBcrypt.genSalt as jest.Mock).mockResolvedValue("mock-salt");
         (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      });

      it("should hash password successfully", async () => {
         const password = "password123";

         const result = await hashPassword(password);

         expect(mockedBcrypt.genSalt).toHaveBeenCalledWith(10);
         expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, "mock-salt");
         expect(result).toBe("hashed-password");
      });

      it("should throw error when bcrypt.genSalt fails", async () => {
         (mockedBcrypt.genSalt as jest.Mock).mockRejectedValue(
            new Error("Salt generation failed"),
         );

         await expect(hashPassword("password123")).rejects.toThrow(
            "Failed to hash password",
         );
      });

      it("should throw error when bcrypt.hash fails", async () => {
         (mockedBcrypt.hash as jest.Mock).mockRejectedValue(
            new Error("Hashing failed"),
         );

         await expect(hashPassword("password123")).rejects.toThrow(
            "Failed to hash password",
         );
      });

      it("should handle empty password", async () => {
         await expect(hashPassword("")).resolves.toBeDefined();
         expect(mockedBcrypt.genSalt).toHaveBeenCalled();
         expect(mockedBcrypt.hash).toHaveBeenCalledWith("", "mock-salt");
      });
   });

   describe("generateToken", () => {
      beforeEach(() => {
         (mockedJwt.sign as jest.Mock).mockReturnValue("mock-jwt-token");
      });

      it("should generate valid JWT token", () => {
         const user = {
            id: "user123",
            email: "test@example.com",
            role: "visitor",
         };

         const result = generateToken(user);

         expect(mockedJwt.sign).toHaveBeenCalledWith(
            {
               user: {
                  id: user.id,
                  email: user.email,
                  role: user.role,
               },
            },
            "test-secret-key",
            { expiresIn: "1h" },
         );
         expect(result).toBe("mock-jwt-token");
      });

      it("should throw error when JWT_SECRET is not defined", () => {
         delete process.env.JWT_SECRET;

         const user = {
            id: "user123",
            email: "test@example.com",
            role: "visitor",
         };

         expect(() => generateToken(user)).toThrow("JWT_SECRET is not defined");
      });

      it("should throw error when jwt.sign fails", () => {
         (mockedJwt.sign as jest.Mock).mockImplementation(() => {
            throw new Error("JWT sign failed");
         });

         const user = {
            id: "user123",
            email: "test@example.com",
            role: "visitor",
         };

         expect(() => generateToken(user)).toThrow(
            "Failed to generate authentication token",
         );
      });

      it("should handle user with missing fields", () => {
         const incompleteUser = {
            id: "user123",
            email: "test@example.com",
         } as any;

         const result = generateToken(incompleteUser);

         expect(mockedJwt.sign).toHaveBeenCalledWith(
            {
               user: {
                  id: "user123",
                  email: "test@example.com",
                  role: undefined,
               },
            },
            "test-secret-key",
            { expiresIn: "1h" },
         );
         expect(result).toBe("mock-jwt-token");
      });
   });

   describe("checkCapstoneStudent", () => {
      const mockedRegisteredStudent = RegisteredStudent as jest.Mocked<
         typeof RegisteredStudent
      >;

      beforeEach(() => {
         mockedRegisteredStudent.isRegisteredStudent = jest.fn();
      });

      it("should return true for registered capstone student with aucklanduni.ac.nz", async () => {
         mockedRegisteredStudent.isRegisteredStudent.mockResolvedValue(true);

         const result = await checkCapstoneStudent(
            "student123@aucklanduni.ac.nz",
         );

         expect(
            mockedRegisteredStudent.isRegisteredStudent,
         ).toHaveBeenCalledWith("student123");
         expect(result).toBe(true);
      });

      it("should return true for registered capstone student with auckland.ac.nz", async () => {
         mockedRegisteredStudent.isRegisteredStudent.mockResolvedValue(true);

         const result = await checkCapstoneStudent("student123@auckland.ac.nz");

         expect(
            mockedRegisteredStudent.isRegisteredStudent,
         ).toHaveBeenCalledWith("student123");
         expect(result).toBe(true);
      });

      it("should return false for unregistered student with university email", async () => {
         mockedRegisteredStudent.isRegisteredStudent.mockResolvedValue(false);

         const result = await checkCapstoneStudent(
            "student123@aucklanduni.ac.nz",
         );

         expect(
            mockedRegisteredStudent.isRegisteredStudent,
         ).toHaveBeenCalledWith("student123");
         expect(result).toBe(false);
      });

      it("should return false for non-university email", async () => {
         const result = await checkCapstoneStudent("user@gmail.com");

         expect(
            mockedRegisteredStudent.isRegisteredStudent,
         ).not.toHaveBeenCalled();
         expect(result).toBe(false);
      });

      it("should return false for other university domains", async () => {
         const result = await checkCapstoneStudent("user@otago.ac.nz");

         expect(
            mockedRegisteredStudent.isRegisteredStudent,
         ).not.toHaveBeenCalled();
         expect(result).toBe(false);
      });

      it("should throw error when database check fails", async () => {
         mockedRegisteredStudent.isRegisteredStudent.mockRejectedValue(
            new Error("Database error"),
         );

         await expect(
            checkCapstoneStudent("student@aucklanduni.ac.nz"),
         ).rejects.toThrow("Failed to verify capstone student status");
      });

      it("should handle malformed email", async () => {
         const result = await checkCapstoneStudent("invalid-email");

         expect(result).toBe(false);
         expect(
            mockedRegisteredStudent.isRegisteredStudent,
         ).not.toHaveBeenCalled();
      });
   });

   describe("loginUser", () => {
      const mockedUser = User as jest.Mocked<typeof User>;

      beforeEach(() => {
         mockedUser.findOne = jest.fn();
         mockedUser.findByIdAndUpdate = jest.fn();
         (mockedBcrypt.compare as jest.Mock) = jest.fn();
         (mockedJwt.sign as jest.Mock).mockReturnValue("mock-jwt-token");
      });

      it("should login user successfully with valid credentials", async () => {
         const loginData = {
            email: "test@example.com",
            password: "password123",
         };

         const mockUser = {
            _id: "user123",
            email: "test@example.com",
            password: "hashed-password",
            role: "visitor",
            name: "Test User",
         };

         mockedUser.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser),
         } as any);
         (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
         mockedUser.findByIdAndUpdate.mockResolvedValue(mockUser as any);

         const result = await loginUser(loginData);

         expect(result.success).toBe(true);
         expect(result.data?.token).toBe("mock-jwt-token");
         expect(result.data?.user).toEqual({
            id: "user123",
            email: "test@example.com",
            role: "visitor",
            name: "Test User",
         });
         expect(mockedUser.findByIdAndUpdate).toHaveBeenCalledWith("user123", {
            lastLogin: expect.any(Date),
         });
      });

      it("should reject login with invalid email format", async () => {
         const loginData = {
            email: "invalid-email",
            password: "password123",
         };

         const result = await loginUser(loginData);

         expect(result.success).toBe(false);
         expect(result.error).toContain("valid email");
      });

      it("should reject login with missing password", async () => {
         const loginData = {
            email: "test@example.com",
         } as any;

         const result = await loginUser(loginData);

         expect(result.success).toBe(false);
         expect(result.error).toContain("password");
         expect(result.error).toContain("required");
      });

      it("should reject login for non-existent user", async () => {
         const loginData = {
            email: "notfound@example.com",
            password: "password123",
         };

         mockedUser.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(null),
         } as any);

         const result = await loginUser(loginData);

         expect(result.success).toBe(false);
         expect(result.error).toBe("Invalid credentials");
      });

      it("should reject login with wrong password", async () => {
         const loginData = {
            email: "test@example.com",
            password: "wrongpassword",
         };

         const mockUser = {
            _id: "user123",
            email: "test@example.com",
            password: "hashed-password",
            role: "visitor",
            name: "Test User",
         };

         mockedUser.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser),
         } as any);
         (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

         const result = await loginUser(loginData);

         expect(result.success).toBe(false);
         expect(result.error).toBe("Invalid credentials");
      });

      it("should handle database connection error", async () => {
         const loginData = {
            email: "test@example.com",
            password: "password123",
         };

         mockedUser.findOne.mockReturnValue({
            select: jest
               .fn()
               .mockRejectedValue(new Error("Database connection failed")),
         } as any);

         await expect(loginUser(loginData)).rejects.toThrow(
            "Database connection failed",
         );
      });

      it("should handle bcrypt comparison error", async () => {
         const loginData = {
            email: "test@example.com",
            password: "password123",
         };

         const mockUser = {
            _id: "user123",
            email: "test@example.com",
            password: "hashed-password",
            role: "visitor",
            name: "Test User",
         };

         mockedUser.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser),
         } as any);
         (mockedBcrypt.compare as jest.Mock).mockRejectedValue(
            new Error("Bcrypt error"),
         );

         await expect(loginUser(loginData)).rejects.toThrow("Bcrypt error");
      });

      it("should handle JWT generation failure", async () => {
         const loginData = {
            email: "test@example.com",
            password: "password123",
         };

         const mockUser = {
            _id: "user123",
            email: "test@example.com",
            password: "hashed-password",
            role: "visitor",
            name: "Test User",
         };

         mockedUser.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser),
         } as any);
         (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
         (mockedJwt.sign as jest.Mock).mockImplementation(() => {
            throw new Error("JWT generation failed");
         });

         await expect(loginUser(loginData)).rejects.toThrow();
      });
   });
});
