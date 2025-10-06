import type { RegisterFormData, LoginFormData } from "@types";
import { BASE_API_URL } from "../config/api";

export interface AuthResponse {
   success: boolean;
   data?: {
      token?: string;
      user: {
         id: string;
         name: string;
         email: string;
         role: string;
         profilePicture?: string;
      };
   };
   error?: string;
}

export const registerUser = async (
   userData: RegisterFormData,
): Promise<AuthResponse> => {
   try {
      const response = await fetch(`${BASE_API_URL}/auth/register`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: JSON.stringify(userData),
      });
      const data: AuthResponse = await response.json();

      return data;
   } catch (error) {
      console.error("Error during registration:", error);
      return {
         success: false,
         error: "Network error",
      };
   }
};

export const loginUser = async (
   userData: LoginFormData,
): Promise<AuthResponse> => {
   try {
      const response = await fetch(`${BASE_API_URL}/auth/login`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: JSON.stringify(userData),
      });
      const data: AuthResponse = await response.json();

      return data;
   } catch (error) {
      console.error("Error during login:", error);
      return {
         success: false,
         error: "Network error",
      };
   }
};
