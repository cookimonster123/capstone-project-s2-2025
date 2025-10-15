import Router from "express";
import {
   register,
   login,
   logout,
   requestMagicLink,
   confirmMagicLink,
   checkEmail,
   requestPasswordReset,
   resetPassword,
   loginWithGoogle,
} from "@controllers";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/register/request-magic-link", requestMagicLink);
router.get("/register/confirm", confirmMagicLink);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check-email", checkEmail);
router.post("/password/request-reset", requestPasswordReset);
router.post("/password/reset", resetPassword);
router.post("/google", loginWithGoogle);

// Dummy protected endpoints for testing auth middleware
router.get("/profile", authenticateToken, (req: any, res) => {
   res.status(200).json({
      message: "Access granted to protected route",
      user: req.user,
      timestamp: new Date().toISOString(),
   });
});

router.get(
   "/admin-only",
   authenticateToken,
   authorizeRoles(["admin"]),
   (req: any, res) => {
      res.status(200).json({
         message: "Admin access granted",
         user: req.user,
         timestamp: new Date().toISOString(),
      });
   },
);

router.get(
   "/staff-or-admin",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   (req: any, res) => {
      res.status(200).json({
         message: "Staff or Admin access granted",
         user: req.user,
         timestamp: new Date().toISOString(),
      });
   },
);

router.get(
   "/students-only",
   authenticateToken,
   authorizeRoles(["capstoneStudent"]),
   (req: any, res) => {
      res.status(200).json({
         message: "Capstone student access granted",
         user: req.user,
         timestamp: new Date().toISOString(),
      });
   },
);

export default router;
