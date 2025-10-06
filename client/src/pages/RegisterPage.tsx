import RegisterForm from "../components/auth/RegisterForm";
import React from "react";

const RegisterPage: React.FC = () => {
   return (
      <div
         style={{
            minHeight: "100dvh",
            width: "auto",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 24,
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
            marginLeft: -24,
            marginRight: -24,
            marginBottom: -48,
            boxSizing: "border-box",
            overflowX: "clip",
            overflowY: "auto",
         }}
      >
         <RegisterForm />
      </div>
   );
};

export default RegisterPage;
