import jsPDF from "jspdf";
import "jspdf-autotable";
import { FIELD_MAP } from "./MemberDetail";
import { getValueByPath } from "./MemberDetail"

const truncateText = (text, maxLength) => {
    if (!text) return "N/A";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const formatValueForPDF = (value) => {
    if (isMissing(value)) return "Not Provided";

    if (typeof value === "string" && (value.startsWith("http") || value.startsWith("https"))) {
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


export const generateMemberPDF = (member) => {
    const doc = new jsPDF();
    const memberName = getValueByPath(member, 'personalDetails.nameOfMember') || 'Unknown';
    const membershipNumber = getValueByPath(member, 'personalDetails.membershipNumber') || 'N/A';

    // Title
    doc.setFontSize(16);
    doc.setTextColor(40, 53, 147);
    doc.text(`Member Details - ${memberName}`, 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Membership Number: ${membershipNumber} | Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

    let yPosition = 35;

    // Function to add section
    const addSection = (title, fields, data) => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(40, 53, 147);
        doc.text(title, 14, yPosition);
        yPosition += 8;

        doc.setDrawColor(200, 200, 200);
        doc.line(14, yPosition, 196, yPosition);
        yPosition += 5;

        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);

        fields.forEach(fieldKey => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }

            const fieldName = FIELD_MAP[fieldKey];
            const value = getValueByPath(data, fieldKey);
            const displayValue = formatValueForPDF(value);

            doc.text(`${fieldName}:`, 16, yPosition);
            doc.setTextColor(20, 20, 20);
            doc.text(displayValue, 70, yPosition);
            doc.setTextColor(80, 80, 80);

            yPosition += 6;
        });

        yPosition += 10;
    };

    // Personal Details
    const personalFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('personalDetails'));
    addSection('Personal Details', personalFields, member);

    // Address Details
    const addressFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('addressDetails'));
    addSection('Address Details', addressFields, member);

    // Reference Details
    const referenceFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('referenceDetails'));
    addSection('Reference & Guarantor Details', referenceFields, member);

    // Document Details
    const documentFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('documents'));
    addSection('Document Details', documentFields, member);

    // Professional Details
    const professionalFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('professionalDetails'));
    addSection('Professional Details', professionalFields, member);

    // Family Details
    const familyFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('familyDetails'));
    addSection('Family Details', familyFields, member);

    // Bank Details
    const bankFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('bankDetails'));
    addSection('Bank Details', bankFields, member);

    // Guarantee Details
    const guaranteeFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('guaranteeDetails'));
    addSection('Guarantee Details', guaranteeFields, member);

    // Loan Details
    const loanFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('loanDetails'));
    addSection('Loan Details', loanFields, member);

    // Save the PDF
    doc.save(`Member_${membershipNumber}_${memberName.replace(/\s+/g, '_')}.pdf`);
};


export const generateMembersListPDF = (members) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text('Members List Report', 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Members: ${members.length}`, 105, 22, { align: 'center' });

    // Define table headers
    const headers = [
        'S.No',
        'Member No',
        'Name',
        'Phone',
        'Email',
        'City',
        'Civil Score',
    ];

    // Prepare table rows
    const rows = members.map((member, index) => {
        const civilScore = getValueByPath(member, 'bankDetails.civilScore') || 'N/A';

        return [
            index + 1,
            truncateText(getValueByPath(member, 'personalDetails.membershipNumber') || 'N/A', 10),
            truncateText(getValueByPath(member, 'personalDetails.nameOfMember') || 'Unknown', 15),
            truncateText(getValueByPath(member, 'personalDetails.phoneNo') || 'N/A', 12),
            truncateText(getValueByPath(member, 'personalDetails.emailId') || 'N/A', 25),
            truncateText(getValueByPath(member, 'addressDetails.currentResidentalAddress.city') || 'N/A', 12),
            civilScore.toString(),
        ];
    });

    // Add table using autoTable
    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 30,
        styles: {
            fontSize: 8,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [40, 53, 147],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            textAlign: 'left',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
    });

    // Add summary section
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(40, 53, 147);
    doc.text('Summary:', 14, finalY);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Members: ${members.length}`, 14, finalY + 7);

    // Calculate average Civil Score
    const scores = members.map(m => getValueByPath(m, 'bankDetails.civilScore')).filter(s => s && !isNaN(s));
    if (scores.length > 0) {
        const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
        doc.text(`Average Civil Score: ${avgScore}`, 14, finalY + 14);
    }

    // Save the PDF
    doc.save(`Members_List_${new Date().toISOString().split('T')[0]}.pdf`);
};