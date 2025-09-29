import Router from "express";
import {
   getAllUsers,
   getUserById,
   deleteUserById,
   updateUserById,
   addProjectToFavorites,
   deleteProjectFromFavorites,
   getUserFavoritesByUserId,
   getMyId,
} from "@controllers";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import {
   deleteUsersWithLimitedRole,
   updateUserContent,
   accessOwnFavoritesOnly,
} from "../middleware/users";

const router = Router();

router.get(
   "/",
   authenticateToken,
   authorizeRoles(["admin", "staff"]),
   getAllUsers,
);

router.get("/me", authenticateToken, getMyId);

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

router.get(
   "/:id/favorites",
   authenticateToken,
   accessOwnFavoritesOnly,
   getUserFavoritesByUserId,
);

router.post(
   "/:id/favorites",
   authenticateToken,
   accessOwnFavoritesOnly,
   addProjectToFavorites,
);

router.delete(
   "/:id/favorites/:projectId",
   authenticateToken,
   accessOwnFavoritesOnly,
   deleteProjectFromFavorites,
);

export default router;
