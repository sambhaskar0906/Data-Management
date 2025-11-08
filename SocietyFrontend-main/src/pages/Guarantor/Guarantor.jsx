import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Card,
    CardContent,
    Grid,
    MenuItem,
    Box,
    Button,
    IconButton,
    Alert,
    Snackbar,
    Typography,
} from "@mui/material";
import {
    PersonAdd as GuarantorIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";
import { fetchAllMembers, addGuarantor } from "../../features/member/memberSlice";

const GuarantorPage = () => {
    const dispatch = useDispatch();
    const { members, loading, error, successMessage, operationLoading } = useSelector(
        (state) => state.members
    );

    const [selectedMember, setSelectedMember] = useState("");
    const [guarantors, setGuarantors] = useState([
        {
            nameOfMember: "",
            membershipNo: "",
            amountOfLoan: "",
            typeOfLoan: "",
            ifIrregular: "",
            selectedGuarantorType: "manual", // "manual" or "member"
        },
    ]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        dispatch(fetchAllMembers());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: "success" });
        }
        if (error) {
            setSnackbar({ open: true, message: error.message || "An error occurred", severity: "error" });
        }
    }, [successMessage, error]);

    const formik = useFormik({
        initialValues: {
            nameOfMember: "",
        },
        onSubmit: (values, { resetForm }) => {
            if (!selectedMember) {
                setSnackbar({ open: true, message: "Please select a member", severity: "error" });
                return;
            }

            const payload = {
                membershipNumber: selectedMember,
                guarantors: guarantors.map((g) => ({
                    nameOfMember: g.nameOfMember,
                    membershipNo: g.membershipNo,
                    amountOfLoan: g.amountOfLoan,
                    typeOfLoan: g.typeOfLoan,
                    ifIrregular: g.ifIrregular,
                })),
            };

            dispatch(addGuarantor(payload))
                .unwrap()
                .then(() => {
                    resetForm();
                    setSelectedMember("");
                    setGuarantors([
                        {
                            nameOfMember: "",
                            membershipNo: "",
                            amountOfLoan: "",
                            typeOfLoan: "",
                            ifIrregular: "",
                            selectedGuarantorType: "manual",
                        },
                    ]);
                })
                .catch((error) => {
                    console.error("Failed to add guarantor:", error);
                });
        },
    });

    const handleMemberSelect = (event) => {
        const membershipNumber = event.target.value;
        setSelectedMember(membershipNumber);
        const selectedMemberData = members.find(
            (member) => member.personalDetails.membershipNumber === membershipNumber
        );
        if (selectedMemberData) {
            formik.setFieldValue("nameOfMember", selectedMemberData.personalDetails.nameOfMember);
        }
    };

    const validMembers = members.filter(
        (member) =>
            member.personalDetails?.nameOfMember &&
            member.personalDetails?.membershipNumber &&
            member.personalDetails.membershipNumber !== selectedMember
    );

    const handleAddGuarantor = () => {
        setGuarantors([
            ...guarantors,
            {
                nameOfMember: "",
                membershipNo: "",
                amountOfLoan: "",
                typeOfLoan: "",
                ifIrregular: "",
                selectedGuarantorType: "manual",
            },
        ]);
    };

    const handleRemoveGuarantor = (index) => {
        const updated = guarantors.filter((_, i) => i !== index);
        setGuarantors(updated);
    };

    const handleGuarantorChange = (index, field, value) => {
        const updated = [...guarantors];
        updated[index][field] = value;
        setGuarantors(updated);
    };

    const handleGuarantorTypeChange = (index, type) => {
        const updated = [...guarantors];
        updated[index].selectedGuarantorType = type;
        if (type === "manual") {
            updated[index].membershipNo = "";
        } else {
            updated[index].nameOfMember = "";
        }
        setGuarantors(updated);
    };

    const handleMemberAsGuarantorSelect = (index, membershipNumber) => {
        const updated = [...guarantors];
        updated[index].membershipNo = membershipNumber;
        const selectedGuarantorMember = members.find(
            (member) => member.personalDetails.membershipNumber === membershipNumber
        );
        if (selectedGuarantorMember) {
            updated[index].nameOfMember = selectedGuarantorMember.personalDetails.nameOfMember || "";
        }
        setGuarantors(updated);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            <CardContent sx={{ p: 4 }}>
                <SectionHeader
                    icon={<GuarantorIcon />}
                    title="Guarantor Information"
                    subtitle="Select member and fill guarantor details"
                />

                {/* Step 1: Select Member */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <StyledTextField
                            select
                            fullWidth
                            label="Select Member"
                            value={selectedMember}
                            onChange={handleMemberSelect}
                            disabled={loading}
                        >
                            <MenuItem value="">Select Member</MenuItem>
                            {validMembers.map((member) => (
                                <MenuItem key={member._id} value={member.personalDetails.membershipNumber}>
                                    {member.personalDetails.nameOfMember} - {member.personalDetails.membershipNumber}
                                </MenuItem>
                            ))}
                        </StyledTextField>
                    </Grid>
                </Grid>

                {/* Step 2: Guarantor Form */}
                {selectedMember && (
                    <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={3} sx={{ py: 3 }}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <StyledTextField
                                    fullWidth
                                    label="Name of Member"
                                    name="nameOfMember"
                                    value={formik.values.nameOfMember}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <StyledTextField
                                    fullWidth
                                    label="Membership Number"
                                    value={selectedMember}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Guarantors
                            </Typography>
                        </Box>

                        {guarantors.map((g, index) => (
                            <Box
                                key={index}
                                sx={{ mb: 3, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}
                            >
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <StyledTextField
                                            select
                                            fullWidth
                                            label="Guarantor Type"
                                            value={g.selectedGuarantorType}
                                            onChange={(e) => handleGuarantorTypeChange(index, e.target.value)}
                                        >
                                            <MenuItem value="manual">Enter Details Manually</MenuItem>
                                            <MenuItem value="member">Select from Members</MenuItem>
                                        </StyledTextField>
                                    </Grid>

                                    {g.selectedGuarantorType === "member" ? (
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <StyledTextField
                                                select
                                                fullWidth
                                                label="Select Member as Guarantor"
                                                value={g.membershipNo}
                                                onChange={(e) => handleMemberAsGuarantorSelect(index, e.target.value)}
                                                required
                                            >
                                                <MenuItem value="">Select Member</MenuItem>
                                                {validMembers.map((member) => (
                                                    <MenuItem
                                                        key={member._id}
                                                        value={member.personalDetails.membershipNumber}
                                                    >
                                                        {member.personalDetails.nameOfMember} -{" "}
                                                        {member.personalDetails.membershipNumber}
                                                    </MenuItem>
                                                ))}
                                            </StyledTextField>
                                        </Grid>
                                    ) : (
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <StyledTextField
                                                fullWidth
                                                label="Guarantor Name"
                                                value={g.nameOfMember}
                                                onChange={(e) => handleGuarantorChange(index, "nameOfMember", e.target.value)}
                                                required
                                            />
                                        </Grid>
                                    )}

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <StyledTextField
                                            fullWidth
                                            label="Membership No (if any)"
                                            value={g.membershipNo}
                                            onChange={(e) => handleGuarantorChange(index, "membershipNo", e.target.value)}
                                            required
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <StyledTextField
                                            fullWidth
                                            label="Amount of Loan"
                                            value={g.amountOfLoan}
                                            onChange={(e) => handleGuarantorChange(index, "amountOfLoan", e.target.value)}
                                            required
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <StyledTextField
                                            fullWidth
                                            label="Type of Loan"
                                            value={g.typeOfLoan}
                                            onChange={(e) => handleGuarantorChange(index, "typeOfLoan", e.target.value)}
                                            required
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <StyledTextField
                                            select
                                            fullWidth
                                            label="If Irregular"
                                            value={g.ifIrregular}
                                            onChange={(e) => handleGuarantorChange(index, "ifIrregular", e.target.value)}
                                            required
                                        >
                                            <MenuItem value="">Select</MenuItem>
                                            <MenuItem value="Yes">Yes</MenuItem>
                                            <MenuItem value="No">No</MenuItem>
                                        </StyledTextField>
                                    </Grid>

                                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
                                        {guarantors.length > 1 && (
                                            <IconButton color="error" onClick={() => handleRemoveGuarantor(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}

                        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
                            <Button
                                startIcon={<AddIcon />}
                                variant="outlined"
                                color="primary"
                                onClick={handleAddGuarantor}
                            >
                                Add Another Guarantor
                            </Button>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={operationLoading.guarantor}
                            >
                                {operationLoading.guarantor ? "Saving..." : "Save Guarantors"}
                            </Button>
                        </Box>
                    </form>
                )}

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </CardContent>
        </Card>
    );
};

export default GuarantorPage;