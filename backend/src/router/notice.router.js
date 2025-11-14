import express from "express";
import multer from "multer";
import { sendNoticeToMembers } from "../controllers/notice.controller.js";

const router = express.Router();

// Multer setup for temporary file upload
const upload = multer({ dest: "uploads/" });

router.post("/send", upload.single("attachment"), sendNoticeToMembers);

export default router;