import React from "react";
import Box from "@mui/material/Box";
import Navbar, { NAV_HEIGHT } from "../components/Navbar";
import { Outlet, useLocation } from "react-router-dom";

/** Layout that renders Navbar once and pages below it. */
const RootLayout: React.FC = () => {
   const { pathname } = useLocation();
   const HIDE_NAV_PATHS = new Set(["/sign-up"]);
   const showNavbar = !HIDE_NAV_PATHS.has(pathname);

   return (
      <>
         {showNavbar && <Navbar />}
         <Box
            component="main"
            sx={{ pt: showNavbar ? `${NAV_HEIGHT}px` : 0, px: 3, pb: 6 }}
         >
            <Outlet />
         </Box>
      </>
   );
};

export default RootLayout;
