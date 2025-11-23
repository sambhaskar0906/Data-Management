import React, { useState, useEffect } from "react";
import {
    Box,
    Grid,
    Typography,
    TextField,
    MenuItem,
    Divider,
    Button,
    Alert,
    Snackbar,
    Autocomplete,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllMembers } from "../../features/member/memberSlice";

// =========================
// ⭐ Custom TextField (Memo)
// =========================
const CustomTextField = React.memo(({ name, value, onChange, ...props }) => (
    <TextField
        name={name}
        value={value}
        onChange={onChange}
        size="small"
        fullWidth
        sx={{
            background: "#fff",
            borderRadius: 1,
        }}
        {...props}
    />
));

// =========================
// ⭐ Form Row (Memo)
// =========================
const FormRow = React.memo(({ number, label, children }) => (
    <Grid
        container
        alignItems="center"
        spacing={2}
        sx={{
            py: 1.8,
            borderBottom: "1px solid #ddd",
        }}
    >
        <Grid size={{ xs: 1 }}>
            <Typography fontWeight="600">{number}</Typography>
        </Grid>

        <Grid size={{ xs: 4 }}>
            <Typography fontWeight="600">{label}</Typography>
        </Grid>

        <Grid size={{ xs: 7 }}>{children}</Grid>
    </Grid>
));

// =========================
// ⭐ Main Component
// =========================

