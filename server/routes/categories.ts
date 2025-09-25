import { Router } from "express";
import { getAllCategories } from "../controllers";

const router = Router();

// Public: list all categories
router.get("/", getAllCategories);

export default router;
