import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import ProjectGalleryPage from "./pages/ProjectGalleryPage";
import ProjectProfilePage from "./pages/ProjectProfile";
import UploadProjectPage from "./pages/UploadProjectPage";
import StudentDashboard from "./pages/StudentDashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export const router = createBrowserRouter([
   {
      path: "/",
      element: <RootLayout />,
      children: [
         { index: true, element: <Navigate to="projects" replace /> },
         { path: "projects", element: <ProjectGalleryPage /> },
         { path: "profile", element: <StudentDashboard /> },
         { path: "profile/:id", element: <ProjectProfilePage /> },
         { path: "upload", element: <UploadProjectPage /> },
         { path: "sign-in", element: <LoginPage /> },
         { path: "register", element: <RegisterPage /> },
         { path: "login", element: <Navigate to="/sign-in" replace /> },
      ],
   },
]);
