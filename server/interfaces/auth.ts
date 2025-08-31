/**
 * Interface for user registration data
 */
export interface RegisterUserData {
   name: string;
   email: string;
   password: string;
   profilePicture?: string;
   role?: string;
   links?: Array<{
      type: "github" | "linkedin" | "personalWebsite";
      value: string;
   }>;
   project?: string;
}

/**
 * Interface for user login data
 */
export interface LoginUserData {
   email: string;
   password: string;
}

/**
 * Interface for authentication token data
 */
export interface AuthTokenData {
   token: string;
   user?: {
      id: string;
      email: string;
      role: string;
      name: string;
   };
}
