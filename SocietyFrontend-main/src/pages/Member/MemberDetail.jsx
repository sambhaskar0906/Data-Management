import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    TablePagination,
    IconButton,
    TextField,
    Button,
    InputAdornment,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

import { useDispatch, useSelector } from "react-redux";

import MemberView from "./MemberView";
import MemberEditPage from "./MemberEdit";
import { generateMembersListPDF } from "./MemberDetailsPdf";

import {
    fetchAllMembers,
    deleteMember,
    clearSuccessMessage,
    clearError
} from "../../features/member/memberSlice";

export const FIELD_MAP = {
    // Personal Details
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

    // Address - Permanent
    "addressDetails.permanentAddress.flatHouseNo": "Permanent - Flat/House No",
    "addressDetails.permanentAddress.areaStreetSector": "Permanent - Area/Street/Sector",
    "addressDetails.permanentAddress.locality": "Permanent - Locality",
    "addressDetails.permanentAddress.landmark": "Permanent - Landmark",
    "addressDetails.permanentAddress.city": "Permanent - City",
    "addressDetails.permanentAddress.country": "Permanent - Country",
    "addressDetails.permanentAddress.state": "Permanent - State",
    "addressDetails.permanentAddress.pincode": "Permanent - Pincode",
    "addressDetails.permanentAddressBillPhoto": "Permanent - Bill Photo",

    // Address - Current
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

    // References & Guarantors
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

    // Professional Details
    "professionalDetails.qualification": "Qualification",
    "professionalDetails.occupation": "Occupation",

    // Family Details
    "familyDetails.familyMembersMemberOfSociety": "Family Members in Society",
    "familyDetails.familyMember": "Family Member Names",
    "familyDetails.familyMemberNo": "Family Member Phones",

    // Bank Details
    "bankDetails.bankName": "Bank Name",
    "bankDetails.branch": "Bank Branch",
    "bankDetails.accountNumber": "Account Number",
    "bankDetails.ifscCode": "IFSC Code",
    "bankDetails.civilScore": "Civil Score",

    // Guarantee Details
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOtherSociety": "Guarantee Given in Other Society",
    "guaranteeDetails.otherSociety": "Other Society Guarantees",
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOurSociety": "Guarantee Given in Our Society",
    "guaranteeDetails.ourSociety": "Our Society Guarantees",

    // Loan Details
    "loanDetails": "Loan Details",
};
export const getValueByPath = (obj, path) => {
    if (!path) return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
        if (cur === undefined || cur === null) return undefined;
        cur = cur[p];
    }
    return cur;
};

export const setValueByPath = (obj, path, value) => {
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

export const isMissing = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
};

export const formatValueForUI = (value) => {
    if (isMissing(value)) return <span style={{ color: 'red', fontWeight: 700 }}>Missing</span>;

    if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('https'))) {
        return (
            <div>
                <img src={value} alt="doc" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 4, border: '1px solid #ddd' }} />
                <div style={{ marginTop: 6 }}>
                    <a href={value} target="_blank" rel="noreferrer" style={{ color: '#1976d2' }}>View Full Image</a>
                </div>
            </div>
        );
    }

    if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object') {
            return value.map((v, idx) => <div key={idx} style={{ marginBottom: 6 }}>{Object.entries(v).map(([k, vv]) => <div key={k}><strong>{k}:</strong> {String(vv)}</div>)}</div>);
        }
        return value.join(', ');
    }

    if (typeof value === 'object') {
        return Object.entries(value).map(([k, v]) => <div key={k}><strong>{k}:</strong> {String(v)}</div>);
    }

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
};