const LoanForm = ({ onLoanDataCollected, loanFormData }) => {
    const dispatch = useDispatch();

    // Try different possible member state structures
    const members = useSelector((state) =>
        state.member?.members ||
        state.members?.members ||
        state.member?.data ||
        state.members?.data ||
        []
    );

    const [form, setForm] = useState(loanFormData || {});
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [memberSearchValue, setMemberSearchValue] = useState(null);
    const [lafMemberSearchValue, setLafMemberSearchValue] = useState(null);

    // Load all members
    useEffect(() => {
        dispatch(fetchAllMembers());
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle member selection for Loan/LAP
    const handleMemberSelect = (event, newValue) => {
        setMemberSearchValue(newValue);
        if (newValue) {
            setForm(prev => ({
                ...prev,
                membershipNumber: newValue.personalDetails?.membershipNumber || "",
                memberName: newValue.personalDetails?.nameOfMember || ""
            }));
        } else {
            setForm(prev => ({
                ...prev,
                membershipNumber: "",
                memberName: ""
            }));
        }
    };

    // Handle member selection for LAF
    const handleLafMemberSelect = (event, newValue) => {
        setLafMemberSearchValue(newValue);
        if (newValue) {
            setForm(prev => ({
                ...prev,
                lafMembershipNumber: newValue.personalDetails?.membershipNumber || "",
                lafMemberName: newValue.personalDetails?.nameOfMember || ""
            }));
        } else {
            setForm(prev => ({
                ...prev,
                lafMembershipNumber: "",
                lafMemberName: ""
            }));
        }
    };

    const handleNext = () => {
        // Validation only - NO API call
        if (!form.loanType) {
            return setSnackbar({ open: true, message: "Select loan type", severity: "error" });
        }

        const membershipNumber = form.loanType === "LAF" ? form.lafMembershipNumber : form.membershipNumber;

        if (!membershipNumber) {
            return setSnackbar({
                open: true,
                message: "Enter membership number",
                severity: "error",
            });
        }

        // Validate required fields based on loan type
        if (form.loanType === "Loan" || form.loanType === "LAP") {
            if (!form.loanDate || !form.loanAmount || !form.purpose) {
                return setSnackbar({
                    open: true,
                    message: "Fill all Loan fields",
                    severity: "error",
                });
            }
        }

        if (form.loanType === "LAF") {
            if (!form.lafDate || !form.lafAmount || !form.fdrAmount || !form.fdrScheme) {
                return setSnackbar({
                    open: true,
                    message: "Fill all LAF fields",
                    severity: "error",
                });
            }
        }

        // 🔥 Just pass data to parent - NO API call
        if (onLoanDataCollected) {
            onLoanDataCollected(form);
        }
    };

    // Safe member options
    const memberOptions = Array.isArray(members) ? members : [];

    return (
        <Box>
            <Typography variant="h5" textAlign="center" fontWeight="bold" mb={2}>
                LOAN DETAILS
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Debug info - remove in production */}
            <Alert severity="info" sx={{ mb: 2 }}>
                Members loaded: {memberOptions.length}
            </Alert>

            {/* TOP SECTION */}
            <Box
                display="flex"
                alignItems="center"
                gap={4}
                mt={2}
                sx={{ background: "#f8f9fc", p: 2, borderRadius: 2 }}
            >
                <CustomTextField
                    select
                    label="Type of Loan"
                    name="loanType"
                    value={form.loanType || ""}
                    onChange={handleChange}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="Loan">Loan</MenuItem>
                    <MenuItem value="LAF">LAF</MenuItem>
                    <MenuItem value="LAP">LAP</MenuItem>
                </CustomTextField>
            </Box>

            {/* LOAN FIELDS */}
            {(form.loanType === "Loan" || form.loanType === "LAP") && (
                <Box
                    mt={4}
                    p={3}
                    sx={{
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        background: "#f9f9f9",
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Loan Details
                    </Typography>

                    <FormRow number="1" label="Membership Number">
                        <Autocomplete
                            options={memberOptions}
                            value={memberSearchValue}
                            onChange={handleMemberSelect}
                            getOptionLabel={(option) =>
                                option?.personalDetails?.membershipNumber
                                    ? `${option.personalDetails.membershipNumber} - ${option.personalDetails.nameOfMember}`
                                    : ""
                            }
                            isOptionEqualToValue={(option, value) =>
                                option?._id === value?._id
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Search by membership number or name"
                                    sx={{ background: "#fff", borderRadius: 1 }}
                                />
                            )}
                            noOptionsText="No members found"
                        />
                    </FormRow>

                    <FormRow number="2" label="Loan Date">
                        <CustomTextField
                            type="date"
                            name="loanDate"
                            value={form.loanDate || ""}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </FormRow>

                    <FormRow number="3" label="Loan Amount">
                        <CustomTextField
                            type="number"
                            name="loanAmount"
                            value={form.loanAmount || ""}
                            onChange={handleChange}
                        />
                    </FormRow>

                    <FormRow number="4" label="Purpose of Loan">
                        <CustomTextField
                            name="purpose"
                            value={form.purpose || ""}
                            onChange={handleChange}
                            placeholder="Enter loan purpose"
                        />
                    </FormRow>
                </Box>
            )}

            {form.loanType === "LAF" && (
                <Box
                    mt={4}
                    p={3}
                    sx={{
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        background: "#f9f9f9",
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        LAF DETAILS
                    </Typography>

                    <FormRow number="1" label="LAF Member Number">
                        <Autocomplete
                            options={memberOptions}
                            value={lafMemberSearchValue}
                            onChange={handleLafMemberSelect}
                            getOptionLabel={(option) =>
                                option?.personalDetails?.membershipNumber
                                    ? `${option.personalDetails.membershipNumber} - ${option.personalDetails.nameOfMember}`
                                    : ""
                            }
                            isOptionEqualToValue={(option, value) =>
                                option?._id === value?._id
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Search by membership number or name"
                                    sx={{ background: "#fff", borderRadius: 1 }}
                                />
                            )}
                            noOptionsText="No members found"
                        />
                    </FormRow>

                    <FormRow number="2" label="LAF Date">
                        <CustomTextField
                            type="date"
                            name="lafDate"
                            value={form.lafDate || ""}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </FormRow>

                    <FormRow number="3" label="LAF Amount">
                        <CustomTextField
                            type="number"
                            name="lafAmount"
                            value={form.lafAmount || ""}
                            onChange={handleChange}
                        />
                    </FormRow>

                    <FormRow number="4" label="FDR Amount">
                        <CustomTextField
                            type="number"
                            name="fdrAmount"
                            value={form.fdrAmount || ""}
                            onChange={handleChange}
                        />
                    </FormRow>

                    <FormRow number="5" label="FDR Scheme">
                        <CustomTextField
                            name="fdrScheme"
                            value={form.fdrScheme || ""}
                            onChange={handleChange}
                            placeholder="Enter FDR scheme details"
                        />
                    </FormRow>
                </Box>
            )}

            {/* NEXT BUTTON */}
            <Box textAlign="center" mt={4}>
                <Button
                    variant="contained"
                    sx={{ px: 5, py: 1.2 }}
                    onClick={handleNext}
                >
                    Continue to PDC Details
                </Button>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LoanForm;