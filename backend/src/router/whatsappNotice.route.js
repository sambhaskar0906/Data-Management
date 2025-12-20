import express from "express";
import { sendBulkWhatsAppNotice } from "../controllers/whatsappNotice.controller.js";

const router = express.Router();

router.post("/send-whatsapp", sendBulkWhatsAppNotice);

export default router;
