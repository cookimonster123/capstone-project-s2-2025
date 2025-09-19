import React from "react";
import Box from "@mui/material/Box";
import Navbar, { NAV_HEIGHT } from "../components/Navbar";
import { Outlet } from "react-router-dom";

/** Layout that renders Navbar once and pages below it. */
const RootLayout: React.FC = () => {
   return (
      <>
         <Navbar />
         <Box component="main" sx={{ pt: `${NAV_HEIGHT}px`, px: 3, pb: 6 }}>
            <Outlet />
         </Box>
      </>
   );
};

export default RootLayout;
