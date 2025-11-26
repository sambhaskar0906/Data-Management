import React, { useEffect, useState } from "react";
import {
    Paper,
    Typography,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Chip,
    Tooltip,
    Tabs,
    Tab,
    Alert,
    CircularProgress
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Download, ArrowBack, Add } from "@mui/icons-material";

// Import Redux actions
import {
    getAllLoans,
    getLoansByMemberId,
    resetLoanState
} from "../../features/loan/loanSlice";

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const LoanView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Redux state
    const {
        loans,
        memberLoans,
        loading,
        error,
        success
    } = useSelector((state) => state.loan);

    const [selectedMember, setSelectedMember] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [allMembers, setAllMembers] = useState([]);
    const [selectedLoanData, setSelectedLoanData] = useState(null);

    // Fetch all loans on component mount
    useEffect(() => {
        dispatch(getAllLoans());
    }, [dispatch]);

    // Extract unique members from loans data based on your API structure
    useEffect(() => {
        if (loans && loans.length > 0) {
            console.log("Loans data:", loans); // Debug log

            const uniqueMembers = {};
            loans.forEach(loan => {
                const membershipNumber = loan.membershipNumber;

                if (membershipNumber && !uniqueMembers[membershipNumber]) {
                    // Handle both cases where memberId might be null or have personalDetails
                    let memberName = "Unknown Member";
                    let memberId = null;

                    if (loan.memberId && loan.memberId.personalDetails) {
                        memberName = loan.memberId.personalDetails.nameOfMember;
                        memberId = loan.memberId._id;
                    } else if (loan.memberId) {
                        memberName = "Member (Details Missing)";
                        memberId = loan.memberId._id;
                    } else {
                        memberName = "External Member";
                    }

                    uniqueMembers[membershipNumber] = {
                        memberId: memberId || membershipNumber, // Use membershipNumber as fallback ID
                        membershipNumber: membershipNumber,
                        name: memberName
                    };
                }
            });

            const membersArray = Object.values(uniqueMembers);
            console.log("Extracted members:", membersArray); // Debug log
            setAllMembers(membersArray);

            // Set initial selected member
            let initialMembershipNumber = location.state?.membershipNumber;
            if (!initialMembershipNumber && membersArray.length > 0) {
                initialMembershipNumber = membersArray[0].membershipNumber;
            }

            if (initialMembershipNumber) {
                setSelectedMember(initialMembershipNumber);
                // For your API, we'll filter locally since we already have all loans
                filterLoansByMember(initialMembershipNumber);
            }
        }
    }, [loans, location.state]);

    // Filter loans by membership number (since we already have all loans)
    const filterLoansByMember = (membershipNumber) => {
        if (!loans || loans.length === 0) return;

        const memberLoans = loans.filter(loan =>
            loan.membershipNumber === membershipNumber
        );

        console.log("Filtered loans for member:", membershipNumber, memberLoans); // Debug log

        if (memberLoans.length > 0) {
            const pdcData = extractPDCFromLoans(memberLoans);
            console.log("📋 Extracted PDC Data for member:", pdcData); // Debug log

            setSelectedLoanData({
                loans: memberLoans,
                pdc: pdcData
            });
        } else {
            setSelectedLoanData(null);
        }
    };

    // Handle member selection change
    const handleMemberChange = (event) => {
        const membershipNumber = event.target.value;
        setSelectedMember(membershipNumber);
        filterLoansByMember(membershipNumber);
    };

    // Extract PDC data from loans based on your API structure
    const extractPDCFromLoans = (loans) => {
        const allPDC = [];

        loans.forEach(loan => {
            console.log(`🔍 Checking loan ${loan._id} for PDC:`, loan.pdcDetails); // Debug log

            if (loan.pdcDetails && loan.pdcDetails.length > 0) {
                // Check each PDC item for actual data
                loan.pdcDetails.forEach((pdcItem, pdcIndex) => {
                    console.log(`📄 PDC Item ${pdcIndex}:`, pdcItem); // Debug log

                    // Check if PDC item has any meaningful data
                    const hasData =
                        pdcItem.bankName && pdcItem.bankName.trim() !== '' ||
                        pdcItem.branchName && pdcItem.branchName.trim() !== '' ||
                        pdcItem.accountNumber && pdcItem.accountNumber.trim() !== '' ||
                        pdcItem.ifscCode && pdcItem.ifscCode.trim() !== '' ||
                        pdcItem.chequeSeries && pdcItem.chequeSeries.trim() !== '';

                    if (hasData) {
                        const pdcData = {
                            bankName: pdcItem.bankName || '',
                            branchName: pdcItem.branchName || '',
                            accountNumber: pdcItem.accountNumber || '',
                            ifscCode: pdcItem.ifscCode || '',
                            chequeSeries: pdcItem.chequeSeries || '',
                            seriesDate: pdcItem.seriesDate || '',
                            numberOfCheques: pdcItem.numberOfCheques || 1,
                            loanId: loan._id,
                            loanType: loan.typeOfLoan,
                            // Add these for PDF compatibility
                            branch: pdcItem.branchName || '', // For PDF
                            ifsc: pdcItem.ifscCode || '', // For PDF
                            chequeNumber: pdcItem.chequeSeries || '', // For PDF
                            chequeDate: pdcItem.seriesDate || '' // For PDF
                        };
                        allPDC.push(pdcData);
                        console.log("✅ Added PDC data:", pdcData); // Debug log
                    } else {
                        console.log("❌ Skipping empty PDC item:", pdcItem); // Debug log
                    }
                });
            } else {
                console.log("❌ No PDC details found in loan:", loan._id); // Debug log
            }
        });

        console.log("📋 Final Extracted PDC Data:", allPDC); // Debug log
        return allPDC;
    };

    // Add debug effect to monitor selectedLoanData changes
    useEffect(() => {
        if (selectedLoanData) {
            console.log("🎯 Selected Loan Data Updated:", selectedLoanData);
            console.log("📊 Loans count:", selectedLoanData.loans?.length);
            console.log("🧾 PDC count:", selectedLoanData.pdc?.length);

            // Debug individual loans
            selectedLoanData.loans?.forEach((loan, index) => {
                console.log(`Loan ${index + 1} PDC:`, loan.pdcDetails);
            });
        }
    }, [selectedLoanData]);

    const handleAddNewLoan = () => {
        navigate("/loan", {
            state: {
                prefillMembershipNumber: selectedMember || undefined
            }
        });
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Get loan details for table in structured format based on your API
    const getLoanTableData = () => {
        if (!selectedLoanData || !selectedLoanData.loans) return [];

        return selectedLoanData.loans.map((loan, index) => {
            // Determine loan-specific fields based on loan type
            const isLAF = loan.typeOfLoan === "LAF";
            const date = isLAF ? loan.lafDate : loan.loanDate;
            const amount = isLAF ? loan.fdrAmount : loan.loanAmount;
            const purpose = isLAF ? "Loan Against FDR" : loan.purposeOfLoan;

            return {
                sno: index + 1,
                id: loan._id,
                loanType: loan.typeOfLoan,
                membershipNumber: loan.membershipNumber,
                memberName: loan.memberId?.personalDetails?.nameOfMember || "External Member",
                amount: amount,
                date: date,
                purpose: purpose,
                fdrAmount: loan.fdrAmount,
                fdrScheme: loan.fdrSchema,
                status: "Active" // You might want to add status field to your API
            };
        });
    };

    // Function to download Loan PDF only
    const handleDownloadLoanPDF = () => {
        if (!selectedLoanData) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(63, 81, 181);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("LOAN DETAILS", pageWidth / 2, 18, { align: "center" });

        // Member Information
        const firstLoan = selectedLoanData.loans[0];
        const memberName = firstLoan.memberId?.personalDetails?.nameOfMember || "External Member";

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Member: ${firstLoan.membershipNumber} - ${memberName}`, 14, 40);
        doc.text(`Total Loans: ${selectedLoanData.loans.length}`, 14, 47);

        // Create loan details table for PDF - FIXED VERSION
        const loanTableData = getLoanTableData();

        // Check if we have data to display
        if (loanTableData.length === 0) {
            doc.text("No loan data available", 14, 60);
            doc.save(`Loan_Details_${firstLoan.membershipNumber}_${new Date().getTime()}.pdf`);
            return;
        }

        // Prepare table data - ensure all values are strings
        const loanData = loanTableData.map((row) => [
            row.sno.toString(),
            row.loanType || 'N/A',
            row.membershipNumber || 'N/A',
            row.amount ? `₹${Number(row.amount).toLocaleString('en-IN')}` : 'N/A',
            row.date ? new Date(row.date).toLocaleDateString('en-IN') : 'N/A',
            row.purpose || 'N/A',
            row.fdrAmount ? `₹${Number(row.fdrAmount).toLocaleString('en-IN')}` : 'N/A',
            row.fdrScheme || 'N/A'
        ]);

        // Define table headers
        const headers = [
            { content: 'S.No', styles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' } },
            { content: 'Loan Type', styles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' } },
            { content: 'Membership No', styles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' } },
            { content: 'Amount', styles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' } },
            { content: 'Date', styles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' } },
            { content: 'Purpose', styles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' } },
            { content: 'FDR Amount', styles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' } },
            { content: 'FDR Scheme', styles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' } }
        ];

        try {
            doc.autoTable({
                startY: 55,
                head: [headers.map(header => header.content)],
                body: loanData,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    overflow: 'linebreak',
                    cellWidth: 'wrap'
                },
                headStyles: {
                    fillColor: [63, 81, 181],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 55 },
                tableWidth: 'auto',
                columnStyles: {
                    0: { cellWidth: 15 }, // S.No
                    1: { cellWidth: 25 }, // Loan Type
                    2: { cellWidth: 30 }, // Membership No
                    3: { cellWidth: 25 }, // Amount
                    4: { cellWidth: 25 }, // Date
                    5: { cellWidth: 40 }, // Purpose
                    6: { cellWidth: 25 }, // FDR Amount
                    7: { cellWidth: 30 }  // FDR Scheme
                }
            });
        } catch (error) {
            console.error("PDF generation error:", error);
            doc.text("Error generating PDF", 14, 60);
        }

        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: "center" }
            );
        }

        doc.save(`Loan_Details_${firstLoan.membershipNumber}_${new Date().getTime()}.pdf`);
    };

    // Function to download PDC PDF only
    const handleDownloadPDCPDF = () => {
        if (!selectedLoanData || !selectedLoanData.pdc || selectedLoanData.pdc.length === 0) {
            alert("No PDC data available to download");
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(156, 39, 176);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("PDC DETAILS", pageWidth / 2, 18, { align: "center" });

        // Member Information
        const firstLoan = selectedLoanData.loans[0];
        const memberName = firstLoan.memberId?.personalDetails?.nameOfMember || "External Member";

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Member: ${firstLoan.membershipNumber} - ${memberName}`, 14, 40);
        doc.text(`Total Cheques: ${selectedLoanData.pdc.length}`, 14, 47);

        // Prepare PDC data - ensure all values are strings
        const pdcData = selectedLoanData.pdc.map((row, index) => [
            (index + 1).toString(),
            row.bankName || 'N/A',
            row.ifscCode || 'N/A',
            row.accountNumber || 'N/A',
            row.chequeSeries || 'N/A',
            row.seriesDate ? new Date(row.seriesDate).toLocaleDateString('en-IN') : 'N/A',
            row.numberOfCheques?.toString() || '1',
            row.loanType || 'N/A'
        ]);

        try {
            doc.autoTable({
                startY: 55,
                head: [[
                    'S.No',
                    'Bank Name',
                    'IFSC Code',
                    'Account No',
                    'Cheque Series',
                    'Series Date',
                    'No. of Cheques',
                    'Loan Type'
                ]],
                body: pdcData,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    overflow: 'linebreak',
                    cellWidth: 'wrap'
                },
                headStyles: {
                    fillColor: [156, 39, 176],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 55 },
                tableWidth: 'auto',
                columnStyles: {
                    0: { cellWidth: 12 }, // S.No
                    1: { cellWidth: 25 }, // Bank Name
                    2: { cellWidth: 25 }, // Branch Name
                    3: { cellWidth: 25 }, // IFSC Code
                    4: { cellWidth: 30 }, // Account No
                    5: { cellWidth: 25 }, // Cheque Series
                    6: { cellWidth: 20 }, // Series Date
                    7: { cellWidth: 15 }, // No. of Cheques
                    8: { cellWidth: 20 }  // Loan Type
                }
            });
        } catch (error) {
            console.error("PDC PDF generation error:", error);
            doc.text("Error generating PDC PDF", 14, 60);
        }

        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: "center" }
            );
        }

        doc.save(`PDC_Details_${firstLoan.membershipNumber}_${new Date().getTime()}.pdf`);
    };

    const loanTableData = getLoanTableData();
    const hasPDC = selectedLoanData?.pdc && selectedLoanData.pdc.length > 0;

    // Show loading state
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading loan data...
                </Typography>
            </Box>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 1400, mx: "auto", mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    VIEW LOAN & PDC DETAILS
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Comprehensive view of loan information and post-dated cheques
                </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(resetLoanState())}>
                    {error}
                </Alert>
            )}

            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Debug: {loans?.length || 0} loans loaded, {allMembers.length} members found, PDC: {hasPDC ? `${selectedLoanData?.pdc?.length} items` : 'None'}
                </Alert>
            )}

            {/* Member Selection and Actions */}
            <Box sx={{ mb: 4, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <FormControl sx={{ minWidth: 300 }} size="small">
                    <InputLabel id="member-select-label">Select Member</InputLabel>
                    <Select
                        labelId="member-select-label"
                        value={selectedMember}
                        label="Select Member"
                        onChange={handleMemberChange}
                        disabled={allMembers.length === 0}
                    >
                        {allMembers.map((member) => (
                            <MenuItem key={member.membershipNumber} value={member.membershipNumber}>
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                        {member.membershipNumber}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {member.name}
                                    </Typography>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Tooltip title="Add new loan for selected member">
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddNewLoan}
                        sx={{ minWidth: 160 }}

                    >
                        Add New Loan
                    </Button>
                </Tooltip>
            </Box>

            {!selectedLoanData || loanTableData.length === 0 ? (
                <Card sx={{ textAlign: "center", py: 6, bgcolor: 'grey.50' }}>
                    <CardContent>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Loan Data Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {selectedMember
                                ? "No loan information available for the selected member"
                                : allMembers.length === 0
                                    ? "No loan data available. Please create some loans first."
                                    : "Please select a member to view loan details"
                            }
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Tabs for Loan and PDC */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs
                                    value={activeTab}
                                    onChange={handleTabChange}
                                    sx={{
                                        '& .MuiTab-root': {
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            textTransform: 'none',
                                            minHeight: 60
                                        }
                                    }}
                                >
                                    <Tab
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography fontWeight="bold">Loan Details</Typography>
                                                <Chip
                                                    label={loanTableData.length}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </Box>
                                        }
                                    />
                                    <Tab
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography fontWeight="bold">PDC Details</Typography>
                                                {hasPDC && (
                                                    <Chip
                                                        label={selectedLoanData.pdc.length}
                                                        color="secondary"
                                                        size="small"
                                                    />
                                                )}
                                            </Box>
                                        }
                                        disabled={!hasPDC}
                                    />
                                </Tabs>
                            </Box>

                            {/* Loan Details Tab Panel */}
                            <TabPanel value={activeTab} index={0}>
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Tooltip title="Download Loan Details PDF">
                                        <Button
                                            variant="contained"
                                            startIcon={<Download />}
                                            onClick={handleDownloadLoanPDF}
                                            size="small"
                                        >
                                            Download Loan PDF
                                        </Button>
                                    </Tooltip>
                                </Box>
                                <TableContainer>
                                    <Table sx={{ minWidth: 1000 }}>
                                        <TableHead sx={{ bgcolor: 'primary.main' }}>
                                            <TableRow>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 80 }}>S.No</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Loan Type</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Membership No</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Member Name</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Purpose</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>FDR Amount</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>FDR Scheme</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {loanTableData.map((row) => (
                                                <TableRow
                                                    key={row.id}
                                                    sx={{
                                                        '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                                                        '&:last-child td, &:last-child th': { border: 0 }
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="medium" color="primary">
                                                            {row.sno}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={row.loanType || 'N/A'}
                                                            color={row.loanType === 'LAF' ? 'secondary' : 'primary'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontFamily="monospace" fontWeight="medium">
                                                            {row.membershipNumber || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {row.memberName}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="bold" color="success.dark" fontFamily="monospace">
                                                            {row.amount ? `₹${Number(row.amount).toLocaleString('en-IN')}` : 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {row.date ? new Date(row.date).toLocaleDateString('en-IN') : 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                                            {row.purpose || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontFamily="monospace">
                                                            {row.fdrAmount ? `₹${Number(row.fdrAmount).toLocaleString('en-IN')}` : 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {row.fdrScheme || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </TabPanel>

                            {/* PDC Details Tab Panel */}
                            <TabPanel value={activeTab} index={1}>
                                {hasPDC ? (
                                    <>
                                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Tooltip title="Download PDC Details PDF">
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    startIcon={<Download />}
                                                    onClick={handleDownloadPDCPDF}
                                                    size="small"
                                                >
                                                    Download PDC PDF
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                        <TableContainer>
                                            <Table sx={{ minWidth: 1000 }}>
                                                <TableHead sx={{ bgcolor: 'secondary.main' }}>
                                                    <TableRow>
                                                        <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 80 }}>S.No</TableCell>
                                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Bank Name</TableCell>
                                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Branch Name</TableCell>
                                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>IFSC Code</TableCell>
                                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Account No</TableCell>
                                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cheque Series</TableCell>
                                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Series Date</TableCell>
                                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>No. of Cheques</TableCell>
                                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Loan Type</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {selectedLoanData.pdc.map((pdc, index) => (
                                                        <TableRow
                                                            key={index}
                                                            sx={{
                                                                '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                                                                '&:last-child td, &:last-child th': { border: 0 }
                                                            }}
                                                        >
                                                            <TableCell>
                                                                <Typography variant="body2" fontWeight="medium" color="primary">
                                                                    {index + 1}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {pdc.bankName || 'N/A'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {pdc.branchName || 'N/A'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" fontFamily="monospace">
                                                                    {pdc.ifscCode || 'N/A'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" fontFamily="monospace">
                                                                    {pdc.accountNumber || 'N/A'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" fontWeight="bold" color="secondary">
                                                                    {pdc.chequeSeries || 'N/A'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {pdc.seriesDate ? new Date(pdc.seriesDate).toLocaleDateString('en-IN') : 'N/A'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={pdc.numberOfCheques || 1}
                                                                    color="primary"
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={pdc.loanType || 'N/A'}
                                                                    color={pdc.loanType === 'LAF' ? 'secondary' : 'primary'}
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 6 }}>
                                        <Typography variant="h6" color="text.secondary">
                                            No PDC Details Available
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            There are no post-dated cheques for these loans.
                                        </Typography>
                                    </Box>
                                )}
                            </TabPanel>
                        </CardContent>
                    </Card>
                </>
            )}
        </Paper>
    );
};

export default LoanView;