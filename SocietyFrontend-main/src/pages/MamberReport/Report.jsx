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
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    CircularProgress,
    Alert,
    Chip,
    Tabs,
    Tab
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
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
        if (Object.keys(value).length === 0) return true;
        return Object.values(value).every(val =>
            val === undefined || val === null || val === "" ||
            (typeof val === 'object' && Object.keys(val).length === 0)
        );
    }
    return false;
};

// Civil Score specific check
const getCivilScoreStatus = (civilScore) => {
    if (civilScore === undefined || civilScore === null || civilScore === "") return "missing";
    const score = Number(civilScore);
    if (isNaN(score)) return "invalid";
    if (score >= 750) return "excellent";
    if (score >= 600) return "good";
    return "poor";
};

// All fields with their display names
const ALL_FIELDS = {
    // Personal Details
    "personalDetails.nameOfMember": "Member Name",
    "personalDetails.membershipNumber": "Membership No",
    "personalDetails.nameOfFather": "Father's Name",
    "personalDetails.nameOfMother": "Mother's Name",
    "personalDetails.dateOfBirth": "Date of Birth",
    "personalDetails.ageInYears": "Age",
    "personalDetails.membershipDate": "Membership Date",
    "personalDetails.amountInCredit": "Amount In Credit",
    "personalDetails.gender": "Gender",
    "personalDetails.maritalStatus": "Marital Status",
    "personalDetails.religion": "Religion",
    "personalDetails.caste": "Caste",
    "personalDetails.phoneNo": "Phone No",
    "personalDetails.alternatePhoneNo": "Alternate Phone",
    "personalDetails.emailId": "Email",

    // Address Details
    "addressDetails.permanentAddress.flatHouseNo": "Permanent - House No",
    "addressDetails.permanentAddress.areaStreetSector": "Permanent - Area",
    "addressDetails.permanentAddress.locality": "Permanent - Locality",
    "addressDetails.permanentAddress.landmark": "Permanent - Landmark",
    "addressDetails.permanentAddress.city": "Permanent - City",
    "addressDetails.permanentAddress.country": "Permanent - Country",
    "addressDetails.permanentAddress.state": "Permanent - State",
    "addressDetails.permanentAddress.pincode": "Permanent - Pincode",
    "addressDetails.currentResidentalAddress.flatHouseNo": "Current - House No",
    "addressDetails.currentResidentalAddress.areaStreetSector": "Current - Area",
    "addressDetails.currentResidentalAddress.locality": "Current - Locality",
    "addressDetails.currentResidentalAddress.landmark": "Current - Landmark",
    "addressDetails.currentResidentalAddress.city": "Current - City",
    "addressDetails.currentResidentalAddress.country": "Current - Country",
    "addressDetails.currentResidentalAddress.state": "Current - State",
    "addressDetails.currentResidentalAddress.pincode": "Current - Pincode",

    // Documents
    "documents.aadhaarNo": "Aadhaar Card",
    "documents.panNo": "PAN Card",
    "documents.voterId": "Voter ID",
    "documents.drivingLicense": "Driving License",
    "documents.passportNo": "Passport",
    "documents.rationCard": "Ration Card",
    "documents.passportSize": "Passport Photo",
    "documents.aadhaarNoPhoto": "Aadhaar Photo",
    "documents.panNoPhoto": "PAN Photo",
    "documents.voterIdPhoto": "Voter ID Photo",
    "documents.drivingLicensePhoto": "DL Photo",
    "documents.passportNoPhoto": "Passport Photo",
    "documents.rationCardPhoto": "Ration Card Photo",

    // Professional Details
    "professionalDetails.qualification": "Qualification",
    "professionalDetails.occupation": "Occupation",

    // Family Details
    "familyDetails.familyMembersMemberOfSociety": "Family in Society",
    "familyDetails.familyMember": "Family Members",
    "familyDetails.familyMemberNo": "Family Phones",

    // Bank Details
    "bankDetails.bankName": "Bank Name",
    "bankDetails.branch": "Bank Branch",
    "bankDetails.accountNumber": "Account Number",
    "bankDetails.ifscCode": "IFSC Code",
    "bankDetails.civilScore": "Civil Score", // ✅ Added Civil Score

    // Reference Details
    "referenceDetails.referenceName": "Reference Name",
    "referenceDetails.referenceMno": "Reference Mobile",
    "referenceDetails.guarantorName": "Guarantor Name",

    // Guarantee Details
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOtherSociety": "Guarantee Other Society",
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOurSociety": "Guarantee Our Society",

    // Loan Details
    "loanDetails": "Loan Details",
};

