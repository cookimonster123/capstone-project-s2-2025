import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
   Alert,
   Box,
   Button,
   Container,
   IconButton,
   InputAdornment,
   Link,
   TextField,
   Typography,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import { registerUser } from "../../api/authApi";
import type { FormFieldErrors, RegisterFormData } from "@types";

// Registration form (MUI)
const RegisterForm: React.FC = () => {
   const [formData, setFormData] = useState<RegisterFormData>({
      name: "",
      email: "",
      password: "",
   });
   const [showPassword, setShowPassword] = useState(false);
   const [message, setMessage] = useState("");
   const [errors, setErrors] = useState<FormFieldErrors>({});

   const nav = useNavigate();

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
      if (errors[name as keyof typeof errors]) {
         setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});
      setMessage("");

      const nextErrors: typeof errors = {};
      if (!formData.name || formData.name.trim().length < 1) {
         nextErrors.name = "Name is required";
      } else if (formData.name.trim().length > 30) {
         nextErrors.name = "Name must be at most 30 characters";
      }
      if (
         !formData.email ||
         !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
         nextErrors.email = "Please enter a valid email";
      }
      if (!formData.password || formData.password.length < 6) {
         nextErrors.password = "Password must be at least 6 characters";
      }
      if (Object.keys(nextErrors).length) {
         setErrors(nextErrors);
         return;
      }

      const result = await registerUser(formData);
      if (!result.success) {
         const errorMessage = result.error || "Registration failed";
         // Handle API errors
         if (/email/i.test(errorMessage)) {
            setErrors((prev) => ({ ...prev, email: errorMessage! }));
         } else if (/password/i.test(errorMessage)) {
            setErrors((prev) => ({ ...prev, password: errorMessage! }));
         } else if (/name/i.test(errorMessage)) {
            setErrors((prev) => ({ ...prev, name: errorMessage! }));
         } else if (/already registered/i.test(errorMessage)) {
            setErrors((prev) => ({
               ...prev,
               email: "This email is already registered",
            }));
         } else {
            setErrors((prev) => ({ ...prev, form: result.error! }));
         }
      } else {
         setMessage("Registration successful!");
         nav("/sign-in");
      }
   };

   return (
      <Container
         component="main"
         maxWidth={false}
         sx={{
            height: "calc(100dvh - 4rem)",
            display: "grid",
            placeItems: "center",
            p: 0,
            overflow: "hidden",
         }}
      >
         <Box sx={{ position: "fixed", top: 12, left: 12, zIndex: 1000 }}>
            <Button
               variant="text"
               size="medium"
               startIcon={
                  <ArrowBack
                     sx={{
                        fontSize: "1.35rem",
                        "@media (min-width: 2560px)": { fontSize: "1.75rem" },
                     }}
                  />
               }
               component={RouterLink}
               to="/"
               sx={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 9999,
                  "@media (min-width: 2560px)": {
                     fontSize: "1.4rem",
                     px: 2.25,
                     py: 1.25,
                  },
               }}
            >
               Back
            </Button>
         </Box>

         <Box
            sx={{
               width: "100%",
               maxWidth: 380,
               px: 2,
               "@media (min-width: 768px)": { maxWidth: 560 },
               "@media (min-width: 1024px)": { maxWidth: 680 },
               "@media (min-width: 1440px)": { maxWidth: 820 },
               "@media (min-width: 2560px)": { maxWidth: 1040 },
            }}
         >
            <Typography
               component="h1"
               variant="h3"
               align="center"
               fontWeight={700}
               gutterBottom
               sx={{
                  fontSize: {
                     xs: 28,
                     sm: 30,
                     md: 34,
                     lg: 38,
                  },
                  "@media (min-width: 1440px)": { fontSize: 40 },
                  "@media (min-width: 2560px)": { fontSize: 48 },
               }}
            >
               Create an account
            </Typography>
            <Typography align="center" color="text.secondary">
               Already have an account?{" "}
               <Link component={RouterLink} to="/sign-in">
                  Log in
               </Link>
            </Typography>

            <Box
               component="form"
               onSubmit={handleSubmit}
               noValidate
               sx={{ mt: 2 }}
            >
               <TextField
                  margin="normal"
                  fullWidth
                  label="What should we call you?"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  InputLabelProps={{
                     sx: {
                        fontSize: {
                           xs: "1rem",
                           sm: "1.05rem",
                           md: "1.1rem",
                           lg: "1.15rem",
                        },
                        "&.MuiInputLabel-shrink": {
                           backgroundColor: "#eaf2ff",
                           px: 0.5,
                        },
                        "&:not(.MuiInputLabel-shrink)": {
                           transform: "translate(14px, 24px) scale(1)",
                        },
                        "@media (min-width: 2560px)": { fontSize: "1.25rem" },
                     },
                  }}
                  sx={{
                     "& .MuiInputBase-input": {
                        fontSize: {
                           xs: "1rem",
                           sm: "1.05rem",
                           md: "1.15rem",
                           lg: "1.2rem",
                        },
                        py: { xs: 2, sm: 2.25, md: 2.5 },
                        px: { xs: 2, sm: 2.25, md: 2.5 },
                        "@media (min-width: 2560px)": {
                           fontSize: "1.3rem",
                           py: 2.75,
                           px: 2.75,
                        },
                     },
                     "& .MuiFormHelperText-root": { fontSize: "1rem" },
                  }}
               />

               <TextField
                  margin="normal"
                  fullWidth
                  label="What's your email?"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  autoComplete="email"
                  required
                  InputLabelProps={{
                     sx: {
                        fontSize: {
                           xs: "1rem",
                           sm: "1.05rem",
                           md: "1.1rem",
                           lg: "1.15rem",
                        },
                        "&.MuiInputLabel-shrink": {
                           backgroundColor: "#eaf2ff",
                           px: 0.5,
                        },
                        "&:not(.MuiInputLabel-shrink)": {
                           transform: "translate(14px, 24px) scale(1)",
                        },
                        "@media (min-width: 2560px)": { fontSize: "1.25rem" },
                     },
                  }}
                  sx={{
                     "& .MuiInputBase-input": {
                        fontSize: {
                           xs: "1rem",
                           sm: "1.05rem",
                           md: "1.15rem",
                           lg: "1.2rem",
                        },
                        py: { xs: 2, sm: 2.25, md: 2.5 },
                        px: { xs: 2, sm: 2.25, md: 2.5 },
                        "@media (min-width: 2560px)": {
                           fontSize: "1.3rem",
                           py: 2.75,
                           px: 2.75,
                        },
                     },
                     "& .MuiFormHelperText-root": { fontSize: "1rem" },
                  }}
               />

               <TextField
                  margin="normal"
                  fullWidth
                  label="Create a password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={
                     errors.password ||
                     "Use 8+ chars with letters, numbers & symbols"
                  }
                  required
                  InputLabelProps={{
                     sx: {
                        fontSize: {
                           xs: "1rem",
                           sm: "1.05rem",
                           md: "1.1rem",
                           lg: "1.15rem",
                        },
                        "&.MuiInputLabel-shrink": {
                           backgroundColor: "#eaf2ff",
                           px: 0.5,
                        },
                        "&:not(.MuiInputLabel-shrink)": {
                           transform: "translate(14px, 24px) scale(1)",
                        },
                        "@media (min-width: 2560px)": { fontSize: "1.25rem" },
                     },
                  }}
                  InputProps={{
                     endAdornment: (
                        <InputAdornment position="end" sx={{ mr: 1 }}>
                           <IconButton
                              aria-label={
                                 showPassword
                                    ? "Hide password"
                                    : "Show password"
                              }
                              onClick={() => setShowPassword((p) => !p)}
                              edge="end"
                              disableRipple
                              disableFocusRipple
                              sx={{
                                 outline: "none",
                                 boxShadow: "none",
                                 "&:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                 },
                                 "&:focus-visible": {
                                    outline: "none",
                                    boxShadow: "none",
                                 },
                              }}
                           >
                              {showPassword ? (
                                 <VisibilityOff />
                              ) : (
                                 <Visibility />
                              )}
                           </IconButton>
                        </InputAdornment>
                     ),
                     sx: {
                        "& .MuiInputBase-input": {
                           fontSize: {
                              xs: "1rem",
                              sm: "1.05rem",
                              md: "1.15rem",
                              lg: "1.2rem",
                           },
                           py: { xs: 2, sm: 2.25, md: 2.5 },
                           px: { xs: 2, sm: 2.25, md: 2.5 },
                           "@media (min-width: 2560px)": {
                              fontSize: "1.3rem",
                              py: 2.75,
                              px: 2.75,
                           },
                        },
                     },
                  }}
                  sx={{ "& .MuiFormHelperText-root": { fontSize: "1rem" } }}
               />

               <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disableElevation
                  sx={{
                     mt: 3.5,
                     py: { xs: 1.25, sm: 1.5, md: 1.75 },
                     fontSize: {
                        xs: "1rem",
                        sm: "1.05rem",
                        md: "1.1rem",
                        lg: "1.15rem",
                     },
                     "@media (min-width: 2560px)": {
                        py: 2,
                        fontSize: "1.25rem",
                     },
                     borderRadius: 9999,
                     backgroundColor: "#1976d2",
                     color: "#fff",
                     textTransform: "none",
                     boxShadow: "none",
                     "&:hover": {
                        backgroundColor: "#1565c0",
                        boxShadow: "none",
                     },
                     "&:active": { boxShadow: "none" },
                     "&:disabled": {
                        backgroundColor: "#90caf9",
                        color: "#fff",
                     },
                  }}
               >
                  Create an account
               </Button>

               {message && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                     {message}
                  </Alert>
               )}
               {errors.form && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                     {errors.form}
                  </Alert>
               )}
            </Box>
         </Box>
      </Container>
   );
};

export default RegisterForm;
