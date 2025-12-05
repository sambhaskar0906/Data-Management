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
    Chip
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MemberView from "./MemberView";
import MemberEditPage from "./MemberEdit.jsx";
import { generateMembersListPDF } from "./MemberDetailsPdf.jsx";
import { generateMembersExcel } from "./MemberDetailsExcel.jsx";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/Block";

import {
    fetchAllMembers,
    deleteMember,
    clearSuccessMessage,
    clearError,
    updateMemberStatus
} from "../../features/member/memberSlice";

// ------------------ Helper map & util functions ------------------
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

// ------------------ Main Component ------------------
const MemberDetailsPage = () => {
    const dispatch = useDispatch();
    const { members = [], loading, error, successMessage } = useSelector((state) => state.members || {});
    const [anchorEl, setAnchorEl] = useState(null);
    const [actionMenu, setActionMenu] = useState({ anchor: null, member: null });
    const [statusDialog, setStatusDialog] = useState({ open: false, member: null });
    const openMenu = Boolean(anchorEl);

    const closeActionMenu = () => {
        setActionMenu({ anchor: null, member: null });
    };

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

    useEffect(() => {
        dispatch(fetchAllMembers());
    }, [dispatch]);

    // Clear notifications
    useEffect(() => {
        if (successMessage) setTimeout(() => dispatch(clearSuccessMessage()), 1500);
        if (error) setTimeout(() => dispatch(clearError()), 1500);
    }, [successMessage, error, dispatch]);

    const filteredMembers = useMemo(() => {
        if (!query.trim()) return members;
        const q = query.toLowerCase();

        return members.filter((m) => {
            const name = (getValueByPath(m, "personalDetails.nameOfMember") || "").toString();
            const mno = (getValueByPath(m, "personalDetails.membershipNumber") || "").toString();
            const phone = (getValueByPath(m, "personalDetails.phoneNo1") || "").toString();
            const email = (getValueByPath(m, "personalDetails.emailId1") || "").toString();

            return (
                name.toLowerCase().includes(q) ||
                mno.toLowerCase().includes(q) ||
                phone.toLowerCase().includes(q) ||
                email.toLowerCase().includes(q)
            );
        });
    }, [query, members]);

    const paginatedMembers = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredMembers.slice(start, start + rowsPerPage);
    }, [page, rowsPerPage, filteredMembers]);

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
                                    <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700, minWidth: 140, textAlign: 'center' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {paginatedMembers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ py: 6 }}>
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
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        {/* Father Name */}
                                        <TableCell>
                                            <Typography variant="body2">
                                                {getValueByPath(m, "personalDetails.nameOfFather") || "—"}
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
                                        <TableCell>
                                            <Chip
                                                label={m.status === "active" ? "Active" : "Inactive"}
                                                color={m.status === "active" ? "success" : "error"}
                                                size="small"
                                            />
                                        </TableCell>

                                        <TableCell
                                            align="center"
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                gap: 0.5,   // space between icons
                                                flexWrap: "nowrap" // stops icons going to next line
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
                                                <IconButton onClick={(e) => setStatusDialog({ open: true, member: m })}>
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
                        {/* ACTIVE BUTTON */}
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleOutline />}
                            sx={{
                                py: 1.5,
                                fontSize: "16px",
                                fontWeight: "bold",
                                background: "green",
                            }}
                            onClick={() => {
                                dispatch(updateMemberStatus({
                                    id: member._id,
                                    status: "Active"
                                }));
                                setStatusDialog({ open: false, member: null });
                            }}
                        >
                            Mark as Active
                        </Button>

                        {/* INACTIVE BUTTON */}
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<BlockIcon />}
                            sx={{
                                py: 1.5,
                                fontSize: "16px",
                                fontWeight: "bold",
                                background: "red",
                            }}
                            onClick={() => {
                                dispatch(updateMemberStatus({
                                    id: statusDialog.member._id,
                                    status: "inactive",
                                }));
                                setStatusDialog({ open: false, member: null });
                            }}
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

        </Box>
    );
};

export default MemberDetailsPage;
