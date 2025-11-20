import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    MenuItem,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Tooltip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
} from "@mui/material";
import {
    VerifiedUser as GuarantorIcon,
    PictureAsPdf as PdfIcon,
    Visibility as ViewIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import SectionHeader from "../../layout/SectionHeader";
import StyledTextField from "../../ui/StyledTextField";
import { GuarantorPdf } from "./GuarantorPdf.jsx";
import {
    fetchGuarantorRelations,
    fetchAllMembers,
} from "../../features/member/memberSlice";

const GuarantorList = () => {
    const dispatch = useDispatch();
    const { members, guarantorRelations, loading } = useSelector(
        (state) => state.members
    );
    const [viewDialog, setViewDialog] = useState(false);
    const [selectedGuarantor, setSelectedGuarantor] = useState(null);

    // ✅ Load all members initially
    useEffect(() => {
        dispatch(fetchAllMembers());
    }, [dispatch]);

    const formik = useFormik({
        initialValues: {
            memberId: "",
        },
        onSubmit: () => { },
    });

    const handleMemberSelect = async (e) => {
        const membershipNumber = e.target.value;
        formik.setFieldValue("memberId", membershipNumber);
        if (membershipNumber) {
            dispatch(fetchGuarantorRelations(membershipNumber));
        }
    };

    // View Guarantor Details
    const handleViewGuarantor = (guarantor) => {
        setSelectedGuarantor(guarantor);
        setViewDialog(true);
    };

    const handleCloseDialog = () => {
        setViewDialog(false);
        setSelectedGuarantor(null);
    };

    const selectedMember = formik.values.memberId;
    const selectedMemberData = members.find(
        (m) => m.personalDetails.membershipNumber === selectedMember
    );

    const myGuarantors = guarantorRelations?.myGuarantors || [];
    const forWhomIAmGuarantor = guarantorRelations?.forWhomIAmGuarantor || [];

    // Helper function to get membership number from guarantor object
    const getMembershipNumber = (guarantor) => {
        return guarantor.membershipNumber || guarantor.membershipNo || 'N/A';
    };

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                mt: 4,
            }}
        >
            <CardContent sx={{ p: 4 }}>
                <SectionHeader
                    icon={<GuarantorIcon color="primary" />}
                    title="Guarantor Information"
                    subtitle="Select a member to view guarantor relationships"
                />

                {/* 🔹 Member Selection */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        mt: 3,
                        mb: 2,
                    }}
                >
                    <StyledTextField
                        select
                        name="memberId"
                        label="Select Member"
                        value={formik.values.memberId}
                        onChange={handleMemberSelect}
                        sx={{ width: "250px" }}
                    >
                        <MenuItem value="">Select Member</MenuItem>
                        {members.map((m) => (
                            <MenuItem
                                key={m._id}
                                value={m.personalDetails.membershipNumber}
                            >
                                {m.personalDetails.nameOfMember} (
                                {m.personalDetails.membershipNumber})
                            </MenuItem>
                        ))}
                    </StyledTextField>

                    {/* PDF Download */}
                    {selectedMember && guarantorRelations && (
                        <Tooltip title="Download PDF">
                            <IconButton
                                color="error"
                                onClick={() =>
                                    GuarantorPdf(
                                        selectedMemberData,
                                        forWhomIAmGuarantor,
                                        myGuarantors
                                    )
                                }
                            >
                                <PdfIcon fontSize="large" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* Loader */}
                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                        <CircularProgress color="primary" />
                    </Box>
                )}

                {/* 🔸 Display Tables */}
                {!loading && selectedMember && guarantorRelations && (
                    <Box mt={2}>
                        {/* Member is Guarantor For */}
                        <Typography variant="h6" color="primary" gutterBottom>
                            {selectedMemberData?.personalDetails?.nameOfMember} is Guarantor
                            For:
                        </Typography>
                        {forWhomIAmGuarantor.length > 0 ? (
                            <Table size="small" sx={{ mb: 4 }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "#1976d2" }}>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            S.No
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Membership No.
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Name
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Amount of Loan
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Type of Loan
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {forWhomIAmGuarantor.map((item, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{getMembershipNumber(item)}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>₹ {parseInt(item.amountOfLoan).toLocaleString()}</TableCell>
                                            <TableCell>{item.typeOfLoan}</TableCell>
                                            <TableCell>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleViewGuarantor(item)}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Typography variant="body2" color="text.secondary" mb={3}>
                                No records found.
                            </Typography>
                        )}

                        {/* Member Has These Guarantors */}
                        <Typography variant="h6" color="primary" gutterBottom>
                            {selectedMemberData?.personalDetails?.nameOfMember} Has These
                            Guarantors:
                        </Typography>
                        {myGuarantors.length > 0 ? (
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "#1976d2" }}>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            S.No
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Membership No.
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Name
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Amount of Loan
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Type of Loan
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {myGuarantors.map((item, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{getMembershipNumber(item)}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>₹ {parseInt(item.amountOfLoan).toLocaleString()}</TableCell>
                                            <TableCell>{item.typeOfLoan}</TableCell>
                                            <TableCell>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleViewGuarantor(item)}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No records found.
                            </Typography>
                        )}
                    </Box>
                )}

                {/* View Guarantor Details Dialog */}
                <Dialog
                    open={viewDialog}
                    onClose={handleCloseDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
                        Guarantor Details
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        {selectedGuarantor && (
                            <Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                    <Typography variant="h6" color="primary">
                                        {selectedGuarantor.name}
                                    </Typography>
                                    <Chip
                                        label={selectedGuarantor.ifIrregular === "Yes" ? "Irregular" : "Regular"}
                                        color={selectedGuarantor.ifIrregular === "Yes" ? "error" : "success"}
                                        size="small"
                                    />
                                </Box>

                                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Membership Number
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            {getMembershipNumber(selectedGuarantor)}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Loan Amount
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold" color="primary">
                                            ₹ {parseInt(selectedGuarantor.amountOfLoan).toLocaleString()}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Loan Type
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            {selectedGuarantor.typeOfLoan}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Status
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            fontWeight="bold"
                                            color={selectedGuarantor.ifIrregular === "Yes" ? "error" : "success"}
                                        >
                                            {selectedGuarantor.ifIrregular === "Yes" ? "Irregular" : "Regular"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default GuarantorList;