import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import ProjectGalleryPage from "./pages/ProjectGalleryPage";
import LoginPage from "./pages/LoginPage";
import ProjectProfilePage from "./pages/ProjectProfile";

export const router = createBrowserRouter([
   {
      path: "/",
      element: <RootLayout />,
      children: [
         { index: true, element: <Navigate to="projects" replace /> },
         { path: "projects", element: <ProjectGalleryPage /> },
         { path: "profile/:id", element: <ProjectProfilePage /> },
         { path: "sign-in", element: <LoginPage /> },
      ],
   },
]);
