import React, { useState } from "react";
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Divider,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Card,
    CardContent,
    IconButton,
    Tooltip
} from "@mui/material";
import { AddCircle, Delete, AccountBalance, Receipt, AttachMoney } from "@mui/icons-material";

const PDCDetails = ({ loanFormData, onPDCSubmit, bankDetails }) => {
    const [numberOfCheques, setNumberOfCheques] = useState("");
    const [rows, setRows] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    // Generate rows with attractive design
    const generateSeries = () => {
        const total = Number(numberOfCheques);
        if (!total || total <= 0) {
            alert("Please enter a valid number of cheques");
            return;
        }

        const emptyRows = Array.from({ length: total }, (_, index) => ({
            id: Date.now() + index,
            bankName: bankDetails?.bankName || "",
            branchName: bankDetails?.branchName || "",
            accountNumber: bankDetails?.accountNumber || "",
            ifscCode: bankDetails?.ifscCode || "",
            chequeNumber: `CHQ${String(index + 1).padStart(3, '0')}`,
            chequeDate: "",
            amount: "",
            seriesDate: new Date().toISOString().split('T')[0]
        }));

        setRows(emptyRows);
    };

    // Update row value
    const updateRow = (id, field, value) => {
        const updated = rows.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        );
        setRows(updated);
    };

    // Add new row
    const addRow = () => {
        const newRow = {
            id: Date.now(),
            bankName: bankDetails?.bankName || "",
            branchName: bankDetails?.branchName || "",
            accountNumber: bankDetails?.accountNumber || "",
            ifscCode: bankDetails?.ifscCode || "",
            chequeNumber: `CHQ${String(rows.length + 1).padStart(3, '0')}`,
            chequeDate: "",
            amount: "",
            seriesDate: new Date().toISOString().split('T')[0]
        };
        setRows([...rows, newRow]);
        setNumberOfCheques(rows.length + 1);
    };

    // Remove row
    const removeRow = (id) => {
        const updatedRows = rows.filter(row => row.id !== id);
        setRows(updatedRows);
        setNumberOfCheques(updatedRows.length);
    };

    // Auto-generate cheque numbers when rows change
    React.useEffect(() => {
        const updatedRows = rows.map((row, index) => ({
            ...row,
            chequeNumber: `CHQ${String(index + 1).padStart(3, '0')}`
        }));
        setRows(updatedRows);
    }, [rows.length]);

    // Submit handler
    const handleSubmit = () => {
        if (rows.length === 0) {
            alert("Please add at least one cheque detail");
            return;
        }

        const incomplete = rows.some(row =>
            !row.bankName ||
            !row.branchName ||
            !row.ifscCode ||
            !row.accountNumber ||
            !row.chequeNumber ||
            !row.chequeDate ||
            !row.amount
        );

        if (incomplete) {
            alert("Please fill all PDC details for each cheque");
            return;
        }

        setSubmitted(true);

        // Transform data for backend
        const pdcPayload = {
            numberOfCheques: rows.length,
            chequeDetails: rows.map(row => ({
                bankName: row.bankName,
                branchName: row.branchName,
                accountNumber: row.accountNumber,
                ifscCode: row.ifscCode,
                chequeNumber: row.chequeNumber,
                chequeDate: row.chequeDate,
                amount: row.amount,
                seriesDate: row.seriesDate
            }))
        };

        console.log("📋 PDC Payload:", pdcPayload);
        onPDCSubmit(pdcPayload);
    };

    // Calculate total amount
    const totalAmount = rows.reduce((sum, row) => {
        const amount = parseFloat(row.amount) || 0;
        return sum + amount;
    }, 0);

    return (
        <Box>
            {/* Header */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Receipt sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        PDC DETAILS
                    </Typography>
                    <Typography variant="h6">
                        Post Dated Cheque Information
                    </Typography>
                </CardContent>
            </Card>

            {submitted && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    PDC Details Submitted Successfully!
                </Alert>
            )}

            {/* Quick Generate Section */}
            <Card sx={{ mb: 3, p: 3, border: '2px dashed #e0e0e0' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                    <AddCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Quick Generate Cheques
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Number of Cheques"
                            type="number"
                            size="small"
                            value={numberOfCheques}
                            onChange={e => setNumberOfCheques(e.target.value)}
                            variant="outlined"
                            InputProps={{ inputProps: { min: 1 } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ height: 40, background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' }}
                            onClick={generateSeries}
                            startIcon={<AddCircle />}
                        >
                            Generate Cheques
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ height: 40 }}
                            onClick={addRow}
                            startIcon={<AddCircle />}
                        >
                            Add Single Cheque
                        </Button>
                    </Grid>
                </Grid>
            </Card>

            {/* Cheque Details Table */}
            {rows.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Cheque Details ({rows.length} cheques)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Fill all details for each cheque
                            </Typography>
                        </Box>

                        <TableContainer component={Paper} elevation={2}>
                            <Table>
                                <TableHead sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cheque Number</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Bank Name</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Branch</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>IFSC Code</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Account No</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount (₹)</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cheque Date</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {rows.map((row, index) => (
                                        <TableRow
                                            key={row.id}
                                            sx={{
                                                '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                                                '&:hover': { backgroundColor: '#f0f0f0' }
                                            }}
                                        >
                                            <TableCell>
                                                <Typography fontWeight="bold" color="primary">
                                                    {index + 1}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={row.chequeNumber}
                                                    onChange={e => updateRow(row.id, "chequeNumber", e.target.value)}
                                                    placeholder="CHQ001"
                                                    sx={{ minWidth: 130 }}
                                                    InputProps={{
                                                        readOnly: true,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={row.bankName}
                                                    onChange={e => updateRow(row.id, "bankName", e.target.value)}
                                                    placeholder="Bank name"
                                                    sx={{ minWidth: 130 }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={row.branchName}
                                                    onChange={e => updateRow(row.id, "branchName", e.target.value)}
                                                    placeholder="Branch name"
                                                    sx={{ minWidth: 130 }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={row.ifscCode}
                                                    onChange={e => updateRow(row.id, "ifscCode", e.target.value)}
                                                    placeholder="IFSC code"
                                                    sx={{ minWidth: 130 }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={row.accountNumber}
                                                    onChange={e => updateRow(row.id, "accountNumber", e.target.value)}
                                                    placeholder="Account number"
                                                    sx={{ minWidth: 140 }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={row.amount}
                                                    onChange={e => updateRow(row.id, "amount", e.target.value)}
                                                    placeholder="0.00"
                                                    sx={{ minWidth: 130 }}
                                                    InputProps={{
                                                        startAdornment: <AttachMoney sx={{ fontSize: 16, mr: 0.5, color: 'green' }} />,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    type="date"
                                                    size="small"
                                                    value={row.chequeDate}
                                                    onChange={e => updateRow(row.id, "chequeDate", e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{ minWidth: 130 }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Tooltip title="Remove cheque">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => removeRow(row.id)}
                                                        size="small"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Summary */}
                        <Box sx={{ mt: 2, p: 2, background: '#e3f2fd', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="primary" fontWeight="bold">
                                        Total Cheques: {rows.length}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="green" fontWeight="bold">
                                        Total Amount: ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Submit Button */}
            {rows.length > 0 && (
                <Box textAlign="center" mt={4}>
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={handleSubmit}
                        sx={{
                            px: 6,
                            py: 1.5,
                            fontSize: '1.1rem',
                            background: 'linear-gradient(45deg, #00C853 30%, #00E676 90%)',
                            boxShadow: '0 3px 5px 2px rgba(0, 200, 83, .3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #00E676 30%, #00C853 90%)',
                            }
                        }}
                    >
                        Submit PDC Details & Continue
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default PDCDetails;