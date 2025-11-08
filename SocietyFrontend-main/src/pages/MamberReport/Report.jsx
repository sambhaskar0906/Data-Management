import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    TextField,
    InputAdornment,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    CircularProgress,
    Alert
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Formik, Form } from "formik";
import { useNavigate } from "react-router-dom";

// Import your Redux actions
import { fetchAllMembers, deleteMember } from "../../features/member/memberSlice";

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

const isMissing = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") {
        // Check if it's an empty object
        if (Object.keys(value).length === 0) return true;
        // Check if all values in the object are empty
        return Object.values(value).every(val =>
            val === undefined || val === null || val === "" ||
            (typeof val === 'object' && Object.keys(val).length === 0)
        );
    }
    return false;
};

const FIELD_MAP = {
    // Personal
    "personalDetails.nameOfMember": "Member Name",
    "personalDetails.membershipNumber": "Membership No",
    "personalDetails.nameOfFather": "Father's Name",
    "personalDetails.nameOfMother": "Mother's Name",
    "personalDetails.dateOfBirth": "Date of Birth",
    "personalDetails.ageInYears": "Age (Years)",
    "personalDetails.membershipDate": "Membership Date",
    "personalDetails.amountInCredit": "Amount In Credit",
    "personalDetails.gender": "Gender",
    "personalDetails.maritalStatus": "Marital Status",
    "personalDetails.religion": "Religion",
    "personalDetails.caste": "Caste",
    "personalDetails.phoneNo": "Phone No",
    "personalDetails.alternatePhoneNo": "Alternate Phone",
    "personalDetails.emailId": "Email",

    // Address - permanent
    "addressDetails.permanentAddress.flatHouseNo": "Permanent - Flat/House No",
    "addressDetails.permanentAddress.areaStreetSector": "Permanent - Area/Street/Sector",
    "addressDetails.permanentAddress.locality": "Permanent - Locality",
    "addressDetails.permanentAddress.landmark": "Permanent - Landmark",
    "addressDetails.permanentAddress.city": "Permanent - City",
    "addressDetails.permanentAddress.country": "Permanent - Country",
    "addressDetails.permanentAddress.state": "Permanent - State",
    "addressDetails.permanentAddress.pincode": "Permanent - Pincode",
    "addressDetails.permanentAddressBillPhoto": "Permanent - Bill Photo",

    // Address - current
    "addressDetails.currentResidentalAddress.flatHouseNo": "Current - Flat/House No",
    "addressDetails.currentResidentalAddress.areaStreetSector": "Current - Area/Street/Sector",
    "addressDetails.currentResidentalAddress.locality": "Current - Locality",
    "addressDetails.currentResidentalAddress.landmark": "Current - Landmark",
    "addressDetails.currentResidentalAddress.city": "Current - City",
    "addressDetails.currentResidentalAddress.country": "Current - Country",
    "addressDetails.currentResidentalAddress.state": "Current - State",
    "addressDetails.currentResidentalAddress.pincode": "Current - Pincode",
    "addressDetails.currentResidentalBillPhoto": "Current - Bill Photo",
    "addressDetails.previousCurrentAddress": "Previous Addresses",

    // References & guarantors
    "referenceDetails.referenceName": "Reference Name",
    "referenceDetails.referenceMno": "Reference Mobile",
    "referenceDetails.guarantorName": "Guarantor Name",
    "referenceDetails.gurantorMno": "Guarantor Mobile(s)",

    // Documents
    "documents.passportSize": "Passport Size Photo",
    "documents.panNo": "PAN No",
    "documents.rationCard": "Ration Card",
    "documents.drivingLicense": "Driving License",
    "documents.aadhaarNo": "Aadhaar No",
    "documents.voterId": "Voter ID",
    "documents.passportNo": "Passport No",
    "documents.panNoPhoto": "PAN Photo",
    "documents.rationCardPhoto": "Ration Card Photo",
    "documents.drivingLicensePhoto": "DL Photo",
    "documents.aadhaarNoPhoto": "Aadhaar Photo",
    "documents.voterIdPhoto": "Voter ID Photo",
    "documents.passportNoPhoto": "Passport Photo",
    "professionalDetails.qualification": "Qualification",
    "professionalDetails.occupation": "Occupation",

    // Family
    "familyDetails.familyMembersMemberOfSociety": "Family Members in Society",
    "familyDetails.familyMember": "Family Member Names",
    "familyDetails.familyMemberNo": "Family Member Phones",

    // Bank
    "bankDetails.bankName": "Bank Name",
    "bankDetails.branch": "Bank Branch",
    "bankDetails.accountNumber": "Account Number",
    "bankDetails.ifscCode": "IFSC Code",

    // Guarantee
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOtherSociety": "Guarantee Given in Other Society",
    "guaranteeDetails.otherSociety": "Other Society Guarantees",
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOurSociety": "Guarantee Given in Our Society",
    "guaranteeDetails.ourSociety": "Our Society Guarantees",

    // Loans
    "loanDetails": "Loan Details",
};

