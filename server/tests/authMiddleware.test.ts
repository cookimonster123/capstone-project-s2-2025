import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
   authenticateToken,
   authorizeRoles,
   AuthRequest,
} from "../middleware/auth";

// Mock jwt
jest.mock("jsonwebtoken", () => ({
   verify: jest.fn(),
   JsonWebTokenError: class JsonWebTokenError extends Error {
      constructor(message: string) {
         super(message);
         this.name = "JsonWebTokenError";
      }
   },
   TokenExpiredError: class TokenExpiredError extends Error {
      constructor(message: string) {
         super(message);
         this.name = "TokenExpiredError";
      }
   },
}));

const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe("Auth Middleware", () => {
   let mockRequest: Partial<AuthRequest>;
   let mockResponse: Partial<Response>;
   let mockNext: NextFunction;

   beforeEach(() => {
      jest.clearAllMocks();

      mockRequest = {
         cookies: {},
      };

      mockResponse = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn().mockReturnThis(),
      };

      mockNext = jest.fn();

      // Set up environment
      process.env.JWT_SECRET = "test-secret-key";
   });

   describe("authenticateToken", () => {
      it("should authenticate user with valid token", async () => {
         const mockToken = "valid-jwt-token";
         const mockDecodedToken = {
            user: {
               id: "user123",
               email: "test@example.com",
               role: "visitor",
            },
         };

         mockRequest.cookies = { token: mockToken };
         (mockedJwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

         await authenticateToken(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockedJwt.verify).toHaveBeenCalledWith(
            mockToken,
            "test-secret-key",
         );
         expect(mockRequest.user).toEqual(mockDecodedToken.user);
         expect(mockNext).toHaveBeenCalled();
         expect(mockResponse.status).not.toHaveBeenCalled();
      });

      it("should attach user info to request object", async () => {
         const mockToken = "valid-jwt-token";
         const mockUser = {
            id: "user123",
            email: "test@example.com",
            role: "capstoneStudent",
         };
         const mockDecodedToken = { user: mockUser };

         mockRequest.cookies = { token: mockToken };
         (mockedJwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

         await authenticateToken(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockRequest.user).toEqual({
            id: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
         });
      });

      it("should return 401 when no token provided", async () => {
         mockRequest.cookies = {}; // No token

         await authenticateToken(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockResponse.status).toHaveBeenCalledWith(401);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Access denied. No token provided.",
         });
         expect(mockNext).not.toHaveBeenCalled();
      });

      it("should return 401 when cookies are undefined", async () => {
         mockRequest.cookies = undefined;

         await authenticateToken(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockResponse.status).toHaveBeenCalledWith(401);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Access denied. No token provided.",
         });
      });

      it("should return 500 when JWT_SECRET is not defined", async () => {
         delete process.env.JWT_SECRET;
         mockRequest.cookies = { token: "some-token" };

         const consoleSpy = jest.spyOn(console, "error").mockImplementation();

         await authenticateToken(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockResponse.status).toHaveBeenCalledWith(500);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Server configuration error",
         });
         expect(consoleSpy).toHaveBeenCalledWith("JWT_SECRET is not defined");

         consoleSpy.mockRestore();
      });

      it("should return 401 for invalid token", async () => {
         const mockToken = "invalid-token";
         mockRequest.cookies = { token: mockToken };

         (mockedJwt.verify as jest.Mock).mockImplementation(() => {
            throw new jwt.JsonWebTokenError("Invalid token");
         });

         const consoleSpy = jest.spyOn(console, "error").mockImplementation();

         await authenticateToken(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockResponse.status).toHaveBeenCalledWith(401);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Invalid token",
         });
         expect(mockNext).not.toHaveBeenCalled();

         consoleSpy.mockRestore();
      });

      it("should return 401 for expired token", async () => {
         const mockToken = "expired-token";
         mockRequest.cookies = { token: mockToken };

         (mockedJwt.verify as jest.Mock).mockImplementation(() => {
            throw new jwt.TokenExpiredError("Token expired", new Date());
         });

         const consoleSpy = jest.spyOn(console, "error").mockImplementation();

         await authenticateToken(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockResponse.status).toHaveBeenCalledWith(401);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Token expired",
         });

         consoleSpy.mockRestore();
      });

      it("should return 500 for other verification errors", async () => {
         const mockToken = "some-token";
         mockRequest.cookies = { token: mockToken };

         (mockedJwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Unexpected error");
         });

         const consoleSpy = jest.spyOn(console, "error").mockImplementation();

         await authenticateToken(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockResponse.status).toHaveBeenCalledWith(500);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Server error",
         });

         consoleSpy.mockRestore();
      });

      it("should return 401 for malformed token payload (missing user)", async () => {
         const mockToken = "token-without-user";
         const mockDecodedToken = { someOtherField: "value" }; // No user field

         mockRequest.cookies = { token: mockToken };
         (mockedJwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

         await authenticateToken(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockResponse.status).toHaveBeenCalledWith(401);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Invalid token format",
         });
         expect(mockNext).not.toHaveBeenCalled();
      });

      it("should handle token with incomplete user data", async () => {
         const mockToken = "token-with-incomplete-user";
         const mockDecodedToken = {
            user: {
               id: "user123",
               // Missing email and role
            },
         };

         mockRequest.cookies = { token: mockToken };
         (mockedJwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

         await authenticateToken(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockRequest.user).toEqual({
            id: "user123",
            email: undefined,
            role: undefined,
         });
         expect(mockNext).toHaveBeenCalled();
      });
   });

   describe("authorizeRoles", () => {
      beforeEach(() => {
         // Set up authenticated user for authorization tests
         mockRequest.user = {
            id: "user123",
            email: "test@example.com",
            role: "visitor",
         };
      });

      it("should allow access for user with correct role", () => {
         const middleware = authorizeRoles(["visitor", "admin"]);

         middleware(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockNext).toHaveBeenCalled();
         expect(mockResponse.status).not.toHaveBeenCalled();
      });

      it("should allow access for admin role", () => {
         mockRequest.user!.role = "admin";
         const middleware = authorizeRoles(["admin"]);

         middleware(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockNext).toHaveBeenCalled();
      });

      it("should allow access for capstone student role", () => {
         mockRequest.user!.role = "capstoneStudent";
         const middleware = authorizeRoles(["capstoneStudent", "staff"]);

         middleware(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockNext).toHaveBeenCalled();
      });

      it("should allow access for multiple valid roles", () => {
         mockRequest.user!.role = "staff";
         const middleware = authorizeRoles([
            "admin",
            "staff",
            "capstoneStudent",
         ]);

         middleware(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockNext).toHaveBeenCalled();
      });

      it("should deny access for user with incorrect role", () => {
         mockRequest.user!.role = "visitor";
         const middleware = authorizeRoles(["admin", "staff"]);

         middleware(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockResponse.status).toHaveBeenCalledWith(403);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Access denied. Insufficient permissions.",
         });
         expect(mockNext).not.toHaveBeenCalled();
      });

      it("should deny access when user is not authenticated", () => {
         mockRequest.user = undefined; // No user attached
         const middleware = authorizeRoles(["admin"]);

         middleware(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockResponse.status).toHaveBeenCalledWith(401);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Authentication required",
         });
         expect(mockNext).not.toHaveBeenCalled();
      });

      it("should handle empty roles array", () => {
         const middleware = authorizeRoles([]);

         middleware(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockResponse.status).toHaveBeenCalledWith(403);
         expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Access denied. Insufficient permissions.",
         });
      });

      it("should handle single role authorization", () => {
         mockRequest.user!.role = "admin";
         const middleware = authorizeRoles(["admin"]);

         middleware(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockNext).toHaveBeenCalled();
      });

      it("should be case sensitive for roles", () => {
         mockRequest.user!.role = "Admin"; // Different case
         const middleware = authorizeRoles(["admin"]);

         middleware(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockResponse.status).toHaveBeenCalledWith(403);
         expect(mockNext).not.toHaveBeenCalled();
      });

      it("should handle user object with missing role", () => {
         mockRequest.user = {
            id: "user123",
            email: "test@example.com",
         } as any; // Missing role

         const middleware = authorizeRoles(["visitor"]);

         middleware(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockResponse.status).toHaveBeenCalledWith(403);
         expect(mockNext).not.toHaveBeenCalled();
      });
   });

   describe("Integration: authenticateToken + authorizeRoles", () => {
      it("should work together for complete auth flow", async () => {
         const mockToken = "valid-jwt-token";
         const mockDecodedToken = {
            user: {
               id: "user123",
               email: "admin@example.com",
               role: "admin",
            },
         };

         mockRequest.cookies = { token: mockToken };
         (mockedJwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

         // First authenticate
         await authenticateToken(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockRequest.user).toBeDefined();

         // Then authorize
         const authzMiddleware = authorizeRoles(["admin"]);
         authzMiddleware(
            mockRequest as AuthRequest,
            mockResponse as Response,
            mockNext,
         );

         expect(mockNext).toHaveBeenCalledTimes(2); // Called by both middleware
      });
   });
});
