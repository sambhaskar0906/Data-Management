import React, { useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    IconButton,
    Grid,
    Card,
    CardContent,
    Button,
    Box,
    Chip,
    Divider
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import {
    FIELD_MAP,
    getValueByPath,
    isMissing,
    formatValueForUI
} from "./MemberDetail";


// ------------------ SECTION DEFINITIONS ------------------
const SECTION_GROUPS = {
    "Personal Details": [
        "personalDetails.nameOfMember",
        "personalDetails.membershipNumber",
        "personalDetails.nameOfFather",
        "personalDetails.nameOfMother",
        "personalDetails.dateOfBirth",
        "personalDetails.ageInYears",
        "personalDetails.membershipDate",
        "personalDetails.gender",
        "personalDetails.maritalStatus",
        "personalDetails.religion",
        "personalDetails.caste",
        "personalDetails.phoneNo1",
        "personalDetails.phoneNo2",
        "personalDetails.whatsapp",
        "personalDetails.emailId1",
        "personalDetails.emailId2",
        "personalDetails.emailId3",
        "personalDetails.landlineNo",
        "personalDetails.landlineOffice",
        "personalDetails.resignationDate",
        "creditDetails.cibilScore"
    ],

    "Address Details": [
        "addressDetails.permanentAddress",
        "addressDetails.currentResidentalAddress",
        "addressDetails.residenceType",
        "addressDetails.permanentAddressBillPhoto",
        "addressDetails.currentResidentalBillPhoto",
        "addressDetails.previousCurrentAddress"
    ],

    "Documents": [
        "documents.passportSize",
        "documents.panNo",
        "documents.panNoPhoto",
        "documents.aadhaarNo",
        "documents.aadhaarNoPhoto",
        "documents.drivingLicense",
        "documents.drivingLicensePhoto",
        "documents.voterId",
        "documents.voterIdPhoto",
        "documents.rationCard",
        "documents.rationCardPhoto",
        "documents.passportNo",
        "documents.passportNoPhoto",
        "documents.signedPhoto",
        "documents.oldMembershipPdf",
    ],

    "Professional Details": [
        "professionalDetails.occupation",
        "professionalDetails.qualification",
        "professionalDetails.serviceDetails.fullNameOfCompany",
        "professionalDetails.serviceDetails.addressOfCompany",
        "professionalDetails.serviceDetails.designation",
        "professionalDetails.serviceDetails.department",
        "professionalDetails.serviceDetails.monthlyIncome"
    ],

    "Nominee Details": [
        "nomineeDetails.nomineeName",
        "nomineeDetails.relationWithApplicant",
        "nomineeDetails.nomineeMobileNo",
        "nomineeDetails.introduceBy",
        "nomineeDetails.memberShipNo"
    ],

    "Financial Details": [
        "financialDetails.shareCapital",
        "financialDetails.optionalDeposit",
        "financialDetails.compulsory",
    ],


    "Bank Details": [
        "bankDetails"
    ],

};

const getProfessionalFields = (member) => {
    if (!member) return [];

    const prof = member.professionalDetails || {};

    // SERVICE (PRIVATE / GOVT / OTHER SERVICE)
    if (prof.inCaseOfService || prof.inCaseOfServiceGovt || prof.inCaseOfPrivate) {
        return [
            "professionalDetails.occupation",
            "professionalDetails.qualification",
            "professionalDetails.serviceDetails.fullNameOfCompany",
            "professionalDetails.serviceDetails.addressOfCompany",
            "professionalDetails.serviceDetails.designation",
            "professionalDetails.serviceDetails.department",
            "professionalDetails.serviceDetails.employeeCode",
            "professionalDetails.serviceDetails.officeNo",
            "professionalDetails.serviceDetails.dateOfJoining",
            "professionalDetails.serviceDetails.dateOfRetirement",
            "professionalDetails.serviceDetails.monthlyIncome",
            "professionalDetails.serviceDetails.idCard",
            "professionalDetails.serviceDetails.monthlySlip",
            "professionalDetails.serviceDetails.bankStatement"
        ];
    }

    // BUSINESS DETAILS
    if (prof.inCaseOfBusiness) {
        return [
            "professionalDetails.occupation",
            "professionalDetails.qualification",
            "professionalDetails.qualificationRemark",

            "professionalDetails.businessDetails.fullNameOfCompany",
            "professionalDetails.businessDetails.addressOfCompany",
            "professionalDetails.businessDetails.gstNumber",
            "professionalDetails.businessDetails.businessStructure",
            "professionalDetails.businessDetails.gstCertificate",
        ];
    }

    return [];
};


const FieldCard = ({ label, value, keyPath }) => {
    const missing = isMissing(value);

    // Safe address cleaning:
    const getAddressPreview = (val) => {
        if (!val && val !== 0) return ""; // null/undefined
        // If it's a string -> split by comma and take first (or more sophisticated)
        if (typeof val === "string") {
            const parts = val.split(",").map(p => p.trim()).filter(Boolean);
            // return first part (house no) — change index if you want city etc.
            return parts.length ? parts.join(", ") /* you can change to parts[0] */ : val;
        }
        // If it's an object -> try to pick meaningful props if present
        if (typeof val === "object") {
            // common address object shape fallback
            const { flatHouseNo, areaStreetSector, locality, city, state, pinCode } = val;
            const out = [];
            if (flatHouseNo) out.push(flatHouseNo);
            if (areaStreetSector) out.push(areaStreetSector);
            if (locality) out.push(locality);
            if (city) out.push(city);
            if (state) out.push(state);
            if (pinCode) out.push(pinCode);
            if (out.length) return out.join(", ");
            // Last resort: JSON stringify small object (short)
            try {
                return JSON.stringify(val);
            } catch {
                return String(val);
            }
        }
        // For numbers, booleans etc
        return String(val);
    };

    // Decide what to display for address fields only
    const isAddressField =
        keyPath === "addressDetails.permanentAddress" ||
        keyPath === "addressDetails.currentResidentalAddress";

    const cleanValue = isAddressField ? getAddressPreview(value) : formatValueForUI(value);

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: 2,
                borderLeft: `6px solid ${missing ? "#d32f2f" : "#2e7d32"}`,
                background: missing ? "#fff6f6" : "#f4fff4",
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    {missing ? (
                        <ErrorOutlineIcon color="error" />
                    ) : (
                        <CheckCircleOutlineIcon color="success" />
                    )}

                    <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        color={missing ? "error" : "success"}
                    >
                        {label}
                    </Typography>
                </Box>

                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                    {missing ? "Missing" : cleanValue}
                </Typography>
            </CardContent>
        </Card>
    );
};

