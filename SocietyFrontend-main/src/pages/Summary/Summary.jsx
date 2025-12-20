import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    Paper,
    TableContainer,
    Typography,
    Box,
    Grid,
    Card,
    CardActionArea,
    CardContent,
    Collapse,
    Button,
    Menu,
    MenuItem,
    Divider,
    CircularProgress
} from "@mui/material";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    TablePagination
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { fetchMemberYearSummary } from "../../features/member/memberSlice";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ThreeSummaryTables() {
    const dispatch = useDispatch();

    const {
        memberYearStats,
        professionalSummaryYearwise
    } = useSelector((state) => state.members.memberYearSummary);

    const loading = useSelector((state) => state.members.loading);

    const [openTable, setOpenTable] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentTable, setCurrentTable] = useState(null);

    const [selectedYear, setSelectedYear] = useState(null);
    const [yearDetails, setYearDetails] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const openMenu = Boolean(anchorEl);

    /* ============================
       FETCH SUMMARY ON LOAD
    ============================ */
    useEffect(() => {
        dispatch(fetchMemberYearSummary());
    }, [dispatch]);

    const toggleTable = (key) => {
        setOpenTable(openTable === key ? null : key);
        setSelectedYear(null);
        setYearDetails(null);
    };

    const handleMenuClick = (event, tableKey) => {
        setAnchorEl(event.currentTarget);
        setCurrentTable(tableKey);
    };

    const handleMenuClose = () => setAnchorEl(null);

    /* ============================
       YEAR CLICK → DETAIL
    ============================ */
    const handleYearClick = (year) => {
        const detail = professionalSummaryYearwise.find(
            (item) => item.year === year
        );
        setSelectedYear(year);
        setYearDetails(detail || null);
    };

    /* ============================
       EXPORT FUNCTIONS
    ============================ */
    const downloadPDF = (title, rows) => {
        const doc = new jsPDF();
        doc.text(title, 14, 20);

        autoTable(doc, {
            head: [["Year", "Opening", "Joined", "Resigned", "Balance"]],
            body: rows.map((r) => [
                r.year,
                r.opening,
                r.joined,
                r.resigned,
                r.balance
            ]),
            startY: 30
        });

        doc.save(`${title}.pdf`);
        handleMenuClose();
    };

    const downloadExcel = (title, rows) => {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, title);
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        saveAs(new Blob([excelBuffer]), `${title}.xlsx`);
        handleMenuClose();
    };

    const downloadYearDetailPDF = () => {
        if (!selectedYear || !yearDetails) return;

        const doc = new jsPDF();
        doc.text(`Profession Details - ${selectedYear}`, 14, 20);

        autoTable(doc, {
            head: [["Profession", "Count"]],
            body: Object.entries(yearDetails)
                .filter(([key]) => key !== "year")
                .map(([profession, count]) => [profession, count]),
            startY: 30
        });

        doc.save(`Profession_Details_${selectedYear}.pdf`);
    };


    /* ============================
       TABLE RENDER
    ============================ */
    const renderTable = (title, rows, key) => {
        const paginatedRows = rows.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
        return (
            <Box mt={3}>
                <Button
                    variant="contained"
                    sx={{ mb: 2 }}
                    onClick={(e) => handleMenuClick(e, key)}
                >
                    Download
                </Button>

                <Menu
                    anchorEl={anchorEl}
                    open={openMenu && currentTable === key}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => downloadPDF(title, rows)}>
                        Download PDF
                    </MenuItem>
                    <MenuItem onClick={() => downloadExcel(title, rows)}>
                        Download Excel
                    </MenuItem>
                </Menu>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#1a237e" }}>
                            <TableRow>
                                <TableCell sx={{ color: "#fff" }}>Year</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Opening</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Joined</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Resigned</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Balance</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedRows.map((row) => (
                                <TableRow key={row.year} hover>
                                    <TableCell
                                        sx={{
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            color: "#0d47a1"
                                        }}
                                        onClick={() => handleYearClick(row.year)}
                                    >
                                        {row.year}
                                    </TableCell>
                                    <TableCell>{row.opening}</TableCell>
                                    <TableCell>{row.joined}</TableCell>
                                    <TableCell>{row.resigned}</TableCell>
                                    <TableCell>{row.balance}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={rows.length}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </TableContainer>

                {/* ============================
               YEAR DETAIL TABLE
            ============================ */}
                <Dialog
                    open={Boolean(selectedYear && yearDetails)}
                    onClose={() => setSelectedYear(null)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "#1a237e",
                            color: "#fff"
                        }}
                    >
                        Profession Details – {selectedYear}
                        <IconButton onClick={() => setSelectedYear(null)} sx={{ color: "#fff" }}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ mt: 2 }}>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{ backgroundColor: "#3949ab" }}>
                                    <TableRow>
                                        <TableCell sx={{ color: "#fff" }}>
                                            Profession
                                        </TableCell>
                                        <TableCell sx={{ color: "#fff" }}>
                                            Count
                                        </TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {Object.entries(yearDetails || {})
                                        .filter(([key]) => key !== "year")
                                        .map(([profession, count]) => (
                                            <TableRow key={profession} hover>
                                                <TableCell>{profession}</TableCell>
                                                <TableCell>{count}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>

                    <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
                        <Button
                            variant="outlined"
                            onClick={downloadYearDetailPDF}
                        >
                            Download PDF
                        </Button>

                        <Button
                            variant="contained"
                            onClick={() => setSelectedYear(null)}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        )
    };

    /* ============================
       UI
    ============================ */
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={2}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ backgroundColor: "#1a237e", color: "#fff" }}>
                        <CardActionArea onClick={() => toggleTable("profession")}>
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Profession Summary
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>

            <Collapse in={openTable === "profession"}>
                {openTable === "profession" &&
                    renderTable(
                        "Profession Summary",
                        memberYearStats,
                        "profession"
                    )}
            </Collapse>
        </Box>
    );
}