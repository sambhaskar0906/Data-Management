import mongoose from "mongoose";
import { pdcSchema } from "./pdc.model.js";

// GUARANTOR SCHEMA
const guarantorSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
            required: true,
        },
        memberName: { type: String, required: true },
        membershipNumber: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        address: { type: String },
        fileNumber: { type: String },
        accountType: { type: String },
        accountNumber: { type: String },
        // GUARANTOR'S OWN PDC
        pdcDetails: {
            type: [pdcSchema],
            default: [],
        },
    },
    { _id: false }
);

// MAIN LOAN SCHEMA
const loanSchema = new mongoose.Schema(
    {
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
            required: false,
        },

        membershipNumber: {
            type: String,
            required: true,
        },

        typeOfLoan: {
            type: String,
            enum: ["Loan", "LAF", "LAP"],
            required: true,
        },

        // LOAN + LAP COMMON FIELDS
        loanDate: {
            type: String,
            required: function () {
                return this.typeOfLoan === "Loan" || this.typeOfLoan === "LAP";
            },
        },

        purposeOfLoan: {
            type: String,
            required: function () {
                return this.typeOfLoan === "Loan" || this.typeOfLoan === "LAP";
            },
        },

        loanAmount: {
            type: String,
            required: function () {
                return this.typeOfLoan === "Loan" || this.typeOfLoan === "LAP";
            },
        },

        // LAF FIELDS
        lafDate: {
            type: String,
            required: function () {
                return this.typeOfLoan === "LAF";
            },
        },

        lafAmount: {
            type: String,
            required: function () {
                return this.typeOfLoan === "LAF";
            },
        },

        fdrAmount: {
            type: String,
            required: function () {
                return this.typeOfLoan === "LAF";
            },
        },

        // FIXED FIELD → frontend uses fdrScheme
        fdrScheme: {
            type: String,
            required: function () {
                return this.typeOfLoan === "LAF";
            },
        },

        // MAIN LOAN PDC
        pdcDetails: {
            type: [pdcSchema],
            default: [],
        },

        // BANK DETAILS
        bankDetails: {
            bankName: { type: String, default: "" },
            branchName: { type: String, default: "" },
            accountNumber: { type: String, default: "" },
            ifscCode: { type: String, default: "" },
            accountHolderName: { type: String, default: "" },
        },

        // GUARANTORS LIST
        suretyGiven: [guarantorSchema], // People who gave surety for this loan
        suretyTaken: [guarantorSchema], // Loans where borrower gave surety
    },
    { timestamps: true }
);

// AUTO-FETCH MEMBERSHIP NUMBER
loanSchema.pre("save", async function (next) {
    if (!this.isModified("memberId")) return next();

    const Member = mongoose.model("Member");
    const member = await Member.findById(this.memberId);

    if (member) {
        this.membershipNumber = member.personalDetails.membershipNumber;
    }

    next();
});

export default mongoose.model("Loan", loanSchema);