import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
   Alert,
   Box,
   Button,
   Container,
   IconButton,
   InputAdornment,
   TextField,
   Typography,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import { resetPassword } from "../api/authApi";

const ResetPasswordPage: React.FC = () => {
   const nav = useNavigate();
   const [params] = useSearchParams();
   const token = params.get("token") || "";

   const [password, setPassword] = useState("");
   const [confirm, setConfirm] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirm, setShowConfirm] = useState(false);
   const [message, setMessage] = useState("");
   const [error, setError] = useState<string | undefined>(undefined);
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage("");
      setError(undefined);

      if (!token) {
         setError("Invalid or expired link");
         return;
      }
      if (!password || password.length < 6) {
         setError("Password must be at least 6 characters");
         return;
      }
      if (password !== confirm) {
         setError("Passwords do not match");
         return;
      }
      setLoading(true);
      const res = await resetPassword({ token, password });
      setLoading(false);
      if (!res.success) {
         setError(res.error || "Failed to reset password");
         return;
      }
      setMessage("Password reset successful. Redirecting to log-in...");
      setTimeout(() => nav("/sign-in"), 1800);
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
         {/* Override any animated dark-mode background (e.g., meteors) on this page */}
         <Box
            sx={{
               position: "fixed",
               inset: 0,
               bgcolor: (t: any) => t.palette.background.default,
               zIndex: 2,
               pointerEvents: "none",
            }}
         />
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
               onClick={() => nav("/sign-in")}
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
               position: "relative",
               zIndex: 10,
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
                  fontSize: { xs: 28, sm: 30, md: 34, lg: 38 },
                  "@media (min-width: 1440px)": { fontSize: 40 },
                  "@media (min-width: 2560px)": { fontSize: 48 },
               }}
            >
               Reset your password
            </Typography>
            <Typography align="center" color="text.secondary">
               Enter a new password for your account
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
                  label="New password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!error && error.toLowerCase().includes("password")}
                  helperText={
                     error && error.toLowerCase().includes("password")
                        ? error
                        : "Use 6+ characters"
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
                           backgroundColor: (t: any) =>
                              t.palette.mode === "dark"
                                 ? "rgba(26,31,46,0.95)"
                                 : "rgba(255,255,255,0.95)",
                           px: 0.5,
                        },
                     },
                  }}
                  InputProps={{
                     sx: {
                        bgcolor: (t: any) =>
                           t.palette.mode === "dark"
                              ? "#1a1f2e !important"
                              : "rgba(255,255,255,0.9) !important",
                        backdropFilter: "blur(10px)",
                        "& fieldset": {
                           borderColor: (t: any) =>
                              t.palette.mode === "dark"
                                 ? "#2d3548"
                                 : "rgba(0,0,0,0.12)",
                        },
                        "&:hover fieldset": {
                           borderColor: (t: any) =>
                              t.palette.mode === "dark"
                                 ? "#3d4558"
                                 : "rgba(0,0,0,0.23)",
                        },
                        "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                     },
                     endAdornment: (
                        <InputAdornment position="end" sx={{ mr: 1 }}>
                           <IconButton
                              onClick={() => setShowPassword((p) => !p)}
                              edge="end"
                              disableRipple
                              disableFocusRipple
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
               />

               <TextField
                  margin="normal"
                  fullWidth
                  label="Confirm new password"
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  error={!!error && error.toLowerCase().includes("match")}
                  helperText={
                     !!error && error.toLowerCase().includes("match")
                        ? error
                        : undefined
                  }
                  required
                  InputProps={{
                     sx: {
                        bgcolor: (t: any) =>
                           t.palette.mode === "dark"
                              ? "#1a1f2e !important"
                              : "rgba(255,255,255,0.9) !important",
                        backdropFilter: "blur(10px)",
                        "& fieldset": {
                           borderColor: (t: any) =>
                              t.palette.mode === "dark"
                                 ? "#2d3548"
                                 : "rgba(0,0,0,0.12)",
                        },
                        "&:hover fieldset": {
                           borderColor: (t: any) =>
                              t.palette.mode === "dark"
                                 ? "#3d4558"
                                 : "rgba(0,0,0,0.23)",
                        },
                        "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                     },
                     endAdornment: (
                        <InputAdornment position="end" sx={{ mr: 1 }}>
                           <IconButton
                              onClick={() => setShowConfirm((p) => !p)}
                              edge="end"
                              disableRipple
                              disableFocusRipple
                           >
                              {showConfirm ? <VisibilityOff /> : <Visibility />}
                           </IconButton>
                        </InputAdornment>
                     ),
                  }}
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
                  disabled={loading}
               >
                  {loading ? "Saving..." : "Save new password"}
               </Button>

               {message && (
                  <Alert variant="filled" severity="success" sx={{ mt: 2 }}>
                     {message}
                  </Alert>
               )}
               {error && (
                  <Alert variant="filled" severity="error" sx={{ mt: 2 }}>
                     {error}
                  </Alert>
               )}
            </Box>
         </Box>
      </Container>
   );
};

export default ResetPasswordPage;
