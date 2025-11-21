import React, { useState, useEffect } from "react";
import {
    Box,
    Grid,
    Typography,
    TextField,
    MenuItem,
    Paper,
    Divider,
    Button,
    Alert,
    Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    createLoan,
    getAllLoans,
    getLoansByMemberId,
    resetLoanState,
} from "../../features/loan/loanSlice";

const LoanForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux state
    const { loans, memberLoans, loading, error, success } = useSelector((state) => state.loan);

    const [form, setForm] = useState({
        loanType: "",
        membershipNumber: "",
        loanDate: "",
        loanAmount: "",
        purpose: "",
        lafMembershipNumber: "",
        lafDate: "",
        lafAmount: "",
        fdrAmount: "",
        fdrScheme: "",
    });

    const [allLoans, setAllLoans] = useState({});
    const [selectedMember, setSelectedMember] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Load all loans on component mount
    useEffect(() => {
        dispatch(getAllLoans());
    }, [dispatch]);

    // Transform Redux loans data for local storage
    useEffect(() => {
        if (loans && loans.length > 0) {
            const transformedLoans = {};
            loans.forEach(loan => {
                transformedLoans[loan.membershipNumber] = {
                    loan: {
                        loanType: loan.typeOfLoan,
                        membershipNumber: loan.membershipNumber,
                        loanDate: loan.loanDate,
                        loanAmount: loan.loanAmount,
                        purpose: loan.purposeOfLoan,
                        lafDate: loan.lafDate,
                        fdrAmount: loan.fdrAmount,
                        fdrScheme: loan.fdrSchema,
                    },
                    pdc: loan.pdcDetails || []
                };
            });
            setAllLoans(transformedLoans);
            localStorage.setItem("loan_pdc_app_all", JSON.stringify(transformedLoans));
        }
    }, [loans]);

    // Handle success/error messages
    useEffect(() => {
        if (success) {
            setSnackbar({
                open: true,
                message: "Loan created successfully!",
                severity: "success"
            });
            dispatch(resetLoanState());
        }

        if (error) {
            setSnackbar({
                open: true,
                message: error,
                severity: "error"
            });
        }
    }, [success, error, dispatch]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const FormRow = ({ number, label, children }) => (
        <Grid container alignItems="center" spacing={2} sx={{ py: 1, borderBottom: "1px solid #e0e0e0" }}>
            <Grid item xs={1.2}><Typography fontWeight={600}>{number}</Typography></Grid>
            <Grid item xs={4}><Typography fontWeight={600}>{label}</Typography></Grid>
            <Grid item xs={6.8}>{children}</Grid>
        </Grid>
    );

    const handleNext = async () => {
        // Validate form based on loan type
        if (!form.loanType) {
            setSnackbar({
                open: true,
                message: "Please select loan type",
                severity: "error"
            });
            return;
        }

        const membershipNumber = form.loanType === "LAF" ? form.lafMembershipNumber : form.membershipNumber;

        if (!membershipNumber) {
            const fieldName = form.loanType === "LAF" ? "LAF membership number" : "membership number";
            setSnackbar({
                open: true,
                message: `Please enter ${fieldName}`,
                severity: "error"
            });
            return;
        }

        try {
            // ✅✅✅ CORRECTED: Prepare loan data WITHOUT memberId
            const loanData = {
                typeOfLoan: form.loanType,
                membershipNumber: membershipNumber,
                // ❌❌❌ NO memberId HERE!
            };

            // Add fields based on loan type
            if (form.loanType === "Loan" || form.loanType === "LAP") {
                if (!form.loanDate || !form.loanAmount || !form.purpose) {
                    setSnackbar({
                        open: true,
                        message: "Please fill all required fields for Loan/LAP",
                        severity: "error"
                    });
                    return;
                }
                loanData.loanDate = form.loanDate;
                loanData.loanAmount = form.loanAmount;
                loanData.purposeOfLoan = form.purpose;
            }

            if (form.loanType === "LAF") {
                if (!form.lafDate || !form.lafAmount || !form.fdrAmount || !form.fdrScheme) {
                    setSnackbar({
                        open: true,
                        message: "Please fill all required fields for LAF",
                        severity: "error"
                    });
                    return;
                }
                loanData.lafDate = form.lafDate;
                loanData.lafAmount = form.lafAmount;
                loanData.fdrAmount = form.fdrAmount;
                loanData.fdrSchema = form.fdrScheme;
            }

            console.log("📤 Sending to API:", loanData);

            // Create loan via API
            const result = await dispatch(createLoan(loanData)).unwrap();

            // Save to local storage as backup
            const updatedLoans = {
                ...allLoans,
                [membershipNumber]: {
                    loan: form,
                    pdc: []
                }
            };
            localStorage.setItem("loan_pdc_app_all", JSON.stringify(updatedLoans));

            // Navigate to PDC page with loan data
            navigate("/pdc", {
                state: {
                    ...form,
                    loanId: result._id,
                    membershipNumber: membershipNumber
                }
            });

        } catch (error) {
            console.error("Failed to create loan:", error);
        }
    };

    const handleView = () => {
        if (!selectedMember) {
            setSnackbar({
                open: true,
                message: "Select a member to view details.",
                severity: "warning"
            });
            return;
        }

        dispatch(getLoansByMemberId(selectedMember));
        navigate("/view-loan", { state: { membershipNumber: selectedMember } });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 950, mx: "auto", mt: 4 }}>
            <Typography variant="h4" textAlign="center" fontWeight="bold" mb={2}>
                LOAN DETAILS FORM
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Loan Type and Member Selection */}
            <Box display="flex" alignItems="center" gap={4} mt={3}>
                <TextField
                    select
                    size="small"
                    label="Type of Loan"
                    name="loanType"
                    value={form.loanType}
                    onChange={handleChange}
                    sx={{ minWidth: 180 }}
                    disabled={loading}
                >
                    <MenuItem value="Loan">Loan</MenuItem>
                    <MenuItem value="LAF">LAF</MenuItem>
                    <MenuItem value="LAP">LAP</MenuItem>
                </TextField>

                <TextField
                    select
                    size="small"
                    label="View Member Details"
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    sx={{ minWidth: 200 }}
                    disabled={loading}
                >
                    <MenuItem value="">Select Member</MenuItem>
                    {Object.keys(allLoans).map((member) => (
                        <MenuItem key={member} value={member}>{member}</MenuItem>
                    ))}
                </TextField>

                <Button
                    variant="outlined"
                    onClick={handleView}
                    sx={{ height: 40 }}
                    disabled={loading}
                >
                    View
                </Button>
            </Box>

            {/* Rest of your form UI remains same */}
            {(form.loanType === "Loan" || form.loanType === "LAP") && (
                <>
                    <FormRow number="1" label="Membership Number">
                        <TextField
                            size="small"
                            fullWidth
                            name="membershipNumber"
                            value={form.membershipNumber}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </FormRow>
                    <FormRow number="2" label="Loan Date">
                        <TextField
                            type="date"
                            size="small"
                            fullWidth
                            name="loanDate"
                            value={form.loanDate}
                            onChange={handleChange}
                            disabled={loading}
                            InputLabelProps={{ shrink: true }}
                        />
                    </FormRow>
                    <FormRow number="3" label="Loan Amount">
                        <TextField
                            type="number"
                            size="small"
                            fullWidth
                            name="loanAmount"
                            value={form.loanAmount}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </FormRow>
                    <FormRow number="4" label="Purpose">
                        <TextField
                            size="small"
                            fullWidth
                            name="purpose"
                            value={form.purpose}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </FormRow>
                </>
            )}

            {form.loanType === "LAF" && (
                <>
                    <Typography mt={3} mb={1} fontWeight="bold">LAF DETAILS</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <FormRow number="1" label="LAF Member No">
                        <TextField
                            size="small"
                            fullWidth
                            name="lafMembershipNumber"
                            value={form.lafMembershipNumber}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </FormRow>
                    <FormRow number="2" label="LAF Date">
                        <TextField
                            type="date"
                            size="small"
                            fullWidth
                            name="lafDate"
                            value={form.lafDate}
                            onChange={handleChange}
                            disabled={loading}
                            InputLabelProps={{ shrink: true }}
                        />
                    </FormRow>
                    <FormRow number="3" label="LAF Amount">
                        <TextField
                            type="number"
                            size="small"
                            fullWidth
                            name="lafAmount"
                            value={form.lafAmount}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </FormRow>
                    <FormRow number="4" label="FDR Amount">
                        <TextField
                            type="number"
                            fullWidth
                            size="small"
                            name="fdrAmount"
                            value={form.fdrAmount}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </FormRow>
                    <FormRow number="5" label="FDR Scheme">
                        <TextField
                            fullWidth
                            size="small"
                            name="fdrScheme"
                            value={form.fdrScheme}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </FormRow>
                </>
            )}

            <Box textAlign="center" mt={4} display="flex" justifyContent="center" alignItems="center" gap={2}>
                <Button
                    variant="contained"
                    sx={{ px: 5, py: 1.3 }}
                    onClick={handleNext}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Next"}
                </Button>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default LoanForm;