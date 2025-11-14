// utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateMembersPDF = (members) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Title
    doc.setFontSize(16);
    doc.text('Members List Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${date}`, 14, 22);
    doc.text(`Total Members: ${members.length}`, 14, 29);

    // Table data
    const tableData = members.map((member, index) => [
        index + 1,
        getValueByPath(member, 'personalDetails.membershipNumber') || 'N/A',
        getValueByPath(member, 'personalDetails.nameOfMember') || 'N/A',
        getValueByPath(member, 'personalDetails.phoneNo') || 'N/A',
        getValueByPath(member, 'personalDetails.emailId') || 'N/A',
        getValueByPath(member, 'addressDetails.currentResidentalAddress.city') || 'N/A',
        getValueByPath(member, 'personalDetails.membershipDate') ?
            new Date(getValueByPath(member, 'personalDetails.membershipDate')).toLocaleDateString() : 'N/A'
    ]);

    // AutoTable
    doc.autoTable({
        startY: 35,
        head: [['S.No', 'Member No', 'Name', 'Phone', 'Email', 'City', 'Membership Date']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [25, 118, 210] }
    });

    // Save the PDF
    doc.save(`members-list-${date}.pdf`);
};

// Helper function to get nested values
const getValueByPath = (obj, path) => {
    if (!path) return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
        if (cur === undefined || cur === null) return undefined;
        cur = cur[p];
    }
    return cur;
};