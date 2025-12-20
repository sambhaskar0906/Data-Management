import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Box, TextField, InputAdornment, Button,
    MenuItem, Select, FormControl, InputLabel, Stack, Dialog,
    DialogTitle, DialogContent, DialogActions, IconButton,
    CircularProgress, Alert, Chip, Tabs, Tab, Checkbox, FormControlLabel, Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Formik, Form } from "formik";
import { useNavigate } from "react-router-dom";
import { fetchAllMembers, deleteMember } from "../../features/member/memberSlice";
import ExportButtons from "../MamberReport/ExportButtons";


// Utility Functions
const getValueByPath = (obj, path) => {
    if (!path) return undefined;

    if (path === "addressDetails.currentResidentalAddress") {
        const address = path.split(".").reduce((cur, p) => cur?.[p], obj);
        if (!address) return undefined;
        return formatAddress(address);
    } else if (path === "addressDetails.permanentAddress") {
        const address = path.split(".").reduce((cur, p) => cur?.[p], obj);
        if (!address) return undefined;
        return formatAddress(address);
    } else if (path === "addressDetails.previousCurrentAddress") {
        const prevAddresses = path.split(".").reduce((cur, p) => cur?.[p], obj);
        if (!prevAddresses || !Array.isArray(prevAddresses) || prevAddresses.length === 0) {
            return undefined;
        }
        // Return the most recent previous address or all formatted
        return prevAddresses.map(addr => formatAddress(addr)).join("; ");
    }

    return path.split(".").reduce((cur, p) => cur?.[p], obj);
};

const formatAddress = (address) => {
    if (!address) return "";

    // Handle both object and string addresses
    if (typeof address === 'string') return address;

    if (typeof address === 'object') {
        const parts = [
            address.flatHouseNo,
            address.areaStreetSector,
            address.locality,
            address.landmark,
            address.city,
            address.state,
            address.country,
            address.pincode
        ].filter(Boolean);

        return parts.join(", ");
    }

    return "";
};

const isMissing = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") {
        // For address objects, check if all fields are empty
        if (value.flatHouseNo || value.areaStreetSector || value.locality ||
            value.landmark || value.city || value.state || value.country || value.pincode) {
            return false;
        }
        return true;
    }
    return false;
};

const getCivilScoreStatus = (civilScore) => {
    if (!civilScore) return "missing";
    const score = Number(civilScore);
    if (isNaN(score)) return "invalid";
    if (score >= 750) return "excellent";
    if (score >= 600) return "good";
    return "poor";
};

const getNameWithTitle = (member) => {
    const title = getValueByPath(member, "personalDetails.title") || "";
    const name = getValueByPath(member, "personalDetails.nameOfMember") || "";
    return title && name ? `${title} ${name}` : name || "—";
};

// Age extraction function
const extractAge = (ageString) => {
    if (!ageString) return 0;
    const match = ageString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
};

// ✅ Date range helper
const isDateInRange = (dateStr, from, to) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (from && date < new Date(from)) return false;
    if (to && date > new Date(to)) return false;
    return true;
};


