import express from "express";
import multer from "multer";
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

// Updated: Use diskStorage as per your requirement
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    // Add timestamp to avoid filename conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

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
  { name: "professionalDetails[serviceDetails][bankStatement]", maxCount: 1 },
  { name: "professionalDetails[serviceDetails][idCard]", maxCount: 1 },
  { name: "professionalDetails[serviceDetails][montlySlip]", maxCount: 1 },

  // Business GST
  { name: "professionalDetails[businessDetails][gstCertificate]", maxCount: 1 },
];



router.post("/", upload.fields(fileFields), createMember);
router.get("/", getAllMembers);
router.post("/add-guarantor", addGuarantor);
router.get("/guarantor-relations", getGuarantorRelationsByMember);
router.get("/:id", getMemberById);
router.put("/:id", upload.fields(fileFields), updateMember);
router.delete("/:id", deleteMember);
router.get("/check/missing-fields", getMissingFieldsForMember);


export default router;