import React from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Divider,
    Alert,
    Chip,
    Button,
    CircularProgress,
    Grid,
    ButtonGroup,
    Paper,
    Stack
} from "@mui/material";
import {
    CheckCircle,
    Error,
    Replay,
    Visibility,
    List,
    AccountBalance,
    ReceiptLong,
    CalendarToday,
    AttachMoney,
    Person
} from "@mui/icons-material";

const ConfirmationStep = ({
    loanFormData,
    pdcDetails,
    loanId,
    onFinalSubmit,
    loading,
    error,
    success,
    onReset,
    onViewLoan,
    onViewAllLoans
}) => {
    return (
        <Card sx={{
            p: 3,
            mt: 2,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
            {success ? (
                // Success State
                <Box textAlign="center" mb={4}>
                    <CheckCircle sx={{
                        fontSize: 80,
                        color: 'success.main',
                        mb: 2,
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }} />
                    <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
                        🎉 Loan Created Successfully!
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 2, mb: 3 }}>
                        <strong>Loan ID:</strong> {loanId}
                    </Typography>
                </Box>
            ) : (
                // Pending State
                <Box textAlign="center" mb={4}>
                    <ReceiptLong sx={{
                        fontSize: 60,
                        color: 'primary.main',
                        mb: 2
                    }} />
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                        Review & Confirm
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Please verify all details before final submission
                    </Typography>
                </Box>
            )}

            <Divider sx={{ mb: 4 }} />

            {/* Error Alert */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    icon={<Error fontSize="large" />}
                >
                    <Typography fontWeight="bold">{error}</Typography>
                </Alert>
            )}

            {/* LOAN DETAILS CARD */}
            <Card sx={{ mb: 3, border: '2px solid #e0e0e0' }}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                        <AccountBalance sx={{ mr: 2, color: 'primary.main', fontSize: 30 }} />
                        <Typography variant="h5" fontWeight="bold" color="primary">
                            Loan Information
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                            <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                    <Person sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                    Loan Type
                                </Typography>
                                <Chip
                                    label={loanFormData.loanType}
                                    color="primary"
                                    variant="filled"
                                    sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                                />
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                            <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                    Membership Number
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                    {loanFormData.loanType === "LAF"
                                        ? loanFormData.lafMembershipNumber
                                        : loanFormData.membershipNumber}
                                </Typography>
                            </Stack>
                        </Grid>

                        {loanFormData.loanAmount && (
                            <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                                <Stack spacing={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        <AttachMoney sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                        Loan Amount
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold" color="green">
                                        ₹{Number(loanFormData.loanAmount).toLocaleString()}
                                    </Typography>
                                </Stack>
                            </Grid>
                        )}

                        {loanFormData.purpose && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack spacing={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Purpose of Loan
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {loanFormData.purpose}
                                    </Typography>
                                </Stack>
                            </Grid>
                        )}

                        {loanFormData.loanDate && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack spacing={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        <CalendarToday sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                        Loan Date
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {new Date(loanFormData.loanDate).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Typography>
                                </Stack>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            {pdcDetails.chequeDetails && pdcDetails.chequeDetails.length > 0 && (
                <Card sx={{ mb: 3, border: '2px solid #e0e0e0' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <ReceiptLong sx={{ mr: 2, color: 'secondary.main', fontSize: 30 }} />
                            <Typography variant="h5" fontWeight="bold" color="secondary">
                                PDC Details
                            </Typography>
                        </Box>

                        {/* PDC Summary */}
                        <Paper elevation={1} sx={{ p: 2, mb: 2, background: '#f8f9fa' }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Cheques
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold" color="primary">
                                        {pdcDetails.numberOfCheques}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Individual Cheque Details */}
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                            Cheque Breakdown
                        </Typography>
                        <Grid container spacing={2}>
                            {pdcDetails.chequeDetails.map((cheque, index) => (
                                <Grid size={{ xs: 12, md: 6 }} key={index}>
                                    <Paper elevation={1} sx={{ p: 2, borderLeft: '4px solid #2196F3' }}>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                {cheque.chequeSeries}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {cheque.bankName} - {cheque.branchName}
                                            </Typography>
                                            <Typography variant="body2">
                                                A/C: {cheque.accountNumber} | IFSC: {cheque.ifscCode}
                                            </Typography>
                                            <Typography variant="body2">
                                                Chq No: {cheque.chequeNumber} | Date: {cheque.chequeDate}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* ACTION BUTTONS */}
            {!success ? (
                <Box textAlign="center" mt={4}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={onFinalSubmit}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                        sx={{
                            px: 6,
                            py: 1.5,
                            fontSize: '1.1rem',
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                            }
                        }}
                    >
                        {loading ? "Creating Loan..." : "Confirm & Create Loan"}
                    </Button>
                </Box>
            ) : (
                <Box textAlign="center">
                    <Alert
                        severity="success"
                        sx={{ mb: 3 }}
                        icon={<CheckCircle fontSize="large" />}
                    >
                        <Typography variant="h6" fontWeight="bold">
                            ✅ Loan Successfully Created!
                        </Typography>
                        <Typography>
                            Your loan has been created with all PDC details. You can now view it in the loans list.
                        </Typography>
                    </Alert>

                    <ButtonGroup variant="outlined" sx={{ mt: 2 }} size="large">
                        <Button
                            startIcon={<Visibility />}
                            onClick={onViewLoan}
                            color="primary"
                            sx={{ px: 3 }}
                        >
                            View This Loan
                        </Button>
                        <Button
                            startIcon={<List />}
                            onClick={onViewAllLoans}
                            color="secondary"
                            sx={{ px: 3 }}
                        >
                            View All Loans
                        </Button>
                        <Button
                            startIcon={<Replay />}
                            onClick={onReset}
                            sx={{ px: 3 }}
                        >
                            Create Another
                        </Button>
                    </ButtonGroup>
                </Box>
            )}
        </Card>
    );
};

export default ConfirmationStep;