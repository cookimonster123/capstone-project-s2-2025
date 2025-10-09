import RegisterForm from "../components/auth/RegisterForm";
import React from "react";
import { Box } from "@mui/material";
import AdaptiveAuthBackground from "../components/animations/AdaptiveAuthBackground";

const RegisterPage: React.FC = () => {
   return (
      <Box
         sx={{
            minHeight: "100dvh",
            width: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pt: 3,
            pb: 3,
            px: 3,
            mx: -3,
            mb: -6,
            boxSizing: "border-box",
            overflow: "hidden",
            position: "relative",
         }}
      >
         {/* Adaptive Background: Nebula in Dark Mode, Abstract Art in Light Mode */}
         <AdaptiveAuthBackground />

         <Box sx={{ position: "relative", zIndex: 10 }}>
            <RegisterForm />
         </Box>
      </Box>
   );
};

export default RegisterPage;
