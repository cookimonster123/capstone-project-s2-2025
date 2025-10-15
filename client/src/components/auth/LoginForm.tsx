/**
 * LoginForm Component
 * Handles user authentication with dark mode support
 * Fixed: Added InputProps sx for proper background color control
 */
import React, { useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
   Alert,
   Box,
   Button,
   Checkbox,
   Container,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   FormControlLabel,
   IconButton,
   InputAdornment,
   Link,
   TextField,
   Typography,
   useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import type { FormFieldErrors } from "@types";
import {
   loginUser,
   loginWithGoogle,
   checkEmailExists,
   requestPasswordReset,
} from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginForm: React.FC = () => {
   const theme = useTheme();
   const [formData, setFormData] = useState({ email: "", password: "" });
   const [message, setMessage] = useState("");
   const [loading, setLoading] = useState(false);
   const [errors, setErrors] = useState<FormFieldErrors>({});
   const googleButtonRef = useRef<HTMLDivElement | null>(null);
   const googleInitRef = useRef(false);

   const [showPassword, setShowPassword] = useState(false);
   const [rememberMe, setRememberMe] = useState(false);
   const [resetOpen, setResetOpen] = useState(false);
   const [resetEmail, setResetEmail] = useState("");
   const [resetError, setResetError] = useState<string | undefined>(undefined);
   const [resetSubmitting, setResetSubmitting] = useState(false);
   const [forgotDisabled, setForgotDisabled] = useState(false);

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

   // Initialize Google Identity Services once and render the official Sign-In button
   useEffect(() => {
      const initGoogle = async () => {
         if (googleInitRef.current) return;
         const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
            | string
            | undefined;
         if (!clientId) {
            // Config missing; do not block the page, but surface a clear error when the user tries
            return;
         }

         try {
            (window as any).google.accounts.id.initialize({
               client_id: clientId,
               // Avoid FedCM AbortError path; rely on popup/button flow
               use_fedcm_for_prompt: false,
               itp_support: true,
               callback: async (response: any) => {
                  try {
                     if (!response?.credential) {
                        setErrors((prev) => ({
                           ...prev,
                           form: "Google login failed: No credential returned",
                        }));
                        return;
                     }
                     const result = await loginWithGoogle(response.credential);
                     if (result.success && result.data?.user) {
                        const u = result.data.user;
                        const pic =
                           typeof u.profilePicture === "string" &&
                           u.profilePicture.trim() !== ""
                              ? u.profilePicture.trim()
                              : undefined;
                        signIn({
                           id: u.id,
                           name: u.name,
                           email: u.email,
                           role: u.role,
                           ...(pic ? { profilePicture: pic } : {}),
                        });
                        const role = u.role;
                        if (role === "admin") nav("/admin");
                        else if (role === "staff") nav("/staff");
                        else nav("/");
                     } else {
                        setErrors((prev) => ({
                           ...prev,
                           form: result.error || "Google login failed",
                        }));
                     }
                  } catch (e: any) {
                     setErrors((prev) => ({
                        ...prev,
                        form: e?.message || "Google login error",
                     }));
                  }
               },
            });

            // Render the official Sign-In button (popup based, resilient across browsers)
            if (googleButtonRef.current) {
               try {
                  (window as any).google.accounts.id.renderButton(
                     googleButtonRef.current,
                     {
                        type: "standard",
                        theme:
                           theme.palette.mode === "dark"
                              ? "filled_black"
                              : "outline",
                        size: "large",
                        text: "continue_with",
                        shape: "rectangular",
                        logo_alignment: "left",
                     },
                  );
               } catch (e) {
                  // best-effort; ignore render errors
               }
            }

            // Try a non-intrusive prompt; add diagnostics for visibility
            try {
               (window as any).google.accounts.id.prompt(
                  (notification: any) => {
                     const logPrefix = "Google prompt: ";
                     if (
                        notification.isNotDisplayed &&
                        notification.isNotDisplayed()
                     ) {
                        const reason =
                           notification.getNotDisplayedReason?.() ||
                           "not_displayed";
                        console.info(logPrefix + "not_displayed -", reason);
                     } else if (
                        notification.isSkippedMoment &&
                        notification.isSkippedMoment()
                     ) {
                        const reason =
                           notification.getSkippedReason?.() || "skipped";
                        console.info(logPrefix + "skipped -", reason);
                     } else if (
                        notification.isDismissedMoment &&
                        notification.isDismissedMoment()
                     ) {
                        const reason =
                           notification.getDismissedReason?.() || "dismissed";
                        console.info(logPrefix + "dismissed -", reason);
                     }
                  },
               );
            } catch {}

            googleInitRef.current = true;
         } catch (e) {
            // Initialization failed; user can still use the email/password path
         }
      };

      const ensureScript = () =>
         new Promise<void>((resolve, reject) => {
            if ((window as any).google?.accounts?.id) return resolve();
            const existing = document.querySelector<HTMLScriptElement>(
               "script[src='https://accounts.google.com/gsi/client']",
            );
            if (existing) {
               existing.addEventListener("load", () => resolve());
               existing.addEventListener("error", () =>
                  reject(new Error("Failed to load Google script")),
               );
               return;
            }
            const s = document.createElement("script");
            s.src = "https://accounts.google.com/gsi/client";
            s.async = true;
            s.defer = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("Failed to load Google script"));
            document.head.appendChild(s);
         });

      ensureScript()
         .then(() => initGoogle())
         .catch(() => {
            // Script failed; do nothing (email login remains)
         });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [theme.palette.mode]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
      if (errors[name as keyof typeof errors]) {
         setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
   };

   const openResetDialog = () => {
      setResetEmail(formData.email || "");
      setResetError(undefined);
      setResetSubmitting(false);
      setResetOpen(true);
   };

   const closeResetDialog = () => {
      setResetOpen(false);
      setResetSubmitting(false);
   };

   const handleResetSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (resetSubmitting) return;
      const email = resetEmail.trim();

      // Use same validation rules as login email field
      const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      // Only proceed (and show message) after input validation succeeds
      setMessage("");
      if (!email || !isValidFormat) {
         setResetError("Please enter a valid email");
         return;
      }
      const domain = email.split("@")[1]?.toLowerCase();
      if (domain === "aucklanduni.ac.nz") {
         setResetError("Please log in with Google");
         return;
      }

      // Optimistic message and disable triggers (after validation)
      setMessage("We've emailed you a one-time reset verify link");
      setResetSubmitting(true);
      setForgotDisabled(true);
      setResetOpen(false);

      // Check against backend for existence and send link
      (async () => {
         const res = await checkEmailExists(email);
         if (!res.success) {
            setResetError(res.error || "Unable to verify email");
            setResetSubmitting(false);
            setForgotDisabled(false);
            setMessage("");
            setResetOpen(true);
            return;
         }
         if (!res.exists) {
            setResetError("User email does not exist");
            setResetSubmitting(false);
            setForgotDisabled(false);
            setMessage("");
            setResetOpen(true);
            return;
         }

         const send = await requestPasswordReset(email);
         if (!send.success) {
            setResetError(send.error || "Failed to send reset link");
            setResetSubmitting(false);
            setForgotDisabled(false);
            setMessage("");
            setResetOpen(true);
            return;
         }

         setResetError(undefined);
         // Keep optimistic message; keep Forgot disabled to prevent spamming
         setResetSubmitting(false);
      })();
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
      } else {
         const domain = formData.email.split("@")[1]?.toLowerCase();
         if (domain === "aucklanduni.ac.nz") {
            nextErrors.email = "Please log in with Google";
         }
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
            if (result.data?.user) {
               // Persist user into global auth context/localStorage
               const serverUser = result.data.user;
               const pic =
                  typeof serverUser.profilePicture === "string" &&
                  serverUser.profilePicture.trim() !== ""
                     ? serverUser.profilePicture.trim()
                     : undefined;
               signIn({
                  id: result.data.user.id,
                  name: result.data.user.name,
                  email: result.data.user.email,
                  role: result.data.user.role,
                  ...(pic ? { profilePicture: pic } : {}),
               });

               // Role-based navigation
               const userRole = result.data.user.role;

               if (userRole === "admin") {
                  nav("/admin");
               } else if (userRole === "staff") {
                  nav("/staff");
               } else {
                  nav("/");
               }
            } else {
               setMessage(
                  "Login succeeded but missing user data. Please refresh.",
               );
            }
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
      <>
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
                           "@media (min-width: 2560px)": {
                              fontSize: "1.75rem",
                           },
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
               {/* Move this to LoginPage */}
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
                     label="Email Address"
                     name="email"
                     type="email"
                     value={formData.email}
                     onChange={handleChange}
                     error={!!errors.email}
                     helperText={errors.email}
                     autoComplete="email"
                     required
                     InputProps={{
                        style: {
                           backgroundColor:
                              theme.palette.mode === "dark"
                                 ? "#1a1f2e"
                                 : "rgba(255, 255, 255, 0.9)",
                        },
                        sx: {
                           bgcolor:
                              theme.palette.mode === "dark"
                                 ? "#1a1f2e !important"
                                 : "rgba(255, 255, 255, 0.9) !important",
                           backdropFilter: "blur(10px)",
                           "& .MuiOutlinedInput-input": {
                              bgcolor:
                                 theme.palette.mode === "dark"
                                    ? "#1a1f2e !important"
                                    : "rgba(255, 255, 255, 0.9) !important",
                           },
                        },
                     }}
                     InputLabelProps={{
                        sx: {
                           fontSize: {
                              xs: "1rem",
                              sm: "1.05rem",
                              md: "1.1rem",
                              lg: "1.15rem",
                           },
                           "&.MuiInputLabel-shrink": {
                              backgroundColor: (theme) =>
                                 theme.palette.mode === "dark"
                                    ? "rgba(26, 31, 46, 0.95)"
                                    : "rgba(255, 255, 255, 0.95)",
                              px: 0.5,
                           },
                           "&:not(.MuiInputLabel-shrink)": {
                              transform: "translate(14px, 24px) scale(1)",
                           },
                           "@media (min-width: 2560px)": {
                              fontSize: "1.25rem",
                           },
                        },
                     }}
                     sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                           bgcolor:
                              theme.palette.mode === "dark"
                                 ? "#1a1f2e !important"
                                 : "rgba(255, 255, 255, 0.9) !important",
                           backdropFilter: "blur(10px)",
                           "& fieldset": {
                              borderColor:
                                 theme.palette.mode === "dark"
                                    ? "#2d3548"
                                    : "rgba(0, 0, 0, 0.12)",
                           },
                           "&:hover fieldset": {
                              borderColor:
                                 theme.palette.mode === "dark"
                                    ? "#3d4558"
                                    : "rgba(0, 0, 0, 0.23)",
                           },
                           "&.Mui-focused fieldset": {
                              borderColor: "#1976d2",
                           },
                        },
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
                           "&:-webkit-autofill": {
                              WebkitBoxShadow:
                                 theme.palette.mode === "dark"
                                    ? "0 0 0 100px #1a1f2e inset !important"
                                    : "0 0 0 100px rgba(255, 255, 255, 0.9) inset !important",
                              WebkitTextFillColor:
                                 theme.palette.mode === "dark"
                                    ? "#e8eaed !important"
                                    : "#1d1d1f !important",
                              caretColor:
                                 theme.palette.mode === "dark"
                                    ? "#e8eaed"
                                    : "#1d1d1f",
                              borderRadius: "4px",
                           },
                           "&:-webkit-autofill:hover": {
                              WebkitBoxShadow:
                                 theme.palette.mode === "dark"
                                    ? "0 0 0 100px #1a1f2e inset !important"
                                    : "0 0 0 100px rgba(255, 255, 255, 0.9) inset !important",
                           },
                           "&:-webkit-autofill:focus": {
                              WebkitBoxShadow:
                                 theme.palette.mode === "dark"
                                    ? "0 0 0 100px #1a1f2e inset !important"
                                    : "0 0 0 100px rgba(255, 255, 255, 0.9) inset !important",
                           },
                           "&:-webkit-autofill:active": {
                              WebkitBoxShadow:
                                 theme.palette.mode === "dark"
                                    ? "0 0 0 100px #1a1f2e inset !important"
                                    : "0 0 0 100px rgba(255, 255, 255, 0.9) inset !important",
                           },
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
                           fontSize: {
                              xs: "1rem",
                              sm: "1.05rem",
                              md: "1.1rem",
                              lg: "1.15rem",
                           },
                           "&.MuiInputLabel-shrink": {
                              backgroundColor: (theme) =>
                                 theme.palette.mode === "dark"
                                    ? "rgba(26, 31, 46, 0.95)"
                                    : "rgba(255, 255, 255, 0.95)",
                              px: 0.5,
                           },
                           "&:not(.MuiInputLabel-shrink)": {
                              transform: "translate(14px, 24px) scale(1)",
                           },
                           "@media (min-width: 2560px)": {
                              fontSize: "1.25rem",
                           },
                        },
                     }}
                     InputProps={{
                        style: {
                           backgroundColor:
                              theme.palette.mode === "dark"
                                 ? "#1a1f2e"
                                 : "rgba(255, 255, 255, 0.9)",
                        },
                        sx: {
                           bgcolor:
                              theme.palette.mode === "dark"
                                 ? "#1a1f2e !important"
                                 : "rgba(255, 255, 255, 0.9) !important",
                           backdropFilter: "blur(10px)",
                           "& .MuiOutlinedInput-input": {
                              bgcolor:
                                 theme.palette.mode === "dark"
                                    ? "#1a1f2e !important"
                                    : "rgba(255, 255, 255, 0.9) !important",
                           },
                        },
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
                     }}
                     sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                           bgcolor:
                              theme.palette.mode === "dark"
                                 ? "#1a1f2e !important"
                                 : "rgba(255, 255, 255, 0.9) !important",
                           backdropFilter: "blur(10px)",
                           "& fieldset": {
                              borderColor:
                                 theme.palette.mode === "dark"
                                    ? "#2d3548"
                                    : "rgba(0, 0, 0, 0.12)",
                           },
                           "&:hover fieldset": {
                              borderColor:
                                 theme.palette.mode === "dark"
                                    ? "#3d4558"
                                    : "rgba(0, 0, 0, 0.23)",
                           },
                           "&.Mui-focused fieldset": {
                              borderColor: "#1976d2",
                           },
                        },
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
                           "&:-webkit-autofill": {
                              WebkitBoxShadow:
                                 theme.palette.mode === "dark"
                                    ? "0 0 0 100px #1a1f2e inset !important"
                                    : "0 0 0 100px rgba(255, 255, 255, 0.9) inset !important",
                              WebkitTextFillColor:
                                 theme.palette.mode === "dark"
                                    ? "#e8eaed !important"
                                    : "#1d1d1f !important",
                              caretColor:
                                 theme.palette.mode === "dark"
                                    ? "#e8eaed"
                                    : "#1d1d1f",
                              borderRadius: "4px",
                           },
                           "&:-webkit-autofill:hover": {
                              WebkitBoxShadow:
                                 theme.palette.mode === "dark"
                                    ? "0 0 0 100px #1a1f2e inset !important"
                                    : "0 0 0 100px rgba(255, 255, 255, 0.9) inset !important",
                           },
                           "&:-webkit-autofill:focus": {
                              WebkitBoxShadow:
                                 theme.palette.mode === "dark"
                                    ? "0 0 0 100px #1a1f2e inset !important"
                                    : "0 0 0 100px rgba(255, 255, 255, 0.9) inset !important",
                           },
                           "&:-webkit-autofill:active": {
                              WebkitBoxShadow:
                                 theme.palette.mode === "dark"
                                    ? "0 0 0 100px #1a1f2e inset !important"
                                    : "0 0 0 100px rgba(255, 255, 255, 0.9) inset !important",
                           },
                        },
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
                     disabled={loading}
                  >
                     {loading ? "Logging in..." : "Log in"}
                  </Button>

                  <Box
                     sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 1.5,
                        mt: 1,
                        flexWrap: "wrap",
                     }}
                  >
                     <Button
                        type="button"
                        variant="text"
                        onClick={openResetDialog}
                        disabled={resetSubmitting || forgotDisabled}
                     >
                        Forgot your password?
                     </Button>
                  </Box>

                  {/* Official Google Sign-In button mount point (popup flow) */}
                  <Box
                     sx={{ display: "flex", justifyContent: "center", mt: 1 }}
                  >
                     <div
                        ref={googleButtonRef}
                        aria-label="Sign in with Google"
                     />
                  </Box>

                  {message && (
                     <Alert variant="filled" severity="success" sx={{ mt: 2 }}>
                        {message}
                     </Alert>
                  )}
                  {errors.form && (
                     <Alert variant="filled" severity="error" sx={{ mt: 2 }}>
                        {errors.form}
                     </Alert>
                  )}
               </Box>
            </Box>
         </Container>

         {/* Reset Password Dialog */}
         <Dialog
            open={resetOpen}
            onClose={closeResetDialog}
            PaperProps={{
               sx: {
                  width: "100%",
                  maxWidth: 520,
                  bgcolor:
                     theme.palette.mode === "dark"
                        ? "#1a1f2e"
                        : "rgba(255, 255, 255, 0.98)",
                  color: theme.palette.mode === "dark" ? "#e8eaed" : "#1d1d1f",
                  backdropFilter: "blur(10px)",
               },
            }}
         >
            <DialogTitle sx={{ fontWeight: 700 }}>
               Reset your password
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 1 }}>
               <Box component="form" onSubmit={handleResetSubmit} noValidate>
                  <TextField
                     autoFocus
                     fullWidth
                     margin="dense"
                     label="Your account email"
                     type="email"
                     value={resetEmail}
                     onChange={(e) => {
                        const v = e.target.value;
                        setResetEmail(v);
                        // Do not validate on input; only validate on submit.
                        if (resetError) setResetError(undefined);
                     }}
                     error={!!resetError}
                     helperText={resetError}
                     InputLabelProps={{
                        sx: {
                           fontSize: {
                              xs: "1rem",
                              sm: "1.05rem",
                              md: "1.1rem",
                           },
                           "&.MuiInputLabel-shrink": {
                              backgroundColor: (theme: any) =>
                                 theme.palette.mode === "dark"
                                    ? "rgba(26, 31, 46, 0.95)"
                                    : "rgba(255, 255, 255, 0.95)",
                              px: 0.5,
                           },
                        },
                     }}
                     InputProps={{
                        sx: {
                           bgcolor: (theme: any) =>
                              theme.palette.mode === "dark"
                                 ? "#1a1f2e !important"
                                 : "rgba(255, 255, 255, 0.9) !important",
                           backdropFilter: "blur(10px)",
                           "& fieldset": {
                              borderColor: (theme: any) =>
                                 theme.palette.mode === "dark"
                                    ? "#2d3548"
                                    : "rgba(0, 0, 0, 0.12)",
                           },
                           "&:hover fieldset": {
                              borderColor: (theme: any) =>
                                 theme.palette.mode === "dark"
                                    ? "#3d4558"
                                    : "rgba(0, 0, 0, 0.23)",
                           },
                           "&.Mui-focused fieldset": {
                              borderColor: "#1976d2",
                           },
                        },
                     }}
                  />
               </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
               <Button onClick={closeResetDialog} variant="text">
                  Cancel
               </Button>
               <Button
                  onClick={handleResetSubmit}
                  variant="contained"
                  disabled={resetSubmitting}
               >
                  Send reset link
               </Button>
            </DialogActions>
         </Dialog>
      </>
   );
};

export default LoginForm;
