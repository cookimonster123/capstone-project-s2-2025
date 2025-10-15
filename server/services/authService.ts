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
   LoginUserData,
} from "../interfaces";
import { Team, RegistrationToken, PasswordResetToken } from "@models";
import mongoose from "mongoose";
import { addUserToTeam } from "./teamService";
import crypto from "crypto";
import {
   sendRegistrationMagicLink,
   sendPasswordResetLink,
} from "./emailService";

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

      const teamObjectId = isCapstoneStudent
         ? await getTeamByEmail(email)
         : null;

      // Create new user
      const user = new User({
         name,
         email,
         password: hashedPassword,
         role: userRole,
         team: teamObjectId,
      });

      await user.save();

      if (isCapstoneStudent && teamObjectId) {
         // Add user to team by updating the Team model
         await addUserToTeam(user._id.toString(), teamObjectId.toString());
      }

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

/**
 * Request a registration magic link (does not create the user yet).
 */
export async function requestRegistrationMagicLink(
   userData: RegisterUserData,
   linkBaseUrl: string,
): Promise<ServiceResult<{ message: string }>> {
   try {
      const { error } = validateUserRegistration(userData);
      if (error) {
         return { success: false, error: error.details[0].message };
      }

      const { name, email, password } = userData;

      const exists = await User.findOne({ email });
      if (exists) {
         return { success: false, error: "User already registered" };
      }

      const passwordHash = await hashPassword(password);
      const tokenRaw = crypto.randomBytes(32).toString("hex");
      const tokenHash = await bcrypt.hash(tokenRaw, 10);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

      // Upsert pending record for this email
      await RegistrationToken.findOneAndUpdate(
         { email, purpose: "register" },
         {
            $set: {
               email,
               name,
               passwordHash,
               tokenHash,
               purpose: "register",
               expiresAt,
            },
            $unset: { usedAt: "" },
         },
         { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      const confirmUrl = `${linkBaseUrl.replace(/\/$/, "")}/api/auth/register/confirm?token=${tokenRaw}`;

      const mailed = await sendRegistrationMagicLink(email, confirmUrl, name);
      if (!mailed) {
         if (process.env.NODE_ENV !== "production") {
            console.log(`[DEV] Magic link for ${email}: ${confirmUrl}`);
         } else {
            return { success: false, error: "Email service not configured" };
         }
      }

      return { success: true, data: { message: "Magic link sent" } };
   } catch (err) {
      console.error("Error in requestRegistrationMagicLink:", err);
      throw err;
   }
}

/**
 * Confirm magic link: create the user and return auth data
 */
export async function confirmRegistrationMagicLink(
   tokenRaw: string,
): Promise<ServiceResult<AuthTokenData>> {
   try {
      // Find a pending record that matches the token (not expired, not used)
      const candidates = await RegistrationToken.find({
         purpose: "register",
         usedAt: { $exists: false },
         expiresAt: { $gt: new Date() },
      }).sort({ updatedAt: -1 });
      if (!candidates.length) {
         return { success: false, error: "Invalid or expired link" };
      }

      let pending: any = null;
      for (const doc of candidates) {
         const ok = await bcrypt.compare(tokenRaw, doc.tokenHash);
         if (ok) {
            pending = doc;
            break;
         }
      }
      if (!pending) {
         return { success: false, error: "Invalid link" };
      }

      // Ensure user does not already exist (race-safe)
      const existingUser = await User.findOne({ email: pending.email });
      if (existingUser) {
         return { success: false, error: "User already registered" };
      }

      // Determine role and team
      const isCapstoneStudent = await checkCapstoneStudent(pending.email);
      const userRole = isCapstoneStudent ? "capstoneStudent" : "visitor";
      const teamObjectId = isCapstoneStudent
         ? await getTeamByEmail(pending.email)
         : null;

      const user = new User({
         name: pending.name,
         email: pending.email,
         password: pending.passwordHash,
         role: userRole,
         team: teamObjectId,
      });

      await user.save();

      if (isCapstoneStudent && teamObjectId) {
         await addUserToTeam(user._id.toString(), teamObjectId.toString());
      }

      await RegistrationToken.updateOne(
         { _id: pending._id },
         { usedAt: new Date() },
      );

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
   } catch (err) {
      console.error("Error in confirmRegistrationMagicLink:", err);
      throw err;
   }
}

// ===== Password Reset (Magic Link to Client) =====

export async function requestPasswordResetLink(
   email: string,
   clientBaseUrl: string,
): Promise<ServiceResult<{ message: string }>> {
   try {
      // Basic format check
      const schema = Joi.object({ email: Joi.string().email().required() });
      const { error } = schema.validate({ email });
      if (error) return { success: false, error: error.details[0].message };

      const user = await User.findOne({ email });
      if (!user) {
         return { success: false, error: "User email does not exist" };
      }

      const tokenRaw = crypto.randomBytes(32).toString("hex");
      const tokenHash = await bcrypt.hash(tokenRaw, 10);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

      await PasswordResetToken.findOneAndUpdate(
         { email },
         { $set: { email, tokenHash, expiresAt }, $unset: { usedAt: "" } },
         { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      const linkBase = clientBaseUrl.replace(/\/$/, "");
      const resetUrl = `${linkBase}/reset-password?token=${tokenRaw}`;

      const mailed = await sendPasswordResetLink(email, resetUrl, user.name);
      if (!mailed) {
         if (process.env.NODE_ENV !== "production") {
            console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
         } else {
            return { success: false, error: "Email service not configured" };
         }
      }

      return { success: true, data: { message: "Reset link sent" } };
   } catch (err) {
      console.error("Error in requestPasswordResetLink:", err);
      throw err;
   }
}

export async function resetPasswordWithToken(
   tokenRaw: string,
   newPassword: string,
): Promise<ServiceResult<{ message: string }>> {
   try {
      const schema = Joi.object({ password: Joi.string().min(6).required() });
      const { error } = schema.validate({ password: newPassword });
      if (error) return { success: false, error: error.details[0].message };

      const candidates = await PasswordResetToken.find({
         usedAt: { $exists: false },
         expiresAt: { $gt: new Date() },
      }).sort({ updatedAt: -1 });
      if (!candidates.length) {
         return { success: false, error: "Invalid or expired link" };
      }

      let pending: any = null;
      for (const doc of candidates) {
         const ok = await bcrypt.compare(tokenRaw, doc.tokenHash);
         if (ok) {
            pending = doc;
            break;
         }
      }
      if (!pending) return { success: false, error: "Invalid or expired link" };

      const user = await User.findOne({ email: pending.email }).select(
         "+password",
      );
      if (!user) return { success: false, error: "User not found" };

      const hashed = await hashPassword(newPassword);
      await User.updateOne({ _id: user._id }, { $set: { password: hashed } });
      await PasswordResetToken.updateOne(
         { _id: pending._id },
         { usedAt: new Date() },
      );

      return { success: true, data: { message: "Password has been reset" } };
   } catch (err) {
      console.error("Error in resetPasswordWithToken:", err);
      throw err;
   }
}

/**
 * Validates user login data
 * @param userData - The user login data to validate
 * @returns Validation result containing validated data or error details
 */
export function validateUserLogin(
   userData: LoginUserData,
): ValidationResult<LoginUserData> {
   const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
   });

   return schema.validate(userData);
}

/**
 * Authenticates a user with email and password
 * @param userData - The user login credentials containing email and password
 * @returns Promise<ServiceResult<AuthTokenData>> authentication result with token and user data or error
 * @throws Error for unexpected server errors during authentication process
 */
export async function loginUser(
   userData: LoginUserData,
): Promise<ServiceResult<AuthTokenData>> {
   try {
      // Validate input data
      const { error, value } = validateUserLogin(userData);
      if (error) {
         return {
            success: false,
            error: error.details[0].message,
         };
      }

      const { email, password } = userData;

      // Find user by email
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
         return {
            success: false,
            error: "Invalid credentials",
         };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
         return {
            success: false,
            error: "Invalid credentials",
         };
      }

      // Update last login timestamp
      await User.findByIdAndUpdate(user._id, {
         lastLogin: new Date(),
      });

      // Generate JWT token
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
      console.error("Error in loginUser service:", error);
      throw error;
   }
}

/**
 * Check if a user with the given email exists
 */
export async function emailExists(email: string): Promise<boolean> {
   try {
      const exists = await User.exists({ email });
      return !!exists;
   } catch (err) {
      console.error("Error checking email existence:", err);
      return false;
   }
}

/**
 * Retrieves the team ObjectId for a capstone student based on their email address
 *
 * @param email - The student's university email address (e.g., "abc123@auckland.ac.nz")
 * @returns Promise resolving to the team's ObjectId if found, null if student has no team assignment or team doesn't exist
 * @throws Does not throw - catches all errors and returns null for robustness during user registration
 */
export async function getTeamByEmail(
   email: string,
): Promise<mongoose.Types.ObjectId | null> {
   try {
      const upi = email.split("@")[0];
      const student = await RegisteredStudent.findOne({ upi: upi })
         .select("team teamName")
         .lean();

      if (!student) {
         return null;
      }

      // Prefer direct team reference when available
      if ((student as any).team) {
         return (student as any).team as mongoose.Types.ObjectId;
      }

      // TODO: Parse teamName if necessary
      // Assume teamName in RegisteredStudent matches Team.name
      const team = await Team.findOne({
         name: (student as any).teamName,
      }).select("_id");

      return team ? team._id : null;
   } catch (error) {
      console.error("Error fetching team by email:", error);
      return null;
   }
}
