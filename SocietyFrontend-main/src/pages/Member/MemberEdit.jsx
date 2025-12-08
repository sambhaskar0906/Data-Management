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

    const [formData, setFormData] = useState(member || {});

    // Soft UI theme colors
    const neu = {
        bg: "#e9eef5",
        shadowLight: "rgba(255,255,255,0.8)",
        shadowDark: "rgba(0,0,0,0.15)"
    };

    useEffect(() => {
        setFormData(member || {});
    }, [member]);

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
        setFormData(prev => {
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
            const newObj = { ...(value || {}), [key]: val };
            onUpdate(path, newObj);
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
                        <Grid siz={{ xs: 12, md: 6 }} key={item.key}>
                            <StyledTextField
                                label={item.label}
                                value={value?.[item.key] || ""}
                                onChange={(e) => updateInner(item.key, e.target.value)}
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
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 9 }}>
                                        <StyledTextField
                                            label="Name of Member"
                                            value={getValueByPath(formData, "personalDetails.nameOfMember") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.nameOfMember", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Membership Number"
                                            value={getValueByPath(formData, "personalDetails.membershipNumber") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.membershipNumber", e.target.value)}
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
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Father's Name"
                                            value={getValueByPath(formData, "personalDetails.nameOfFather") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.nameOfFather", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Mother's Name"
                                            value={getValueByPath(formData, "personalDetails.nameOfMother") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.nameOfMother", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Date of Birth"
                                            type="date"
                                            value={getValueByPath(formData, "personalDetails.dateOfBirth") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.dateOfBirth", e.target.value)}
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Age (Years)"
                                            type="number"
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
                                            label="Caste"
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
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Secondary Phone"
                                            value={getValueByPath(formData, "personalDetails.phoneNo2") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.phoneNo2", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="WhatsApp Number"
                                            value={getValueByPath(formData, "personalDetails.whatsapp") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.whatsapp", e.target.value)}
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
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Amount in Credit"
                                            type="number"
                                            value={getValueByPath(formData, "personalDetails.amountInCredit") || ""}
                                            onChange={(e) => handleFieldUpdate("personalDetails.amountInCredit", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid >
                            </AccordionDetails >
                        </Accordion >
                    </Grid >

                    {/* 2. ADDRESS DETAILS */}
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
                                    🏠 Address Details
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                {/* Permanent Address */}
                                <ObjectField
                                    label="Permanent Address"
                                    value={getValueByPath(formData, "addressDetails.permanentAddress")}
                                    path="addressDetails.permanentAddress"
                                    onUpdate={handleFieldUpdate}
                                    fields={[
                                        { key: "flatHouseNo", label: "Flat/House No", type: "text" },
                                        { key: "areaStreetSector", label: "Area/Street/Sector", type: "text" },
                                        { key: "locality", label: "Locality", type: "text" },
                                        { key: "landmark", label: "Landmark", type: "text" },
                                        { key: "city", label: "City", type: "text" },
                                        { key: "country", label: "Country", type: "text" },
                                        { key: "state", label: "State", type: "text" },
                                        { key: "pincode", label: "Pincode", type: "text" }
                                    ]}
                                />

                                {/* Current Address */}
                                <ObjectField
                                    label="Current Residential Address"
                                    value={getValueByPath(formData, "addressDetails.currentResidentalAddress")}
                                    path="addressDetails.currentResidentalAddress"
                                    onUpdate={handleFieldUpdate}
                                    fields={[
                                        { key: "flatHouseNo", label: "Flat/House No", type: "text" },
                                        { key: "areaStreetSector", label: "Area/Street/Sector", type: "text" },
                                        { key: "locality", label: "Locality", type: "text" },
                                        { key: "landmark", label: "Landmark", type: "text" },
                                        { key: "city", label: "City", type: "text" },
                                        { key: "country", label: "Country", type: "text" },
                                        { key: "state", label: "State", type: "text" },
                                        { key: "pincode", label: "Pincode", type: "text" }
                                    ]}
                                />

                                {/* Address Proof Photos */}
                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }} >
                                        <ImageField
                                            label="Permanent Address Proof Photo"
                                            value={getValueByPath(formData, "addressDetails.permanentAddressBillPhoto")}
                                            path="addressDetails.permanentAddressBillPhoto"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }} >
                                        <ImageField
                                            label="Current Address Proof Photo"
                                            value={getValueByPath(formData, "addressDetails.currentResidentalBillPhoto")}
                                            path="addressDetails.currentResidentalBillPhoto"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails >
                        </Accordion >
                    </Grid >

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
                                    <Grid size
                                        ={{ xs: 12, md: 6 }} >
                                        <StyledTextField
                                            label="Qualification"
                                            value={getValueByPath(formData, "professionalDetails.qualification") || ""}
                                            onChange={(e) => handleFieldUpdate("professionalDetails.qualification", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }} >
                                        <StyledTextField
                                            label="Occupation"
                                            value={getValueByPath(formData, "professionalDetails.occupation") || ""}
                                            onChange={(e) => handleFieldUpdate("professionalDetails.occupation", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }} >
                                        <StyledTextField
                                            label="Certificate of Membership"
                                            value={getValueByPath(formData, "professionalDetails.degreeNumber") || ""}
                                            onChange={(e) => handleFieldUpdate("professionalDetails.degreeNumber", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid >

                                {/* Service Type Section with Conditional Fields */}
                                < ServiceTypeSection />
                            </AccordionDetails >
                        </Accordion >
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
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Passport Number"
                                            value={getValueByPath(formData, "documents.passportNo") || ""}
                                            onChange={(e) => handleFieldUpdate("documents.passportNo", e.target.value)}
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
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="Bank Name"
                                            value={getValueByPath(formData, "bankDetails.bankName") || ""}
                                            onChange={(e) => handleFieldUpdate("bankDetails.bankName", e.target.value)}
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
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }}>
                                        <StyledTextField
                                            label="IFSC Code"
                                            value={getValueByPath(formData, "bankDetails.ifscCode") || ""}
                                            onChange={(e) => handleFieldUpdate("bankDetails.ifscCode", e.target.value)}
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
                                            type="number"
                                            value={getValueByPath(formData, "financialDetails.compulsory") || ""}
                                            onChange={(e) => handleFieldUpdate("financialDetails.compulsory", e.target.value)}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size
                                        ={{ xs: 12, md: 6 }} >
                                        <StyledTextField
                                            label="Optional Deposit"
                                            type="number"
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