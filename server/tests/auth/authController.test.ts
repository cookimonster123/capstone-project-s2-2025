import { Request, Response } from "express";
import { login, logout } from "../../controllers/authController";
import * as authService from "../../services/authService";

// Mock the auth service
jest.mock("../services/authService");
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe("Auth Controller", () => {
   let mockRequest: Partial<Request>;
   let mockResponse: Partial<Response>;

   beforeEach(() => {
      jest.clearAllMocks();

      mockRequest = {
         body: {},
         cookies: {},
      };

      mockResponse = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn().mockReturnThis(),
         cookie: jest.fn().mockReturnThis(),
         clearCookie: jest.fn().mockReturnThis(),
      };

      // Set up environment
      process.env.NODE_ENV = "development";
   });

   describe("login", () => {
      it("should login user successfully with valid credentials", async () => {
         const loginData = {
            email: "test@example.com",
            password: "password123",
         };

         mockRequest.body = loginData;

         const mockServiceResult = {
            success: true,
            data: {
               token: "mock-jwt-token",
               user: {
                  id: "user123",
                  email: "test@example.com",
                  role: "visitor",
                  name: "Test User",
               },
            },
         };

         mockedAuthService.loginUser.mockResolvedValue(mockServiceResult);

         await login(mockRequest as Request, mockResponse as Response);

         expect(mockedAuthService.loginUser).toHaveBeenCalledWith(loginData);
         expect(mockResponse.cookie).toHaveBeenCalledWith(
            "token",
            "mock-jwt-token",
            {
               httpOnly: true,
               secure: false, // development mode
               sameSite: "strict",
               maxAge: 60 * 60 * 1000, // 1 hour
            },
         );
         expect(mockResponse.status).toHaveBeenCalledWith(200);
         expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Login successful",
            user: mockServiceResult.data.user,
         });
      });

      it("should set secure cookie in production", async () => {
         process.env.NODE_ENV = "production";

         const loginData = {
            email: "test@example.com",
            password: "password123",
         };

         mockRequest.body = loginData;

         const mockServiceResult = {
            success: true,
            data: {
               token: "mock-jwt-token",
               user: {
                  id: "user123",
                  email: "test@example.com",
                  role: "visitor",
                  name: "Test User",
               },
            },
         };

         mockedAuthService.loginUser.mockResolvedValue(mockServiceResult);

         await login(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.cookie).toHaveBeenCalledWith(
            "token",
            "mock-jwt-token",
            {
               httpOnly: true,
               secure: true, // production mode
               sameSite: "strict",
               maxAge: 60 * 60 * 1000,
            },
         );
      });

      it("should return 400 for validation errors (email)", async () => {
         const loginData = {
            email: "invalid-email",
            password: "password123",
         };

         mockRequest.body = loginData;

         const mockServiceResult = {
            success: false,
            error: '"email" must be a valid email',
         };

         mockedAuthService.loginUser.mockResolvedValue(mockServiceResult);

         await login(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.status).toHaveBeenCalledWith(400);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: '"email" must be a valid email',
         });
      });

      it("should return 400 for validation errors (password)", async () => {
         const loginData = {
            email: "test@example.com",
            password: "123",
         };

         mockRequest.body = loginData;

         const mockServiceResult = {
            success: false,
            error: '"password" length must be at least 6 characters long',
         };

         mockedAuthService.loginUser.mockResolvedValue(mockServiceResult);

         await login(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.status).toHaveBeenCalledWith(400);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: '"password" length must be at least 6 characters long',
         });
      });

      it("should return 400 for missing required fields", async () => {
         const loginData = {
            email: "test@example.com",
         };

         mockRequest.body = loginData;

         const mockServiceResult = {
            success: false,
            error: '"password" is required',
         };

         mockedAuthService.loginUser.mockResolvedValue(mockServiceResult);

         await login(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.status).toHaveBeenCalledWith(400);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: '"password" is required',
         });
      });

      it("should return 401 for invalid credentials", async () => {
         const loginData = {
            email: "test@example.com",
            password: "wrongpassword",
         };

         mockRequest.body = loginData;

         const mockServiceResult = {
            success: false,
            error: "Invalid credentials",
         };

         mockedAuthService.loginUser.mockResolvedValue(mockServiceResult);

         await login(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.status).toHaveBeenCalledWith(401);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Invalid credentials",
         });
      });

      it("should return 401 for user not found", async () => {
         const loginData = {
            email: "notfound@example.com",
            password: "password123",
         };

         mockRequest.body = loginData;

         const mockServiceResult = {
            success: false,
            error: "User not found",
         };

         mockedAuthService.loginUser.mockResolvedValue(mockServiceResult);

         await login(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.status).toHaveBeenCalledWith(401);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "User not found",
         });
      });

      it("should return 500 for service layer errors", async () => {
         const loginData = {
            email: "test@example.com",
            password: "password123",
         };

         mockRequest.body = loginData;

         mockedAuthService.loginUser.mockRejectedValue(
            new Error("Database connection failed"),
         );

         const consoleSpy = jest.spyOn(console, "error").mockImplementation();

         await login(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.status).toHaveBeenCalledWith(500);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Server error",
         });
         expect(consoleSpy).toHaveBeenCalledWith(
            "Login controller error:",
            "Database connection failed",
         );

         consoleSpy.mockRestore();
      });

      it("should handle empty request body", async () => {
         mockRequest.body = {};

         const mockServiceResult = {
            success: false,
            error: '"email" is required',
         };

         mockedAuthService.loginUser.mockResolvedValue(mockServiceResult);

         await login(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.status).toHaveBeenCalledWith(400);
      });

      it("should not include token in response body", async () => {
         const loginData = {
            email: "test@example.com",
            password: "password123",
         };

         mockRequest.body = loginData;

         const mockServiceResult = {
            success: true,
            data: {
               token: "mock-jwt-token",
               user: {
                  id: "user123",
                  email: "test@example.com",
                  role: "visitor",
                  name: "Test User",
               },
            },
         };

         mockedAuthService.loginUser.mockResolvedValue(mockServiceResult);

         await login(mockRequest as Request, mockResponse as Response);

         const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
         expect(responseCall).not.toHaveProperty("token");
         expect(responseCall).toHaveProperty("user");
         expect(responseCall).toHaveProperty("message");
      });
   });

   describe("logout", () => {
      it("should logout successfully and clear cookie", async () => {
         await logout(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.clearCookie).toHaveBeenCalledWith("token", {
            httpOnly: true,
            secure: false, // development mode
            sameSite: "strict",
         });
         expect(mockResponse.status).toHaveBeenCalledWith(200);
         expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Logout successful",
         });
      });

      it("should clear secure cookie in production", async () => {
         process.env.NODE_ENV = "production";

         await logout(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.clearCookie).toHaveBeenCalledWith("token", {
            httpOnly: true,
            secure: true, // production mode
            sameSite: "strict",
         });
      });

      it("should work even without existing cookie", async () => {
         mockRequest.cookies = {}; // No cookies

         await logout(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.clearCookie).toHaveBeenCalled();
         expect(mockResponse.status).toHaveBeenCalledWith(200);
         expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Logout successful",
         });
      });

      it("should handle server errors during logout", async () => {
         // Mock clearCookie to throw an error
         (mockResponse.clearCookie as jest.Mock).mockImplementation(() => {
            throw new Error("Cookie clear failed");
         });

         const consoleSpy = jest.spyOn(console, "error").mockImplementation();

         await logout(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.status).toHaveBeenCalledWith(500);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Server error",
         });
         expect(consoleSpy).toHaveBeenCalledWith(
            "Logout controller error:",
            "Cookie clear failed",
         );

         consoleSpy.mockRestore();
      });

      it("should be idempotent (multiple logouts)", async () => {
         // First logout
         await logout(mockRequest as Request, mockResponse as Response);

         // Reset mocks
         jest.clearAllMocks();
         mockResponse.status = jest.fn().mockReturnThis();
         mockResponse.json = jest.fn().mockReturnThis();
         mockResponse.clearCookie = jest.fn().mockReturnThis();

         // Second logout
         await logout(mockRequest as Request, mockResponse as Response);

         expect(mockResponse.status).toHaveBeenCalledWith(200);
         expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Logout successful",
         });
      });
   });
});
