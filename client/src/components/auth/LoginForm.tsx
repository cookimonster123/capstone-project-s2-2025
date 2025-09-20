import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
   Alert,
   Box,
   Button,
   Checkbox,
   Container,
   FormControlLabel,
   IconButton,
   InputAdornment,
   Link,
   TextField,
   Typography,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import type { FormFieldErrors } from "@types";
import { loginUser } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginForm: React.FC = () => {
   const [formData, setFormData] = useState({ email: "", password: "" });
   const [message, setMessage] = useState("");
   const [loading, setLoading] = useState(false);
   const [errors, setErrors] = useState<FormFieldErrors>({});

   const [showPassword, setShowPassword] = useState(false);
   const [rememberMe, setRememberMe] = useState(false);

   const nav = useNavigate();
   const { signIn } = useAuth();

   // const navigate = useNavigate();

   useEffect(() => {
      try {
         const savedEmail = localStorage.getItem("rememberEmail");
         if (savedEmail) {
            setFormData((prev) => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
         }
      } catch (err) {
         setMessage(
            "Unable to load remembered email. Please check your browser settings.",
         );
      }
   }, []);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
      if (errors[name as keyof typeof errors]) {
         setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");
      setErrors({});

      const nextErrors: typeof errors = {};
      if (
         !formData.email ||
         !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
         nextErrors.email = "Please enter a valid email";
      }
      // Require password presence only (no length enforcement)
      if (!formData.password || formData.password.trim().length === 0) {
         nextErrors.password = "Please enter your password";
      }
      // Do not enforce client-side password length; rely on unified auth error
      if (Object.keys(nextErrors).length) {
         setErrors(nextErrors);
         setLoading(false);
         return;
      }

      const result = await loginUser(formData);
      if (result.success) {
         setMessage("Login successful!");
         // update global auth so Navbar reflects login state
         try {
            signIn();
         } catch (err) {
            setMessage(
               "Login succeeded, but session could not be established. Please refresh.",
            );
         }
         try {
            if (rememberMe) {
               localStorage.setItem("rememberEmail", formData.email);
            } else {
               localStorage.removeItem("rememberEmail");
            }
         } catch (err) {
            setMessage(
               "Unable to save your email preference. Please check your browser settings.",
            );
         }
         nav("/");
      } else {
         const errorMessage = result.error || "Login failed";
         // Clear success message for error cases
         setMessage("");

         if (/email/i.test(errorMessage)) {
            setErrors((prev) => ({ ...prev, email: errorMessage }));
         } else if (/password/i.test(errorMessage)) {
            setErrors((prev) => ({ ...prev, password: errorMessage }));
         } else if (/invalid credentials/i.test(errorMessage)) {
            setErrors((prev) => ({
               ...prev,
               form: "Invalid email or password",
            }));
         } else if (
            /not found|no account|user does not exist/i.test(errorMessage)
         ) {
            setErrors((prev) => ({ ...prev, form: "Account not found" }));
         } else {
            setErrors((prev) => ({ ...prev, form: errorMessage }));
         }
      }
      setLoading(false);
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
               startIcon={<ArrowBack sx={{ fontSize: "1.35rem" }} />}
               component={RouterLink}
               to="/"
               sx={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 9999,
               }}
            >
               Back
            </Button>
            {/* Move this to LoginPage */}
         </Box>

         <Box sx={{ width: "100%", maxWidth: 840, px: 2 }}>
            <Typography
               component="h1"
               variant="h3"
               align="center"
               fontWeight={700}
               gutterBottom
            >
               Welcome Back
            </Typography>
            <Typography align="center" color="text.secondary">
               Don't have an account?{" "}
               <Link component={RouterLink} to="/register">
                  Sign up
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
                  label="Email Address or Username"
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
                        fontSize: "1.15rem",
                        "&.MuiInputLabel-shrink": {
                           backgroundColor: "#eaf2ff",
                           px: 0.5,
                        },
                        "&:not(.MuiInputLabel-shrink)": {
                           transform: "translate(14px, 24px) scale(1)",
                        },
                     },
                  }}
                  sx={{
                     width: "100%",
                     "& .MuiInputBase-input": {
                        fontSize: "1.4rem",
                        py: 3,
                        px: 2.5,
                     },
                     "& .MuiFormHelperText-root": { fontSize: "1rem" },
                  }}
               />

               <TextField
                  margin="normal"
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                  InputLabelProps={{
                     sx: {
                        fontSize: "1.15rem",
                        "&.MuiInputLabel-shrink": {
                           backgroundColor: "#eaf2ff",
                           px: 0.5,
                        },
                        "&:not(.MuiInputLabel-shrink)": {
                           transform: "translate(14px, 24px) scale(1)",
                        },
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
                           fontSize: "1.4rem",
                           py: 3,
                           px: 2.5,
                        },
                     },
                  }}
                  sx={{
                     width: "100%",
                     "& .MuiFormHelperText-root": { fontSize: "1rem" },
                  }}
               />

               <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <FormControlLabel
                     control={
                        <Checkbox
                           checked={rememberMe}
                           onChange={(e) => setRememberMe(e.target.checked)}
                           color="primary"
                        />
                     }
                     label="Remember me"
                     sx={{
                        m: 0,
                        "& .MuiFormControlLabel-label": { fontSize: "1rem" },
                     }}
                  />
               </Box>

               <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disableElevation
                  sx={{
                     mt: 3,
                     py: 1.9,
                     fontSize: "1.15rem",
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
                  disabled={loading}
               >
                  {loading ? "Logging in…" : "Log in"}
               </Button>

               <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  <Button
                     type="button"
                     variant="text"
                     onClick={() => alert("Password reset is coming soon.")}
                  >
                     Forgot your password?
                  </Button>
               </Box>

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

export default LoginForm;
