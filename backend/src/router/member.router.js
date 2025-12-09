import express from "express";
import multer from "multer";
import path from "path";

import {
  createMember,
  getMemberById,
  getAllMembers,
  updateMember,
  deleteMember,
  getMissingFieldsForMember,
  addGuarantor,
  getGuarantorRelationsByMember,
} from "../controllers/member.controller.js";

const router = express.Router();

// Get the absolute path for uploads folder
const __dirname = path.resolve();

// Storage configuration with absolute path
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // IMPORTANT: Works on VPS + Local
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Multer configuration
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// List of file fields
const fileFields = [
  { name: "addressDetails[permanentAddressBillPhoto]", maxCount: 1 },
  { name: "addressDetails[currentResidentalBillPhoto]", maxCount: 1 },
  { name: "companyProvidedAddressBillPhoto", maxCount: 1 },

  // Identity proofs
  { name: "passportSize", maxCount: 1 },
  { name: "panNoPhoto", maxCount: 1 },
  { name: "aadhaarNoPhoto", maxCount: 1 },
  { name: "rationCardPhoto", maxCount: 1 },
  { name: "drivingLicensePhoto", maxCount: 1 },
  { name: "voterIdPhoto", maxCount: 1 },
  { name: "passportNoPhoto", maxCount: 1 },
  { name: "signedPhoto", maxCount: 1 },

  // Service Documents
  { name: "professionalDetails[serviceDetails][bankStatement]", maxCount: 1 },
  { name: "professionalDetails[serviceDetails][idCard]", maxCount: 1 },
  { name: "professionalDetails[serviceDetails][montlySlip]", maxCount: 1 },

  // Business GST
  { name: "professionalDetails[businessDetails][gstCertificate]", maxCount: 1 },
];

// ROUTES
router.post("/", upload.fields(fileFields), createMember);
router.get("/", getAllMembers);
router.post("/add-guarantor", addGuarantor);
router.get("/guarantor-relations", getGuarantorRelationsByMember);
router.get("/:id", getMemberById);
router.put("/:id", upload.fields(fileFields), updateMember);
router.delete("/:id", deleteMember);
router.get("/check/missing-fields", getMissingFieldsForMember);

export default router;