// Field groups for organization
const FIELD_GROUPS = {
    "personal": {
        label: "Personal Details",
        fields: Object.keys(ALL_FIELDS).filter(f => f.startsWith("personalDetails"))
    },
    "address": {
        label: "Address Details",
        fields: Object.keys(ALL_FIELDS).filter(f => f.startsWith("addressDetails"))
    },
    "documents": {
        label: "Documents",
        fields: Object.keys(ALL_FIELDS).filter(f => f.startsWith("documents"))
    },
    "professional": {
        label: "Professional",
        fields: Object.keys(ALL_FIELDS).filter(f => f.startsWith("professionalDetails"))
    },
    "family": {
        label: "Family",
        fields: Object.keys(ALL_FIELDS).filter(f => f.startsWith("familyDetails"))
    },
    "bank": {
        label: "Bank",
        fields: Object.keys(ALL_FIELDS).filter(f => f.startsWith("bankDetails"))
    },
    "reference": {
        label: "Reference",
        fields: Object.keys(ALL_FIELDS).filter(f => f.startsWith("referenceDetails"))
    },
    "guarantee": {
        label: "Guarantee",
        fields: Object.keys(ALL_FIELDS).filter(f => f.startsWith("guaranteeDetails"))
    },
    "loan": {
        label: "Loan",
        fields: ["loanDetails"]
    }
};

// Civil Score specific filters
const CIVIL_SCORE_FILTERS = {
    "all": "All Civil Scores",
    "missing": "Missing Civil Score",
    "excellent": "Excellent (750-900)",
    "good": "Good (600-749)",
    "poor": "Poor (300-599)",
    "invalid": "Invalid Score"
};