// Field Definitions based on your model
const ALL_FIELDS = {
    // Personal Details
    "personalDetails.title": "Title",
    "personalDetails.nameOfMember": "Member Name",
    "personalDetails.membershipNumber": "Membership No",
    "personalDetails.minor": "Minor",
    "personalDetails.guardianName": "Guardian Name",
    "personalDetails.guardianRelation": "Guardian Relation",
    "personalDetails.fatherTitle": "Father Title",
    "personalDetails.nameOfFather": "Father's Name",
    "personalDetails.motherTitle": "Mother Title",
    "personalDetails.nameOfMother": "Mother's Name",
    "personalDetails.nameOfSpouse": "Spouse Name",
    "personalDetails.dateOfBirth": "Date of Birth",
    "personalDetails.ageInYears": "Age",
    "personalDetails.membershipDate": "Membership Date",
    "personalDetails.amountInCredit": "Amount In Credit",
    "personalDetails.civilScore": "Civil Score",
    "personalDetails.gender": "Gender",
    "personalDetails.maritalStatus": "Marital Status",
    "personalDetails.religion": "Religion",
    "personalDetails.caste": "Category",
    "personalDetails.phoneNo1": "Phone No 1",
    "personalDetails.phoneNo2": "Phone No 2",
    "personalDetails.whatsappNumber": "WhatsApp Number",
    "personalDetails.alternatePhoneNo": "Alternate Phone",
    "personalDetails.emailId1": "Email 1",
    "personalDetails.emailId2": "Email 2",
    "personalDetails.emailId3": "Email 3",
    "personalDetails.landlineNo": "Landline",
    "personalDetails.landlineOffice": "Office Landline",

    // Address Details
    "addressDetails.residenceType": "Residence Type",
    "addressDetails.currentResidentalAddress": "Current Address",
    "addressDetails.permanentAddress": "Permanent Address",
    "addressDetails.previousCurrentAddress": "Previous Addresses",

    // Documents
    "documents.passportSize": "Passport Photo",
    "documents.panNo": "PAN Card",
    "documents.rationCard": "Ration Card",
    "documents.drivingLicense": "Driving License",
    "documents.aadhaarNo": "Aadhaar Card",
    "documents.voterId": "Voter ID",
    "documents.passportNo": "Passport",
    "documents.panNoPhoto": "PAN Photo",
    "documents.rationCardPhoto": "Ration Card Photo",
    "documents.drivingLicensePhoto": "DL Photo",
    "documents.aadhaarNoPhoto": "Aadhaar Photo",
    "documents.voterIdPhoto": "Voter ID Photo",
    "documents.passportNoPhoto": "Passport Photo",
    "documents.signedPhoto": "Signed Photo",

    // Professional Details
    "professionalDetails.qualification": "Qualification",
    "professionalDetails.qualificationRemark": "Qualification Remark",
    "professionalDetails.occupation": "Occupation",
    "professionalDetails.degreeNumber": "Degree Number",
    "professionalDetails.serviceType": "Service Type",
    "professionalDetails.serviceDetails.fullNameOfCompany": "Company Name",
    "professionalDetails.serviceDetails.addressOfCompany": "Company Address",
    "professionalDetails.serviceDetails.department": "Department",
    "professionalDetails.serviceDetails.monthlyIncome": "Monthly Income",
    "professionalDetails.serviceDetails.designation": "Designation",
    "professionalDetails.serviceDetails.dateOfJoining": "Date of Joining",
    "professionalDetails.serviceDetails.employeeCode": "Employee Code",
    "professionalDetails.serviceDetails.dateOfRetirement": "Date of Retirement",
    "professionalDetails.serviceDetails.officeNo": "Office Number",

    // Family Details
    "familyDetails.familyMembersMemberOfSociety": "Family in Society",
    "familyDetails.familyMember": "Family Members",
    "familyDetails.familyMemberNo": "Family Phone Numbers",

    // Bank Details
    "bankDetails.bankName": "Bank Name",
    "bankDetails.branch": "Bank Branch",
    "bankDetails.accountNumber": "Account Number",
    "bankDetails.ifscCode": "IFSC Code",

    // Guarantee Details
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOtherSociety": "Guarantee Other Society",
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOurSociety": "Guarantee Our Society",

    // Loan Details
    "loanDetails": "Loan Details",

    // Nominee Details
    "nomineeDetails.nomineeName": "Nominee Name",
    "nomineeDetails.relationWithApplicant": "Nominee Relation",
    "nomineeDetails.introduceBy": "Introduced By",
    "nomineeDetails.memberShipNo": "Introducer Membership No",
};

const FIELD_GROUPS = Object.entries({
    personal: "Personal Details",
    address: "Address Details",
    documents: "Documents",
    professional: "Professional",
    family: "Family",
    bank: "Bank",
    reference: "Reference",
    guarantee: "Guarantee",
    loan: "Loan",
    nominee: "Nominee"
}).reduce((acc, [key, label]) => {
    let fields = [];

    if (key === "address") {
        // Address-specific grouping
        fields = [
            "addressDetails.residenceType",
            "addressDetails.currentResidentalAddress",
            "addressDetails.permanentAddress",
            "addressDetails.previousCurrentAddress"
        ];
    } else if (key === "personal") {
        // Personal details fields (filter out address-related ones)
        fields = Object.keys(ALL_FIELDS).filter(f =>
            f.startsWith("personalDetails") &&
            !f.includes("address") // Exclude any personal address fields if they exist
        );
    } else {
        // Other groups remain as before
        fields = Object.keys(ALL_FIELDS).filter(f => f.startsWith(
            key === "personal" ? "personalDetails" :
                key === "documents" ? "documents" :
                    key === "professional" ? "professionalDetails" :
                        key === "family" ? "familyDetails" :
                            key === "bank" ? "bankDetails" :
                                key === "reference" ? "referenceDetails" :
                                    key === "guarantee" ? "guaranteeDetails" :
                                        key === "nominee" ? "nomineeDetails" : key
        ));
    }

    return {
        ...acc,
        [key]: { label, fields }
    };
}, {});


const CIVIL_SCORE_FILTERS = {
    "all": "All Civil Scores",
    "missing": "Missing Civil Score",
    "excellent": "Excellent (750-900)",
    "good": "Good (600-749)",
    "poor": "Poor (300-599)",
    "invalid": "Invalid Score"
};

// Delete Confirmation Dialog
const DeleteConfirmationDialog = ({ open, onClose, onConfirm, memberName }) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
            <Typography>Are you sure you want to delete member <strong>"{memberName}"</strong>?</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} variant="contained" color="error">Delete</Button>
        </DialogActions>
    </Dialog>
);

function TabPanel({ children, value, index }) {
    return <div hidden={value !== index}>{value === index && <Box sx={{ py: 2 }}>{children}</Box>}</div>;
}