// ------------------ MAIN COMPONENT ------------------
const MemberView = ({ member, open, onClose, onDelete, loading }) => {
    const [activeView, setActiveView] = useState("all");

    const openPdfViaGoogle = (url) => {
        const googleViewer = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
        window.open(googleViewer, "_blank");
    };

    if (!member) return null;

    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <DialogTitle sx={{ fontWeight: 700, fontSize: "22px", position: "relative" }}>
                Member Details — {member?.personalDetails?.nameOfMember}

                <IconButton
                    onClick={onClose}
                    sx={{ position: "absolute", right: 10, top: 10, bgcolor: "#fff" }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>


                {/* ----------- FILTER BUTTONS ----------- */}
                <Box display="flex" gap={1.5} mb={3}>
                    {[
                        { id: "all", label: "All Fields" },
                        { id: "filled", label: "Filled" },
                        { id: "missing", label: "Missing" }
                    ].map((item) => (
                        <Chip
                            key={item.id}
                            label={item.label}
                            color={
                                item.id === "missing"
                                    ? "error"
                                    : activeView === item.id
                                        ? "primary"
                                        : "default"
                            }
                            variant={activeView === item.id ? "filled" : "outlined"}
                            onClick={() => setActiveView(item.id)}
                        />
                    ))}
                </Box>


                {Object.entries(SECTION_GROUPS).map(([sectionName, fieldKeys]) => {

                    // ⭐ DYNAMIC PROFESSIONAL DETAILS
                    if (sectionName === "Professional Details") {
                        fieldKeys = getProfessionalFields(member);
                    }

                    return (
                        <Box key={sectionName} mb={4}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    mb: 2,
                                    pl: 1,
                                    color: "#3949ab",
                                    borderLeft: "5px solid #3949ab"
                                }}
                            >
                                {sectionName}
                            </Typography>

                            <Grid container spacing={2}>
                                {fieldKeys.map((key) => {
                                    const label = FIELD_MAP[key] || key;
                                    let value = getValueByPath(member, key);

                                    // ⭐ 1) MEMBER NAME WITH TITLE
                                    if (key === "personalDetails.nameOfMember") {
                                        const title = getValueByPath(member, "personalDetails.title") || "";
                                        const fullName = title ? `${title} ${value}` : value;

                                        return (
                                            <Grid size={{ xs: 12, md: 4 }} key={key}>
                                                <FieldCard label="Member Name" value={fullName} keyPath={key} />
                                            </Grid>
                                        );
                                    }

                                    // ⭐ 2) FATHER NAME WITH TITLE
                                    if (key === "personalDetails.nameOfFather") {
                                        const fatherTitle = getValueByPath(member, "personalDetails.fatherTitle") || "";
                                        const fullFatherName = fatherTitle ? `${fatherTitle} ${value}` : value;

                                        return (
                                            <Grid size={{ xs: 12, md: 4 }} key={key}>
                                                <FieldCard label="Father's Name" value={fullFatherName} keyPath={key} />
                                            </Grid>
                                        );
                                    }

                                    // ⭐ 3) MOTHER NAME WITH TITLE
                                    if (key === "personalDetails.nameOfMother") {
                                        const motherTitle = getValueByPath(member, "personalDetails.motherTitle") || "";
                                        const fullMotherName = motherTitle ? `${motherTitle} ${value}` : value;

                                        return (
                                            <Grid size={{ xs: 12, md: 4 }} key={key}>
                                                <FieldCard label="Mother's Name" value={fullMotherName} keyPath={key} />
                                            </Grid>
                                        );
                                    }

                                    // ⭐ SPECIAL CASE: BANK DETAILS
                                    if (key === "bankDetails") {
                                        return (
                                            <Grid size={{ xs: 12 }} key={key}>
                                                <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                                    <CardContent>

                                                        {Array.isArray(value) && value.length > 0 ? (
                                                            value.map((b, i) => (
                                                                <Box key={i} mb={2} p={2} sx={{ background: "#fff", borderRadius: 2 }}>
                                                                    <Typography><b>Account Holder:</b> {b.accountHolderName}</Typography>
                                                                    <Typography><b>Bank:</b> {b.bankName}</Typography>
                                                                    <Typography><b>Branch:</b> {b.branch}</Typography>
                                                                    <Typography><b>Account No:</b> {b.accountNumber}</Typography>
                                                                    <Typography><b>IFSC:</b> {b.ifscCode}</Typography>
                                                                </Box>
                                                            ))
                                                        ) : (
                                                            <Typography color="error">No bank details found.</Typography>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    }

                                    // ⭐ SPECIAL CASE: OLD MEMBERSHIP PDF
                                    if (key === "documents.oldMembershipPdf") {
                                        const pdfUrl = value;
                                        console.log("PDF URL:", pdfUrl);

                                        return (
                                            <Grid size={{ xs: 12, md: 4 }} key={key}>
                                                <Card
                                                    sx={{
                                                        borderRadius: 3,
                                                        boxShadow: 2,
                                                        borderLeft: `6px solid ${pdfUrl ? "#2e7d32" : "#d32f2f"}`,
                                                        background: pdfUrl ? "#f4fff4" : "#fff6f6",
                                                    }}
                                                >
                                                    <CardContent>
                                                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                                            {pdfUrl ? (
                                                                <CheckCircleOutlineIcon color="success" />
                                                            ) : (
                                                                <ErrorOutlineIcon color="error" />
                                                            )}

                                                            <Typography
                                                                variant="subtitle1"
                                                                fontWeight="600"
                                                                color={pdfUrl ? "success.main" : "error"}
                                                            >
                                                                Old Membership PDF
                                                            </Typography>
                                                        </Box>

                                                        {pdfUrl ? (
                                                            <Button
                                                                variant="outlined"
                                                                fullWidth
                                                                onClick={() => openPdfViaGoogle(pdfUrl)}
                                                            >
                                                                View PDF
                                                            </Button>
                                                        ) : (
                                                            <Typography color="error">Missing</Typography>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    }

                                    // ⭐ DEFAULT RENDER
                                    return (
                                        <Grid size={{ xs: 12, md: 4 }} key={key}>
                                            <FieldCard label={label} value={value} keyPath={key} />
                                        </Grid>
                                    );
                                })}

                            </Grid>

                            <Divider sx={{ mt: 3 }} />
                        </Box>
                    );
                })}

            </DialogContent>

            <DialogActions>
                <Button
                    color="error"
                    variant="contained"
                    disabled={loading}
                    onClick={() => onDelete(member._id)}
                >
                    Delete Member
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MemberView;
