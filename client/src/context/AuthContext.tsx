import React from "react";
import { fetchUserById } from "../api/userApi";

export type AuthUser = {
   id: string;
   name: string;
   email: string;
   role: string;
   profilePicture?: string;
};

type AuthContextType = {
   isLoggedIn: boolean;
   user: AuthUser | null;
   loading: boolean;
   signIn: (user: AuthUser) => void;
   signOut: () => void;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
   children,
}) => {
   const [user, setUser] = React.useState<AuthUser | null>(null);
   const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
   const [loading, setLoading] = React.useState<boolean>(true);

   // Check auth status on initial load
   React.useEffect(() => {
      try {
         const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
         const rawUser = localStorage.getItem("authUser");
         const storedUser = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;

         if (loggedInStatus && storedUser) {
            setIsLoggedIn(true);
            setUser(storedUser);
         }
      } catch (error) {
         console.error("Failed to parse auth user from localStorage", error);

         localStorage.removeItem("isLoggedIn");
         localStorage.removeItem("authUser");
      } finally {
         setLoading(false);
      }
   }, []);

   // HYDRATION: if we have a user id but no valid profilePicture, fetch canonical user
   React.useEffect(() => {
      let cancelled = false;
      const shouldFetch =
         !!user?.id &&
         // treat empty string or non-string as "missing"
         !(
            typeof user.profilePicture === "string" &&
            user.profilePicture.trim().length > 0
         );

      if (!shouldFetch) return;

      (async () => {
         try {
            const res = await fetchUserById(user!.id);
            const info = res?.user;
            if (!info) return;
            // determine id shape
            const idStr = (info as any)?._id ?? (info as any)?.id ?? user!.id;
            const pic =
               typeof (info as any)?.profilePicture === "string" &&
               (info as any).profilePicture.trim().length > 0
                  ? (info as any).profilePicture.trim()
                  : undefined;

            if (!cancelled) {
               const updated: AuthUser = {
                  id: idStr,
                  name: info.name ?? user!.name,
                  email: info.email ?? user!.email,
                  role: info.role ?? user!.role,
                  profilePicture: pic,
               };
               setUser(updated);
               try {
                  localStorage.setItem("authUser", JSON.stringify(updated));
               } catch {
                  /* ignore localStorage write errors */
               }
            }
         } catch (err) {
            // non-fatal: keep existing local user
            // console.debug("Failed to hydrate auth user:", err);
         }
      })();

      return () => {
         cancelled = true;
      };
   }, [user?.id]);

   const signIn = (u: AuthUser) => {
      setIsLoggedIn(true);
      setUser(u);
      localStorage.setItem("isLoggedIn", "true");
      try {
         localStorage.setItem("authUser", JSON.stringify(u));
      } catch {}
   };

   const signOut = () => {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.setItem("isLoggedIn", "false");
      try {
         localStorage.removeItem("authUser");
      } catch {}
   };

   const value = React.useMemo(
      () => ({ isLoggedIn, user, loading, signIn, signOut }),
      [isLoggedIn, user, loading],
   );
   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
   const ctx = React.useContext(AuthContext);
   if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
   return ctx;
};
