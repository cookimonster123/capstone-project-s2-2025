import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type ProtectedRouteProps = {
   children: React.ReactElement;
   roles?: Array<"visitor" | "admin" | "staff" | "capstoneStudent">;
   redirectTo?: string;
};

/**
 * ProtectedRoute
 * - Requires auth; optionally enforces role-based access
 * - While loading auth bootstrap, renders nothing (or a tiny placeholder)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
   children,
   roles,
   redirectTo = "/sign-in",
}) => {
   const { isLoggedIn, user, loading } = useAuth();
   const location = useLocation();

   if (loading) {
      // Could replace with a full-screen spinner later
      return null;
   }

   if (!isLoggedIn || !user) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
   }

   if (roles && roles.length > 0) {
      const allowed = roles.includes(user.role as any);
      if (!allowed) {
         // No permission: send home for now
         return <Navigate to="/" replace />;
      }
   }

   return children;
};

export default ProtectedRoute;
