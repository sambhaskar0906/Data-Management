import express from "express";
import {
    createLoan,
    getAllLoans,
    getLoanById,
    updateLoan,
    deleteLoan,
    getSuretySummaryByMember,
    getGuarantorRelationsByMember,
    getAllLoansByMembershipNumber
    //getLoansByMemberId,
} from "../controllers/loan.controller.js";

const router = express.Router();

// Create Loan
router.post("/", createLoan);

// Get All Loans
router.get("/", getAllLoans);
router.get("/surety-summary/:membershipNumber", getSuretySummaryByMember);
router.get("/guarantor-relations", getGuarantorRelationsByMember);

// Get Loan by ID
router.get("/:id", getLoanById);

// Get Loans by Member ID
//router.get("/member/:memberId", getLoansByMemberId);

router.get("/membership/:membershipNumber", getAllLoansByMembershipNumber);

// Update Loan
router.put("/:id", updateLoan);

// Delete Loan
router.delete("/:id", deleteLoan);

export default router;