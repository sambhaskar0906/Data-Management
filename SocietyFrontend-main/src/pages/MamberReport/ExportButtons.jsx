import React from "react";
import { Button, Stack } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ExportButtons = ({ filteredMembers, selectedColumns, activeFilterColumns, ALL_FIELDS }) => {

    // 🟦 DEFAULT TABLE COLUMNS (Always included)
    const defaultColumns = [
        { key: "personalDetails.membershipNumber", label: "Member No" },
        { key: "personalDetails.nameOfMember", label: "Member Name" },
        { key: "personalDetails.nameOfFather", label: "Father Name" },
        { key: "personalDetails.phoneNo1", label: "Mobile No" },
        { key: "personalDetails.emailId1", label: "Email" },
        { key: "nomineeDetails.introduceBy", label: "Introduced By" }
    ];

    // MERGED EXPORT COLUMNS
    const mergedColumns = [
        ...defaultColumns.map(col => ({ key: col.key, label: col.label })),
        ...activeFilterColumns.map((col) => ({ key: col, label: ALL_FIELDS[col] })),
        ...selectedColumns.map((col) => ({ key: col, label: ALL_FIELDS[col] })),
    ];

    // ---------------- PDF EXPORT ----------------
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Members Export Report", 14, 16);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

        const tableHead = ["S.No", ...mergedColumns.map(c => c.label)];

        const tableBody = filteredMembers.map((m, idx) => {
            const row = [idx + 1];

            mergedColumns.forEach(col => {
                const value = col.key.split(".").reduce((o, k) => o?.[k], m);
                row.push(value || "—");
            });

            return row;
        });

        autoTable(doc, {
            startY: 35,
            head: [tableHead],
            body: tableBody,
            styles: { fontSize: 9 },
        });

        doc.save(`Members_Report_${Date.now()}.pdf`);
    };

    // ---------------- EXCEL EXPORT ----------------
    const downloadExcel = () => {
        const excelData = filteredMembers.map((m, idx) => {
            const row = { "S.No": idx + 1 };

            mergedColumns.forEach((col) => {
                const value = col.key.split(".").reduce((o, k) => o?.[k], m);
                row[col.label] = value || "—";
            });

            return row;
        });

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Members");

        XLSX.writeFile(wb, `Members_Report_${Date.now()}.xlsx`);
    };

    return (
        <Stack direction="row" spacing={2}>
            <Button
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                onClick={downloadPDF}
                sx={{ bgcolor: "#1A237E" }}
            >
                PDF
            </Button>

            <Button
                variant="contained"
                color="success"
                startIcon={<DescriptionIcon />}
                onClick={downloadExcel}
            >
                Excel
            </Button>
        </Stack>
    );
};

export default ExportButtons;
