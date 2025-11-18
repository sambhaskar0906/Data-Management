import jsPDF from "jspdf";
import 'jspdf-autotable';

// Helper function to get nested values
const getValueByPath = (obj, path) => {
    if (!path || !obj) return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
        if (cur === undefined || cur === null) return undefined;
        cur = cur[p];
    }
    return cur;
};

// Helper function to truncate text
const truncateText = (text, maxLength) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Generate Members List PDF
export const generateMembersListPDF = (members) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text('Members List Report', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Members: ${members.length}`, 105, 28, { align: 'center' });

    // Prepare table data
    const tableData = members.map((member, index) => {
        const civilScore = getValueByPath(member, 'bankDetails.civilScore') || 'N/A';

        return [
            (index + 1).toString(),
            truncateText(getValueByPath(member, 'personalDetails.membershipNumber') || 'N/A', 15),
            truncateText(getValueByPath(member, 'personalDetails.nameOfMember') || 'Unknown', 20),
            truncateText(getValueByPath(member, 'personalDetails.phoneNo') || 'N/A', 15),
            truncateText(getValueByPath(member, 'personalDetails.emailId') || 'N/A', 25),
            truncateText(getValueByPath(member, 'addressDetails.currentResidentalAddress.city') || 'N/A', 15),
            civilScore.toString(),
            'Active'
        ];
    });

    // Table headers
    const headers = ['S.No', 'Member No', 'Name', 'Phone', 'Email', 'City', 'Civil Score', 'Status'];

    // Generate table using autoTable
    doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 35,
        styles: {
            fontSize: 8,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [40, 53, 147],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        columnStyles: {
            0: { cellWidth: 15 }, // S.No
            1: { cellWidth: 25 }, // Member No
            2: { cellWidth: 35 }, // Name
            3: { cellWidth: 30 }, // Phone
            4: { cellWidth: 45 }, // Email
            5: { cellWidth: 25 }, // City
            6: { cellWidth: 20 }, // Civil Score
            7: { cellWidth: 25 }  // Status
        },
        didDrawCell: (data) => {
            // Color code civil score cells
            if (data.column.index === 6 && data.cell.raw !== 'N/A') {
                const score = parseInt(data.cell.raw);
                if (!isNaN(score)) {
                    if (score >= 700) {
                        doc.setFillColor(46, 125, 50); // Green
                    } else if (score >= 600) {
                        doc.setFillColor(237, 108, 2); // Orange
                    } else {
                        doc.setFillColor(211, 47, 47); // Red
                    }
                    doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.text(data.cell.raw, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 2, {
                        align: 'center'
                    });
                }
            }
        }
    });

    // Add summary
    const finalY = doc.lastAutoTable.finalY + 10;
    if (finalY < 280) {
        doc.setFontSize(10);
        doc.setTextColor(40, 53, 147);
        doc.text('Summary:', 14, finalY);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Members: ${members.length}`, 14, finalY + 7);

        // Civil Score Summary
        const scores = members.map(m => getValueByPath(m, 'bankDetails.civilScore')).filter(s => s && !isNaN(s));
        if (scores.length > 0) {
            const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
            doc.text(`Average Civil Score: ${avgScore}`, 14, finalY + 14);
        }
    }

    doc.save(`Members_List_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Generate Single Member PDF
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

    // Field mapping (you can move this to a separate file if needed)
    const FIELD_MAP = {
        "personalDetails.nameOfMember": "Member Name",
        "personalDetails.membershipNumber": "Membership No",
        "personalDetails.nameOfFather": "Father's Name",
        "personalDetails.nameOfMother": "Mother's Name",
        "personalDetails.dateOfBirth": "Date of Birth",
        "personalDetails.membershipDate": "Membership Date",
        "personalDetails.gender": "Gender",
        "personalDetails.phoneNo": "Phone No",
        "personalDetails.emailId": "Email",
        "bankDetails.civilScore": "Civil Score",
        // Add other fields as needed
    };

    const formatValueForPDF = (value) => {
        if (!value || value === '') return 'Not Provided';
        if (typeof value === 'string' && value.startsWith('http')) return 'Image Available';
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object') return JSON.stringify(value);
        return value.toString();
    };

    // Add sections
    const personalFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('personalDetails'));
    addSection('Personal Details', personalFields, member);

    const bankFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('bankDetails'));
    if (bankFields.length > 0) {
        addSection('Bank Details', bankFields, member);
    }

    // Save the PDF
    doc.save(`Member_${membershipNumber}_${memberName.replace(/\s+/g, '_')}.pdf`);
};