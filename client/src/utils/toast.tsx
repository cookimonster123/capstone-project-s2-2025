import toast, { Toaster } from "react-hot-toast";
import type { Toast } from "react-hot-toast";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@mui/material";

/**
 * Custom toast notification system with animated icons
 * Provides success, error, info, and warning toast variants
 * Matches the application's blue theme and dark mode
 */

// Custom toast component with animation
const CustomToast = ({
   t,
   type,
   message,
}: {
   t: Toast;
   type: string;
   message: string;
}) => {
   const theme = useTheme();
   const isDark = theme.palette.mode === "dark";

   const icons = {
      success: <CheckCircleIcon sx={{ fontSize: 24, color: "#4caf50" }} />,
      error: <ErrorIcon sx={{ fontSize: 24, color: "#f44336" }} />,
      info: (
         <InfoIcon
            sx={{ fontSize: 24, color: isDark ? "#0099ff" : "#0066cc" }}
         />
      ),
      warning: <WarningIcon sx={{ fontSize: 24, color: "#ff9800" }} />,
   };

   const icon = icons[type as keyof typeof icons] || icons.info;

   return (
      <AnimatePresence>
         {t.visible && (
            <motion.div
               initial={{ opacity: 0, y: -20, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: -20, scale: 0.9 }}
               transition={{ duration: 0.3, ease: "easeOut" }}
               style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: isDark
                     ? "linear-gradient(135deg, #1a2332 0%, #151b2b 100%)"
                     : "linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)",
                  boxShadow: isDark
                     ? "0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)"
                     : "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)",
                  border: isDark ? "1px solid #2a3142" : "1px solid #e5e5e7",
                  minWidth: "300px",
                  maxWidth: "500px",
               }}
            >
               <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
               >
                  {icon}
               </motion.div>
               <div
                  style={{
                     flex: 1,
                     fontSize: "14px",
                     fontWeight: 500,
                     color: isDark ? "#e8eaf0" : "#1a1a1a",
                  }}
               >
                  {message}
               </div>
            </motion.div>
         )}
      </AnimatePresence>
   );
};

// Toast notification functions
export const showToast = {
   /**
    * Display success toast notification
    */
   success: (message: string) => {
      toast.custom(
         (t) => <CustomToast t={t} type="success" message={message} />,
         {
            duration: 3000,
            position: "top-right",
         },
      );
   },

   /**
    * Display error toast notification
    */
   error: (message: string) => {
      toast.custom(
         (t) => <CustomToast t={t} type="error" message={message} />,
         {
            duration: 4000,
            position: "top-right",
         },
      );
   },

   /**
    * Display info toast notification
    */
   info: (message: string) => {
      toast.custom((t) => <CustomToast t={t} type="info" message={message} />, {
         duration: 3000,
         position: "top-right",
      });
   },

   /**
    * Display warning toast notification
    */
   warning: (message: string) => {
      toast.custom(
         (t) => <CustomToast t={t} type="warning" message={message} />,
         {
            duration: 3500,
            position: "top-right",
         },
      );
   },
};

// Toaster component to be added to App.tsx
export const ToastContainer = () => {
   return (
      <Toaster
         position="top-right"
         toastOptions={{
            style: {
               background: "transparent",
               boxShadow: "none",
               padding: 0,
            },
         }}
      />
   );
};
