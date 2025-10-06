import LoginForm from "../components/auth/LoginForm";
import React from "react";

const LoginPage: React.FC = () => {
   return (
      <div
         style={{
            minHeight: "100dvh",
            width: "auto", // avoid 100vw which causes horizontal overflow inside RootLayout padding
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 24,
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
            // Extend white background to the edges of RootLayout (px:3) and bottom (pb:6)
            marginLeft: -24,
            marginRight: -24,
            marginBottom: -48,
            boxSizing: "border-box",
            overflowX: "clip",
            overflowY: "auto",
         }}
      >
         <LoginForm />
      </div>
   );
};

export default LoginPage;
