import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import ProjectGalleryPage from "./pages/ProjectGalleryPage";
import LoginPage from "./pages/LoginPage";

export const router = createBrowserRouter([
   {
      path: "/",
      element: <RootLayout />,
      children: [
         { path: "projects", element: <ProjectGalleryPage /> },
         { path: "sign-in", element: <LoginPage /> },
      ],
   },
]);
