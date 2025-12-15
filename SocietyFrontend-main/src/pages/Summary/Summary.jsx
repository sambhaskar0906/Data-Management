import React, { useState } from "react";
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
    MenuItem
} from "@mui/material";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ThreeSummaryTables() {
    const [openTable, setOpenTable] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentTable, setCurrentTable] = useState(null);
    const openMenu = Boolean(anchorEl);

    const toggleTable = (name) => setOpenTable(openTable === name ? null : name);

    const handleMenuClick = (event, tableKey) => {
        setAnchorEl(event.currentTarget);
        setCurrentTable(tableKey);
    };

    const handleMenuClose = () => setAnchorEl(null);

    // PDF Export
    const downloadPDF = (title, rows) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor("#0d47a1");
        doc.setFont(undefined, "bold");
        doc.text(title, 14, 20);

        const tableColumn = ["Year", "Opening", "Joined", "Resign", "Balance"];
        const tableRows = rows.map((r) => [r.year, r.opening, r.joined, r.resign, r.balance]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            headStyles: { fillColor: [13, 71, 161], textColor: 255, fontStyle: "bold" },
            bodyStyles: { fillColor: [232, 240, 254], textColor: 0 },
            alternateRowStyles: { fillColor: [212, 225, 247] },
            theme: "grid",
        });

        doc.save(`${title}.pdf`);
        handleMenuClose();
    };

    // Excel Export
    const downloadExcel = (title, rows) => {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, title);
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `${title}.xlsx`);
        handleMenuClose();
    };

    const dataProfession = [
        { year: 2020, opening: 100, joined: 20, resign: 5, balance: 115 },
        { year: 2021, opening: 115, joined: 30, resign: 8, balance: 137 },
        { year: 2022, opening: 137, joined: 25, resign: 4, balance: 158 }
    ];
    const dataCaste = [
        { year: 2020, opening: 80, joined: 10, resign: 2, balance: 88 },
        { year: 2021, opening: 88, joined: 18, resign: 4, balance: 102 },
        { year: 2022, opening: 102, joined: 22, resign: 3, balance: 121 }
    ];
    const dataMember = [
        { year: 2020, opening: 200, joined: 40, resign: 10, balance: 230 },
        { year: 2021, opening: 230, joined: 35, resign: 6, balance: 259 },
        { year: 2022, opening: 259, joined: 28, resign: 5, balance: 282 }
    ];

    const renderTable = (title, rows, key) => (
        <Box>
            {/* Single Download Button */}
            <Button
                variant="contained"
                sx={{ mt: 2, mb: 2, backgroundColor: "#0d47a1", "&:hover": { backgroundColor: "#08306b" } }}
                onClick={(e) => handleMenuClick(e, key)}
            >
                Download
            </Button>

            <Menu anchorEl={anchorEl} open={openMenu && currentTable === key} onClose={handleMenuClose}>
                <MenuItem onClick={() => downloadPDF(title, rows)}>Download PDF</MenuItem>
                <MenuItem onClick={() => downloadExcel(title, rows)}>Download Excel</MenuItem>
            </Menu>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#0d47a1" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Year</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Opening</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Member Joined</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Member Resign</TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Balance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index} hover sx={{ backgroundColor: index % 2 === 0 ? "#e8f0fe" : "#d0e1fd" }}>
                                <TableCell>{row.year}</TableCell>
                                <TableCell>{row.opening}</TableCell>
                                <TableCell>{row.joined}</TableCell>
                                <TableCell>{row.resign}</TableCell>
                                <TableCell>{row.balance}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    const cards = [
        { key: "profession", title: "Profession Summary", data: dataProfession },
        { key: "caste", title: "Caste Summary", data: dataCaste },
        { key: "member", title: "Member Summary", data: dataMember }
    ];

    return (
        <Box p={2}>
            <Grid container spacing={3}>
                {cards.map((card) => (
                    <Grid item xs={12} md={4} key={card.key}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                boxShadow: 3,
                                transition: "0.3s",
                                border: openTable === card.key ? "2px solid #0d47a1" : "2px solid transparent",
                                backgroundColor: openTable === card.key ? "#0d47a1" : "#1a237e",
                                color: "#fff",
                                "&:hover": { boxShadow: 6 }
                            }}
                        >
                            <CardActionArea onClick={() => toggleTable(card.key)}>
                                <CardContent sx={{ textAlign: "center", p: 3 }}>
                                    <Typography variant="h6" fontWeight="bold">{card.title}</Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {cards.map((card) => (
                <Collapse in={openTable === card.key} key={card.key} timeout={400}>
                    {openTable === card.key && renderTable(card.title, card.data, card.key)}
                </Collapse>
            ))}
        </Box>
    );
}