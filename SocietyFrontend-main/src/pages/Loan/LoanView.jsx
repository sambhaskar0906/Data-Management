import React, { useEffect, useState } from "react";
import { Paper, Typography, Divider, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const STORAGE_KEY = "loan_pdc_app_all";

const LoanView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        let membership = location.state?.membershipNumber;
        if (!membership) membership = Object.keys(saved)[0];
        if (membership && saved[membership]) setData(saved[membership]);
    }, [location.state]);

    if (!data) return <Typography textAlign="center">No data found</Typography>;

    // Function to download PDF
    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Loan & PDC Details", 14, 20);

        doc.setFontSize(14);
        doc.text("Loan Details", 14, 30);

        // Loan Details
        let y = 36;
        Object.entries(data.loan).forEach(([key, value]) => {
            if (value) {
                doc.text(`${key.replace(/([A-Z])/g, " $1")}: ${value}`, 14, y);
                y += 6;
            }
        });

        // PDC Details
        if (data.pdc.length > 0) {
            doc.text("PDC Details", 14, y + 6);

            const pdcData = data.pdc.map((row, index) => [
                index + 1,
                row.bankName,
                row.branch,
                row.ifsc,
                row.accountNumber,
                row.chequeNumber,
                row.chequeDate
            ]);

            doc.autoTable({
                startY: y + 12,
                head: [["S.No", "Bank Name", "Branch", "IFSC", "Account No", "Cheque Number", "Cheque Date"]],
                body: pdcData,
                theme: 'grid',
                headStyles: { fillColor: [200, 200, 200] },
            });
        }

        doc.save(`Loan_PDC_${data.loan.membershipNumber}.pdf`);
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 950, mx: "auto", mt: 4 }}>
            <Typography variant="h4" textAlign="center" fontWeight="bold" mb={2}>
                VIEW LOAN & PDC DETAILS
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" fontWeight="bold" mb={1}>Loan Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
                {Object.entries(data.loan).map(([key, value]) => value && (
                    <Grid item xs={12} sm={6} key={key}>
                        <Typography><b>{key.replace(/([A-Z])/g, " $1")}: </b>{value}</Typography>
                    </Grid>
                ))}
            </Grid>

            {data.pdc.length > 0 && (
                <>
                    <Typography mt={4} mb={1} fontWeight="bold">PDC Details</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer component={Paper}>
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
                                {data.pdc.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.bankName}</TableCell>
                                        <TableCell>{row.branch}</TableCell>
                                        <TableCell>{row.ifsc}</TableCell>
                                        <TableCell>{row.accountNumber}</TableCell>
                                        <TableCell>{row.chequeNumber}</TableCell>
                                        <TableCell>{row.chequeDate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            <Box mt={4} textAlign="center" display="flex" justifyContent="center" gap={2}>
                <Button variant="outlined" onClick={() => navigate("/loan")}>Back</Button>
                <Button variant="contained" color="success" onClick={handleDownloadPDF}>Download PDF</Button>
            </Box>
        </Paper>
    );
};

export default LoanView;