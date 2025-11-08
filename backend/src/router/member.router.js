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

// Updated: Include all possible file fields
const fileFields = [
  { name: "passportSize", maxCount: 1 },
  { name: "panNoPhoto", maxCount: 1 },
  { name: "aadhaarNoPhoto", maxCount: 2 },
  { name: "rationCardPhoto", maxCount: 2 },
  { name: "drivingLicensePhoto", maxCount: 2 },
  { name: "voterIdPhoto", maxCount: 2 },
  { name: "passportNoPhoto", maxCount: 1 },
  { name: "permanentAddressBillPhoto", maxCount: 1 },
  { name: "currentResidentalBillPhoto", maxCount: 1 }
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