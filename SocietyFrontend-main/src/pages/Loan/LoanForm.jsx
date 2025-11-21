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

const LoanForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { loans, memberLoans, loading, error, success } = useSelector((state) => state.loan);

    const initialFormState = {
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
    };

    const [form, setForm] = useState(initialFormState);
    const [allLoans, setAllLoans] = useState({});
    const [selectedMember, setSelectedMember] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Load all loans
    useEffect(() => {
        dispatch(getAllLoans());
    }, [dispatch]);


    useEffect(() => {
        if (!loans || loans.length === 0) return;

        const transformed = {};
        loans.forEach(loan => {
            transformed[loan.membershipNumber] = {
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

        if (JSON.stringify(transformed) !== JSON.stringify(allLoans)) {
            setAllLoans(transformed);
            localStorage.setItem("loan_pdc_app_all", JSON.stringify(transformed));
        }
    }, [loans]);


    // Handle API responses
    useEffect(() => {
        if (success) {
            setSnackbar({ open: true, message: "Loan created successfully!", severity: "success" });
            setForm(initialFormState);
            setSelectedMember("");
            dispatch(resetLoanState());
        }

        if (error) {
            setSnackbar({ open: true, message: error, severity: "error" });
        }
    }, [success, error, dispatch]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };


    const handleNext = async () => {
        if (!form.loanType) {
            return setSnackbar({ open: true, message: "Select loan type", severity: "error" });
        }

        const membershipNumber =
            form.loanType === "LAF" ? form.lafMembershipNumber : form.membershipNumber;

        if (!membershipNumber) {
            return setSnackbar({
                open: true,
                message: "Enter membership number",
                severity: "error",
            });
        }

        try {
            const loanData = {
                typeOfLoan: form.loanType,
                membershipNumber,
            };

            if (form.loanType === "Loan" || form.loanType === "LAP") {
                if (!form.loanDate || !form.loanAmount || !form.purpose) {
                    return setSnackbar({
                        open: true,
                        message: "Fill all Loan fields",
                        severity: "error",
                    });
                }
                loanData.loanDate = form.loanDate;
                loanData.loanAmount = form.loanAmount;
                loanData.purposeOfLoan = form.purpose;
            }

            if (form.loanType === "LAF") {
                if (!form.lafDate || !form.lafAmount || !form.fdrAmount || !form.fdrScheme) {
                    return setSnackbar({
                        open: true,
                        message: "Fill all LAF fields",
                        severity: "error",
                    });
                }
                loanData.lafDate = form.lafDate;
                loanData.lafAmount = form.lafAmount;
                loanData.fdrAmount = form.fdrAmount;
                loanData.fdrSchema = form.fdrScheme;
            }

            const result = await dispatch(createLoan(loanData)).unwrap();

            navigate("/pdc", {
                state: {
                    ...form,
                    loanId: result._id,
                    membershipNumber,
                },
            });

        } catch (err) {
            console.error(err);
        }
    };


    return (
        <Paper
            elevation={4}
            sx={{
                p: 4,
                maxWidth: 950,
                mx: "auto",
                mt: 4,
                borderRadius: 3,
            }}
        >
            <Typography variant="h4" textAlign="center" fontWeight="bold" mb={2}>
                LOAN DETAILS FORM
            </Typography>

            <Divider sx={{ mb: 3 }} />

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
                    value={form.loanType}
                    onChange={handleChange}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="Loan">Loan</MenuItem>
                    <MenuItem value="LAF">LAF</MenuItem>
                    <MenuItem value="LAP">LAP</MenuItem>
                </CustomTextField>

                <CustomTextField
                    select
                    label="View Member Details"
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">Select Member</MenuItem>
                    {Object.keys(allLoans).map(member => (
                        <MenuItem key={member} value={member}>{member}</MenuItem>
                    ))}
                </CustomTextField>

                <Button variant="outlined" sx={{ height: 40 }}>
                    View
                </Button>
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
                        <CustomTextField
                            name="membershipNumber"
                            value={form.membershipNumber}
                            onChange={handleChange}
                        />
                    </FormRow>

                    <FormRow number="2" label="Loan Date">
                        <CustomTextField
                            type="date"
                            name="loanDate"
                            value={form.loanDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </FormRow>

                    <FormRow number="3" label="Loan Amount">
                        <CustomTextField
                            type="number"
                            name="loanAmount"
                            value={form.loanAmount}
                            onChange={handleChange}
                        />
                    </FormRow>

                    <FormRow number="4" label="Purpose of Loan">
                        <CustomTextField
                            name="purpose"
                            value={form.purpose}
                            onChange={handleChange}
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
                        <CustomTextField
                            name="lafMembershipNumber"
                            value={form.lafMembershipNumber}
                            onChange={handleChange}
                        />
                    </FormRow>

                    <FormRow number="2" label="LAF Date">
                        <CustomTextField
                            type="date"
                            name="lafDate"
                            value={form.lafDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </FormRow>

                    <FormRow number="3" label="LAF Amount">
                        <CustomTextField
                            type="number"
                            name="lafAmount"
                            value={form.lafAmount}
                            onChange={handleChange}
                        />
                    </FormRow>

                    <FormRow number="4" label="FDR Amount">
                        <CustomTextField
                            type="number"
                            name="fdrAmount"
                            value={form.fdrAmount}
                            onChange={handleChange}
                        />
                    </FormRow>

                    <FormRow number="5" label="FDR Scheme">
                        <CustomTextField
                            name="fdrScheme"
                            value={form.fdrScheme}
                            onChange={handleChange}
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
                    Next
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
        </Paper>
    );
};

export default LoanForm;
