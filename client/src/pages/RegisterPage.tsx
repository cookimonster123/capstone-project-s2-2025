import RegisterForm from "../components/auth/RegisterForm";
import React from "react";

const RegisterPage: React.FC = () => {
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
         <RegisterForm />
      </div>
   );
};

export default RegisterPage;
