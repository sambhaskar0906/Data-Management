import express from "express";
import { register, login, logout, getAllUsers, deleteUserById } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/users", protect, getAllUsers);
router.delete("/users/:id", protect, deleteUserById);

export default router;