// Define the 4 main fields to show in table
const MAIN_TABLE_FIELDS = [
    "personalDetails.nameOfMember",
    "personalDetails.membershipNumber",
    "personalDetails.phoneNo",
    "personalDetails.emailId"
];

// Field groups for dropdown
const FIELD_GROUPS = {
    "mainFields": {
        label: "Main Fields (4 Fields)",
        fields: MAIN_TABLE_FIELDS
    },
    "allFields": {
        label: "All Fields",
        fields: Object.keys(FIELD_MAP)
    },
    "personalDetails": {
        label: "Personal Details",
        fields: Object.keys(FIELD_MAP).filter(f => f.startsWith("personalDetails"))
    },
    "addressDetails": {
        label: "Address Details",
        fields: Object.keys(FIELD_MAP).filter(f => f.startsWith("addressDetails"))
    },
    "referenceDetails": {
        label: "Reference & Guarantor",
        fields: Object.keys(FIELD_MAP).filter(f => f.startsWith("referenceDetails"))
    },
    "documents": {
        label: "Documents",
        fields: Object.keys(FIELD_MAP).filter(f => f.startsWith("documents"))
    },
    "professionalDetails": {
        label: "Professional Details",
        fields: Object.keys(FIELD_MAP).filter(f => f.startsWith("professionalDetails"))
    },
    "familyDetails": {
        label: "Family Details",
        fields: Object.keys(FIELD_MAP).filter(f => f.startsWith("familyDetails"))
    },
    "bankDetails": {
        label: "Bank Details",
        fields: Object.keys(FIELD_MAP).filter(f => f.startsWith("bankDetails"))
    },
    "guaranteeDetails": {
        label: "Guarantee Details",
        fields: Object.keys(FIELD_MAP).filter(f => f.startsWith("guaranteeDetails"))
    },
    "loanDetails": {
        label: "Loan Details",
        fields: ["loanDetails"]
    }
};

