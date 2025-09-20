import LoginForm from "../components/auth/LoginForm";
import React from "react";

const LoginPage: React.FC = () => {
   return (
      <div
         style={{
            minHeight: "100dvh",
            width: "100vw",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            boxSizing: "border-box",
            overflowX: "hidden",
            overflowY: "auto",
         }}
      >
         <LoginForm />
      </div>
   );
};

export default LoginPage;
