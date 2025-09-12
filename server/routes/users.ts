import Router from "express";
import {
   getAllUsers,
   getUserById,
   deleteUserById,
   updateUserById,
} from "@controllers";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import {
   deleteUsersWithLimitedRole,
   updateUserContent,
} from "../middleware/users";

const router = Router();

router.get(
   "/",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   getAllUsers,
);

router.get("/:id", getUserById);

router.put(
   "/:id",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   updateUserContent,
   updateUserById,
);

router.delete(
   "/:id",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   deleteUsersWithLimitedRole,
   deleteUserById,
);

export default router;
