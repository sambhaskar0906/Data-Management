// src/models/pdc.schema.js
import mongoose from "mongoose";

export const pdcSchema = new mongoose.Schema(
    {
        bankName: { type: String },
        branchName: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
        numberOfCheques: { type: Number },
        chequeSeries: { type: String },
        seriesDate: { type: String },
    },
    { _id: false } // IMPORTANT: No separate ID for subdocuments
);