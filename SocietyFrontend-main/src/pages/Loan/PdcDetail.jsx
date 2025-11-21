import React, { useState, useEffect } from "react";
import { Box, Paper, TextField, Button, Typography, Divider, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const STORAGE_KEY = "loan_pdc_app_all"; // Combined storage
const PDC_KEY = "loan_pdc_app_pdc";     // Temporary PDC storage
const LOAN_KEY = "loan_pdc_app_loan";   // Loan page temp

const PDCDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [numberOfCheques, setNumberOfCheques] = useState("");
    const [rows, setRows] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem(PDC_KEY);
        if (saved) setRows(JSON.parse(saved).rows || []);

        if (location.state) localStorage.setItem(LOAN_KEY, JSON.stringify(location.state));
    }, [location.state]);

    const generateSeries = () => {
        const total = Number(numberOfCheques);
        if (!total || total <= 0) return alert("Enter number of cheques");

        const emptyRows = Array.from({ length: total }, () => ({
            bankName: "", branch: "", ifsc: "", accountNumber: "", chequeNumber: "", chequeDate: ""
        }));

        setRows(emptyRows);
        localStorage.setItem(PDC_KEY, JSON.stringify({ rows: emptyRows }));
    };

    const updateRow = (index, field, value) => {
        setRows(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            localStorage.setItem(PDC_KEY, JSON.stringify({ rows: updated }));
            return updated;
        });
    };

    const handleSubmit = () => {
        const loanData = JSON.parse(localStorage.getItem(LOAN_KEY));
        if (!loanData) return alert("Loan data not found!");
        const membership = loanData.membershipNumber;

        const savedLoans = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        savedLoans[membership] = { loan: loanData, pdc: rows };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLoans));
        alert("PDC Details Submitted Successfully!");
        navigate("/view-loan", { state: { membershipNumber: membership } });
    };

    return (
        <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" textAlign="center" fontWeight="bold" mb={2}>PDC DETAILS</Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Number of Cheques" type="number" size="small" value={numberOfCheques} onChange={e => setNumberOfCheques(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Button variant="contained" fullWidth sx={{ height: 40 }} onClick={generateSeries}>Generate Rows</Button>
                </Grid>
            </Grid>

            {rows.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                        <TableHead sx={{ background: "#f5f5f5" }}>
                            <TableRow>
                                <TableCell>S.No</TableCell>
                                <TableCell>Bank Name</TableCell>
                                <TableCell>Branch</TableCell>
                                <TableCell>IFSC</TableCell>
                                <TableCell>Account No</TableCell>
                                <TableCell>Cheque Number</TableCell>
                                <TableCell>Cheque Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((r, i) => (
                                <TableRow key={i}>
                                    <TableCell>{i + 1}</TableCell>
                                    {["bankName", "branch", "ifsc", "accountNumber", "chequeNumber"].map(field => (
                                        <TableCell key={field}>
                                            <TextField size="small" value={r[field]} onChange={e => updateRow(i, field, e.target.value)} />
                                        </TableCell>
                                    ))}
                                    <TableCell>
                                        <TextField type="date" size="small" value={r.chequeDate} onChange={e => updateRow(i, "chequeDate", e.target.value)} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Box mt={4} textAlign="center">
                <Button variant="outlined" sx={{ mr: 2 }} onClick={() => navigate("/loan")}>Back</Button>
                <Button variant="contained" color="success" onClick={handleSubmit}>Submit</Button>
            </Box>
        </Paper>
    );
};

export default PDCDetails;