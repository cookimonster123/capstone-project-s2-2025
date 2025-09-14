import React from "react";

/** Global auth state via React Context (no window/global vars). */
type AuthContextType = {
   isLoggedIn: boolean;
   signIn: () => void;
   signOut: () => void;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
   children,
}) => {
   // Persist in localStorage so refresh won't reset it.
   const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(
      () => localStorage.getItem("isLoggedIn") === "true",
   );

   const signIn = () => {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
   };

   const signOut = () => {
      setIsLoggedIn(false);
      localStorage.setItem("isLoggedIn", "false");
   };

   const value = React.useMemo(
      () => ({ isLoggedIn, signIn, signOut }),
      [isLoggedIn],
   );
   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
   const ctx = React.useContext(AuthContext);
   if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
   return ctx;
};
