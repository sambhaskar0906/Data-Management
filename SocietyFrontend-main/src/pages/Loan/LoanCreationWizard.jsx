import React, { useState } from "react";
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Paper,
    CircularProgress,
    Alert
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import LoanForm from "./LoanForm";
import BankDetails from "./BankDetails";
import PDCDetails from "./PdcDetail";
import GuarantorDetails from "./GuarantorDetails";
import ConfirmationStep from "./ConfirmationStep";
import { createLoan, resetLoanState } from "../../features/loan/loanSlice";

const steps = ["Loan Details", "Bank Details", "PDC Details", "Guarantor Details", "Confirmation"];


const bankDetailsValidationSchema = Yup.object({
    bankName: Yup.string().required('Bank Name is required'),
    branchName: Yup.string().required('Branch Name is required'),
    accountNumber: Yup.string()
        .required('Account Number is required')
        .matches(/^\d+$/, 'Account Number must contain only digits')
        .min(9, 'Account Number must be at least 9 digits')
        .max(18, 'Account Number cannot exceed 18 digits'),
    ifscCode: Yup.string()
        .required('IFSC Code is required')
        .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC Code format'),
    accountHolderName: Yup.string().required('Account Holder Name is required')
});

const LoanCreationWizard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, success } = useSelector((state) => state.loan || {});

    const [activeStep, setActiveStep] = useState(0);
    const [createdLoanId, setCreatedLoanId] = useState(null);
    const [loanFormData, setLoanFormData] = useState({});
    const [bankDetails, setBankDetails] = useState({});
    const [pdcDetails, setPdcDetails] = useState({});
    const [guarantorDetails, setGuarantorDetails] = useState({});
    const [apiSuccess, setApiSuccess] = useState(false);

    // Step 1: Collect loan data
    const handleLoanDataCollected = (formData) => {
        setLoanFormData(formData);
        setActiveStep(1);
    };

    // Step 2: Collect Bank details
    const handleBankDetailsSubmit = (bankData) => {
        setBankDetails(bankData);
        setActiveStep(2);
    };

    // Step 3: Collect PDC details
    const handlePDCSubmit = (pdcData) => {
        setPdcDetails(pdcData);
        setActiveStep(3);
    };

    // Step 4: Collect Guarantor details
    const handleGuarantorSubmit = (data) => {
        setGuarantorDetails(data);

        setLoanFormData(prev => ({
            ...prev,
            suretyGiven: data.suretyGiven
        }));

        setActiveStep(4);
    };


    const handleFinalSubmit = async () => {

        const finalPayload = {
            typeOfLoan: loanFormData.loanType,
            membershipNumber: loanFormData.loanType === "LAF"
                ? loanFormData.lafMembershipNumber
                : loanFormData.membershipNumber,

            bankDetails: {
                bankName: bankDetails.bankName,
                branchName: bankDetails.branchName,
                accountNumber: bankDetails.accountNumber,
                ifscCode: bankDetails.ifscCode,
                accountHolderName: bankDetails.accountHolderName
            },

            // ✅ REAL FIX HERE
            suretyGiven: Array.isArray(guarantorDetails.guarantors)
                ? guarantorDetails.guarantors.map(g => ({
                    memberId: g.memberId,
                    memberName: g.fullName,
                    membershipNumber: g.membershipNumber,
                    mobileNumber: g.mobileNumber,
                    accountType: g.accountType,
                    accountNumber: g.accountNumber,
                    fileNumber: g.fileNumber,
                    address: g.address
                }))
                : [],

            pdcDetails: []
        };


        // -----------------------------
        // PDC DETAILS
        // -----------------------------
        if (pdcDetails.chequeDetails && pdcDetails.chequeDetails.length > 0) {
            pdcDetails.chequeDetails.forEach((cheque, index) => {
                const pdcItem = {
                    bankName: bankDetails.bankName,
                    branchName: bankDetails.branchName,
                    accountNumber: bankDetails.accountNumber,
                    ifscCode: bankDetails.ifscCode,
                    numberOfCheques: pdcDetails.numberOfCheques || 1,
                    chequeNumber: cheque.chequeNumber || `CHQ${index + 1}`,
                    chequeDate: cheque.chequeDate,
                    amount: cheque.amount,
                    seriesDate: cheque.seriesDate || new Date().toISOString().split('T')[0]
                };
                finalPayload.pdcDetails.push(pdcItem);
            });
        } else {
            finalPayload.pdcDetails = [{
                bankName: bankDetails.bankName,
                branchName: bankDetails.branchName,
                accountNumber: bankDetails.accountNumber,
                ifscCode: bankDetails.ifscCode,
                numberOfCheques: 0,
                chequeNumber: '',
                chequeDate: '',
                amount: 0,
                seriesDate: ''
            }];
        }

        // -----------------------------
        // LOAN FIELDS
        // -----------------------------
        if (loanFormData.loanType === "Loan" || loanFormData.loanType === "LAP") {
            finalPayload.loanDate = loanFormData.loanDate;
            finalPayload.loanAmount = loanFormData.loanAmount;
            finalPayload.purposeOfLoan = loanFormData.purpose;
        }

        // -----------------------------
        // LAF FIELDS
        // -----------------------------
        if (loanFormData.loanType === "LAF") {
            finalPayload.lafDate = loanFormData.lafDate;
            finalPayload.lafAmount = loanFormData.lafAmount;
            finalPayload.fdrAmount = loanFormData.fdrAmount;
            finalPayload.fdrScheme = loanFormData.fdrScheme;
        }

        console.log("🚀 FINAL PAYLOAD TO BE SENT:", JSON.stringify(finalPayload, null, 2));

        try {
            const result = await dispatch(createLoan(finalPayload)).unwrap();
            setCreatedLoanId(result._id);
            setApiSuccess(true);

            setTimeout(() => {
                navigate("/view-loan");
            }, 2000);

        } catch (err) {
            console.error("❌ Loan creation failed:", err);
        }
    };


    // Manual navigation to view-loan
    const handleViewLoan = () => {
        navigate("/view-loan");
    };

    const handleReset = () => {
        setActiveStep(0);
        setCreatedLoanId(null);
        setLoanFormData({});
        setBankDetails({});
        setPdcDetails({});
        setGuarantorDetails({});
        setApiSuccess(false);
        dispatch(resetLoanState());
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <LoanForm
                        onLoanDataCollected={handleLoanDataCollected}
                        loanFormData={loanFormData}
                    />
                );

            case 1:
                return (
                    <BankDetails
                        onBankDetailsSubmit={handleBankDetailsSubmit}
                        bankDetails={bankDetails}
                    />
                );

            case 2:
                return (
                    <PDCDetails
                        loanFormData={loanFormData}
                        bankDetails={bankDetails}
                        onPDCSubmit={handlePDCSubmit}
                    />
                );

            case 3:
                return (
                    <GuarantorDetails
                        loanFormData={loanFormData}
                        onGuarantorSubmit={handleGuarantorSubmit}
                        guarantorDetails={guarantorDetails}
                    />
                );

            case 4:
                return (
                    <ConfirmationStep
                        loanId={createdLoanId}
                        loanFormData={loanFormData}
                        bankDetails={bankDetails}
                        pdcDetails={pdcDetails}
                        guarantorDetails={guarantorDetails}
                        onFinalSubmit={handleFinalSubmit}
                        loading={loading}
                        error={error}
                        success={apiSuccess}
                        onReset={handleReset}
                        onViewLoan={handleViewLoan}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => (
                    <Step key={index}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box sx={{ mt: 4 }}>
                {renderStepContent(activeStep)}
            </Box>

            {/* Back Button */}
            {activeStep > 0 && activeStep < 4 && (
                <Button
                    sx={{ mt: 2 }}
                    variant="outlined"
                    onClick={() => setActiveStep(activeStep - 1)}
                >
                    Back
                </Button>
            )}
        </Paper>
    );
};

export default LoanCreationWizard;