const MemberDetailsPage = () => {
    const dispatch = useDispatch();
    const { members = [], loading, error, successMessage } = useSelector((state) => state.members);

    // Search + pagination
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // View modal
    const [selectedMember, setSelectedMember] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    // Edit modal
    const [editMember, setEditMember] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // Delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState({
        open: false,
        id: null
    });

    // Load all members
    useEffect(() => {
        dispatch(fetchAllMembers());
    }, [dispatch]);

    // Clear notifications
    useEffect(() => {
        if (successMessage)
            setTimeout(() => dispatch(clearSuccessMessage()), 1500);
        if (error) setTimeout(() => dispatch(clearError()), 1500);
    }, [successMessage, error, dispatch]);

    // Filter members by search
    const filteredMembers = useMemo(() => {
        if (!query.trim()) return members;
        const q = query.toLowerCase();

        return members.filter((m) => {
            const name = getValueByPath(m, "personalDetails.nameOfMember") || "";
            const mno = getValueByPath(m, "personalDetails.membershipNumber") || "";
            const phone = getValueByPath(m, "personalDetails.phoneNo") || "";
            const email = getValueByPath(m, "personalDetails.emailId") || "";

            return (
                name.toLowerCase().includes(q) ||
                mno.toLowerCase().includes(q) ||
                phone.toLowerCase().includes(q) ||
                email.toLowerCase().includes(q)
            );
        });
    }, [query, members]);

    // Pagination logic
    const paginatedMembers = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredMembers.slice(start, start + rowsPerPage);
    }, [page, rowsPerPage, filteredMembers]);

    // View handler
    const handleView = (member) => {
        setSelectedMember(member);
        setViewDialogOpen(true);
    };

    // Edit handler (OPEN MODAL)
    const handleEdit = (member) => {
        setEditMember(member);
        setEditDialogOpen(true);
    };

    // Delete handler
    const handleDelete = () => {
        dispatch(deleteMember(deleteConfirm.id));
        setDeleteConfirm({ open: false, id: null });
    };

    return (
        <Box p={2}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Member Details
            </Typography>

            {/* Search + PDF */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <TextField
                    placeholder="Search..."
                    fullWidth
                    size="small"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                />

                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => generateMembersListPDF(filteredMembers)}
                >
                    Dowenload
                </Button>
            </Box>

            {/* Table */}
            <Paper>
                <Table>
                    <TableHead sx={{ background: "#1976d2" }}>
                        <TableRow>
                            <TableCell sx={{ color: "white" }}>S.No</TableCell>
                            <TableCell sx={{ color: "white" }}>Member No</TableCell>
                            <TableCell sx={{ color: "white" }}>Name</TableCell>
                            <TableCell sx={{ color: "white" }}>Phone</TableCell>
                            <TableCell sx={{ color: "white" }}>Email</TableCell>
                            <TableCell sx={{ color: "white" }}>City</TableCell>
                            <TableCell sx={{ color: "white" }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {paginatedMembers.map((m, index) => (
                            <TableRow key={m._id}>
                                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                <TableCell>{getValueByPath(m, "personalDetails.membershipNumber")}</TableCell>
                                <TableCell>{getValueByPath(m, "personalDetails.nameOfMember")}</TableCell>
                                <TableCell>{getValueByPath(m, "personalDetails.phoneNo")}</TableCell>
                                <TableCell>{getValueByPath(m, "personalDetails.emailId")}</TableCell>
                                <TableCell>{getValueByPath(m, "addressDetails.currentResidentalAddress.city")}</TableCell>

                                <TableCell>
                                    <IconButton color="primary" onClick={() => handleView(m)}>
                                        <VisibilityIcon />
                                    </IconButton>

                                    <IconButton color="secondary" onClick={() => handleEdit(m)}>
                                        <EditIcon />
                                    </IconButton>

                                    <IconButton
                                        color="error"
                                        onClick={() =>
                                            setDeleteConfirm({ open: true, id: m._id })
                                        }
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={filteredMembers.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>

            {/* VIEW DIALOG */}
            <MemberView
                open={viewDialogOpen}
                handleClose={() => setViewDialogOpen(false)}
                member={selectedMember}
            />

            {/* EDIT DIALOG */}
            <MemberEditPage
                open={editDialogOpen}
                member={editMember}
                onClose={() => setEditDialogOpen(false)}
            />

            {/* DELETE DIALOG */}
            <Dialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null })}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>Are you sure?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm({ open: false, id: null })}>
                        Cancel
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MemberDetailsPage;