// Delete Confirmation Dialog
const DeleteConfirmationDialog = ({ open, onClose, onConfirm, memberName }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete member <strong>"{memberName}"</strong>?
                    This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onConfirm} variant="contained" color="error">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`field-tabpanel-${index}`}
            aria-labelledby={`field-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
        </div>
    );
}

// Main Component
const MissingMembersTable = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get data from Redux store
    const { members, loading, error, operationLoading } = useSelector((state) => state.members);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    // Fetch members on component mount
    useEffect(() => {
        dispatch(fetchAllMembers());
    }, [dispatch]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const generatePDF = (filteredMembers, selectedField, viewType) => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Field Status Report", 14, 16);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);
        doc.text(`Field: ${ALL_FIELDS[selectedField]} | View: ${viewType} | Total: ${filteredMembers.length}`, 14, 32);

        const head = [["S. No", "Member Name", "Membership No", "Phone No", "Status"]];

        const body = filteredMembers.map((m, idx) => {
            const fieldValue = getValueByPath(m, selectedField);
            const isFieldMissing = isMissing(fieldValue);

            return [
                idx + 1,
                getValueByPath(m, "personalDetails.nameOfMember") || "—",
                getValueByPath(m, "personalDetails.membershipNumber") || "—",
                getValueByPath(m, "personalDetails.phoneNo") || "—",
                isFieldMissing ? "MISSING" : "AVAILABLE"
            ];
        });

        autoTable(doc, {
            startY: 40,
            head,
            body,
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [25, 118, 210], textColor: 255, fontSize: 10 },
        });

        doc.save(`${viewType}_${ALL_FIELDS[selectedField]}_Report_${Date.now()}.pdf`);
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
                    No members found.
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
                Field Status Overview
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Total Members: {members.length} | Select a field and view type to check status
            </Typography>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                memberName={memberToDelete ? getValueByPath(memberToDelete, "personalDetails.nameOfMember") : ""}
            />

            <Formik initialValues={{
                search: "",
                selectedField: "documents.aadhaarNo",
                viewType: "all", // all, missing, available
                civilScoreFilter: "all" // Civil score specific filter
            }} onSubmit={() => { }}>
                {({ values, setFieldValue }) => {
                    const filteredMembers = useMemo(() => {
                        if (!members) return [];

                        let result = [...members];

                        // Filter by search
                        const searchTerm = values.search.trim().toLowerCase();
                        if (searchTerm) {
                            result = result.filter(m => {
                                const name = (getValueByPath(m, "personalDetails.nameOfMember") || "").toLowerCase();
                                const memNo = (getValueByPath(m, "personalDetails.membershipNumber") || "").toLowerCase();
                                const phone = (getValueByPath(m, "personalDetails.phoneNo") || "").toLowerCase();
                                return name.includes(searchTerm) || memNo.includes(searchTerm) || phone.includes(searchTerm);
                            });
                        }

                        // Filter by field status
                        if (values.viewType !== "all") {
                            result = result.filter(m => {
                                const fieldValue = getValueByPath(m, values.selectedField);
                                const isFieldMissing = isMissing(fieldValue);
                                return values.viewType === "missing" ? isFieldMissing : !isFieldMissing;
                            });
                        }

                        // Filter by civil score (if civil score field is selected)
                        if (values.selectedField === "bankDetails.civilScore" && values.civilScoreFilter !== "all") {
                            result = result.filter(m => {
                                const civilScore = getValueByPath(m, "bankDetails.civilScore");
                                const civilScoreStatus = getCivilScoreStatus(civilScore);
                                return civilScoreStatus === values.civilScoreFilter;
                            });
                        }

                        return result;
                    }, [values.search, values.selectedField, values.viewType, values.civilScoreFilter, members]);

                    const allMembersCount = useMemo(() => {
                        return members.filter(m => {
                            const searchTerm = values.search.trim().toLowerCase();
                            if (searchTerm) {
                                const name = (getValueByPath(m, "personalDetails.nameOfMember") || "").toLowerCase();
                                const memNo = (getValueByPath(m, "personalDetails.membershipNumber") || "").toLowerCase();
                                const phone = (getValueByPath(m, "personalDetails.phoneNo") || "").toLowerCase();
                                return name.includes(searchTerm) || memNo.includes(searchTerm) || phone.includes(searchTerm);
                            }
                            return true;
                        }).length;
                    }, [values.search, members]);

                    const missingCount = useMemo(() => {
                        return members.filter(m => {
                            const fieldValue = getValueByPath(m, values.selectedField);
                            const isFieldMissing = isMissing(fieldValue);

                            const searchTerm = values.search.trim().toLowerCase();
                            if (searchTerm) {
                                const name = (getValueByPath(m, "personalDetails.nameOfMember") || "").toLowerCase();
                                const memNo = (getValueByPath(m, "personalDetails.membershipNumber") || "").toLowerCase();
                                const phone = (getValueByPath(m, "personalDetails.phoneNo") || "").toLowerCase();
                                if (!name.includes(searchTerm) && !memNo.includes(searchTerm) && !phone.includes(searchTerm)) {
                                    return false;
                                }
                            }

                            return isFieldMissing;
                        }).length;
                    }, [values.selectedField, values.search, members]);

                    const availableCount = allMembersCount - missingCount;

                    // Civil Score Statistics
                    const civilScoreStats = useMemo(() => {
                        const stats = {
                            missing: 0,
                            excellent: 0,
                            good: 0,
                            poor: 0,
                            invalid: 0
                        };

                        members.forEach(m => {
                            const civilScore = getValueByPath(m, "bankDetails.civilScore");
                            const status = getCivilScoreStatus(civilScore);
                            stats[status]++;
                        });

                        return stats;
                    }, [members]);

                    return (
                        <Form>
                            <Stack spacing={2} sx={{ mb: 3 }}>
                                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                                    <TextField
                                        size="small"
                                        placeholder="Search by name, membership no, or phone"
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

                                    <FormControl size="small" sx={{ minWidth: 180 }}>
                                        <InputLabel>View Type</InputLabel>
                                        <Select
                                            value={values.viewType}
                                            label="View Type"
                                            onChange={(e) => setFieldValue("viewType", e.target.value)}
                                        >
                                            <MenuItem value="all">All Members</MenuItem>
                                            <MenuItem value="missing">Missing Only</MenuItem>
                                            <MenuItem value="available">Available Only</MenuItem>
                                        </Select>
                                    </FormControl>

                                    {/* Civil Score Filter - Only show when civil score field is selected */}
                                    {values.selectedField === "bankDetails.civilScore" && (
                                        <FormControl size="small" sx={{ minWidth: 200 }}>
                                            <InputLabel>Civil Score</InputLabel>
                                            <Select
                                                value={values.civilScoreFilter}
                                                label="Civil Score"
                                                onChange={(e) => setFieldValue("civilScoreFilter", e.target.value)}
                                            >
                                                {Object.entries(CIVIL_SCORE_FILTERS).map(([key, label]) => (
                                                    <MenuItem key={key} value={key}>
                                                        {label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}

                                    <Button
                                        variant="contained"
                                        startIcon={<PictureAsPdfIcon />}
                                        onClick={() => generatePDF(filteredMembers, values.selectedField, values.viewType)}
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

                                {/* Field Selection Tabs */}
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="field categories">
                                        {Object.keys(FIELD_GROUPS).map((groupKey, index) => (
                                            <Tab
                                                key={groupKey}
                                                label={FIELD_GROUPS[groupKey].label}
                                                id={`field-tab-${index}`}
                                            />
                                        ))}
                                    </Tabs>
                                </Box>

                                {/* Field Buttons Grid */}
                                {Object.keys(FIELD_GROUPS).map((groupKey, index) => (
                                    <TabPanel key={groupKey} value={tabValue} index={index}>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {FIELD_GROUPS[groupKey].fields.map(fieldKey => (
                                                <Chip
                                                    key={fieldKey}
                                                    label={ALL_FIELDS[fieldKey]}
                                                    onClick={() => {
                                                        setFieldValue("selectedField", fieldKey);
                                                        // Reset civil score filter when switching away from civil score field
                                                        if (fieldKey !== "bankDetails.civilScore") {
                                                            setFieldValue("civilScoreFilter", "all");
                                                        }
                                                    }}
                                                    color={values.selectedField === fieldKey ? "primary" : "default"}
                                                    variant={values.selectedField === fieldKey ? "filled" : "outlined"}
                                                    clickable
                                                />
                                            ))}
                                        </Box>
                                    </TabPanel>
                                ))}

                                {/* Summary Chips */}
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <Chip
                                        label={`Total: ${allMembersCount}`}
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={`Missing: ${missingCount}`}
                                        color="error"
                                        variant={values.viewType === "missing" ? "filled" : "outlined"}
                                        clickable
                                        onClick={() => setFieldValue("viewType", "missing")}
                                    />
                                    <Chip
                                        label={`Available: ${availableCount}`}
                                        color="success"
                                        variant={values.viewType === "available" ? "filled" : "outlined"}
                                        clickable
                                        onClick={() => setFieldValue("viewType", "available")}
                                    />
                                    <Chip
                                        label={`All: ${allMembersCount}`}
                                        color="default"
                                        variant={values.viewType === "all" ? "filled" : "outlined"}
                                        clickable
                                        onClick={() => setFieldValue("viewType", "all")}
                                    />

                                    {/* Civil Score Stats Chips - Only show when civil score field is selected */}
                                    {values.selectedField === "bankDetails.civilScore" && (
                                        <>
                                            <Chip
                                                label={`Excellent: ${civilScoreStats.excellent}`}
                                                color="success"
                                                variant={values.civilScoreFilter === "excellent" ? "filled" : "outlined"}
                                                clickable
                                                onClick={() => setFieldValue("civilScoreFilter", "excellent")}
                                            />
                                            <Chip
                                                label={`Good: ${civilScoreStats.good}`}
                                                color="warning"
                                                variant={values.civilScoreFilter === "good" ? "filled" : "outlined"}
                                                clickable
                                                onClick={() => setFieldValue("civilScoreFilter", "good")}
                                            />
                                            <Chip
                                                label={`Poor: ${civilScoreStats.poor}`}
                                                color="error"
                                                variant={values.civilScoreFilter === "poor" ? "filled" : "outlined"}
                                                clickable
                                                onClick={() => setFieldValue("civilScoreFilter", "poor")}
                                            />
                                            <Chip
                                                label={`Missing: ${civilScoreStats.missing}`}
                                                color="default"
                                                variant={values.civilScoreFilter === "missing" ? "filled" : "outlined"}
                                                clickable
                                                onClick={() => setFieldValue("civilScoreFilter", "missing")}
                                            />
                                        </>
                                    )}

                                    <Typography variant="body2" color="text.secondary">
                                        Selected: <strong>{ALL_FIELDS[values.selectedField]}</strong>
                                        {values.selectedField === "bankDetails.civilScore" && values.civilScoreFilter !== "all" && (
                                            <span> | Filter: <strong>{CIVIL_SCORE_FILTERS[values.civilScoreFilter]}</strong></span>
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>

                            {filteredMembers.length === 0 ? (
                                <Alert severity="info">
                                    No members match the current filters.
                                </Alert>
                            ) : (
                                <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: "bold", bgcolor: 'primary.main', color: 'white' }}>S. No</TableCell>
                                                <TableCell sx={{ fontWeight: "bold", bgcolor: 'primary.main', color: 'white' }}>Member Name</TableCell>
                                                <TableCell sx={{ fontWeight: "bold", bgcolor: 'primary.main', color: 'white' }}>Membership No</TableCell>
                                                <TableCell sx={{ fontWeight: "bold", bgcolor: 'primary.main', color: 'white' }}>Phone No</TableCell>
                                                <TableCell sx={{ fontWeight: "bold", bgcolor: 'primary.main', color: 'white' }}>
                                                    {ALL_FIELDS[values.selectedField]} Status
                                                </TableCell>
                                                {values.selectedField === "bankDetails.civilScore" && (
                                                    <TableCell sx={{ fontWeight: "bold", bgcolor: 'primary.main', color: 'white' }}>
                                                        Civil Score Value
                                                    </TableCell>
                                                )}
                                                <TableCell sx={{ fontWeight: "bold", bgcolor: 'primary.main', color: 'white' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {filteredMembers.map((m, idx) => {
                                                const fieldValue = getValueByPath(m, values.selectedField);
                                                const isFieldMissing = isMissing(fieldValue);
                                                const civilScore = getValueByPath(m, "bankDetails.civilScore");
                                                const civilScoreStatus = getCivilScoreStatus(civilScore);

                                                return (
                                                    <TableRow
                                                        key={m._id || idx}
                                                        sx={{
                                                            "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                                                            "&:hover": { backgroundColor: "#f0f0f0", cursor: "pointer" },
                                                            backgroundColor: isFieldMissing ? "#ffebee" : "inherit"
                                                        }}
                                                        onClick={() => handleViewDetails(m)}
                                                    >
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>
                                                            {getValueByPath(m, "personalDetails.nameOfMember") || "—"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {getValueByPath(m, "personalDetails.membershipNumber") || "—"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {getValueByPath(m, "personalDetails.phoneNo") || "—"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {values.selectedField === "bankDetails.civilScore" ? (
                                                                <Chip
                                                                    label={
                                                                        civilScoreStatus === "missing" ? "MISSING" :
                                                                            civilScoreStatus === "excellent" ? "EXCELLENT" :
                                                                                civilScoreStatus === "good" ? "GOOD" :
                                                                                    civilScoreStatus === "poor" ? "POOR" : "INVALID"
                                                                    }
                                                                    color={
                                                                        civilScoreStatus === "missing" ? "default" :
                                                                            civilScoreStatus === "excellent" ? "success" :
                                                                                civilScoreStatus === "good" ? "warning" :
                                                                                    civilScoreStatus === "poor" ? "error" : "error"
                                                                    }
                                                                    size="small"
                                                                />
                                                            ) : (
                                                                <Chip
                                                                    label={isFieldMissing ? "MISSING" : "AVAILABLE"}
                                                                    color={isFieldMissing ? "error" : "success"}
                                                                    size="small"
                                                                />
                                                            )}
                                                        </TableCell>

                                                        {/* Civil Score Value Column */}
                                                        {values.selectedField === "bankDetails.civilScore" && (
                                                            <TableCell>
                                                                {civilScore ? (
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            fontWeight: 'bold',
                                                                            color:
                                                                                civilScoreStatus === "excellent" ? '#2e7d32' :
                                                                                    civilScoreStatus === "good" ? '#ed6c02' :
                                                                                        civilScoreStatus === "poor" ? '#d32f2f' : '#757575'
                                                                        }}
                                                                    >
                                                                        {civilScore}
                                                                    </Typography>
                                                                ) : (
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        —
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                        )}

                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleViewDetails(m);
                                                                    }}
                                                                    title="View Details"
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