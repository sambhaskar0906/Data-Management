import React, { useEffect } from "react";
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

    const selectedMember = formik.values.memberId;
    const selectedMemberData = members.find(
        (m) => m.personalDetails.membershipNumber === selectedMember
    );

    const myGuarantors = guarantorRelations?.myGuarantors || [];
    const forWhomIAmGuarantor = guarantorRelations?.forWhomIAmGuarantor || [];

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
                                            Name
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Amount of Loan
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Type of Loan
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {forWhomIAmGuarantor.map((item, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.amountOfLoan}</TableCell>
                                            <TableCell>{item.typeOfLoan}</TableCell>
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
                                            Name
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Amount of Loan
                                        </TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                                            Type of Loan
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {myGuarantors.map((item, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.amountOfLoan}</TableCell>
                                            <TableCell>{item.typeOfLoan}</TableCell>
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
            </CardContent>
        </Card>
    );
};

export default GuarantorList;