import jsPDF from "jspdf";
import "jspdf-autotable";
import { FIELD_MAP } from "./MemberDetail";
import { getValueByPath } from "./MemberDetail";

const truncateText = (text, maxLength) => {
    if (!text) return "N/A";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const formatValueForPDF = (value) => {
    if (!value || value === undefined || value === null) return "Not Provided";

    if (typeof value === "string" && value.startsWith("http")) {
        return "Image Available";
    }

    if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === "object") {
            return value
                .map(item =>
                    Object.entries(item)
                        .map(([k, v]) => `${k}: ${formatValueForPDF(v)}`)
                        .join("; ")
                )
                .join(" | ");
        }
        return value.join(", ");
    }

    if (typeof value === "object") {
        return Object.entries(value)
            .map(([k, v]) => `${k}: ${formatValueForPDF(v)}`)
            .join("; ");
    }

    if (typeof value === "boolean") return value ? "Yes" : "No";

    return value.toString();
};

const addPageNumbers = (doc) => {
    try {
        const pageCount = doc.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const footerY = pageHeight - 10;

        doc.setFontSize(9);
        doc.setTextColor(100);

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, footerY, { align: "center" });
        }
    } catch (err) {
        console.error("Failed to add page numbers:", err);
    }
};

export const generateMemberPDF = (member) => {
    const doc = new jsPDF();

    const memberName = getValueByPath(member, 'personalDetails.nameOfMember') || 'Unknown';
    const membershipNumber = getValueByPath(member, 'personalDetails.membershipNumber') || 'N/A';

    // Title
    doc.setFontSize(16);
    doc.setTextColor(40, 53, 147);
    doc.text(`Member Details - ${memberName}`, 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
        `Membership Number: ${membershipNumber} | Generated on: ${new Date().toLocaleDateString()}`,
        105,
        22,
        { align: "center" }
    );

    let yPosition = 35;

    const addSection = (title, fields, data) => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(40, 53, 147);
        doc.text(title, 14, yPosition);
        yPosition += 8;

        doc.setDrawColor(200);
        doc.line(14, yPosition, 196, yPosition);
        yPosition += 5;

        doc.setFontSize(9);
        doc.setTextColor(80);

        fields.forEach((fieldKey) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }

            const fieldName = FIELD_MAP[fieldKey];
            const value = getValueByPath(data, fieldKey);
            const displayValue = formatValueForPDF(value);

            doc.text(`${fieldName}:`, 16, yPosition);
            doc.setTextColor(20);
            doc.text(displayValue, 70, yPosition);
            doc.setTextColor(80);

            yPosition += 6;
        });

        yPosition += 10;
    };

    addSection("Personal Details", Object.keys(FIELD_MAP).filter(f => f.startsWith("personalDetails")), member);
    addSection("Address Details", Object.keys(FIELD_MAP).filter(f => f.startsWith("addressDetails")), member);
    addSection("Reference & Guarantor Details", Object.keys(FIELD_MAP).filter(f => f.startsWith("referenceDetails")), member);
    addSection("Document Details", Object.keys(FIELD_MAP).filter(f => f.startsWith("documents")), member);
    addSection("Professional Details", Object.keys(FIELD_MAP).filter(f => f.startsWith("professionalDetails")), member);
    addSection("Family Details", Object.keys(FIELD_MAP).filter(f => f.startsWith("familyDetails")), member);
    addSection("Bank Details", Object.keys(FIELD_MAP).filter(f => f.startsWith("bankDetails")), member);
    addSection("Guarantee Details", Object.keys(FIELD_MAP).filter(f => f.startsWith("guaranteeDetails")), member);
    addSection("Loan Details", Object.keys(FIELD_MAP).filter(f => f.startsWith("loanDetails")), member);

    addPageNumbers(doc);

    // ⭐ SAVE AS dialog using Blob
    const pdfBlob = doc.output("blob");

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Member_${membershipNumber}_${memberName.replace(/\s+/g, "_")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
};

export const generateMembersListPDF = (members) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text("Members List Report", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
        `Generated on: ${new Date().toLocaleDateString()} | Total Members: ${members.length}`,
        105,
        22,
        { align: "center" }
    );

    const headers = ["S.No", "Member No", "Name", "Phone", "Email", "Introduce By", "Civil Score"];

    const rows = members.map((member, index) => {
        const civilScore = getValueByPath(member, "bankDetails.civilScore") || "N/A";

        return [
            index + 1,
            truncateText(getValueByPath(member, "personalDetails.membershipNumber") || "N/A", 10),
            truncateText(getValueByPath(member, "personalDetails.nameOfMember") || "Unknown", 15),
            truncateText(getValueByPath(member, "personalDetails.phoneNo") || "N/A", 12),
            truncateText(getValueByPath(member, "personalDetails.emailId") || "N/A", 25),
            truncateText(getValueByPath(member, "nomineeDetails.introduceBy") || "N/A", 12),
            civilScore.toString(),
        ];
    });

    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 30,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: {
            fillColor: [40, 53, 147],
            textColor: [255, 255, 255],
            fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 30;

    doc.setFontSize(10);
    doc.setTextColor(40, 53, 147);
    doc.text("Summary:", 14, finalY);

    doc.setTextColor(0);
    doc.text(`Total Members: ${members.length}`, 14, finalY + 7);

    const scores = members
        .map(m => getValueByPath(m, "bankDetails.civilScore"))
        .filter(s => s && !isNaN(s));

    if (scores.length > 0) {
        const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
        doc.text(`Average Civil Score: ${avg}`, 14, finalY + 14);
    }

    addPageNumbers(doc);

    const pdfBlob = doc.output("blob");

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Members_List_${new Date().toISOString().split("T")[0]}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
};