// Advanced Filters Component
const AdvancedFilters = ({ values, setFieldValue, filters }) => (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mb: 2, bgcolor: '#f9f9f9' }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Advanced Filters
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Occupation Filter */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Occupation</InputLabel>
                <Select value={values.occupationFilter} label="Occupation"
                    onChange={(e) => setFieldValue("occupationFilter", e.target.value)}>
                    {filters.occupationOptions.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt === "all" ? "All Occupations" : opt}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Qualification Filter - CA, ADV, DR, etc. */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Qualification</InputLabel>
                <Select value={values.qualificationFilter} label="Qualification"
                    onChange={(e) => setFieldValue("qualificationFilter", e.target.value)}>
                    {filters.qualificationOptions.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt === "all" ? "All Qualifications" : opt}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Religion Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Religion</InputLabel>
                <Select value={values.religionFilter} label="Religion"
                    onChange={(e) => setFieldValue("religionFilter", e.target.value)}>
                    {filters.religionOptions.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt === "all" ? "All Religions" : opt}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Gender Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Gender</InputLabel>
                <Select value={values.genderFilter} label="Gender"
                    onChange={(e) => setFieldValue("genderFilter", e.target.value)}>
                    <MenuItem value="all">All Genders</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Transgender">Transgender</MenuItem>
                </Select>
            </FormControl>

            {/* Marital Status Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Marital Status</InputLabel>
                <Select value={values.maritalFilter} label="Marital Status"
                    onChange={(e) => setFieldValue("maritalFilter", e.target.value)}>
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Married">Married</MenuItem>
                    <MenuItem value="Divorced">Divorced</MenuItem>
                    <MenuItem value="Widowed">Widowed</MenuItem>
                </Select>
            </FormControl>

            {/* Age Range Filter - Fixed */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                    size="small"
                    label="Min Age"
                    type="number"
                    value={values.minAge}
                    onChange={(e) => {
                        const val = e.target.value;
                        setFieldValue("minAge", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                    }}
                    inputProps={{ min: 0, max: 150 }}
                    sx={{ width: 100 }}
                />
                <Typography>to</Typography>
                <TextField
                    size="small"
                    label="Max Age"
                    type="number"
                    value={values.maxAge}
                    onChange={(e) => {
                        const val = e.target.value;
                        setFieldValue("maxAge", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                    }}
                    inputProps={{ min: 0, max: 150 }}
                    sx={{ width: 100 }}
                />
            </Box>

            <TextField
                size="small"
                label="Joining Date From"
                type="date"
                value={values.joiningFrom}
                onChange={(e) => setFieldValue("joiningFrom", e.target.value)}
                InputLabelProps={{ shrink: true }}
            />

            <TextField
                size="small"
                label="Joining Date To"
                type="date"
                value={values.joiningTo}
                onChange={(e) => setFieldValue("joiningTo", e.target.value)}
                InputLabelProps={{ shrink: true }}
            />

            <TextField
                size="small"
                label="Retirement Date From"
                type="date"
                value={values.retirementFrom}
                onChange={(e) => setFieldValue("retirementFrom", e.target.value)}
                InputLabelProps={{ shrink: true }}
            />

            <TextField
                size="small"
                label="Retirement Date To"
                type="date"
                value={values.retirementTo}
                onChange={(e) => setFieldValue("retirementTo", e.target.value)}
                InputLabelProps={{ shrink: true }}
            />


            {/* Caste Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select value={values.casteFilter} label="Category"
                    onChange={(e) => setFieldValue("casteFilter", e.target.value)}>
                    {filters.casteOptions.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt === "all" ? "All Category" : opt}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Reset Filters Button */}
            <Button variant="outlined" size="small" onClick={() => {
                setFieldValue("occupationFilter", "all");
                setFieldValue("qualificationFilter", "all");
                setFieldValue("religionFilter", "all");
                setFieldValue("categoryFilter", "all");
                setFieldValue("genderFilter", "all");
                setFieldValue("maritalFilter", "all");
                setFieldValue("casteFilter", "all");
                setFieldValue("minAge", "");
                setFieldValue("maxAge", "");
                setFieldValue("joiningFrom", "");
                setFieldValue("joiningTo", "");
                setFieldValue("retirementFrom", "");
                setFieldValue("retirementTo", "");
                setFieldValue("viewType", "all");
                setFieldValue("civilScoreFilter", "all");
            }}>
                Reset Filters
            </Button>
        </Box>

        {/* Active Filters Summary */}
        {(values.occupationFilter !== "all" || values.qualificationFilter !== "all" ||
            values.religionFilter !== "all" || values.categoryFilter !== "all" ||
            values.genderFilter !== "all" || values.maritalFilter !== "all" ||
            values.casteFilter !== "all" || values.minAge !== "" ||
            values.maxAge !== "" || values.viewType !== "all" ||
            (values.selectedField === "personalDetails.civilScore" && values.civilScoreFilter !== "all")) && (
                <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        Active Filters:
                        {values.occupationFilter !== "all" && <span style={{ marginLeft: 8 }}><strong>Occupation:</strong> {values.occupationFilter}</span>}
                        {values.qualificationFilter !== "all" && <span style={{ marginLeft: 8 }}><strong>Qualification:</strong> {values.qualificationFilter}</span>}
                        {values.religionFilter !== "all" && <span style={{ marginLeft: 8 }}><strong>Religion:</strong> {values.religionFilter}</span>}
                        {values.categoryFilter !== "all" && <span style={{ marginLeft: 8 }}><strong>Category:</strong> {FIELD_GROUPS[values.categoryFilter]?.label}</span>}
                        {values.genderFilter !== "all" && <span style={{ marginLeft: 8 }}><strong>Gender:</strong> {values.genderFilter}</span>}
                        {values.maritalFilter !== "all" && <span style={{ marginLeft: 8 }}><strong>Marital Status:</strong> {values.maritalFilter}</span>}
                        {values.casteFilter !== "all" && <span style={{ marginLeft: 8 }}><strong>Category:</strong> {values.casteFilter}</span>}
                        {values.minAge && <span style={{ marginLeft: 8 }}><strong>Min Age:</strong> {values.minAge}</span>}
                        {values.maxAge && <span style={{ marginLeft: 8 }}><strong>Max Age:</strong> {values.maxAge}</span>}
                        {values.joiningFrom && <span><strong>Joining From:</strong> {values.joiningFrom}</span>}
                        {values.joiningTo && <span><strong>Joining To:</strong> {values.joiningTo}</span>}
                        {values.retirementFrom && <span><strong>Retirement From:</strong> {values.retirementFrom}</span>}
                        {values.retirementTo && <span><strong>Retirement To:</strong> {values.retirementTo}</span>}
                        {values.viewType !== "all" && <span style={{ marginLeft: 8 }}><strong>View Type:</strong> {values.viewType}</span>}
                        {values.selectedField === "personalDetails.civilScore" && values.civilScoreFilter !== "all" &&
                            <span style={{ marginLeft: 8 }}><strong>Civil Score:</strong> {CIVIL_SCORE_FILTERS[values.civilScoreFilter]}</span>}
                    </Typography>
                </Box>
            )}
    </Box>
);

const getActiveFilterColumns = (values) => {
    const cols = [];

    if (values.occupationFilter !== "all") cols.push("professionalDetails.occupation");
    if (values.qualificationFilter !== "all") cols.push("professionalDetails.qualification");
    if (values.religionFilter !== "all") cols.push("personalDetails.religion");
    if (values.genderFilter !== "all") cols.push("personalDetails.gender");
    if (values.maritalFilter !== "all") cols.push("personalDetails.maritalStatus");
    if (values.casteFilter !== "all") cols.push("personalDetails.caste");

    // Age adds Age column
    if (values.minAge !== "" || values.maxAge !== "") cols.push("personalDetails.ageInYears");

    // 🔥 JOINING DATE
    if (values.joiningFrom || values.joiningTo)
        cols.push("professionalDetails.serviceDetails.dateOfJoining");

    // 🔥 RETIREMENT DATE
    if (values.retirementFrom || values.retirementTo)
        cols.push("professionalDetails.serviceDetails.dateOfRetirement");

    // Category → All fields under that category
    if (values.categoryFilter !== "all") {
        FIELD_GROUPS[values.categoryFilter].fields.forEach(f => cols.push(f));
    }

    return cols;
};

// Main Component
const MissingMembersTable = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { members, loading, error, operationLoading } = useSelector((state) => state.members);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showFieldGroups, setShowFieldGroups] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedColumns, setSelectedColumns] = useState([]);


    useEffect(() => { dispatch(fetchAllMembers()); }, [dispatch]);

    const generatePDF = (filteredMembers, selectedField, viewType) => {
        const doc = new jsPDF();
        doc.text("Field Status Report", 14, 16);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);
        doc.text(`Field: ${ALL_FIELDS[selectedField]} | View: ${viewType} | Total: ${filteredMembers.length}`, 14, 32);

        autoTable(doc, {
            startY: 40,
            head: [["S. No", "Member Name", "Membership No", "Phone", "Email", "City", "Status"]],
            body: filteredMembers.map((m, idx) => [
                idx + 1,
                getNameWithTitle(m),
                getValueByPath(m, "personalDetails.membershipNumber") || "—",
                getValueByPath(m, "personalDetails.phoneNo1") || "—",
                getValueByPath(m, "personalDetails.emailId1") || "—",
                getValueByPath(m, "addressDetails.permanentAddress.city") ||
                getValueByPath(m, "addressDetails.currentResidentalAddress.city") || "—",
                isMissing(getValueByPath(m, selectedField)) ? "MISSING" : "AVAILABLE"
            ]),
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [25, 118, 210], textColor: 255, fontSize: 10 },
        });

        doc.save(`${viewType}_${ALL_FIELDS[selectedField]}_Report_${Date.now()}.pdf`);
    };

    if (loading) return (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress /><Typography sx={{ ml: 2 }}>Loading members...</Typography>
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>Error loading members: {error.message || error.toString()}</Alert>
            <Button variant="contained" onClick={() => dispatch(fetchAllMembers())}>Retry</Button>
        </Box>
    );

    if (!members?.length) return (
        <Box sx={{ p: 3 }}>
            <Alert severity="info">No members found.</Alert>
            <Button variant="contained" onClick={() => dispatch(fetchAllMembers())} sx={{ mt: 2 }}>Refresh Data</Button>
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Box
                sx={{
                    mb: 3,
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    borderLeft: "5px solid #1A237E",
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#1A237E" }}>
                    Member Field Status Overview
                </Typography>

                <Typography variant="body2" sx={{ color: "#555", mt: 0.3 }}>
                    Analyse Missing / Available fields across all members
                </Typography>
            </Box>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => { setDeleteDialogOpen(false); setMemberToDelete(null); }}
                onConfirm={() => {
                    if (memberToDelete) {
                        dispatch(deleteMember(memberToDelete._id)).then(() => {
                            setDeleteDialogOpen(false);
                            setMemberToDelete(null);
                            dispatch(fetchAllMembers());
                        });
                    }
                }}
                memberName={memberToDelete ? getNameWithTitle(memberToDelete) : ""}
            />

            <Formik initialValues={{
                search: "",
                selectedField: "",
                viewType: "all",
                civilScoreFilter: "all",
                occupationFilter: "all",
                qualificationFilter: "all",
                religionFilter: "all",
                categoryFilter: "all",
                genderFilter: "all",
                maritalFilter: "all",
                casteFilter: "all",
                minAge: "",
                maxAge: "",
                joiningFrom: "",
                joiningTo: "",
                retirementFrom: "",
                retirementTo: ""
            }} onSubmit={() => { }}>
                {({ values, setFieldValue }) => {
                    // Derived filter options
                    const filters = useMemo(() => ({
                        occupationOptions: ["all", ...new Set(members.map(m =>
                            (getValueByPath(m, "professionalDetails.occupation") || "").toString().trim()).filter(Boolean))],
                        qualificationOptions: ["all", ...new Set(members.map(m =>
                            (getValueByPath(m, "professionalDetails.qualification") || "").toString().trim()).filter(Boolean))],
                        religionOptions: ["all", ...new Set(members.map(m =>
                            (getValueByPath(m, "personalDetails.religion") || "").toString().trim()).filter(Boolean))],
                        casteOptions: ["all", ...new Set(members.map(m =>
                            (getValueByPath(m, "personalDetails.caste") || "").toString().trim()).filter(Boolean))],
                        categoryOptions: ["all", ...Object.keys(FIELD_GROUPS)]
                    }), [members]);

                    const filteredMembers = useMemo(() => {
                        let result = [...members];

                        const searchTerm = values.search.trim().toLowerCase();

                        // 🔍 UNIVERSAL SEARCH FILTER
                        if (searchTerm) {
                            result = result.filter(m => {
                                const searchable = [
                                    "personalDetails.nameOfMember",
                                    "personalDetails.title",
                                    "personalDetails.membershipNumber",
                                    "personalDetails.phoneNo1",
                                    "personalDetails.phoneNo2",
                                    "personalDetails.emailId1",
                                    "personalDetails.emailId2",
                                    "personalDetails.emailId3",
                                    "personalDetails.religion",
                                    "personalDetails.caste",
                                    "professionalDetails.occupation",
                                    "professionalDetails.qualification",
                                    "addressDetails.permanentAddress.city",
                                    "addressDetails.currentResidentalAddress.city",
                                ];


                                return searchable.some(path => {
                                    const v = getValueByPath(m, path);
                                    return v?.toString()?.toLowerCase()?.includes(searchTerm);
                                });
                            });
                        }

                        if (values.joiningFrom || values.joiningTo) {
                            result = result.filter(m => {
                                const joiningDate = getValueByPath(
                                    m,
                                    "professionalDetails.serviceDetails.dateOfJoining"
                                );
                                return isDateInRange(
                                    joiningDate,
                                    values.joiningFrom,
                                    values.joiningTo
                                );
                            });
                        }

                        if (values.retirementFrom || values.retirementTo) {
                            result = result.filter(m => {
                                const retirementDate = getValueByPath(
                                    m,
                                    "professionalDetails.serviceDetails.dateOfRetirement"
                                );
                                return isDateInRange(
                                    retirementDate,
                                    values.retirementFrom,
                                    values.retirementTo
                                );
                            });
                        }

                        // 🔥 OCCUPATION FILTER
                        if (values.occupationFilter !== "all") {
                            result = result.filter(m =>
                                (getValueByPath(m, "professionalDetails.occupation") || "")
                                    .toLowerCase() === values.occupationFilter.toLowerCase()
                            );
                        }

                        // 🔥 QUALIFICATION FILTER
                        if (values.qualificationFilter !== "all") {
                            result = result.filter(m =>
                                (getValueByPath(m, "professionalDetails.qualification") || "")
                                    .toLowerCase() === values.qualificationFilter.toLowerCase()
                            );
                        }

                        // 🔥 RELIGION FILTER
                        if (values.religionFilter !== "all") {
                            result = result.filter(m =>
                                (getValueByPath(m, "personalDetails.religion") || "")
                                    .toLowerCase() === values.religionFilter.toLowerCase()
                            );
                        }

                        // 🔥 GENDER FILTER
                        if (values.genderFilter !== "all") {
                            result = result.filter(m =>
                                (getValueByPath(m, "personalDetails.gender") || "")
                                    .toLowerCase() === values.genderFilter.toLowerCase()
                            );
                        }

                        // 🔥 MARITAL FILTER
                        if (values.maritalFilter !== "all") {
                            result = result.filter(m =>
                                (getValueByPath(m, "personalDetails.maritalStatus") || "")
                                    .toLowerCase() === values.maritalFilter.toLowerCase()
                            );
                        }

                        // 🔥 CASTE FILTER
                        if (values.casteFilter !== "all") {
                            result = result.filter(m =>
                                (getValueByPath(m, "personalDetails.caste") || "")
                                    .toLowerCase() === values.casteFilter.toLowerCase()
                            );
                        }

                        // 🔥 AGE RANGE FIXED FILTER
                        if (values.minAge !== "" || values.maxAge !== "") {
                            const minAge = values.minAge === "" ? 0 : parseInt(values.minAge);
                            const maxAge = values.maxAge === "" ? 150 : parseInt(values.maxAge);

                            result = result.filter(m => {
                                const ageStr = getValueByPath(m, "personalDetails.ageInYears") || "";
                                const age = extractAge(ageStr);
                                return age >= minAge && age <= maxAge;
                            });
                        }

                        // 🔥 CATEGORY FILTER (FIELD GROUP)
                        if (values.categoryFilter !== "all") {
                            const keys = FIELD_GROUPS[values.categoryFilter]?.fields || [];
                            result = result.filter(m =>
                                keys.some(fieldKey => !isMissing(getValueByPath(m, fieldKey)))
                            );
                        }

                        // 🔥 MISSING / AVAILABLE FILTER
                        if (values.viewType !== "all") {
                            result = result.filter(m => {
                                const isFieldMissing = isMissing(getValueByPath(m, values.selectedField));
                                return values.viewType === "missing" ? isFieldMissing : !isFieldMissing;
                            });
                        }

                        // 🔥 CIVIL SCORE FILTER
                        if (
                            (values.selectedField === "personalDetails.civilScore" ||
                                values.selectedField === "bankDetails.civilScore") &&
                            values.civilScoreFilter !== "all"
                        ) {
                            result = result.filter(m => {
                                const civil = getValueByPath(m, values.selectedField);
                                return getCivilScoreStatus(civil) === values.civilScoreFilter;
                            });
                        }

                        return result;
                    }, [values, members]);


                    const paginatedMembers = useMemo(() => {
                        return filteredMembers.slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                        );
                    }, [filteredMembers, page, rowsPerPage]);


                    const stats = useMemo(() => {
                        const civilScoreStats = filteredMembers.reduce((acc, m) => {
                            const civilScore = getValueByPath(m, "personalDetails.civilScore") ||
                                getValueByPath(m, "bankDetails.civilScore");
                            acc[getCivilScoreStatus(civilScore)]++;
                            return acc;
                        }, { missing: 0, excellent: 0, good: 0, poor: 0, invalid: 0 });

                        return {
                            all: filteredMembers.length,
                            missing: filteredMembers.filter(m =>
                                isMissing(getValueByPath(m, values.selectedField))
                            ).length,
                            available: filteredMembers.filter(m =>
                                !isMissing(getValueByPath(m, values.selectedField))
                            ).length,
                            civilScore: civilScoreStats
                        };
                    }, [filteredMembers, values.selectedField]);


                    return (
                        <Form>
                            <Stack spacing={2} sx={{ mb: 3 }}>
                                {/* Main Search and Actions */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                        mb: 2,
                                        p: 2,
                                        bgcolor: "#FFFFFF",
                                        borderRadius: 2,
                                        boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                                        <TextField
                                            size="small"
                                            placeholder="Search members..."
                                            value={values.search}
                                            onChange={(e) => setFieldValue("search", e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon color="primary" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                width: { xs: "100%", md: 350 },
                                                bgcolor: "#fff",
                                            }}
                                        />

                                        <ExportButtons
                                            filteredMembers={filteredMembers}
                                            selectedColumns={selectedColumns}
                                            activeFilterColumns={getActiveFilterColumns(values)}
                                            ALL_FIELDS={ALL_FIELDS}
                                        />


                                        <Button variant="outlined" onClick={() => dispatch(fetchAllMembers())}>
                                            Refresh
                                        </Button>
                                    </Box>

                                    {/* 🔥 Both checkboxes perfectly aligned in one line */}
                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={showAdvancedFilters}
                                                    onChange={(e) => setShowAdvancedFilters(e.target.checked)}
                                                    sx={{
                                                        color: "#1A237E",
                                                        "&.Mui-checked": { color: "#1A237E" },
                                                    }}
                                                />
                                            }
                                            label="Show Advanced Filters"
                                        />

                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={showFieldGroups}
                                                    onChange={(e) => setShowFieldGroups(e.target.checked)}
                                                    sx={{
                                                        color: "#1A237E",
                                                        "&.Mui-checked": { color: "#1A237E" },
                                                    }}
                                                />
                                            }
                                            label="Show Field Groups"
                                        />
                                    </Box>
                                </Box>


                                {/* Advanced Filters */}
                                {showAdvancedFilters && (
                                    <AdvancedFilters values={values} setFieldValue={setFieldValue} filters={filters} />
                                )}

                                {showFieldGroups && (
                                    <>
                                        {/* Field Selection Tabs */}
                                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                                                {Object.entries(FIELD_GROUPS).map(([key, { label }]) => (
                                                    <Tab key={key} label={label} />
                                                ))}
                                            </Tabs>
                                        </Box>

                                        {/* Field Buttons */}
                                        {Object.entries(FIELD_GROUPS).map(([key, { fields }], idx) => (
                                            <TabPanel key={key} value={tabValue} index={idx}>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {fields.map((fieldKey) => {
                                                        // For address fields, show a special chip with info icon
                                                        const isAddressField = fieldKey.includes("currentResidentalAddress") ||
                                                            fieldKey.includes("permanentAddress") ||
                                                            fieldKey.includes("previousCurrentAddress");

                                                        return (
                                                            <Chip
                                                                key={fieldKey}
                                                                label={ALL_FIELDS[fieldKey]}
                                                                onClick={() => {
                                                                    setSelectedColumns((prev) =>
                                                                        prev.includes(fieldKey)
                                                                            ? prev.filter((col) => col !== fieldKey)
                                                                            : [...prev, fieldKey]
                                                                    );

                                                                    setFieldValue("selectedField", fieldKey);
                                                                    if (fieldKey !== "personalDetails.civilScore") {
                                                                        setFieldValue("civilScoreFilter", "all");
                                                                    }
                                                                }}
                                                                color={selectedColumns.includes(fieldKey) ? "primary" : "default"}
                                                                variant={selectedColumns.includes(fieldKey) ? "filled" : "outlined"}
                                                                clickable
                                                                sx={{
                                                                    ...(isAddressField && {
                                                                        backgroundColor: selectedColumns.includes(fieldKey)
                                                                    })
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </Box>
                                            </TabPanel>
                                        ))}
                                    </>
                                )}

                                {/* Summary Statistics */}
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <Chip label={`Total: ${stats.all}`} color="primary" variant="outlined" />
                                    <Chip label={`Missing: ${stats.missing}`} color="error" variant={values.viewType === "missing" ? "filled" : "outlined"}
                                        clickable onClick={() => setFieldValue("viewType", "missing")} />
                                    <Chip label={`Available: ${stats.available}`} color="success" variant={values.viewType === "available" ? "filled" : "outlined"}
                                        clickable onClick={() => setFieldValue("viewType", "available")} />

                                    {(values.selectedField === "personalDetails.civilScore" ||
                                        values.selectedField === "bankDetails.civilScore") && (
                                            <>
                                                <Chip label={`Excellent: ${stats.civilScore.excellent}`} color="success"
                                                    variant={values.civilScoreFilter === "excellent" ? "filled" : "outlined"}
                                                    clickable onClick={() => setFieldValue("civilScoreFilter", "excellent")} />
                                                <Chip label={`Good: ${stats.civilScore.good}`} color="warning"
                                                    variant={values.civilScoreFilter === "good" ? "filled" : "outlined"}
                                                    clickable onClick={() => setFieldValue("civilScoreFilter", "good")} />
                                                <Chip label={`Poor: ${stats.civilScore.poor}`} color="error"
                                                    variant={values.civilScoreFilter === "poor" ? "filled" : "outlined"}
                                                    clickable onClick={() => setFieldValue("civilScoreFilter", "poor")} />
                                                <Chip label={`Missing: ${stats.civilScore.missing}`} color="default"
                                                    variant={values.civilScoreFilter === "missing" ? "filled" : "outlined"}
                                                    clickable onClick={() => setFieldValue("civilScoreFilter", "missing")} />
                                            </>
                                        )}

                                    <Typography variant="body2" color="text.secondary">
                                        Selected: <strong>{ALL_FIELDS[values.selectedField]}</strong>
                                        {(values.selectedField === "personalDetails.civilScore" ||
                                            values.selectedField === "bankDetails.civilScore") &&
                                            values.civilScoreFilter !== "all" && (
                                                <span> | Filter: <strong>{CIVIL_SCORE_FILTERS[values.civilScoreFilter]}</strong></span>
                                            )}
                                    </Typography>
                                </Box>
                            </Stack>

                            {/* Results Table */}
                            {!filteredMembers.length ? (
                                <Alert severity="info">No members match the current filters.</Alert>
                            ) : (
                                <Paper
                                    sx={{
                                        borderRadius: 3,
                                        overflow: "hidden",
                                        boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: "#1A237E" }}>
                                                    {["S.No", "Member No", "Member Name", "Father Name", "Mobile No", "Email", "Introduced By"]
                                                        .map((header, idx) => (
                                                            <TableCell
                                                                key={idx}
                                                                sx={{ fontWeight: "bold", color: "white", py: 1.5, fontSize: "0.9rem" }}
                                                            >
                                                                {header}
                                                            </TableCell>
                                                        ))}

                                                    {/* 🔥 DYNAMIC FILTER COLUMNS */}
                                                    {getActiveFilterColumns(values).map((fieldKey) => (
                                                        <TableCell
                                                            key={fieldKey}
                                                            sx={{ fontWeight: "bold", color: "white", py: 1.5, fontSize: "0.9rem" }}
                                                        >
                                                            {ALL_FIELDS[fieldKey]}
                                                        </TableCell>
                                                    ))}

                                                    {/* 🔥 SHOW FIELDS SELECTED FROM FIELD GROUPS */}
                                                    {selectedColumns.map((fieldKey) => (
                                                        <TableCell
                                                            key={"selected-" + fieldKey}
                                                            sx={{ fontWeight: "bold", color: "white", py: 1.5, fontSize: "0.9rem" }}
                                                        >
                                                            {ALL_FIELDS[fieldKey]}
                                                        </TableCell>
                                                    ))}

                                                    <TableCell sx={{ fontWeight: "bold", color: "white", py: 1.5 }}>
                                                        Actions
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>



                                            <TableBody>
                                                {paginatedMembers.map((m, idx) => {
                                                    const indexNumber = page * rowsPerPage + idx + 1;
                                                    const isFieldMissing = isMissing(getValueByPath(m, values.selectedField));

                                                    return (
                                                        <TableRow
                                                            key={m._id}
                                                            hover
                                                            onClick={() => navigate(`/member-details/${m._id}`)}
                                                            sx={{
                                                                cursor: "pointer",
                                                                bgcolor: isFieldMissing ? "#ffebee" : "inherit",
                                                                "&:hover": {
                                                                    bgcolor: isFieldMissing ? "#ffcdd2" : "#fffff",
                                                                    transition: "0.2s",
                                                                },
                                                            }}
                                                        >
                                                            <TableCell>{indexNumber}</TableCell>
                                                            <TableCell>{getValueByPath(m, "personalDetails.membershipNumber") || "—"}</TableCell>
                                                            <TableCell>{getNameWithTitle(m)}</TableCell>
                                                            <TableCell>{getValueByPath(m, "personalDetails.nameOfFather") || "—"}</TableCell>
                                                            <TableCell>{getValueByPath(m, "personalDetails.phoneNo1") || "—"}</TableCell>
                                                            <TableCell>{getValueByPath(m, "personalDetails.emailId1") || "—"}</TableCell>
                                                            <TableCell>{getValueByPath(m, "nomineeDetails.introduceBy") || "—"}</TableCell>

                                                            {/* 🔥 ADD FILTER APPLIED COLUMNS HERE */}
                                                            {getActiveFilterColumns(values).map((fieldKey) => (
                                                                <TableCell key={fieldKey}>
                                                                    {getValueByPath(m, fieldKey) || "—"}
                                                                </TableCell>
                                                            ))}

                                                            {/* 🔥 SHOW SELECTED FIELD VALUES */}
                                                            {selectedColumns.map((fieldKey) => {
                                                                const value = getValueByPath(m, fieldKey);
                                                                const isMissingField = isMissing(value);

                                                                return (
                                                                    <TableCell
                                                                        key={"val-" + fieldKey}
                                                                    >
                                                                        {isMissingField ? (
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                <Typography variant="caption" color="error">MISSING</Typography>
                                                                            </Box>
                                                                        ) : (
                                                                            <Box>
                                                                                {fieldKey.includes("currentResidentalAddress") ||
                                                                                    fieldKey.includes("permanentAddress") ||
                                                                                    fieldKey.includes("previousCurrentAddress") ? (
                                                                                    <Tooltip title={value} arrow>
                                                                                        <Typography
                                                                                            variant="body2"
                                                                                            sx={{
                                                                                                maxWidth: '200px',
                                                                                                overflow: 'hidden',
                                                                                                textOverflow: 'ellipsis',
                                                                                                whiteSpace: 'nowrap'
                                                                                            }}
                                                                                        >
                                                                                            {value}
                                                                                        </Typography>
                                                                                    </Tooltip>
                                                                                ) : (
                                                                                    value || "—"
                                                                                )}
                                                                            </Box>
                                                                        )}
                                                                    </TableCell>
                                                                );
                                                            })}


                                                            <TableCell>
                                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => { e.stopPropagation(); navigate(`/member-details/${m._id}`); }}
                                                                        color="primary"
                                                                    >
                                                                        <VisibilityIcon />
                                                                    </IconButton>

                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => { e.stopPropagation(); setMemberToDelete(m); setDeleteDialogOpen(true); }}
                                                                        color="error"
                                                                        disabled={operationLoading?.delete}
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

                                    {/* Pagination */}
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1 }}>
                                        <Typography variant="body2">
                                            Showing {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filteredMembers.length)} of {filteredMembers.length}
                                        </Typography>

                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <TextField
                                                select
                                                size="small"
                                                value={rowsPerPage}
                                                onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
                                                sx={{ width: 100 }}
                                            >
                                                {[5, 10, 20, 50].map((num) => (
                                                    <MenuItem key={num} value={num}>
                                                        {num} / page
                                                    </MenuItem>
                                                ))}
                                            </TextField>

                                            <Button
                                                variant="outlined"
                                                size="small"
                                                disabled={page === 0}
                                                onClick={() => setPage(page - 1)}
                                            >
                                                Previous
                                            </Button>

                                            <Button
                                                variant="contained"
                                                size="small"
                                                disabled={(page + 1) * rowsPerPage >= filteredMembers.length}
                                                onClick={() => setPage(page + 1)}
                                            >
                                                Next
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Paper>
                            )}

                        </Form>
                    );
                }}
            </Formik>
        </Box>
    );
};

export default MissingMembersTable;