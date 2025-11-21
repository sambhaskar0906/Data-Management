import express from "express";
import {
    createLoan,
    getAllLoans,
    getLoanById,
    updateLoan,
    deleteLoan,
    getLoansByMemberId,
} from "../controllers/loan.controller.js";

const router = express.Router();

// Create Loan
router.post("/", createLoan);

// Get All Loans
router.get("/", getAllLoans);

// Get Loan by ID
router.get("/:id", getLoanById);

// Get Loans by Member ID
router.get("/member/:memberId", getLoansByMemberId);

// Update Loan
router.put("/:id", updateLoan);

// Delete Loan
router.delete("/:id", deleteLoan);

export default router;