// Delete Confirmation Dialog
const DeleteConfirmationDialog = ({ open, onClose, onConfirm, memberName }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Confirm Delete
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete member <strong>"{memberName}"</strong>?
                    This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Main Component
const MissingMembersTable = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get data from Redux store
    const { members, loading, error, operationLoading } = useSelector((state) => state.members);

    const [selectedMember, setSelectedMember] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

    // Fetch members on component mount
    useEffect(() => {
        dispatch(fetchAllMembers());
    }, [dispatch]);

    const fieldKeys = Object.keys(FIELD_MAP);

    const generatePDF = (filteredMembers, visibleFields, viewType) => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text("Members Report", 14, 16);
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
        doc.text(`View: ${viewType} — Total: ${filteredMembers.length}`, 14, 28);

        const head = [["S. No", ...visibleFields.map((f) => FIELD_MAP[f]), "Status"]];

        const body = filteredMembers.map((m, idx) => {
            const row = [idx + 1];
            visibleFields.forEach((f) => {
                const val = getValueByPath(m, f);
                const missing = isMissing(val);

                let display = "";
                if (Array.isArray(val)) {
                    display = val.length > 0 ? val.slice(0, 3).join(", ") : "Missing";
                } else if (typeof val === "object" && val !== null) {
                    const entries = Object.entries(val);
                    display = entries.length > 0
                        ? entries.slice(0, 3).map(([k, v]) => `${k}:${v}`).join(", ")
                        : "Missing";
                } else {
                    display = !missing ? (val || "Filled") : "Missing";
                }
                row.push(display);
            });

            // Add overall status
            const totalFields = Object.keys(FIELD_MAP).length;
            const filledFields = Object.keys(FIELD_MAP).filter(f => !isMissing(getValueByPath(m, f))).length;
            row.push(`${filledFields}/${totalFields}`);

            return row;
        });

        autoTable(doc, {
            startY: 34,
            head,
            body,
            styles: { fontSize: 7, cellPadding: 2 },
            headStyles: { fillColor: [25, 118, 210], textColor: 255, fontSize: 8 },
        });

        doc.save(`Members_Report_${viewType}_${Date.now()}.pdf`);
    };

    const handleViewDetails = (member) => {
        navigate(`/member-details/${member._id}`);
    };

    const handleDeleteClick = (member, e) => {
        e.stopPropagation();
        setMemberToDelete(member);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (memberToDelete) {
            dispatch(deleteMember(memberToDelete._id))
                .then(() => {
                    setDeleteDialogOpen(false);
                    setMemberToDelete(null);
                    // Refresh the list
                    dispatch(fetchAllMembers());
                });
        }
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setMemberToDelete(null);
    };

    // Show loading state
    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading members...</Typography>
            </Box>
        );
    }

    // Show error state
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading members: {error.message || error.toString()}
                </Alert>
                <Button variant="contained" onClick={() => dispatch(fetchAllMembers())}>
                    Retry
                </Button>
            </Box>
        );
    }

    // Check if members data is available
    if (!members || members.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">
                    No members found. The data might be empty or there might be an issue with the API response.
                </Alert>
                <Button variant="contained" onClick={() => dispatch(fetchAllMembers())} sx={{ mt: 2 }}>
                    Refresh Data
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}>
                Members Missing / Filled Fields Overview
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Total Members: {members.length} | Click on any row to view complete details
            </Typography>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                memberName={memberToDelete ? getValueByPath(memberToDelete, "personalDetails.nameOfMember") : ""}
            />

            <Formik initialValues={{ search: "", viewType: "all", fieldGroup: "mainFields" }} onSubmit={() => { }}>
                {({ values, setFieldValue }) => {
                    const filteredMembers = useMemo(() => {
                        if (!members) return [];

                        let result = [...members];

                        // Filter by view type
                        if (values.viewType === "missing") {
                            result = result.filter((m) =>
                                fieldKeys.some((f) => isMissing(getValueByPath(m, f)))
                            );
                        } else if (values.viewType === "filled") {
                            result = result.filter((m) =>
                                fieldKeys.every((f) => !isMissing(getValueByPath(m, f)))
                            );
                        }

                        // Filter by search
                        const q = values.search.trim().toLowerCase();
                        if (q) {
                            result = result.filter((m) => {
                                const name = (getValueByPath(m, "personalDetails.nameOfMember") || "").toLowerCase();
                                const memNo = (getValueByPath(m, "personalDetails.membershipNumber") || "").toLowerCase();
                                return name.includes(q) || memNo.includes(q);
                            });
                        }

                        return result;
                    }, [values.search, values.viewType, members, fieldKeys]);

                    const visibleFields = useMemo(() => {
                        return FIELD_GROUPS[values.fieldGroup]?.fields || MAIN_TABLE_FIELDS;
                    }, [values.fieldGroup]);

                    return (
                        <Form>
                            <Stack spacing={2} sx={{ mb: 3 }}>
                                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                                    <TextField
                                        size="small"
                                        placeholder="Search by name or membership no"
                                        value={values.search}
                                        onChange={(e) => setFieldValue("search", e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ width: 300 }}
                                    />

                                    <FormControl size="small" sx={{ minWidth: 160 }}>
                                        <InputLabel>View Type</InputLabel>
                                        <Select
                                            value={values.viewType}
                                            label="View Type"
                                            onChange={(e) => setFieldValue("viewType", e.target.value)}
                                        >
                                            <MenuItem value="all">All Members</MenuItem>
                                            <MenuItem value="missing">With Missing Fields</MenuItem>
                                            <MenuItem value="filled">All Fields Filled</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 200 }}>
                                        <InputLabel>Show Fields</InputLabel>
                                        <Select
                                            value={values.fieldGroup}
                                            label="Show Fields"
                                            onChange={(e) => setFieldValue("fieldGroup", e.target.value)}
                                        >
                                            {Object.keys(FIELD_GROUPS).map((groupKey) => (
                                                <MenuItem key={groupKey} value={groupKey}>
                                                    {FIELD_GROUPS[groupKey].label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <Button
                                        variant="contained"
                                        startIcon={<PictureAsPdfIcon />}
                                        onClick={() => generatePDF(filteredMembers, visibleFields, values.viewType)}
                                        disabled={filteredMembers.length === 0}
                                    >
                                        Download PDF
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        onClick={() => dispatch(fetchAllMembers())}
                                        disabled={loading}
                                    >
                                        Refresh
                                    </Button>
                                </Box>

                                <Typography variant="body2" color="text.secondary">
                                    Showing {filteredMembers.length} of {members.length} members |
                                    View: {values.viewType} |
                                    Fields: {FIELD_GROUPS[values.fieldGroup].label}
                                </Typography>
                            </Stack>

                            {filteredMembers.length === 0 ? (
                                <Alert severity="info">
                                    No members match the current filters. Try changing your search criteria or view type.
                                </Alert>
                            ) : (
                                <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: "bold", bgcolor: 'primary.main', color: 'white' }}>S. No</TableCell>
                                                {visibleFields.map((f) => (
                                                    <TableCell key={f} sx={{ fontWeight: "bold", bgcolor: 'primary.main', color: 'white' }}>
                                                        {FIELD_MAP[f]}
                                                    </TableCell>
                                                ))}
                                                <TableCell sx={{ fontWeight: "bold", bgcolor: 'primary.main', color: 'white' }}>
                                                    Actions
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {filteredMembers.map((m, idx) => {
                                                const filledCount = fieldKeys.filter(f => !isMissing(getValueByPath(m, f))).length;
                                                const totalCount = fieldKeys.length;
                                                const completionRate = Math.round((filledCount / totalCount) * 100);

                                                return (
                                                    <TableRow
                                                        key={m._id || idx}
                                                        sx={{
                                                            "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                                                            "&:hover": { backgroundColor: "#f0f0f0", cursor: "pointer" }
                                                        }}
                                                        onClick={() => handleViewDetails(m)}
                                                    >
                                                        <TableCell>{idx + 1}</TableCell>
                                                        {visibleFields.map((f) => {
                                                            const val = getValueByPath(m, f);
                                                            const missing = isMissing(val);

                                                            let display = "";
                                                            if (Array.isArray(val)) {
                                                                display = val.length > 0 ? val.slice(0, 2).join(", ") + (val.length > 2 ? "..." : "") : "Missing";
                                                            } else if (typeof val === "object" && val !== null) {
                                                                const entries = Object.entries(val);
                                                                display = entries.length > 0
                                                                    ? entries.slice(0, 2).map(([k, v]) => `${k}:${v}`).join(", ") + (entries.length > 2 ? "..." : "")
                                                                    : "Missing";
                                                            } else {
                                                                display = !missing ? (val || "—") : "Missing";
                                                            }

                                                            return (
                                                                <TableCell
                                                                    key={f}
                                                                    sx={{
                                                                        color: missing ? "error.main" : "text.primary",
                                                                        fontWeight: missing ? "bold" : "normal",
                                                                        maxWidth: 200,
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                    title={display}
                                                                >
                                                                    {display}
                                                                </TableCell>
                                                            );
                                                        })}
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleViewDetails(m);
                                                                    }}
                                                                    title={`View Details (${completionRate}% filled)`}
                                                                    color="primary"
                                                                >
                                                                    <VisibilityIcon />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => handleDeleteClick(m, e)}
                                                                    title="Delete Member"
                                                                    color="error"
                                                                    disabled={operationLoading.delete}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Form>
                    );
                }}
            </Formik>
        </Box>
    );
};

export default MissingMembersTable;