import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
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
    Tooltip,
    MenuItem,
    Select,
    FormControl
} from "@mui/material";
import { AddCircle, Delete, AccountBalance, Receipt, AttachMoney, Edit } from "@mui/icons-material";

const PDCDetails = ({ loanFormData, onPDCSubmit, bankDetails }) => {
    const [numberOfCheques, setNumberOfCheques] = useState("");
    const [startingChequeNumber, setStartingChequeNumber] = useState("");
    const [rows, setRows] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalAmount, setGlobalAmount] = useState("");
    const [globalDate, setGlobalDate] = useState("");
    const [manualMode, setManualMode] = useState(false);

    // Status options
    const statusOptions = [
        { value: "clear", label: "Clear", color: "#4caf50" },
        { value: "in_hand", label: "In Hand", color: "#2196f3" },
        { value: "cheque_return", label: "Cheque Return", color: "#f44336" },
        { value: "represent", label: "Represent", color: "#ff9800" }
    ];

    const handleGlobalAmountChange = (value) => {
        setGlobalAmount(value);
        setRows(prev => prev.map(r => ({ ...r, amount: value })));
    };

    const handleGlobalDateChange = (value) => {
        setGlobalDate(value);

        if (!value) return;

        const baseDate = new Date(value);

        const updatedRows = rows.map((row, index) => {
            let newDate = new Date(baseDate);
            newDate.setMonth(baseDate.getMonth() + index);

            // Fix overflow (28/29/30/31)
            if (newDate.getDate() !== baseDate.getDate()) {
                newDate.setDate(0);
            }

            return {
                ...row,
                chequeDate: newDate.toISOString().split("T")[0]
            };
        });

        setRows(updatedRows);
    };

    // ------------------------------
    // ✅ FUNCTION: Generate next alphanumeric cheque number
    // ------------------------------
    const generateNextChequeNumber = (cheque) => {
        const match = cheque.match(/(\D*)(\d+)/);

        if (!match) return cheque;

        const prefix = match[1];
        const numPart = match[2];

        const nextNum = String(parseInt(numPart) + 1).padStart(numPart.length, '0');

        return prefix + nextNum;
    };

    // ------------------------------
    // ✅ Generate full series
    // ------------------------------
    const generateSeries = () => {
        const total = Number(numberOfCheques);
        let currentNum = startingChequeNumber.trim();

        if (!total || total <= 0) {
            alert("Please enter a valid number of cheques");
            return;
        }

        if (!currentNum) {
            alert("Please enter valid starting cheque number");
            return;
        }

        const emptyRows = [];

        for (let i = 0; i < total; i++) {
            emptyRows.push({
                id: Date.now() + i,
                bankName: bankDetails?.bankName || "",
                branchName: bankDetails?.branchName || "",
                accountNumber: bankDetails?.accountNumber || "",
                ifscCode: bankDetails?.ifscCode || "",
                chequeNumber: currentNum,
                chequeDate: "",
                amount: "",
                status: "in_hand", // Default status
                seriesDate: new Date().toISOString().split("T")[0],
            });

            currentNum = generateNextChequeNumber(currentNum);
        }

        setRows(prev => [...prev, ...emptyRows]);
        setStartingChequeNumber("");
        setNumberOfCheques("");
        setManualMode(false);
    };

    // ------------------------------
    // ✅ Manual Entry Mode
    // ------------------------------
    const handleManualEntry = () => {
        const total = Number(numberOfCheques);

        if (!total || total <= 0) {
            alert("Please enter a valid number of cheques");
            return;
        }

        if (!startingChequeNumber) {
            alert("Please enter starting cheque number");
            return;
        }

        let currentNum = startingChequeNumber.trim();
        const emptyRows = [];

        for (let i = 0; i < total; i++) {
            emptyRows.push({
                id: Date.now() + i,
                bankName: bankDetails?.bankName || "",
                branchName: bankDetails?.branchName || "",
                accountNumber: bankDetails?.accountNumber || "",
                ifscCode: bankDetails?.ifscCode || "",
                chequeNumber: currentNum, // Pre-fill with generated numbers
                chequeDate: "",
                amount: "",
                status: "in_hand",
                seriesDate: new Date().toISOString().split("T")[0],
            });

            // Generate next number for the next row
            currentNum = generateNextChequeNumber(currentNum);
        }

        setRows(emptyRows);
        setManualMode(true);
        setStartingChequeNumber("");
        setNumberOfCheques("");
    };

    // ------------------------------
    // Update row
    // ------------------------------
    const updateRow = (id, field, value) => {
        const updated = rows.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        );
        setRows(updated);
    };

    // ------------------------------
    // Remove row
    // ------------------------------
    const removeRow = (id) => {
        const updatedRows = rows.filter(row => row.id !== id);
        setRows(updatedRows);
        setNumberOfCheques(updatedRows.length);
    };

    // ------------------------------
    // Update status for a cheque
    // ------------------------------
    const updateStatus = (id, newStatus) => {
        const updated = rows.map(row =>
            row.id === id ? { ...row, status: newStatus } : row
        );
        setRows(updated);
    };

    // ------------------------------
    // Get END number for preview
    // ------------------------------
    const getEndNumber = () => {
        if (!startingChequeNumber || !numberOfCheques) return "";

        let current = startingChequeNumber.trim();
        for (let i = 1; i < Number(numberOfCheques); i++) {
            current = generateNextChequeNumber(current);
        }
        return current;
    };

    // Convert yyyy-mm-dd → dd/mm/yyyy
    const formatToDDMMYYYY = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    };

    // ------------------------------
    // Submit Handler
    // ------------------------------
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
                status: row.status,
                seriesDate: row.seriesDate
            }))
        };

        console.log("📋 PDC Payload:", pdcPayload);
        onPDCSubmit(pdcPayload);
    };

    // ------------------------------
    // Total amount
    // ------------------------------
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

            {/* Cheque Series Generator */}
            <Card sx={{ mb: 3, p: 3, border: '2px dashed #e0e0e0' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                    <AddCircle sx={{ mr: 1 }} /> Generate Cheque Series
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Starting Cheque Number"
                            size="small"
                            value={startingChequeNumber}
                            onChange={e => setStartingChequeNumber(e.target.value)}
                            placeholder="e.g. CHQUE001"
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Number of Cheques"
                            type="number"
                            size="small"
                            value={numberOfCheques}
                            onChange={e => setNumberOfCheques(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ height: 40 }}
                            onClick={generateSeries}
                            startIcon={<AddCircle />}
                            disabled={!startingChequeNumber || !numberOfCheques}
                        >
                            Auto Generate
                        </Button>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ height: 40 }}
                            onClick={handleManualEntry}
                            startIcon={<Edit />}
                            disabled={!startingChequeNumber || !numberOfCheques}
                        >
                            Manual Entry
                        </Button>
                    </Grid>
                </Grid>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {startingChequeNumber && numberOfCheques && (
                        <> Example: {startingChequeNumber} to {getEndNumber()} </>
                    )}
                </Typography>
            </Card>

            {/* Table */}
            {rows.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                Cheque Details ({rows.length})
                                {manualMode && " - Manual Entry Mode"}
                            </Typography>
                            {rows[0]?.chequeNumber && rows[rows.length - 1]?.chequeNumber && (
                                <Typography variant="body2">
                                    Series: {rows[0]?.chequeNumber} → {rows[rows.length - 1]?.chequeNumber}
                                </Typography>
                            )}
                        </Box>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{ background: "#2196F3" }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white' }}>#</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Cheque Number</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Bank</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Branch</TableCell>
                                        <TableCell sx={{ color: 'white' }}>IFSC</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Account</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Amount</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Date</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                        <TableCell sx={{ color: 'white' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {rows.map((row, index) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{index + 1}</TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={row.chequeNumber}
                                                    onChange={e => updateRow(row.id, "chequeNumber", e.target.value)}
                                                    sx={{ width: 150 }}
                                                    placeholder="Cheque number"
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={row.bankName}
                                                    onChange={e => updateRow(row.id, "bankName", e.target.value)}
                                                    sx={{ width: 150 }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={row.branchName}
                                                    onChange={e => updateRow(row.id, "branchName", e.target.value)}
                                                    sx={{ width: 150 }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={row.ifscCode}
                                                    onChange={e => updateRow(row.id, "ifscCode", e.target.value)}
                                                    sx={{ width: 150 }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    value={row.accountNumber}
                                                    onChange={e => updateRow(row.id, "accountNumber", e.target.value)}
                                                    sx={{ width: 150 }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {manualMode ? (
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={row.amount}
                                                        onChange={e => updateRow(row.id, "amount", e.target.value)}
                                                        placeholder="Amount"
                                                        sx={{ width: 150 }}
                                                    />
                                                ) : (
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={globalAmount}
                                                        onChange={e => handleGlobalAmountChange(e.target.value)}
                                                        placeholder="Amount (same for all)"
                                                        sx={{ width: 150 }}
                                                    />
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {manualMode ? (
                                                    <TextField
                                                        size="small"
                                                        type="date"
                                                        value={row.chequeDate || ""}
                                                        onChange={e => updateRow(row.id, "chequeDate", e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                        sx={{ width: 150 }}
                                                    />
                                                ) : (
                                                    <TextField
                                                        size="small"
                                                        type="date"
                                                        value={row.chequeDate || ""}
                                                        onChange={(e) => handleGlobalDateChange(e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                        sx={{ width: 150 }}
                                                    />
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <FormControl fullWidth size="small" sx={{ width: 150 }}>
                                                    <Select
                                                        value={row.status || "in_hand"}
                                                        onChange={(e) => updateStatus(row.id, e.target.value)}
                                                        sx={{
                                                            backgroundColor: statusOptions.find(s => s.value === row.status)?.color + '15',
                                                            borderColor: statusOptions.find(s => s.value === row.status)?.color
                                                        }}
                                                    >
                                                        {statusOptions.map(status => (
                                                            <MenuItem key={status.value} value={status.value}>
                                                                <Box display="flex" alignItems="center">
                                                                    <Box
                                                                        sx={{
                                                                            width: 8,
                                                                            height: 8,
                                                                            borderRadius: '50%',
                                                                            backgroundColor: status.color,
                                                                            mr: 1
                                                                        }}
                                                                    />
                                                                    {status.label}
                                                                </Box>
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>

                                            <TableCell>
                                                <IconButton onClick={() => removeRow(row.id)} color="error">
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Summary */}
                        <Box mt={2}>
                            <Typography fontWeight="bold">Total Amount: ₹{totalAmount}</Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Submit */}
            {rows.length > 0 && (
                <Box textAlign="center" mt={4}>
                    <Button variant="contained" color="success" size="large" onClick={handleSubmit}>
                        Submit PDC Details & Continue
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default PDCDetails;