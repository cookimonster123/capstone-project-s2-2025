import request from "supertest";
import { Express } from "express";
import bcrypt from "bcryptjs";
import { User } from "../../models/user.model";
import { RegisteredStudent } from "../../models/registeredStudent.model";

// We'll need to import the app for testing
// For now, let's create a minimal test app setup
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "../../routes/auth";

const createTestApp = (): Express => {
   const app = express();
   app.use(express.json());
   app.use(cookieParser());
   app.use("/auth", authRoutes);
   return app;
};

describe("Auth Routes Integration", () => {
   let app: Express;

   beforeEach(() => {
      app = createTestApp();
      process.env.JWT_SECRET = "test-secret-key";
      process.env.NODE_ENV = "test";
   });

   describe("POST /auth/login", () => {
      it("should login user with valid credentials", async () => {
         // Create a test user
         const hashedPassword = await bcrypt.hash("password123", 10);
         const testUser = new User({
            name: "Test User",
            email: "test@example.com",
            password: hashedPassword,
            role: "visitor",
         });
         await testUser.save();

         const response = await request(app)
            .post("/auth/login")
            .send({
               email: "test@example.com",
               password: "password123",
            })
            .expect(200);

         expect(response.body).toHaveProperty("message", "Login successful");
         expect(response.body).toHaveProperty("user");
         expect(response.body.user).toHaveProperty("id");
         expect(response.body.user).toHaveProperty("email", "test@example.com");
         expect(response.body.user).toHaveProperty("role", "visitor");
         expect(response.body.user).toHaveProperty("name", "Test User");

         // Check that token is not in response body
         expect(response.body).not.toHaveProperty("token");

         // Check that cookie is set
         expect(response.headers["set-cookie"]).toBeDefined();
         const cookieHeader = response.headers["set-cookie"][0];
         expect(cookieHeader).toContain("token=");
         expect(cookieHeader).toContain("HttpOnly");
         expect(cookieHeader).toContain("SameSite=Strict");
      });

      it("should login capstone student with correct role", async () => {
         // Mock capstone student check
         const originalIsRegistered = RegisteredStudent.isRegisteredStudent;
         RegisteredStudent.isRegisteredStudent = jest
            .fn()
            .mockResolvedValue(true);

         const hashedPassword = await bcrypt.hash("password123", 10);
         const testUser = new User({
            name: "Student User",
            email: "student123@aucklanduni.ac.nz",
            password: hashedPassword,
            role: "capstoneStudent",
         });
         await testUser.save();

         const response = await request(app)
            .post("/auth/login")
            .send({
               email: "student123@aucklanduni.ac.nz",
               password: "password123",
            })
            .expect(200);

         expect(response.body.user.role).toBe("capstoneStudent");

         // Restore original method
         RegisteredStudent.isRegisteredStudent = originalIsRegistered;
      });

      it("should return 400 for invalid email format", async () => {
         const response = await request(app)
            .post("/auth/login")
            .send({
               email: "invalid-email",
               password: "password123",
            })
            .expect(400);

         expect(response.body).toHaveProperty("error");
         expect(response.body.error).toContain("valid email");
      });

      it("should return 400 for missing email", async () => {
         const response = await request(app)
            .post("/auth/login")
            .send({
               password: "password123",
            })
            .expect(400);

         expect(response.body).toHaveProperty("error");
         expect(response.body.error).toContain("email");
         expect(response.body.error).toContain("required");
      });

      it("should return 400 for missing password", async () => {
         const response = await request(app)
            .post("/auth/login")
            .send({
               email: "test@example.com",
            })
            .expect(400);

         expect(response.body).toHaveProperty("error");
         expect(response.body.error).toContain("password");
         expect(response.body.error).toContain("required");
      });

      it("should return 400 for password too short", async () => {
         const response = await request(app)
            .post("/auth/login")
            .send({
               email: "test@example.com",
               password: "123",
            })
            .expect(400);

         expect(response.body).toHaveProperty("error");
         expect(response.body.error).toContain("at least 6 characters");
      });

      it("should return 401 for non-existent user", async () => {
         const response = await request(app)
            .post("/auth/login")
            .send({
               email: "notfound@example.com",
               password: "password123",
            })
            .expect(401);

         expect(response.body).toHaveProperty("error", "Invalid credentials");
      });

      it("should return 401 for wrong password", async () => {
         const hashedPassword = await bcrypt.hash("correctpassword", 10);
         const testUser = new User({
            name: "Test User",
            email: "test@example.com",
            password: hashedPassword,
            role: "visitor",
         });
         await testUser.save();

         const response = await request(app)
            .post("/auth/login")
            .send({
               email: "test@example.com",
               password: "wrongpassword",
            })
            .expect(401);

         expect(response.body).toHaveProperty("error", "Invalid credentials");
      });

      it("should return 400 for empty request body", async () => {
         const response = await request(app)
            .post("/auth/login")
            .send({})
            .expect(400);

         expect(response.body).toHaveProperty("error");
      });

      it("should handle malformed JSON", async () => {
         const response = await request(app)
            .post("/auth/login")
            .set("Content-Type", "application/json")
            .send("invalid json")
            .expect(400);

         // Express should handle the JSON parsing error
      });

      it("should update lastLogin timestamp", async () => {
         const hashedPassword = await bcrypt.hash("password123", 10);
         const testUser = new User({
            name: "Test User",
            email: "test@example.com",
            password: hashedPassword,
            role: "visitor",
         });
         await testUser.save();

         const originalLastLogin = testUser.lastLogin;

         await request(app)
            .post("/auth/login")
            .send({
               email: "test@example.com",
               password: "password123",
            })
            .expect(200);

         // Check that lastLogin was updated
         const updatedUser = await User.findById(testUser._id);
         expect(updatedUser?.lastLogin).not.toEqual(originalLastLogin);
         expect(updatedUser?.lastLogin).toBeInstanceOf(Date);
      });
   });

   describe("POST /auth/logout", () => {
      it("should logout successfully and clear cookie", async () => {
         const response = await request(app).post("/auth/logout").expect(200);

         expect(response.body).toHaveProperty("message", "Logout successful");

         // Check that cookie is cleared
         expect(response.headers["set-cookie"]).toBeDefined();
         const cookieHeader = response.headers["set-cookie"][0];
         expect(cookieHeader).toContain("token=;");
         expect(cookieHeader).toContain("HttpOnly");
      });

      it("should work without existing cookie", async () => {
         const response = await request(app).post("/auth/logout").expect(200);

         expect(response.body).toHaveProperty("message", "Logout successful");
      });

      it("should be idempotent", async () => {
         // First logout
         await request(app).post("/auth/logout").expect(200);

         // Second logout should also work
         const response = await request(app).post("/auth/logout").expect(200);

         expect(response.body).toHaveProperty("message", "Logout successful");
      });
   });

   describe("Protected Routes", () => {
      let authToken: string;
      let testUser: any;

      beforeEach(async () => {
         // Create and login a test user to get auth token
         const hashedPassword = await bcrypt.hash("password123", 10);
         testUser = new User({
            name: "Test User",
            email: "test@example.com",
            password: hashedPassword,
            role: "visitor",
         });
         await testUser.save();

         const loginResponse = await request(app).post("/auth/login").send({
            email: "test@example.com",
            password: "password123",
         });

         // Extract token from cookie
         const cookieHeader = loginResponse.headers["set-cookie"][0];
         authToken = cookieHeader.split("token=")[1].split(";")[0];
      });

      describe("GET /auth/profile", () => {
         it("should access protected route with valid token", async () => {
            const response = await request(app)
               .get("/auth/profile")
               .set("Cookie", `token=${authToken}`)
               .expect(200);

            expect(response.body).toHaveProperty(
               "message",
               "Access granted to protected route",
            );
            expect(response.body).toHaveProperty("user");
            expect(response.body.user).toHaveProperty("id");
            expect(response.body.user).toHaveProperty(
               "email",
               "test@example.com",
            );
            expect(response.body).toHaveProperty("timestamp");
         });

         it("should deny access without token", async () => {
            const response = await request(app)
               .get("/auth/profile")
               .expect(401);

            expect(response.body).toHaveProperty(
               "error",
               "Access denied. No token provided.",
            );
         });

         it("should deny access with invalid token", async () => {
            const response = await request(app)
               .get("/auth/profile")
               .set("Cookie", "token=invalid.jwt.token")
               .expect(401);

            expect(response.body).toHaveProperty("error", "Invalid token");
         });
      });

      describe("GET /auth/admin-only", () => {
         it("should deny access for non-admin user", async () => {
            const response = await request(app)
               .get("/auth/admin-only")
               .set("Cookie", `token=${authToken}`)
               .expect(403);

            expect(response.body).toHaveProperty(
               "error",
               "Access denied. Insufficient permissions.",
            );
         });

         it("should allow access for admin user", async () => {
            // Create admin user
            const hashedPassword = await bcrypt.hash("adminpass", 10);
            const adminUser = new User({
               name: "Admin User",
               email: "admin@example.com",
               password: hashedPassword,
               role: "admin",
            });
            await adminUser.save();

            // Login as admin
            const loginResponse = await request(app).post("/auth/login").send({
               email: "admin@example.com",
               password: "adminpass",
            });

            const adminCookie = loginResponse.headers["set-cookie"][0];
            const adminToken = adminCookie.split("token=")[1].split(";")[0];

            const response = await request(app)
               .get("/auth/admin-only")
               .set("Cookie", `token=${adminToken}`)
               .expect(200);

            expect(response.body).toHaveProperty(
               "message",
               "Admin access granted",
            );
         });
      });

      describe("GET /auth/students-only", () => {
         it("should allow access for capstone student", async () => {
            // Create capstone student
            const hashedPassword = await bcrypt.hash("studentpass", 10);
            const studentUser = new User({
               name: "Student User",
               email: "student@aucklanduni.ac.nz",
               password: hashedPassword,
               role: "capstoneStudent",
            });
            await studentUser.save();

            // Login as student
            const loginResponse = await request(app).post("/auth/login").send({
               email: "student@aucklanduni.ac.nz",
               password: "studentpass",
            });

            const studentCookie = loginResponse.headers["set-cookie"][0];
            const studentToken = studentCookie.split("token=")[1].split(";")[0];

            const response = await request(app)
               .get("/auth/students-only")
               .set("Cookie", `token=${studentToken}`)
               .expect(200);

            expect(response.body).toHaveProperty(
               "message",
               "Capstone student access granted",
            );
         });

         it("should deny access for non-student user", async () => {
            const response = await request(app)
               .get("/auth/students-only")
               .set("Cookie", `token=${authToken}`)
               .expect(403);

            expect(response.body).toHaveProperty(
               "error",
               "Access denied. Insufficient permissions.",
            );
         });
      });
   });
});
