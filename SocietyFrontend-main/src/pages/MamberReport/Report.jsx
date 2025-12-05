import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Box, TextField, InputAdornment, Button,
    MenuItem, Select, FormControl, InputLabel, Stack, Dialog,
    DialogTitle, DialogContent, DialogActions, IconButton,
    CircularProgress, Alert, Chip, Tabs, Tab, Checkbox, FormControlLabel
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

// Utility Functions
const getValueByPath = (obj, path) => {
    if (!path) return undefined;
    return path.split(".").reduce((cur, p) => cur?.[p], obj);
};

const isMissing = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.values(value).every(val =>
        val === undefined || val === null || val === "" ||
        (typeof val === 'object' && Object.keys(val).length === 0)
    );
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
    "personalDetails.caste": "Caste",
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
    "addressDetails.permanentAddress.flatHouseNo": "Permanent House No",
    "addressDetails.permanentAddress.areaStreetSector": "Permanent Area",
    "addressDetails.permanentAddress.locality": "Permanent Locality",
    "addressDetails.permanentAddress.landmark": "Permanent Landmark",
    "addressDetails.permanentAddress.city": "Permanent City",
    "addressDetails.permanentAddress.country": "Permanent Country",
    "addressDetails.permanentAddress.state": "Permanent State",
    "addressDetails.permanentAddress.pincode": "Permanent Pincode",
    "addressDetails.currentResidentalAddress.flatHouseNo": "Current House No",
    "addressDetails.currentResidentalAddress.areaStreetSector": "Current Area",
    "addressDetails.currentResidentalAddress.locality": "Current Locality",
    "addressDetails.currentResidentalAddress.landmark": "Current Landmark",
    "addressDetails.currentResidentalAddress.city": "Current City",
    "addressDetails.currentResidentalAddress.country": "Current Country",
    "addressDetails.currentResidentalAddress.state": "Current State",
    "addressDetails.currentResidentalAddress.pincode": "Current Pincode",

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
}).reduce((acc, [key, label]) => ({
    ...acc,
    [key]: {
        label,
        fields: Object.keys(ALL_FIELDS).filter(f => f.startsWith(key === "personal" ? "personalDetails" :
            key === "address" ? "addressDetails" :
                key === "documents" ? "documents" :
                    key === "professional" ? "professionalDetails" :
                        key === "family" ? "familyDetails" :
                            key === "bank" ? "bankDetails" :
                                key === "reference" ? "referenceDetails" :
                                    key === "guarantee" ? "guaranteeDetails" :
                                        key === "nominee" ? "nomineeDetails" : key))
    }
}), {});

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

            {/* Category Filter */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Category</InputLabel>
                <Select value={values.categoryFilter} label="Category"
                    onChange={(e) => setFieldValue("categoryFilter", e.target.value)}>
                    {filters.categoryOptions.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt === "all" ? "All Categories" : FIELD_GROUPS[opt]?.label || opt}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* View Type */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>View Type</InputLabel>
                <Select value={values.viewType} label="View Type"
                    onChange={(e) => setFieldValue("viewType", e.target.value)}>
                    <MenuItem value="all">All Members</MenuItem>
                    <MenuItem value="missing">Missing Only</MenuItem>
                    <MenuItem value="available">Available Only</MenuItem>
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

            {/* Caste Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Caste</InputLabel>
                <Select value={values.casteFilter} label="Caste"
                    onChange={(e) => setFieldValue("casteFilter", e.target.value)}>
                    {filters.casteOptions.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt === "all" ? "All Castes" : opt}</MenuItem>
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
                        {values.casteFilter !== "all" && <span style={{ marginLeft: 8 }}><strong>Caste:</strong> {values.casteFilter}</span>}
                        {values.minAge && <span style={{ marginLeft: 8 }}><strong>Min Age:</strong> {values.minAge}</span>}
                        {values.maxAge && <span style={{ marginLeft: 8 }}><strong>Max Age:</strong> {values.maxAge}</span>}
                        {values.viewType !== "all" && <span style={{ marginLeft: 8 }}><strong>View Type:</strong> {values.viewType}</span>}
                        {values.selectedField === "personalDetails.civilScore" && values.civilScoreFilter !== "all" &&
                            <span style={{ marginLeft: 8 }}><strong>Civil Score:</strong> {CIVIL_SCORE_FILTERS[values.civilScoreFilter]}</span>}
                    </Typography>
                </Box>
            )}
    </Box>
);

// Main Component
const MissingMembersTable = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { members, loading, error, operationLoading } = useSelector((state) => state.members);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);

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
            <Typography variant="h5" sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}>
                Field Status Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Total Members: {members.length} | Select a field and apply filters to check status
            </Typography>

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
                selectedField: "documents.aadhaarNo",
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
                maxAge: ""
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

                    // Filtered members with ALL filters applied
                    const filteredMembers = useMemo(() => {
                        let result = [...members];

                        // Search filter
                        const searchTerm = values.search.trim().toLowerCase();
                        if (searchTerm) {
                            result = result.filter(m => {
                                const searchFields = [
                                    getValueByPath(m, "personalDetails.nameOfMember"),
                                    getValueByPath(m, "personalDetails.title"),
                                    getValueByPath(m, "personalDetails.membershipNumber"),
                                    getValueByPath(m, "personalDetails.phoneNo1"),
                                    getValueByPath(m, "personalDetails.phoneNo2"),
                                    getValueByPath(m, "personalDetails.emailId1"),
                                    getValueByPath(m, "personalDetails.emailId2"),
                                    getValueByPath(m, "personalDetails.emailId3"),
                                    getValueByPath(m, "personalDetails.caste"),
                                    getValueByPath(m, "personalDetails.religion"),
                                    getValueByPath(m, "professionalDetails.occupation"),
                                    getValueByPath(m, "professionalDetails.qualification"),
                                    getValueByPath(m, "addressDetails.permanentAddress.city"),
                                    getValueByPath(m, "addressDetails.currentResidentalAddress.city"),
                                    getValueByPath(m, "professionalDetails.degreeNumber"),
                                    getValueByPath(m, "professionalDetails.serviceDetails.fullNameOfCompany"),
                                    getValueByPath(m, "professionalDetails.serviceDetails.designation")
                                ];
                                return searchFields.some(field =>
                                    field?.toString().toLowerCase().includes(searchTerm)
                                );
                            });
                        }

                        // Apply ALL filters in sequence
                        const applyFilters = [
                            // Occupation filter
                            () => values.occupationFilter !== "all" ?
                                result.filter(m => {
                                    const occupation = getValueByPath(m, "professionalDetails.occupation") || "";
                                    return occupation.toLowerCase() === values.occupationFilter.toLowerCase();
                                }) : result,

                            // Qualification filter (CA, ADV, DR, etc.)
                            () => values.qualificationFilter !== "all" ?
                                result.filter(m => {
                                    const qualification = getValueByPath(m, "professionalDetails.qualification") || "";
                                    return qualification.toLowerCase() === values.qualificationFilter.toLowerCase();
                                }) : result,

                            // Religion filter
                            () => values.religionFilter !== "all" ?
                                result.filter(m => {
                                    const religion = getValueByPath(m, "personalDetails.religion") || "";
                                    return religion.toLowerCase() === values.religionFilter.toLowerCase();
                                }) : result,

                            // Gender filter
                            () => values.genderFilter !== "all" ?
                                result.filter(m => {
                                    const gender = getValueByPath(m, "personalDetails.gender") || "";
                                    return gender.toLowerCase() === values.genderFilter.toLowerCase();
                                }) : result,

                            // Marital status filter
                            () => values.maritalFilter !== "all" ?
                                result.filter(m => {
                                    const maritalStatus = getValueByPath(m, "personalDetails.maritalStatus") || "";
                                    return maritalStatus.toLowerCase() === values.maritalFilter.toLowerCase();
                                }) : result,

                            // Caste filter
                            () => values.casteFilter !== "all" ?
                                result.filter(m => {
                                    const caste = getValueByPath(m, "personalDetails.caste") || "";
                                    return caste.toLowerCase() === values.casteFilter.toLowerCase();
                                }) : result,

                            // Age range filter - FIXED
                            () => {
                                const minAge = parseInt(values.minAge) || 0;
                                const maxAge = parseInt(values.maxAge) || 150;

                                if (minAge > 0 || maxAge < 150) {
                                    return result.filter(m => {
                                        const ageStr = getValueByPath(m, "personalDetails.ageInYears") || "";
                                        const age = extractAge(ageStr);
                                        return age >= minAge && age <= maxAge;
                                    });
                                }
                                return result;
                            },

                            // Category filter
                            () => values.categoryFilter !== "all" ?
                                result.filter(m => FIELD_GROUPS[values.categoryFilter]?.fields?.some(fk =>
                                    !isMissing(getValueByPath(m, fk))
                                )) : result,

                            // Field status filter
                            () => values.viewType !== "all" ?
                                result.filter(m => {
                                    const isMissingField = isMissing(getValueByPath(m, values.selectedField));
                                    return values.viewType === "missing" ? isMissingField : !isMissingField;
                                }) : result,

                            // Civil score filter (check both personalDetails.civilScore and bankDetails.civilScore)
                            () => (values.selectedField === "personalDetails.civilScore" ||
                                values.selectedField === "bankDetails.civilScore") &&
                                values.civilScoreFilter !== "all" ?
                                result.filter(m => {
                                    const civilScore = getValueByPath(m, values.selectedField);
                                    return getCivilScoreStatus(civilScore) === values.civilScoreFilter;
                                }) : result
                        ];

                        // Apply all filters sequentially
                        applyFilters.forEach(filterFn => {
                            result = filterFn();
                        });

                        return result;
                    }, [values, members]);

                    // Statistics
                    const stats = useMemo(() => {
                        const civilScoreStats = members.reduce((acc, m) => {
                            const civilScore = getValueByPath(m, "personalDetails.civilScore") ||
                                getValueByPath(m, "bankDetails.civilScore");
                            acc[getCivilScoreStatus(civilScore)]++;
                            return acc;
                        }, { missing: 0, excellent: 0, good: 0, poor: 0, invalid: 0 });

                        return {
                            all: filteredMembers.length,
                            missing: members.filter(m => isMissing(getValueByPath(m, values.selectedField))).length,
                            available: members.length - members.filter(m => isMissing(getValueByPath(m, values.selectedField))).length,
                            civilScore: civilScoreStats
                        };
                    }, [members, values.selectedField, filteredMembers]);

                    return (
                        <Form>
                            <Stack spacing={2} sx={{ mb: 3 }}>
                                {/* Main Search and Actions */}
                                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                                    <TextField size="small" placeholder="Search by name, membership, phone, email, qualification..."
                                        value={values.search} onChange={(e) => setFieldValue("search", e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                                        sx={{ width: 400 }} />

                                    <Button variant="contained" startIcon={<PictureAsPdfIcon />}
                                        onClick={() => generatePDF(filteredMembers, values.selectedField, values.viewType)}
                                        disabled={!filteredMembers.length}>
                                        Download PDF
                                    </Button>

                                    <Button variant="outlined" onClick={() => dispatch(fetchAllMembers())} disabled={loading}>
                                        Refresh
                                    </Button>

                                    <FormControlLabel control={<Checkbox checked={showAdvancedFilters}
                                        onChange={(e) => setShowAdvancedFilters(e.target.checked)} />}
                                        label="Show Advanced Filters" />
                                </Box>

                                {/* Advanced Filters */}
                                {showAdvancedFilters && (
                                    <AdvancedFilters values={values} setFieldValue={setFieldValue} filters={filters} />
                                )}

                                {/* Field Selection Tabs */}
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                                        {Object.entries(FIELD_GROUPS).map(([key, { label }], idx) => (
                                            <Tab key={key} label={label} />
                                        ))}
                                    </Tabs>
                                </Box>

                                {/* Field Buttons */}
                                {Object.entries(FIELD_GROUPS).map(([key, { fields }], idx) => (
                                    <TabPanel key={key} value={tabValue} index={idx}>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {fields.map(fieldKey => (
                                                <Chip key={fieldKey} label={ALL_FIELDS[fieldKey]}
                                                    onClick={() => {
                                                        setFieldValue("selectedField", fieldKey);
                                                        if (fieldKey !== "personalDetails.civilScore") {
                                                            setFieldValue("civilScoreFilter", "all");
                                                        }
                                                    }}
                                                    color={values.selectedField === fieldKey ? "primary" : "default"}
                                                    variant={values.selectedField === fieldKey ? "filled" : "outlined"}
                                                    clickable />
                                            ))}
                                        </Box>
                                    </TabPanel>
                                ))}

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
                                <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                {["S. No", "Member No", "Name", "Phone", "Email", "City", "Actions"].map((header, idx) => (
                                                    <TableCell key={idx} sx={{ fontWeight: "bold", bgcolor: 'primary.main', color: 'white' }}>
                                                        {header}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredMembers.map((m, idx) => {
                                                const isFieldMissing = isMissing(getValueByPath(m, values.selectedField));
                                                const city = getValueByPath(m, "addressDetails.permanentAddress.city") ||
                                                    getValueByPath(m, "addressDetails.currentResidentalAddress.city");
                                                return (
                                                    <TableRow key={m._id} hover onClick={() => navigate(`/member-details/${m._id}`)}
                                                        sx={{
                                                            backgroundColor: isFieldMissing ? "#ffebee" : "inherit",
                                                            "&:nth-of-type(odd)": { backgroundColor: isFieldMissing ? "#ffebee" : "#fafafa" }
                                                        }}>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>{getValueByPath(m, "personalDetails.membershipNumber") || "—"}</TableCell>
                                                        <TableCell>{getNameWithTitle(m)}</TableCell>
                                                        <TableCell>{getValueByPath(m, "personalDetails.phoneNo1") || "—"}</TableCell>
                                                        <TableCell>{getValueByPath(m, "personalDetails.emailId1") || "—"}</TableCell>
                                                        <TableCell>{city || "—"}</TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/member-details/${m._id}`); }}
                                                                    title="View Details" color="primary"><VisibilityIcon /></IconButton>
                                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMemberToDelete(m); setDeleteDialogOpen(true); }}
                                                                    title="Delete Member" color="error" disabled={operationLoading.delete}><DeleteIcon /></IconButton>
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