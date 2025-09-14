import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import ProjectGalleryPage from "./pages/ProjectGalleryPage";

export const router = createBrowserRouter([
   {
      path: "/",
      element: <RootLayout />,
      children: [{ path: "projects", element: <ProjectGalleryPage /> }],
   },
]);
