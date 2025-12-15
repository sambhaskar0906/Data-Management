import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Button,
    CircularProgress,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Avatar,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

import { useDispatch, useSelector } from "react-redux";
import { updateMember } from "../../features/member/memberSlice";
import { FieldMap, imageFields, ServiceTypeOptions, GenderOptions, MaritalStatusOptions } from "./FieldMap";
import StyledTextField from "../../ui/StyledTextField";

export default function MemberEditPage({ open, member, onClose }) {
    const dispatch = useDispatch();
    const { loading } = useSelector((s) => s.members);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        professionalDetails: {
            serviceType: "",
            serviceDetails: {},
            businessDetails: {}
        },
        ...member
    });

    // Soft UI theme colors
    const neu = {
        bg: "#e9eef5",
        shadowLight: "rgba(255,255,255,0.8)",
        shadowDark: "rgba(0,0,0,0.15)"
    };

    useEffect(() => {
        if (member) {

            const formatted = JSON.parse(JSON.stringify(member));

            if (formatted.personalDetails?.gender) {
                formatted.personalDetails.gender =
                    formatted.personalDetails.gender.toString().trim().toLowerCase();
            }

            if (formatted.personalDetails?.dateOfBirth) {
                const dob = formatted.personalDetails.dateOfBirth;
                formatted.personalDetails.dateOfBirth = dob.split("T")[0];
            }

            if (formatted.personalDetails?.maritalStatus) {
                formatted.personalDetails.maritalStatus =
                    formatted.personalDetails.maritalStatus.toString().trim().toLowerCase();
            }

            if (Array.isArray(formatted.bankDetails)) {
                formatted.bankDetails = formatted.bankDetails[0] || {};
            }

            // 🔥🔥🔥 IMPORTANT FIX STARTS HERE
            if (!formatted.professionalDetails) {
                formatted.professionalDetails = {};
            }

            if (!formatted.professionalDetails.serviceType) {
                formatted.professionalDetails.serviceType = "";
            }

            if (!formatted.professionalDetails.serviceDetails) {
                formatted.professionalDetails.serviceDetails = {};
            }

            if (!formatted.professionalDetails.businessDetails) {
                formatted.professionalDetails.businessDetails = {};
            }
            // 🔥🔥🔥 IMPORTANT FIX ENDS HERE

            setFormData(formatted);
        }
    }, [member]);


    const setServiceType = (type) => {
        setFormData(prev => {
            let updated = { ...prev };

            updated.professionalDetails.inCaseOfServiceGovt = type === "govt";
            updated.professionalDetails.inCaseOfPrivate = type === "private";
            updated.professionalDetails.inCaseOfBusiness = type === "business";

            updated.professionalDetails.serviceType = type;

            return updated;
        });
    };

    const validateField = (path, value) => {
        let msg = "";
        if (!value || value.toString().trim() === "") {
            setErrors(prev => ({ ...prev, [path]: "" }));
            return true;
        }
        if (path.includes("phone") || path.includes("whatsapp")) {
            if (!/^[6-9]\d{9}$/.test(value)) {
                msg = "Enter valid 10-digit Indian mobile number";
            }
        }

        if (path.includes("emailId")) {
            if (!/^\S+@\S+\.\S+$/.test(value)) {
                msg = "Enter valid email";
            }
        }

        // PAN
        if (path === "documents.panNo") {
            if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
                msg = "Invalid PAN format (ABCDE1234F)";
            }
        }

        // AADHAAR
        if (path === "documents.aadhaarNo") {
            if (!/^\d{12}$/.test(value)) {
                msg = "Aadhaar must be 12 digits";
            }
        }

        // PASSPORT
        if (path === "documents.passportNo") {
            if (!/^[A-PR-WY][1-9]\d\s?\d{4}[1-9]$/.test(value)) {
                msg = "Invalid passport number";
            }
        }

        // VOTER ID
        if (path === "documents.voterId") {
            if (!/^[A-Z]{3}[0-9]{7}$/.test(value)) {
                msg = "Invalid Voter ID";
            }
        }

        // ACCOUNT NUMBER
        if (path === "bankDetails.accountNumber") {
            if (!/^\d{9,18}$/.test(value)) {
                msg = "Account number must be 9–18 digits";
            }
        }

        // IFSC
        if (path === "bankDetails.ifscCode") {
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
                msg = "Invalid IFSC (e.g. SBIN0001234)";
            }
        }

        if (path.endsWith("pincode")) {
            if (value && !/^\d{6}$/.test(value)) {
                msg = "Pincode must be exactly 6 digits";
            }
        }

        setErrors(prev => ({ ...prev, [path]: msg }));
        return msg === "";
    };


    const getValueByPath = (obj, path) => {
        if (!path) return undefined;
        const parts = path.split(".");
        let cur = obj;
        for (const p of parts) {
            if (cur === undefined || cur === null) return undefined;
            cur = cur[p];
        }
        return cur;
    };

    const setValueByPath = (obj, path, value) => {
        const parts = path.split(".");
        const newObj = JSON.parse(JSON.stringify(obj));
        let current = newObj;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }

        current[parts[parts.length - 1]] = value;
        return newObj;
    };

    const handleFieldUpdate = (path, value) => {
        validateField(path, value);

        setFormData(prev => {
            // For nested address objects, we need to update the specific property
            if (path.includes("addressDetails")) {
                const parts = path.split(".");
                const updated = JSON.parse(JSON.stringify(prev));

                let current = updated;
                for (let i = 0; i < parts.length - 1; i++) {
                    const part = parts[i];

                    if (!current[part]) {
                        current[part] = {};
                    }
                    current = current[part];
                }

                const lastPart = parts[parts.length - 1];
                current[lastPart] = value;

                return updated;
            }

            const updated = setValueByPath(prev, path, value);
            return { ...updated };
        });
    };
    const handleSave = () => {
        if (member && member._id) {
            dispatch(updateMember({ id: member._id, formData })).then(() => {
                onClose();
            });
        }
    };

    const handleImageUpload = (event, path) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleFieldUpdate(path, reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // ---------------------------
    // Reusable Image Field Component
    // ---------------------------
    const ImageField = ({ label, value, path, onUpdate }) => {
        return (
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.6 }}>
                    {label}
                </Typography>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: "14px",
                        background: neu.bg,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1
                    }}
                >
                    {value ? (
                        <Avatar
                            src={value}
                            alt={label}
                            sx={{ width: 100, height: 100 }}
                            variant="rounded"
                        />
                    ) : (
                        <Avatar
                            sx={{ width: 100, height: 100, bgcolor: "rgba(0,0,0,0.1)" }}
                            variant="rounded"
                        >
                            <PhotoCamera />
                        </Avatar>
                    )}
                    <Button
                        component="label"
                        variant="contained"
                        size="small"
                        sx={{
                            borderRadius: "10px",
                            background: neu.bg,
                            boxShadow: `5px 5px 10px ${neu.shadowDark}, -5px -5px 10px ${neu.shadowLight}`,
                            color: "#555",
                            "&:hover": {
                                background: neu.bg,
                                boxShadow: `inset 5px 5px 10px ${neu.shadowDark}, inset -5px -5px 10px ${neu.shadowLight}`
                            }
                        }}
                    >
                        Upload Image
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, path)}
                        />
                    </Button>
                </Box>
            </Box>
        );
    };

    // ---------------------------
    // Service Type Component with conditional fields
    // ---------------------------
    const ServiceTypeSection = () => {
        const serviceType = getValueByPath(formData, "professionalDetails.serviceType") || "";

        return (
            <Box>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Service Type</InputLabel>
                    <Select
                        value={serviceType}
                        onChange={(e) => handleFieldUpdate("professionalDetails.serviceType", e.target.value)}
                        label="Service Type"
                        sx={{ borderRadius: "14px", background: neu.bg }}
                    >
                        {Object.entries(ServiceTypeOptions).map(([value, label]) => (
                            <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Conditional Fields based on Service Type */}
                {serviceType === "government" || serviceType === "private" ? (
                    <Box sx={{ p: 2, borderRadius: "14px", background: "rgba(0,0,0,0.02)", mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                            Service Details
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <StyledTextField
                                    label="Company Name"
                                    value={getValueByPath(formData, "professionalDetails.serviceDetails.fullNameOfCompany") || ""}
                                    onChange={(e) => handleFieldUpdate("professionalDetails.serviceDetails.fullNameOfCompany", e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <StyledTextField
                                    label="Designation"
                                    value={getValueByPath(formData, "professionalDetails.serviceDetails.designation") || ""}
                                    onChange={(e) => handleFieldUpdate("professionalDetails.serviceDetails.designation", e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <StyledTextField
                                    label="Employee Code"
                                    value={getValueByPath(formData, "professionalDetails.serviceDetails.employeeCode") || ""}
                                    onChange={(e) => handleFieldUpdate("professionalDetails.serviceDetails.employeeCode", e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <StyledTextField
                                    label="Monthly Income"
                                    type="number"
                                    value={getValueByPath(formData, "professionalDetails.serviceDetails.monthlyIncome") || ""}
                                    onChange={(e) => handleFieldUpdate("professionalDetails.serviceDetails.monthlyIncome", e.target.value)}
                                    fullWidth
                                />
                            </Grid >
                            <Grid size={{ xs: 12, md: 6 }}>
                                <StyledTextField
                                    label="Date of Joining"
                                    type="date"
                                    value={getValueByPath(formData, "professionalDetails.serviceDetails.dateOfJoining") || ""}
                                    onChange={(e) => handleFieldUpdate("professionalDetails.serviceDetails.dateOfJoining", e.target.value)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <StyledTextField
                                    label="Date of Retirement"
                                    type="date"
                                    value={getValueByPath(formData, "professionalDetails.serviceDetails.dateOfRetirement") || ""}
                                    onChange={(e) => handleFieldUpdate("professionalDetails.serviceDetails.dateOfRetirement", e.target.value)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <StyledTextField
                                    label="Company Address"
                                    multiline
                                    rows={2}
                                    value={getValueByPath(formData, "professionalDetails.serviceDetails.addressOfCompany") || ""}
                                    onChange={(e) => handleFieldUpdate("professionalDetails.serviceDetails.addressOfCompany", e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <StyledTextField
                                    label="Office Phone"
                                    value={getValueByPath(formData, "professionalDetails.serviceDetails.officeNo") || ""}
                                    onChange={(e) => handleFieldUpdate("professionalDetails.serviceDetails.officeNo", e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            {/* Service Type Documents */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <ImageField
                                    label="Bank Statement"
                                    value={getValueByPath(formData, "professionalDetails.serviceDetails.bankStatement")}
                                    path="professionalDetails.serviceDetails.bankStatement"
                                    onUpdate={handleFieldUpdate}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <ImageField
                                    label="Monthly Salary Slip"
                                    value={getValueByPath(formData, "professionalDetails.serviceDetails.monthlySlip")}
                                    path="professionalDetails.serviceDetails.monthlySlip"
                                    onUpdate={handleFieldUpdate}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <ImageField
                                    label="ID Card"
                                    value={getValueByPath(formData, "professionalDetails.serviceDetails.idCard")}
                                    path="professionalDetails.serviceDetails.idCard"
                                    onUpdate={handleFieldUpdate}
                                />
                            </Grid>
                        </Grid >
                    </Box >
                ) : serviceType === "business" ? (
                    <Box sx={{ p: 2, borderRadius: "14px", background: "rgba(0,0,0,0.02)", mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                            Business Details
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <StyledTextField
                                    label="Business Name"
                                    value={getValueByPath(formData, "professionalDetails.businessDetails.fullNameOfCompany") || ""}
                                    onChange={(e) => handleFieldUpdate("professionalDetails.businessDetails.fullNameOfCompany", e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <StyledTextField
                                    label="Business Structure"
                                    value={getValueByPath(formData, "professionalDetails.businessDetails.businessStructure") || ""}
                                    onChange={(e) => handleFieldUpdate("professionalDetails.businessDetails.businessStructure", e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <StyledTextField
                                    label="Business Address"
                                    multiline
                                    rows={2}
                                    value={getValueByPath(formData, "professionalDetails.businessDetails.addressOfCompany") || ""}
                                    onChange={(e) => handleFieldUpdate("professionalDetails.businessDetails.addressOfCompany", e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <ImageField
                                    label="GST Certificate"
                                    value={getValueByPath(formData, "professionalDetails.businessDetails.gstCertificate")}
                                    path="professionalDetails.businessDetails.gstCertificate"
                                    onUpdate={handleFieldUpdate}
                                />
                            </Grid>
                        </Grid >
                    </Box >
                ) : null
                }
            </Box >
        );
    };

    // ---------------------------
    // Reusable Object Field Component
    // ---------------------------
    const ObjectField = ({ label, value, path, onUpdate, fields }) => {
        const updateInner = (key, val) => {
            const fullPath = `${path}.${key}`;
            validateField(fullPath, val);
            onUpdate(fullPath, val);
        };


        return (
            <Box
                sx={{
                    mb: 3,
                    p: 2.5,
                    borderRadius: "20px",
                    background: neu.bg,
                    boxShadow: `8px 8px 16px ${neu.shadowDark}, -8px -8px 16px ${neu.shadowLight}`
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                    {label}
                </Typography>

                <Grid container spacing={2}>
                    {fields.map((item) => (
                        <Grid size={{ xs: 12, md: 6 }} key={item.key}>
                            <StyledTextField
                                label={item.label}
                                value={value?.[item.key] || ""}

                                onChange={(e) => {
                                    let val = e.target.value;

                                    if (item.key === "pincode") {
                                        val = val.replace(/\D/g, "");
                                        val = val.slice(0, 6);
                                    }

                                    updateInner(item.key, val);
                                }}

                                inputProps={
                                    item.key === "pincode"
                                        ? { maxLength: 6, inputMode: "numeric", pattern: "[0-9]*" }
                                        : {}
                                }

                                type={item.type || "text"}
                                fullWidth
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    };

    if (!member) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "25px",
                    background: neu.bg,
                }
            }}
        >
            <DialogTitle
                sx={{
                    p: 2.5,
                    borderBottom: "none",
                    fontWeight: 700,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Edit Member: {getValueByPath(formData, "personalDetails.nameOfMember") || "Unknown"}
                </Typography>

                <IconButton
                    onClick={onClose}
                    sx={{
                        background: neu.bg,
                        borderRadius: "50%",
                        boxShadow: `5px 5px 10px ${neu.shadowDark}, -5px -5px 10px ${neu.shadowLight}`
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* MAIN FORM SECTION */}
            <DialogContent dividers sx={{ maxHeight: "80vh", border: "none", p: 3 }}>
                <Grid container spacing={3}>

                    {/* 1. PERSONAL INFORMATION */}
                    <Grid size={{ xs: 12 }}>
                        <Accordion
                            defaultExpanded
                            sx={{
                                borderRadius: "20px",
                                background: neu.bg,
                                boxShadow: `8px 8px 16px ${neu.shadowDark}, -8px -8px 16px ${neu.shadowLight}`,
                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    👤 Personal Information
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <StyledTextField
                                            label="Title"
                                            value={getValueByPath(formData, "personalDetails.title") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.title", e.target.value)}
                                            error={Boolean(errors["personalDetails.title"])}
                                            helperText={errors["personalDetails.title"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 9 }}>
                                        <StyledTextField
                                            label="Name of Member"
                                            value={getValueByPath(formData, "personalDetails.nameOfMember") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.nameOfMember", e.target.value)}
                                            error={Boolean(errors["personalDetails.nameOfMember"])}
                                            helperText={errors["personalDetails.nameOfMember"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Membership Number"
                                            value={getValueByPath(formData, "personalDetails.membershipNumber") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.membershipNumber", e.target.value)}
                                            error={Boolean(errors["personalDetails.membershipNumber"])}
                                            helperText={errors["personalDetails.membershipNumber"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Membership Date"
                                            type="date"
                                            value={getValueByPath(formData, "personalDetails.membershipDate") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.membershipDate", e.target.value)}
                                            error={Boolean(errors["personalDetails.membershipDate"])}
                                            helperText={errors["personalDetails.membershipDate"]}
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <StyledTextField
                                            label="Father Title"
                                            value={getValueByPath(formData, "personalDetails.fatherTitle") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.fatherTitle", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 9 }}>
                                        <StyledTextField
                                            label="Father's Name"
                                            value={getValueByPath(formData, "personalDetails.nameOfFather") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.nameOfFather", e.target.value)}
                                            error={Boolean(errors["personalDetails.nameOfFather"])}
                                            helperText={errors["personalDetails.nameOfFather"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <StyledTextField
                                            label="Mother Title"
                                            value={getValueByPath(formData, "personalDetails.motherTitle") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.motherTitle", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 9 }}>
                                        <StyledTextField
                                            label="Mother's Name"
                                            value={getValueByPath(formData, "personalDetails.nameOfMother") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.nameOfMother", e.target.value)}
                                            error={Boolean(errors["personalDetails.nameOfMother"])}
                                            helperText={errors["personalDetails.nameOfMother"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Spouse Name"
                                            value={getValueByPath(formData, "personalDetails.nameOfSpouse") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.nameOfSpouse", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <FormControl component="fieldset">
                                        <RadioGroup
                                            value={getValueByPath(formData, "personalDetails.minor") ? "yes" : "no"}
                                            onChange={(e) => handleFieldUpdate("personalDetails.minor", e.target.value === "yes")}
                                            row
                                        >
                                            <FormControlLabel value="yes" control={<Radio />} label="Minor" />
                                            <FormControlLabel value="no" control={<Radio />} label="Not Minor" />
                                        </RadioGroup>
                                    </FormControl>

                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Date of Birth"
                                            type="date"
                                            value={getValueByPath(formData, "personalDetails.dateOfBirth") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.dateOfBirth", e.target.value)}
                                            error={Boolean(errors["personalDetails.dateOfBirth"])}
                                            helperText={errors["personalDetails.dateOfBirth"]}
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Age (Years)"
                                            value={getValueByPath(formData, "personalDetails.ageInYears") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.ageInYears", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Gender</InputLabel>
                                            <Select
                                                value={getValueByPath(formData, "personalDetails.gender") || ""}
                                                onChange={(e) => handleFieldUpdate("personalDetails.gender", e.target.value)}
                                                label="Gender"
                                                sx={{ borderRadius: "14px", background: neu.bg }}
                                            >
                                                {Object.entries(GenderOptions).map(([value, label]) => (
                                                    <MenuItem key={value} value={value}>
                                                        {label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Marital Status</InputLabel>
                                            <Select
                                                value={getValueByPath(formData, "personalDetails.maritalStatus") || ""}
                                                onChange={(e) => handleFieldUpdate("personalDetails.maritalStatus", e.target.value)}
                                                label="Marital Status"
                                                sx={{ borderRadius: "14px", background: neu.bg }}
                                            >
                                                {Object.entries(MaritalStatusOptions).map(([value, label]) => (
                                                    <MenuItem key={value} value={value}>
                                                        {label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Religion"
                                            value={getValueByPath(formData, "personalDetails.religion") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.religion", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Category"
                                            value={getValueByPath(formData, "personalDetails.caste") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.caste", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Primary Phone"
                                            value={getValueByPath(formData, "personalDetails.phoneNo1") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.phoneNo1", e.target.value)}
                                            error={Boolean(errors["personalDetails.phoneNo1"])}
                                            helperText={errors["personalDetails.phoneNo1"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Secondary Phone"
                                            value={getValueByPath(formData, "personalDetails.phoneNo2") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.phoneNo2", e.target.value)}
                                            error={Boolean(errors["personalDetails.phoneNo2"])}
                                            helperText={errors["personalDetails.phoneNo2"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="WhatsApp Number"
                                            value={getValueByPath(formData, "personalDetails.whatsapp") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.whatsapp", e.target.value)}
                                            error={Boolean(errors["personalDetails.whatsapp"])}
                                            helperText={errors["personalDetails.whatsapp"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Landline Number"
                                            value={getValueByPath(formData, "personalDetails.landlineNo") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.landlineNo", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Landline Number Office"
                                            value={getValueByPath(formData, "personalDetails.landlineOffice") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.landlineOffice", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Primary Email"
                                            type="email"
                                            value={getValueByPath(formData, "personalDetails.emailId1") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.emailId1", e.target.value)}
                                            error={Boolean(errors["personalDetails.emailId1"])}
                                            helperText={errors["personalDetails.emailId1"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Secondary Email"
                                            type="email"
                                            value={getValueByPath(formData, "personalDetails.emailId2") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.emailId2", e.target.value)}
                                            error={Boolean(errors["personalDetails.emailId2"])}
                                            helperText={errors["personalDetails.emailId2"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Optional Number"
                                            type="email"
                                            value={getValueByPath(formData, "personalDetails.emailId3") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.emailId3", e.target.value)}
                                            error={Boolean(errors["personalDetails.emailId3"])}
                                            helperText={errors["personalDetails.emailId3"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Resignation Date"
                                            type="date"
                                            value={getValueByPath(formData, "personalDetails.resignationDate") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.resignationDate", e.target.value)}
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>

                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="CIBIL Score"
                                            type="number"
                                            value={getValueByPath(formData, "creditDetails.cibilScore") || ""}
                                            onChange={(e) => handleFieldUpdate("creditDetails.cibilScore", e.target.value)}
                                            error={Boolean(errors["creditDetails.cibilScore"])}
                                            helperText={errors["creditDetails.cibilScore"]}
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid >
                            </AccordionDetails >
                        </Accordion >
                    </Grid >

                    {/* 2. ADDRESS DETAILS */}
                    <Grid size={{ xs: 12 }}>
                        <Accordion
                            sx={{
                                borderRadius: "20px",
                                background: neu.bg,
                                boxShadow: `8px 8px 16px ${neu.shadowDark}, -8px -8px 16px ${neu.shadowLight}`,
                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    🏠 Address Details
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                {/* Permanent Address */}
                                <Box
                                    sx={{
                                        mb: 3,
                                        p: 2.5,
                                        borderRadius: "20px",
                                        background: neu.bg,
                                        boxShadow: `8px 8px 16px ${neu.shadowDark}, -8px -8px 16px ${neu.shadowLight}`
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                                        Permanent Address
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {[
                                            { key: "flatHouseNo", label: "Flat/House No", type: "text" },
                                            { key: "areaStreetSector", label: "Area/Street/Sector", type: "text" },
                                            { key: "locality", label: "Locality", type: "text" },
                                            { key: "landmark", label: "Landmark", type: "text" },
                                            { key: "city", label: "City", type: "text" },
                                            { key: "country", label: "Country", type: "text" },
                                            { key: "state", label: "State", type: "text" },
                                            { key: "pincode", label: "Pincode", type: "text" }
                                        ].map((field) => (
                                            <Grid item xs={12} md={6} key={field.key}>
                                                <TextField
                                                    label={field.label}
                                                    value={formData?.addressDetails?.permanentAddress?.[field.key] || ""}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        if (field.key === "pincode") {
                                                            val = val.replace(/\D/g, "");
                                                            val = val.slice(0, 6);
                                                        }

                                                        // Create a clean update
                                                        const updatedData = {
                                                            ...formData,
                                                            addressDetails: {
                                                                ...formData.addressDetails,
                                                                permanentAddress: {
                                                                    ...formData.addressDetails?.permanentAddress,
                                                                    [field.key]: val
                                                                }
                                                            }
                                                        };

                                                        console.log(`Updating permanentAddress.${field.key}:`, val);
                                                        console.log("Updated data:", updatedData.addressDetails.permanentAddress);

                                                        setFormData(updatedData);
                                                    }}
                                                    inputProps={
                                                        field.key === "pincode"
                                                            ? { maxLength: 6, inputMode: "numeric", pattern: "[0-9]*" }
                                                            : {}
                                                    }
                                                    fullWidth
                                                    sx={{ mb: 2 }}
                                                    variant="outlined"
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>

                                {/* Current Address */}
                                <Box
                                    sx={{
                                        mb: 3,
                                        p: 2.5,
                                        borderRadius: "20px",
                                        background: neu.bg,
                                        boxShadow: `8px 8px 16px ${neu.shadowDark}, -8px -8px 16px ${neu.shadowLight}`
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                                        Current Residential Address
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {[
                                            { key: "flatHouseNo", label: "Flat/House No", type: "text" },
                                            { key: "areaStreetSector", label: "Area/Street/Sector", type: "text" },
                                            { key: "locality", label: "Locality", type: "text" },
                                            { key: "landmark", label: "Landmark", type: "text" },
                                            { key: "city", label: "City", type: "text" },
                                            { key: "country", label: "Country", type: "text" },
                                            { key: "state", label: "State", type: "text" },
                                            { key: "pincode", label: "Pincode", type: "text" }
                                        ].map((field) => (
                                            <Grid item xs={12} md={6} key={field.key}>
                                                <TextField
                                                    label={field.label}
                                                    value={formData?.addressDetails?.currentResidentalAddress?.[field.key] || ""}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        if (field.key === "pincode") {
                                                            val = val.replace(/\D/g, "");
                                                            val = val.slice(0, 6);
                                                        }

                                                        // Create a clean update
                                                        const updatedData = {
                                                            ...formData,
                                                            addressDetails: {
                                                                ...formData.addressDetails,
                                                                currentResidentalAddress: {
                                                                    ...formData.addressDetails?.currentResidentalAddress,
                                                                    [field.key]: val
                                                                }
                                                            }
                                                        };

                                                        console.log(`Updating currentResidentalAddress.${field.key}:`, val);
                                                        console.log("Updated data:", updatedData.addressDetails.currentResidentalAddress);

                                                        setFormData(updatedData);
                                                    }}
                                                    inputProps={
                                                        field.key === "pincode"
                                                            ? { maxLength: 6, inputMode: "numeric", pattern: "[0-9]*" }
                                                            : {}
                                                    }
                                                    fullWidth
                                                    sx={{ mb: 2 }}
                                                    variant="outlined"
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>

                                {/* Address Proof Photos */}
                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    <Grid item xs={12} md={6}>
                                        <ImageField
                                            label="Permanent Address Proof Photo"
                                            value={formData?.addressDetails?.permanentAddressBillPhoto}
                                            path="addressDetails.permanentAddressBillPhoto"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <ImageField
                                            label="Current Address Proof Photo"
                                            value={formData?.addressDetails?.currentResidentalBillPhoto}
                                            path="addressDetails.currentResidentalBillPhoto"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                    {/* 3. PROFESSIONAL DETAILS WITH SERVICE TYPE */}
                    < Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <Accordion
                            sx={{
                                borderRadius: "20px",
                                background: neu.bg,
                                boxShadow: `8px 8px 16px ${neu.shadowDark}, -8px -8px 16px ${neu.shadowLight}`,
                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    💼 Professional Details
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <Grid container spacing={2}>

                                    {/* Qualification */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Qualification"
                                            value={getValueByPath(formData, "professionalDetails.qualification") || ""}
                                            onChange={(e) => handleFieldUpdate("professionalDetails.qualification", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>

                                    {/* Occupation */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Occupation"
                                            value={getValueByPath(formData, "professionalDetails.occupation") || ""}
                                            onChange={(e) => handleFieldUpdate("professionalDetails.occupation", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>

                                    {/* Certificate */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Certificate Number"
                                            value={getValueByPath(formData, "professionalDetails.degreeNumber") || ""}
                                            onChange={(e) => handleFieldUpdate("professionalDetails.degreeNumber", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>

                                    {/* Qualification Remark */}
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Qualification Remark"
                                            value={getValueByPath(formData, "professionalDetails.qualificationRemark") || ""}
                                            onChange={(e) => handleFieldUpdate("professionalDetails.qualificationRemark", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>

                                    {/* SERVICE TYPE RADIO */}
                                    <Grid size={{ xs: 12 }}>
                                        <Typography sx={{ fontWeight: 600, mb: 1 }}>Select Work Type</Typography>

                                        <RadioGroup
                                            row
                                            value={getValueByPath(formData, "professionalDetails.serviceType")}
                                            onChange={(e) => setServiceType(e.target.value)}
                                        >
                                            <FormControlLabel value="govt" control={<Radio />} label="Government Service" />
                                            <FormControlLabel value="private" control={<Radio />} label="Private Service" />
                                            <FormControlLabel value="business" control={<Radio />} label="Business" />
                                        </RadioGroup>
                                    </Grid>

                                    {/* =============================
                GOVERNMENT + PRIVATE SERVICE
            ==============================*/}
                                    {(formData.professionalDetails.serviceType === "govt"
                                        || formData.professionalDetails.serviceType === "private") && (
                                            <Box sx={{ mt: 2, p: 2, background: neu.bg, borderRadius: "15px", width: "100%" }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                                                    {formData.professionalDetails.serviceType === "govt"
                                                        ? "Government Service Details"
                                                        : "Private Service Details"}
                                                </Typography>

                                                <Grid container spacing={2}>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <StyledTextField
                                                            label="Company Name"
                                                            value={getValueByPath(formData, "professionalDetails.serviceDetails.fullNameOfCompany") || ""}
                                                            onChange={(e) =>
                                                                handleFieldUpdate("professionalDetails.serviceDetails.fullNameOfCompany", e.target.value)
                                                            }
                                                            fullWidth
                                                        />
                                                    </Grid>

                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <StyledTextField
                                                            label="Department"
                                                            value={getValueByPath(formData, "professionalDetails.serviceDetails.department") || ""}
                                                            onChange={(e) =>
                                                                handleFieldUpdate("professionalDetails.serviceDetails.department", e.target.value)
                                                            }
                                                            fullWidth
                                                        />
                                                    </Grid>

                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <StyledTextField
                                                            label="Designation"
                                                            value={getValueByPath(formData, "professionalDetails.serviceDetails.designation") || ""}
                                                            onChange={(e) =>
                                                                handleFieldUpdate("professionalDetails.serviceDetails.designation", e.target.value)
                                                            }
                                                            fullWidth
                                                        />
                                                    </Grid>

                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <StyledTextField
                                                            label="Employee Code"
                                                            value={getValueByPath(formData, "professionalDetails.serviceDetails.employeeCode") || ""}
                                                            onChange={(e) =>
                                                                handleFieldUpdate("professionalDetails.serviceDetails.employeeCode", e.target.value)
                                                            }
                                                            fullWidth
                                                        />
                                                    </Grid>

                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <StyledTextField
                                                            label="Monthly Income"
                                                            value={getValueByPath(formData, "professionalDetails.serviceDetails.monthlyIncome") || ""}
                                                            onChange={(e) =>
                                                                handleFieldUpdate("professionalDetails.serviceDetails.monthlyIncome", e.target.value)
                                                            }
                                                            fullWidth
                                                        />
                                                    </Grid>

                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <StyledTextField
                                                            label="Office Phone"
                                                            value={getValueByPath(formData, "professionalDetails.serviceDetails.officeNo") || ""}
                                                            onChange={(e) =>
                                                                handleFieldUpdate("professionalDetails.serviceDetails.officeNo", e.target.value)
                                                            }
                                                            fullWidth
                                                        />
                                                    </Grid>

                                                    {/* Joining Date */}
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <StyledTextField
                                                            type="date"
                                                            label="Date of Joining"
                                                            InputLabelProps={{ shrink: true }}
                                                            value={getValueByPath(formData, "professionalDetails.serviceDetails.dateOfJoining") || ""}
                                                            onChange={(e) =>
                                                                handleFieldUpdate("professionalDetails.serviceDetails.dateOfJoining", e.target.value)
                                                            }
                                                            fullWidth
                                                        />
                                                    </Grid>

                                                    {/* Retirement Date */}
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <StyledTextField
                                                            type="date"
                                                            label="Date of Retirement"
                                                            InputLabelProps={{ shrink: true }}
                                                            value={getValueByPath(formData, "professionalDetails.serviceDetails.dateOfRetirement") || ""}
                                                            onChange={(e) =>
                                                                handleFieldUpdate("professionalDetails.serviceDetails.dateOfRetirement", e.target.value)
                                                            }
                                                            fullWidth
                                                        />
                                                    </Grid>

                                                    {/* Company Address */}
                                                    <Grid size={{ xs: 12 }}>
                                                        <StyledTextField
                                                            label="Company Address"
                                                            multiline
                                                            rows={2}
                                                            value={getValueByPath(formData, "professionalDetails.serviceDetails.addressOfCompany") || ""}
                                                            onChange={(e) =>
                                                                handleFieldUpdate("professionalDetails.serviceDetails.addressOfCompany", e.target.value)
                                                            }
                                                            fullWidth
                                                        />
                                                    </Grid>

                                                    {/* Uploads */}
                                                    <Grid size={{ xs: 12, md: 4 }}>
                                                        <ImageField
                                                            label="Bank Statement"
                                                            value={getValueByPath(formData, "professionalDetails.serviceDetails.bankStatement")}
                                                            path="professionalDetails.serviceDetails.bankStatement"
                                                            onUpdate={handleFieldUpdate}
                                                        />
                                                    </Grid>

                                                    <Grid size={{ xs: 12, md: 4 }}>
                                                        <ImageField
                                                            label="Monthly Salary Slip"
                                                            value={getValueByPath(formData, "professionalDetails.serviceDetails.monthlySlip")}
                                                            path="professionalDetails.serviceDetails.monthlySlip"
                                                            onUpdate={handleFieldUpdate}
                                                        />
                                                    </Grid>

                                                    <Grid size={{ xs: 12, md: 4 }}>
                                                        <ImageField
                                                            label="ID Card"
                                                            value={getValueByPath(formData, "professionalDetails.serviceDetails.idCard")}
                                                            path="professionalDetails.serviceDetails.idCard"
                                                            onUpdate={handleFieldUpdate}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}

                                    {/* =============================
                  BUSINESS SECTION
            ==============================*/}
                                    {formData.professionalDetails.serviceType === "business" && (
                                        <Box sx={{ mt: 2, p: 2, background: neu.bg, borderRadius: "15px", width: "100%" }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                                                Business Details
                                            </Typography>

                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <StyledTextField
                                                        label="Business Name"
                                                        value={getValueByPath(formData, "professionalDetails.businessDetails.fullNameOfCompany") || ""}
                                                        onChange={(e) =>
                                                            handleFieldUpdate("professionalDetails.businessDetails.fullNameOfCompany", e.target.value)
                                                        }
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <StyledTextField
                                                        label="Business Structure"
                                                        value={getValueByPath(formData, "professionalDetails.businessDetails.businessStructure") || ""}
                                                        onChange={(e) =>
                                                            handleFieldUpdate("professionalDetails.businessDetails.businessStructure", e.target.value)
                                                        }
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid size={{ xs: 12 }}>
                                                    <StyledTextField
                                                        label="Business Address"
                                                        multiline
                                                        rows={2}
                                                        value={getValueByPath(formData, "professionalDetails.businessDetails.addressOfCompany") || ""}
                                                        onChange={(e) =>
                                                            handleFieldUpdate("professionalDetails.businessDetails.addressOfCompany", e.target.value)
                                                        }
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid size={{ xs: 12 }}>
                                                    <StyledTextField
                                                        label="GST Number"
                                                        value={getValueByPath(formData, "professionalDetails.businessDetails.gstNumber") || ""}
                                                        onChange={(e) =>
                                                            handleFieldUpdate("professionalDetails.businessDetails.gstNumber", e.target.value)
                                                        }
                                                        fullWidth
                                                    />
                                                </Grid>

                                                <Grid size={{ xs: 12 }}>
                                                    <ImageField
                                                        label="GST Certificate"
                                                        value={getValueByPath(formData, "professionalDetails.businessDetails.gstCertificate")}
                                                        path="professionalDetails.businessDetails.gstCertificate"
                                                        onUpdate={handleFieldUpdate}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid >

                    {/* 4. DOCUMENT DETAILS */}
                    < Grid size={{ xs: 12 }} >
                        <Accordion
                            sx={{
                                borderRadius: "20px",
                                background: neu.bg,
                                boxShadow: `8px 8px 16px ${neu.shadowDark}, -8px -8px 16px ${neu.shadowLight}`,
                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    📄 Document Details
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {/* Profile Photo Section */}
                                    <Grid size={{ xs: 12 }} md={4}>
                                        <ImageField
                                            label="Profile Photo"
                                            value={getValueByPath(formData, "documents.passportSize")}
                                            path="documents.passportSize"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <ImageField
                                            label="Signature"
                                            value={getValueByPath(formData, "documents.sign")}
                                            path="documents.sign"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="PAN Number"
                                            value={getValueByPath(formData, "documents.panNo") || ""}
                                            onChange={(e) => handleFieldUpdate("documents.panNo", e.target.value)}
                                            error={Boolean(errors["documents.panNo"])}
                                            helperText={errors["documents.panNo"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <ImageField
                                            label="PAN Photo"
                                            value={getValueByPath(formData, "documents.panNoPhoto")}
                                            path="documents.panNoPhoto"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Aadhaar Number"
                                            value={getValueByPath(formData, "documents.aadhaarNo") || ""}
                                            onChange={(e) => handleFieldUpdate("documents.aadhaarNo", e.target.value)}
                                            error={Boolean(errors["documents.aadhaarNo"])}
                                            helperText={errors["documents.aadhaarNo"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <ImageField
                                            label="Aadhaar Photo"
                                            value={getValueByPath(formData, "documents.aadhaarNoPhoto")}
                                            path="documents.aadhaarNoPhoto"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Voter ID"
                                            value={getValueByPath(formData, "documents.voterId") || ""}
                                            onChange={(e) => handleFieldUpdate("documents.voterId", e.target.value)}
                                            error={Boolean(errors["documents.voterId"])}
                                            helperText={errors["documents.voterId"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <ImageField
                                            label="Voter ID Photo"
                                            value={getValueByPath(formData, "documents.voterIdPhoto")}
                                            path="documents.voterIdPhoto"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Driving License"
                                            value={getValueByPath(formData, "documents.drivingLicense") || ""}
                                            onChange={(e) => handleFieldUpdate("documents.drivingLicense", e.target.value)}
                                            error={Boolean(errors["documents.drivingLicense"])}
                                            helperText={errors["documents.drivingLicense"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Passport Number"
                                            value={getValueByPath(formData, "documents.passportNo") || ""}
                                            onChange={(e) => handleFieldUpdate("documents.passportNo", e.target.value)}
                                            error={Boolean(errors["documents.passportNo"])}
                                            helperText={errors["documents.passportNo"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <ImageField
                                            label="Passport Photo"
                                            value={getValueByPath(formData, "documents.passportNoPhoto")}
                                            path="documents.passportNoPhoto"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Ration Card"
                                            value={getValueByPath(formData, "documents.rationCard") || ""}
                                            onChange={(e) => handleFieldUpdate("documents.rationCard", e.target.value)}
                                            error={Boolean(errors["documents.rationCard"])}
                                            helperText={errors["documents.rationCard"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <ImageField
                                            label="Ration Card Photo"
                                            value={getValueByPath(formData, "documents.rationCardPhoto")}
                                            path="documents.rationCardPhoto"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails >
                        </Accordion >
                    </Grid >

                    {/* 5. BANK DETAILS */}
                    < Grid size={{ xs: 12 }} >
                        <Accordion
                            sx={{
                                borderRadius: "20px",
                                background: neu.bg,
                                boxShadow: `8px 8px 16px ${neu.shadowDark}, -8px -8px 16px ${neu.shadowLight}`,
                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    🏦 Bank Details
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Account Holder Name"
                                            value={getValueByPath(formData, "bankDetails.accountHolderName") || ""}
                                            onChange={(e) => handleFieldUpdate("bankDetails.accountHolderName", e.target.value)}
                                            error={Boolean(errors["bankDetails.accountHolderName"])}
                                            helperText={errors["bankDetails.accountHolderName"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Bank Name"
                                            value={getValueByPath(formData, "bankDetails.bankName") || ""}
                                            onChange={(e) => handleFieldUpdate("bankDetails.bankName", e.target.value)}
                                            error={Boolean(errors["bankDetails.bankName"])}
                                            helperText={errors["bankDetails.bankName"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Branch"
                                            value={getValueByPath(formData, "bankDetails.branch") || ""}
                                            onChange={(e) => handleFieldUpdate("bankDetails.branch", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Account Number"
                                            value={getValueByPath(formData, "bankDetails.accountNumber") || ""}
                                            onChange={(e) => handleFieldUpdate("bankDetails.accountNumber", e.target.value)}
                                            error={Boolean(errors["bankDetails.accountNumber"])}
                                            helperText={errors["bankDetails.accountNumber"]}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="IFSC Code"
                                            value={getValueByPath(formData, "bankDetails.ifscCode") || ""}
                                            onChange={(e) => handleFieldUpdate("bankDetails.ifscCode", e.target.value)}
                                            error={Boolean(errors["bankDetails.ifscCode"])}
                                            helperText={errors["bankDetails.ifscCode"]}
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid >
                            </AccordionDetails >
                        </Accordion >
                    </Grid >

                    {/* 6. FINANCIAL DETAILS */}
                    < Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <Accordion
                            sx={{
                                borderRadius: "20px",
                                background: neu.bg,
                                boxShadow: `8px 8px 16px ${neu.shadowDark}, -8px -8px 16px ${neu.shadowLight}`,
                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    💰 Financial Details
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }} >
                                        <StyledTextField
                                            label="Share Capital"
                                            type="number"
                                            value={getValueByPath(formData, "financialDetails.shareCapital") || ""}
                                            onChange={(e) => handleFieldUpdate("financialDetails.shareCapital", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }} >
                                        <StyledTextField
                                            label="Compulsory Deposit"

                                            value={getValueByPath(formData, "financialDetails.compulsory") || ""}
                                            onChange={(e) => handleFieldUpdate("financialDetails.compulsory", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }} >
                                        <StyledTextField
                                            label="Optional Deposit"
                                            value={getValueByPath(formData, "financialDetails.optionalDeposit") || ""}
                                            onChange={(e) => handleFieldUpdate("financialDetails.optionalDeposit", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid >
                            </AccordionDetails >
                        </Accordion >
                    </Grid >

                </Grid >
            </DialogContent >

            {/* FOOTER */}
            < DialogActions
                sx={{
                    p: 2.5,
                    borderTop: "none",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2
                }}
            >
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        px: 3,
                        borderRadius: "14px",
                        background: neu.bg,
                        boxShadow: `5px 5px 10px ${neu.shadowDark}, -5px -5px 10px ${neu.shadowLight}`,
                        color: "#555",
                        "&:hover": {
                            background: neu.bg,
                            boxShadow: `inset 5px 5px 10px ${neu.shadowDark}, inset -5px -5px 10px ${neu.shadowLight}`
                        }
                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                    disabled={loading}
                    onClick={handleSave}
                    sx={{
                        px: 3,
                        borderRadius: "14px",
                        background: "#4b70f5",
                        color: "#fff",
                        boxShadow: `5px 5px 15px rgba(75, 112, 245, 0.4), -5px -5px 15px rgba(255, 255, 255, 0.8)`,
                        "&:hover": {
                            background: "#3a5be0",
                            boxShadow: `inset 5px 5px 10px rgba(0,0,0,0.2), inset -5px -5px 10px rgba(255,255,255,0.8)`
                        }
                    }}
                >
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </DialogActions >
        </Dialog >
    );
}