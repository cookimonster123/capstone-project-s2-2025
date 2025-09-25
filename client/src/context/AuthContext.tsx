import React from "react";

export type AuthUser = {
   id: string;
   name: string;
   email: string;
   role: string;
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
