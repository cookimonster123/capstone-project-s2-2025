import { createBrowserRouter, Navigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import RootLayout from "./layouts/RootLayout";
import ProjectGalleryPage from "./pages/ProjectGalleryPage";
import ProjectGalleryMobilePage from "./pages/ProjectGalleryMobilePage";
import ProjectProfilePage from "./pages/ProjectProfile";
import ProjectProfileMobilePage from "./pages/ProjectProfileMobilePage";
import LandingPage from "./pages/LandingPage";
import UploadProjectPage from "./pages/UploadProjectPage";
import StudentDashboard from "./pages/StudentDashboard";
import StudentDashboardMobilePage from "./pages/StudentDashboardMobilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AboutPage from "./pages/AboutPage";

export const router = createBrowserRouter([
   {
      path: "/",
      element: <RootLayout />,
      children: [
         { index: true, element: <LandingPage /> },
         {
            path: "projects",
            element: <ProjectsResponsive />,
         },
         { path: "projects-mobile", element: <ProjectGalleryMobilePage /> },
         { path: "profile", element: <ProfileResponsive /> },
         { path: "profile/:id", element: <ProjectProfileResponsive /> },
         { path: "upload", element: <UploadProjectPage /> },
         { path: "sign-in", element: <LoginPage /> },
         { path: "register", element: <RegisterPage /> },
         { path: "login", element: <Navigate to="/sign-in" replace /> },
         {
            path: "staff",
            element: (
               <ProtectedRoute roles={["staff"]}>
                  <StaffDashboard />
               </ProtectedRoute>
            ),
         },
         {
            path: "admin",
            element: (
               <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
               </ProtectedRoute>
            ),
         },
         { path: "/about", element: <AboutPage /> },
      ],
   },
]);

// Responsive wrapper that swaps the gallery component based on viewport width
function ProjectsResponsive() {
   const isMobile = useMediaQuery("(max-width:600px)");
   return isMobile ? <ProjectGalleryMobilePage /> : <ProjectGalleryPage />;
}

// Responsive wrapper for Student Dashboard
function ProfileResponsive() {
   const isMobile = useMediaQuery("(max-width:600px)");
   return isMobile ? <StudentDashboardMobilePage /> : <StudentDashboard />;
}

// Responsive wrapper for Project Profile details page
function ProjectProfileResponsive() {
   const isMobile = useMediaQuery("(max-width:600px)");
   return isMobile ? <ProjectProfileMobilePage /> : <ProjectProfilePage />;
}
