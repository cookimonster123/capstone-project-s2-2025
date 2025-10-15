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

export const requestRegisterMagicLink = async (
   userData: RegisterFormData,
): Promise<{ success: boolean; error?: string }> => {
   try {
      const response = await fetch(
         `${BASE_API_URL}/auth/register/request-magic-link`,
         {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(userData),
         },
      );
      const data = await response.json();
      return data;
   } catch (error) {
      console.error("Error requesting magic link:", error);
      return { success: false, error: "Network error" };
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

// Google OAuth login using Google Identity credential
export const loginWithGoogle = async (
   credential: string,
): Promise<{ success: boolean; data?: any; error?: string }> => {
   try {
      const response = await fetch(`${BASE_API_URL}/auth/google`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: JSON.stringify({ credential }),
      });
      const data = await response.json();
      if (!response.ok)
         return { success: false, error: data?.error || "Login failed" };
      return data;
   } catch (err: any) {
      return { success: false, error: err?.message || "Network error" };
   }
};

export const checkEmailExists = async (
   email: string,
): Promise<{ success: boolean; exists?: boolean; error?: string }> => {
   try {
      const url = new URL(`${BASE_API_URL}/auth/check-email`);
      url.searchParams.set("email", email);
      const response = await fetch(url.toString(), { credentials: "include" });
      const data = await response.json();
      if (data?.success && data?.data) {
         return { success: true, exists: !!data.data.exists };
      }
      return { success: false, error: data?.error || "Request failed" };
   } catch (error) {
      console.error("Error checking email:", error);
      return { success: false, error: "Network error" };
   }
};

export const requestPasswordReset = async (
   email: string,
): Promise<{ success: boolean; error?: string }> => {
   try {
      const response = await fetch(
         `${BASE_API_URL}/auth/password/request-reset`,
         {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email }),
         },
      );
      const data = await response.json();
      return data;
   } catch (error) {
      console.error("Error requesting password reset:", error);
      return { success: false, error: "Network error" };
   }
};

export const resetPassword = async (params: {
   token: string;
   password: string;
}): Promise<{ success: boolean; error?: string }> => {
   try {
      const response = await fetch(`${BASE_API_URL}/auth/password/reset`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: JSON.stringify(params),
      });
      const data = await response.json();
      return data;
   } catch (error) {
      console.error("Error resetting password:", error);
      return { success: false, error: "Network error" };
   }
};
