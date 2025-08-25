import React, { useState } from "react";

const RegisterForm: React.FC = () => {
   const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
   });

   const [message, setMessage] = useState("");

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   };

   const handleSubmit = async (e: React.FormEvent) => {
      // move this
      e.preventDefault();
      try {
         const response = await fetch(
            "http://localhost:3000/api/auth/register",
            {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(formData),
            },
         );

         const data = await response.json();

         if (response.ok) {
            setMessage("Registration successful!");
            console.log("Token:", data.token);
         } else {
            setMessage(`Error: ${data.error}`);
         }
         let errorMsg = "A network error occurred. Please check your internet connection and try again.";
         if (error instanceof TypeError) {
            // TypeError is often thrown for failed fetch due to network issues
            errorMsg = "Unable to connect to the server. Please check your internet connection or try again later.";
         } else if (error && typeof error === "object" && "message" in error) {
            errorMsg = `Error: ${(error as Error).message}`;
         }
         setMessage(errorMsg);
         console.error("Error:", error);
      }
   };

   return (
      <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
         <h2>Sign Up</h2>
         <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
               <label>Name:</label>
               <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
               />
            </div>

            <div style={{ marginBottom: "15px" }}>
               <label>Email:</label>
               <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
               />
            </div>

            <div style={{ marginBottom: "15px" }}>
               <label>Password:</label>
               <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
               />
            </div>

            <button
               type="submit"
               style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
               }}
            >
               Sign Up
            </button>
         </form>

         {message && (
            <div
               style={{
                  marginTop: "20px",
                  padding: "10px",
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #ddd",
               }}
            >
               {message}
            </div>
         )}
      </div>
   );
};

export default RegisterForm;
