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
    DialogActions,
    Menu,
    MenuItem,
    TableContainer,
    Avatar,
    Stack,
    Tooltip,
    Divider,
    Chip,
    Drawer,
    Grid
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/Block";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MemberView from "./MemberView";
import MemberEditPage from "./MemberEdit.jsx";
import { generateMembersListPDF } from "./MemberDetailsPdf.jsx";
import { generateMembersExcel } from "./MemberDetailsExcel.jsx";

import {
    fetchAllMembers,
    deleteMember,
    clearSuccessMessage,
    clearError,
    updateMemberStatus
} from "../../features/member/memberSlice";

// ------------------ Helper map & util functions ------------------
// (Assume your existing helpers remain; they are kept as-is)
export const FIELD_MAP = {
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
    "personalDetails.phoneNo1": "Phone No",
    "personalDetails.alternatePhoneNo": "Alternate Phone",
    "personalDetails.emailId1": "Email",
    "addressDetails.permanentAddress.flatHouseNo": "Permanent - Flat/House No",
    "addressDetails.permanentAddress.areaStreetSector": "Permanent - Area/Street/Sector",
    "addressDetails.permanentAddress.locality": "Permanent - Locality",
    "addressDetails.permanentAddress.landmark": "Permanent - Landmark",
    "addressDetails.permanentAddress.city": "Permanent - City",
    "addressDetails.permanentAddress.country": "Permanent - Country",
    "addressDetails.permanentAddress.state": "Permanent - State",
    "addressDetails.permanentAddress.pincode": "Permanent - Pincode",
    "addressDetails.permanentAddressBillPhoto": "Permanent - Bill Photo",
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
    "familyDetails.familyMembersMemberOfSociety": "Family Members in Society",
    "familyDetails.familyMember": "Family Member Names",
    "familyDetails.familyMemberNo": "Family Member Phones",
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

export const getTitleForMember = (member) => {
    if (!member) return "";
    const explicitTitle = (getValueByPath(member, "personalDetails.title") || "").toString().trim();
    if (explicitTitle) return explicitTitle;

    const gender = (getValueByPath(member, "personalDetails.gender") || "").toString().trim().toLowerCase();
    const marital = (getValueByPath(member, "personalDetails.maritalStatus") || "").toString().trim().toLowerCase();

    if (gender === "male" || gender === "m") return "Mr.";
    if (gender === "female" || gender === "f") {
        if (marital === "married") return "Mrs.";
        return "Ms.";
    }
    return "";
};

export const formatMemberName = (member) => {
    const name = getValueByPath(member, "personalDetails.nameOfMember") || "";
    const title = getTitleForMember(member);
    if (!name) return "—";
    return title ? `${title} ${name}` : name;
};

export const formatFatherName = (member) => {
    const fatherName = getValueByPath(member, "personalDetails.nameOfFather") || "";
    const fatherTitle = getValueByPath(member, "personalDetails.fatherTitle") || "";

    if (!fatherName) return "—";

    return fatherTitle ? `${fatherTitle} ${fatherName}` : fatherName;
};


// ------------------ Main Component ------------------
const MemberDetailsPage = () => {
    const dispatch = useDispatch();
    const { members = [], loading, error, successMessage } = useSelector((state) => state.members || {});
    const [anchorEl, setAnchorEl] = useState(null);
    const [actionMenu, setActionMenu] = useState({ anchor: null, member: null });
    const [statusDialog, setStatusDialog] = useState({ open: false, member: null });
    const openMenu = Boolean(anchorEl);

    const navigate = useNavigate();

    const handleDownloadClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => setAnchorEl(null);
    const handleAddMember = () => navigate('/addmember');

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
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

    // Filter drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);

    const [filters, setFilters] = useState({
        name: "",
        membershipNumber: "",
        phone: "",
        email: "",
        fatherName: "",
        introducedBy: "",
        city: "",
        state: "",
        pincode: "",
        occupation: "",
        qualification: "",
        caste: "",
        religion: "",
        gender: "",
        status: "",
        minAge: "",
        maxAge: "",
    });

    // When component loads, fetch members
    useEffect(() => {
        dispatch(fetchAllMembers());
    }, [dispatch]);

    // Clear notifications
    useEffect(() => {
        if (successMessage) setTimeout(() => dispatch(clearSuccessMessage()), 1500);
        if (error) setTimeout(() => dispatch(clearError()), 1500);
    }, [successMessage, error, dispatch]);

    // Helpers for filters
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0);
    };

    const clearAllFilters = () => {
        setFilters({
            name: "",
            membershipNumber: "",
            phone: "",
            email: "",
            fatherName: "",
            introducedBy: "",
            city: "",
            state: "",
            pincode: "",
            occupation: "",
            qualification: "",
            caste: "",
            religion: "",
            gender: "",
            status: ""
        });
        setPage(0);
    };

    const filteredMembers = useMemo(() => {
        const q = (query || "").toString().trim().toLowerCase();

        const f = Object.fromEntries(
            Object.entries(filters).map(([k, v]) => [k, (v || "").toString().trim().toLowerCase()])
        );

        return members.filter((m) => {

            // 🔍 GLOBAL SEARCH
            const matchesQuery = !q || [
                getValueByPath(m, "personalDetails.nameOfMember"),
                getValueByPath(m, "personalDetails.membershipNumber"),
                getValueByPath(m, "personalDetails.phoneNo1"),
                getValueByPath(m, "personalDetails.emailId1"),
                getValueByPath(m, "personalDetails.phoneNo2"),
                getValueByPath(m, "nomineeDetails.introduceBy"),
                getValueByPath(m, "personalDetails.nameOfFather")
            ].some(val => (val || "").toString().toLowerCase().includes(q));

            if (!matchesQuery) return false;

            // 🎯 AGE FILTER (Correct Place)
            const age = getValueByPath(m, "personalDetails.ageInYears");

            if (f.minAge && age < parseInt(f.minAge)) return false;
            if (f.maxAge && age > parseInt(f.maxAge)) return false;

            // Generic matching function
            const match = (filterValue, path) => {
                if (!filterValue) return true;
                const val = getValueByPath(m, path);
                return (val || "").toString().toLowerCase().includes(filterValue);
            };

            return (
                match(f.name, "personalDetails.nameOfMember") &&
                match(f.membershipNumber, "personalDetails.membershipNumber") &&
                match(f.phone, "personalDetails.phoneNo1") &&
                match(f.email, "personalDetails.emailId1") &&
                match(f.fatherName, "personalDetails.nameOfFather") &&
                match(f.introducedBy, "nomineeDetails.introduceBy") &&
                match(f.city, "addressDetails.currentResidentalAddress.city") &&
                match(f.state, "addressDetails.currentResidentalAddress.state") &&
                match(f.pincode, "addressDetails.currentResidentalAddress.pincode") &&
                match(f.occupation, "professionalDetails.occupation") &&
                match(f.qualification, "professionalDetails.qualification") &&
                match(f.caste, "personalDetails.caste") &&
                match(f.religion, "personalDetails.religion") &&
                match(f.gender, "personalDetails.gender") &&
                (!f.status || (getValueByPath(m, "status") || "").toString().toLowerCase() === f.status)
            );
        });
    }, [members, query, filters]);


    // Pagination slice
    const paginatedMembers = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredMembers.slice(start, start + rowsPerPage);
    }, [page, rowsPerPage, filteredMembers]);

    // Actions
    const handleView = (member) => {
        setSelectedMember(member);
        setViewDialogOpen(true);
    };

    const handleEdit = (member) => {
        setEditMember(member);
        setEditDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteConfirm.id) dispatch(deleteMember(deleteConfirm.id));
        setDeleteConfirm({ open: false, id: null });
    };

    // Status dialog handlers (fixed to use statusDialog.member)
    const handleMarkActive = () => {
        if (statusDialog.member && statusDialog.member._id) {
            dispatch(updateMemberStatus({
                id: statusDialog.member._id,
                status: "Active"
            }));
        }
        setStatusDialog({ open: false, member: null });
    };

    const handleMarkInactive = () => {
        if (statusDialog.member && statusDialog.member._id) {
            dispatch(updateMemberStatus({
                id: statusDialog.member._id,
                status: "Inactive"
            }));
        }
        setStatusDialog({ open: false, member: null });
    };

    return (
        <Box p={{ xs: 1.5, sm: 2.5 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, background: 'transparent' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>Member Details</Typography>
                        <Typography variant="body2" color="text.secondary">Manage society members — minimal, clean & responsive.</Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                            placeholder="Search by name, member no, phone or email"
                            size="small"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                            sx={{ width: { xs: 220, sm: 360 }, background: '#fff', borderRadius: 1 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Tooltip title="Filters">
                            <IconButton onClick={() => setFilterDialogOpen(true)} sx={{ bgcolor: "#fff" }}>
                                <FilterListIcon />
                            </IconButton>
                        </Tooltip>

                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadClick}
                            disabled={loading || filteredMembers.length === 0}
                            sx={{ whiteSpace: 'nowrap', minWidth: '40px' }}
                        >
                            Export
                        </Button>

                        <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
                            <MenuItem onClick={() => { generateMembersListPDF(filteredMembers); handleMenuClose(); }}>
                                <FileDownloadDoneIcon sx={{ mr: 1 }} /> Download PDF
                            </MenuItem>
                            <MenuItem onClick={() => { generateMembersExcel(filteredMembers); handleMenuClose(); }}>
                                <FileDownloadDoneIcon sx={{ mr: 1 }} /> Download Excel
                            </MenuItem>
                        </Menu>

                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddMember} sx={{ ml: 1 }}>
                            Add Member
                        </Button>
                    </Stack>
                </Stack>

                <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 520, background: '#fafafa' }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow sx={{ background: '#fff' }}>
                                    <TableCell sx={{ fontWeight: 700, minWidth: 60 }}>S.No</TableCell>
                                    <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Member No</TableCell>
                                    <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Member Name</TableCell>
                                    <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Father Name</TableCell>
                                    <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>Mobile No</TableCell>
                                    <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>Introduced By</TableCell>
                                    {/* <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Status</TableCell> */}
                                    <TableCell sx={{ fontWeight: 700, minWidth: 140, textAlign: 'center' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {paginatedMembers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} sx={{ py: 6 }}>
                                            <Box textAlign="center">
                                                <Typography variant="h6" color="text.secondary">No members found</Typography>
                                                <Typography variant="body2" color="text.secondary">Try adjusting your search or add a new member.</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {paginatedMembers.map((m, index) => (
                                    <TableRow key={m._id} hover sx={{ '&:hover': { background: '#fff' } }}>
                                        {/* S.No */}
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                                        {/* Member No */}
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {getValueByPath(m, "personalDetails.membershipNumber") || "—"}
                                            </Typography>
                                        </TableCell>

                                        {/* Member Name with Avatar */}
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar
                                                    src={getValueByPath(m, "documents.passportSize") || ""}
                                                    alt={formatMemberName(m)}
                                                    sx={{ width: 36, height: 36 }}
                                                />
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                        {formatMemberName(m)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {getValueByPath(m, "professionalDetails.occupation") || ""}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        {/* Father Name */}
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {formatFatherName(m)}
                                            </Typography>
                                        </TableCell>

                                        {/* Mobile No */}
                                        <TableCell>
                                            <Typography variant="body2">
                                                {getValueByPath(m, "personalDetails.phoneNo1") || "—"}
                                            </Typography>
                                        </TableCell>

                                        {/* Email */}
                                        <TableCell>
                                            <Typography variant="body2">
                                                {getValueByPath(m, "personalDetails.emailId1") || "—"}
                                            </Typography>
                                        </TableCell>

                                        {/* Introduced By */}
                                        <TableCell>
                                            <Typography variant="body2">
                                                {getValueByPath(m, "nomineeDetails.introduceBy") || "—"}
                                            </Typography>
                                        </TableCell>

                                        {/* Status */}
                                        {/* <TableCell>
                                            <Chip
                                                label={(getValueByPath(m, "status") || "").toString()}
                                                color={((getValueByPath(m, "status") || "").toString().toLowerCase() === "active") ? "success" : "error"}
                                                size="small"
                                            />
                                        </TableCell> */}

                                        <TableCell
                                            align="center"
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                gap: 0.5,
                                                flexWrap: "nowrap"
                                            }}
                                        >
                                            <Tooltip title="View">
                                                <IconButton color="primary" onClick={() => handleView(m)}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Edit">
                                                <IconButton color="secondary" onClick={() => handleEdit(m)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Delete">
                                                <IconButton color="error" onClick={() => setDeleteConfirm({ open: true, id: m._id })}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="More">
                                                <IconButton onClick={() => setStatusDialog({ open: true, member: m })}>
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                        <TablePagination
                            component="div"
                            count={filteredMembers.length}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            labelRowsPerPage="Rows"
                            sx={{ '.MuiTablePagination-toolbar': { minHeight: 40 } }}
                        />
                    </Box>
                </Paper>
            </Paper>

            {/* VIEW DIALOG */}
            <MemberView open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} member={selectedMember} />

            {/* EDIT DIALOG */}
            <MemberEditPage open={editDialogOpen} member={editMember} onClose={() => setEditDialogOpen(false)} />

            {/* DELETE DIALOG */}
            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null })}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this member?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm({ open: false, id: null })}>
                        Cancel
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* STATUS CHANGE DIALOG */}
            <Dialog
                open={statusDialog.open}
                onClose={() => setStatusDialog({ open: false, member: null })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700, textAlign: "center" }}>
                    Change Status
                </DialogTitle>

                <DialogContent sx={{ py: 3 }}>
                    <Stack spacing={2}>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleOutline />}
                            sx={{ py: 1.5, fontSize: "16px", fontWeight: "bold" }}
                            onClick={handleMarkActive}
                        >
                            Mark as Active
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<BlockIcon />}
                            sx={{ py: 1.5, fontSize: "16px", fontWeight: "bold" }}
                            onClick={handleMarkInactive}
                        >
                            Mark as Inactive
                        </Button>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setStatusDialog({ open: false, member: null })}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={filterDialogOpen}
                onClose={() => setFilterDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 0,
                        background: "#f7f9fc",
                    }
                }}
            >
                {/* HEADER */}
                <Box sx={{ p: 3, borderBottom: "1px solid #e0e6ef", bgcolor: "#fff" }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Advanced Filters
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Apply filters to refine the member list.
                    </Typography>
                </Box>

                {/* BODY */}
                <DialogContent sx={{ p: 3 }}>

                    {/* PERSONAL DETAILS CARD */}
                    <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: "1px solid #e0e6ef" }}>
                        <Typography sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
                            ⭐ Personal Details
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Member Name"
                                    size="small"
                                    fullWidth
                                    value={filters.name}
                                    onChange={(e) => handleFilterChange("name", e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start"><SearchIcon /></InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Membership No"
                                    size="small"
                                    fullWidth
                                    value={filters.membershipNumber}
                                    onChange={(e) => handleFilterChange("membershipNumber", e.target.value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Phone"
                                    size="small"
                                    fullWidth
                                    value={filters.phone}
                                    onChange={(e) => handleFilterChange("phone", e.target.value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Email"
                                    size="small"
                                    fullWidth
                                    value={filters.email}
                                    onChange={(e) => handleFilterChange("email", e.target.value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Father Name"
                                    size="small"
                                    fullWidth
                                    value={filters.fatherName}
                                    onChange={(e) => handleFilterChange("fatherName", e.target.value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Introduced By"
                                    size="small"
                                    fullWidth
                                    value={filters.introducedBy}
                                    onChange={(e) => handleFilterChange("introducedBy", e.target.value)}
                                />
                            </Grid>

                            {/* AGE RANGE */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Min Age"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={filters.minAge}
                                    onChange={(e) => handleFilterChange("minAge", e.target.value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Max Age"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={filters.maxAge}
                                    onChange={(e) => handleFilterChange("maxAge", e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* ADDRESS CARD */}
                    <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: "1px solid #e0e6ef" }}>
                        <Typography sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
                            🏠 Address Details
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="City"
                                    size="small"
                                    fullWidth
                                    value={filters.city}
                                    onChange={(e) => handleFilterChange("city", e.target.value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="State"
                                    size="small"
                                    fullWidth
                                    value={filters.state}
                                    onChange={(e) => handleFilterChange("state", e.target.value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Pincode"
                                    size="small"
                                    fullWidth
                                    value={filters.pincode}
                                    onChange={(e) => handleFilterChange("pincode", e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* OTHER FILTERS CARD */}
                    <Paper elevation={0} sx={{ p: 2.5, mb: 1, borderRadius: 2, border: "1px solid #e0e6ef" }}>
                        <Typography sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}>
                            🔎 Other Filters
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Occupation"
                                    size="small"
                                    fullWidth
                                    value={filters.occupation}
                                    onChange={(e) => handleFilterChange("occupation", e.target.value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Qualification"
                                    size="small"
                                    fullWidth
                                    value={filters.qualification}
                                    onChange={(e) => handleFilterChange("qualification", e.target.value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Caste"
                                    size="small"
                                    fullWidth
                                    value={filters.caste}
                                    onChange={(e) => handleFilterChange("caste", e.target.value)}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Religion"
                                    size="small"
                                    fullWidth
                                    value={filters.religion}
                                    onChange={(e) => handleFilterChange("religion", e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </DialogContent>

                {/* FOOTER BUTTONS - More Professional */}
                <DialogActions sx={{ p: 2.5, borderTop: "1px solid #e0e6ef", bgcolor: "#fff" }}>
                    <Button variant="outlined" color="error" onClick={() => setFilterDialogOpen(false)}>
                        Close
                    </Button>

                    <Button variant="outlined" onClick={clearAllFilters}>
                        Clear Filters
                    </Button>

                    <Button variant="contained" onClick={() => setFilterDialogOpen(false)}>
                        Apply Filters
                    </Button>
                </DialogActions>
            </Dialog>


        </Box >
    );
};

export default MemberDetailsPage;