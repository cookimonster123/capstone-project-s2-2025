import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi";
import { User } from "../models/user.model";
import { RegisteredStudent } from "../models/registeredStudent.model";
import {
   ServiceResult,
   ValidationResult,
   RegisterUserData,
   AuthTokenData,
} from "../interfaces";

/**
 * Validates user registration data
 * @param userData - The user data to validate
 * @returns Validation result
 */
export function validateUserRegistration(
   userData: RegisterUserData,
): ValidationResult<RegisterUserData> {
   const schema = Joi.object({
      name: Joi.string().min(1).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      profilePicture: Joi.string().allow(""), // remove allow('') later
      role: Joi.string()
         .valid("visitor", "admin", "staff", "capstoneStudent")
         .default("visitor"),
      links: Joi.array().items(
         Joi.object({
            type: Joi.string().valid("github", "linkedin", "personalWebsite"),
            value: Joi.string(),
         }),
      ),
      project: Joi.string().allow(""),
   });

   return schema.validate(userData);
}

/**
 * Checks if email belongs to a registered capstone student
 * @param email - Email to check
 * @returns Promise<boolean> indicating if user is a capstone student
 * @throws Error if there's an issue checking the status
 */
export async function checkCapstoneStudent(email: string): Promise<boolean> {
   try {
      const upi = email.split("@")[0];
      const domain = email.split("@")[1];

      // Only check university emails
      if (domain !== "aucklanduni.ac.nz" && domain !== "auckland.ac.nz") {
         return false;
      }

      return await RegisteredStudent.isRegisteredStudent(upi);
   } catch (error) {
      console.error("Error checking capstone student status:", error);
      throw new Error("Failed to verify capstone student status");
   }
}

/**
 * Hashes a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Promise<string> hashed password
 * @throws Error if hashing fails
 */
export async function hashPassword(password: string): Promise<string> {
   try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
   } catch (error) {
      console.error("Error hashing password:", error);
      throw new Error("Failed to hash password");
   }
}

/**
 * Generates a JWT token for a user
 * @param user - User object with id, email, and role
 * @returns string JWT token
 * @throws Error if JWT_SECRET is not defined or token generation fails
 */
export function generateToken(user: {
   id: string;
   email: string;
   role: string;
}): string {
   try {
      if (!process.env.JWT_SECRET) {
         throw new Error("JWT_SECRET is not defined");
      }

      const payload = {
         user: {
            id: user.id,
            email: user.email,
            role: user.role,
         },
      };

      return jwt.sign(payload, process.env.JWT_SECRET, {
         expiresIn: "1h",
      });
   } catch (error) {
      console.error("Error generating token:", error);
      throw new Error("Failed to generate authentication token");
   }
}

/**
 * Registers a new user
 * @param userData - User registration data
 * @returns Promise<ServiceResult<AuthTokenData>> registration result with token or error
 * @throws Error for unexpected server errors
 */
export async function registerUser(
   userData: RegisterUserData,
): Promise<ServiceResult<AuthTokenData>> {
   try {
      // Validate input data
      const { error } = validateUserRegistration(userData);
      if (error) {
         return {
            success: false,
            error: error.details[0].message,
         };
      }

      const { name, email, password } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
         return {
            success: false,
            error: "User already registered",
         };
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Determine user role based on capstone student status
      const isCapstoneStudent = await checkCapstoneStudent(email);
      const userRole = isCapstoneStudent ? "capstoneStudent" : "visitor";

      // Create new user
      const user = new User({
         name,
         email,
         password: hashedPassword,
         role: userRole,
      });

      await user.save();

      // Generate token
      const token = generateToken({
         id: user._id.toString(),
         email: user.email,
         role: user.role,
      });

      return {
         success: true,
         data: {
            token,
            user: {
               id: user._id.toString(),
               email: user.email,
               role: user.role,
               name: user.name,
            },
         },
      };
   } catch (error) {
      console.error("Error in registerUser service:", error);
      throw error; // Re-throw to be handled by controller
   }
}
