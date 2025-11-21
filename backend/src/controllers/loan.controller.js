import Loan from "../models/loan.model.js";
import Member from "../models/members.model.js";

// =============================
// CREATE LOAN
// =============================
export const createLoan = async (req, res) => {
    try {
        const {
            membershipNumber,
            typeOfLoan,
            loanDate,
            purposeOfLoan,
            loanAmount,
            lafDate,
            fdrAmount,
            fdrSchema,
            pdcDetails,
        } = req.body;

        console.log("📥 Received data:", req.body);

        // ========== 1. CORRECTED: Find Member by Membership Number ==========
        const member = await Member.findOne({
            'personalDetails.membershipNumber': membershipNumber
        });

        console.log("🔍 Member search result:", member ? "Found" : "Not Found");

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found with this membership number",
            });
        }

        // ========== 2. CORRECTED: Create Loan with memberId ==========
        const loan = await Loan.create({
            memberId: member._id, // ✅ ADD THIS
            membershipNumber,
            typeOfLoan,
            loanDate,
            purposeOfLoan,
            loanAmount,
            lafDate,
            fdrAmount,
            fdrSchema,
            pdcDetails,
        });

        console.log("✅ Loan created:", loan);

        return res.status(201).json({
            success: true,
            message: "Loan created successfully",
            data: loan,
        });
    } catch (error) {
        console.log("❌ Error:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =============================
// GET ALL LOANS
// =============================
export const getAllLoans = async (req, res) => {
    try {
        const loans = await Loan.find()
            .populate("memberId", "personalDetails.nameOfMember personalDetails.membershipNumber personalDetails.phoneNo")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: loans,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =============================
// GET SINGLE LOAN
// =============================
export const getLoanById = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id).populate(
            "memberId",
            "personalDetails.nameOfMember personalDetails.membershipNumber personalDetails.phoneNo"
        );

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: "Loan not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: loan,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =============================
// UPDATE LOAN
// =============================
export const updateLoan = async (req, res) => {
    try {
        const updatedLoan = await Loan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("memberId");

        if (!updatedLoan) {
            return res.status(404).json({
                success: false,
                message: "Loan not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Loan updated successfully",
            data: updatedLoan,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =============================
// DELETE LOAN
// =============================
export const deleteLoan = async (req, res) => {
    try {
        const loan = await Loan.findByIdAndDelete(req.params.id);

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: "Loan not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Loan deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// =============================
// GET LOANS BY MEMBER ID
// =============================
export const getLoansByMemberId = async (req, res) => {
    try {
        const { membershipNumber } = req.params;

        console.log("🔍 Searching loans for membershipNumber:", membershipNumber);

        // CORRECTED: Find member by membership number, not ID
        const member = await Member.findOne({
            'personalDetails.membershipNumber': membershipNumber
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        // CORRECTED: Get loans by membershipNumber (not memberId)
        const loans = await Loan.find({ membershipNumber })
            .sort({ createdAt: -1 });

        console.log("✅ Loans found:", loans.length);

        return res.status(200).json({
            success: true,
            data: loans,
        });

    } catch (error) {
        console.log("❌ Error:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};