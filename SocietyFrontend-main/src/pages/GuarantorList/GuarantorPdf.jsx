import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const GuarantorPdf = (member, guarantorFor = [], hasGuarantors = []) => {
    if (!member) {
        console.warn("⚠️ No member selected for PDF export");
        return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // ============================
    // 🎨 ATTRACTIVE HEADER WITH GRADIENT
    // ============================
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, 210, 25, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("GUARANTOR INFORMATION REPORT", 105, 15, { align: "center" });

    // ============================
    // 👤 MEMBER DETAILS CARD
    // ============================
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, 35, 180, 25, 3, 3, 'F');

    doc.setDrawColor(25, 118, 210);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 35, 180, 25, 3, 3, 'S');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(25, 118, 210);
    doc.text("Member Information", 20, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Name: ${member.personalDetails?.nameOfMember || "-"}`, 20, 53);
    doc.text(`Membership No: ${member.personalDetails?.membershipNumber || "-"}`, 110, 53);

    // ============================
    // 📊 SECTION 1: Member is Guarantor For
    // ============================
    const section1Y = 70;

    // Section Header
    doc.setFillColor(33, 150, 243);
    doc.roundedRect(15, section1Y, 180, 8, 2, 2, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("1. MEMBER IS GUARANTOR FOR", 22, section1Y + 5.5);

    // SIMPLE AMOUNT FORMATTING - WITHOUT ANY SPECIAL CHARACTERS
    const formatAmount = (amount) => {
        if (!amount && amount !== 0) return "0";

        // Convert to number
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        // Check if valid number
        if (isNaN(numAmount)) return "0";

        // Simple formatting - only numbers with commas
        return numAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    if (Array.isArray(guarantorFor) && guarantorFor.length > 0) {
        autoTable(doc, {
            startY: section1Y + 12,
            head: [["S.No", "Name", "Amount of Loan", "Type of Loan"]],
            headStyles: {
                fillColor: [25, 118, 210],
                textColor: 255,
                fontStyle: "bold",
                fontSize: 10,
            },
            body: guarantorFor.map((g, i) => [
                i + 1,
                g.name || "-",
                formatAmount(g.amountOfLoan),
                g.typeOfLoan || "-",
            ]),
            styles: {
                halign: "left",
                font: "helvetica",
                fontSize: 9,
                cellPadding: 3,
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { left: 15, right: 15 },
            tableLineColor: [200, 200, 200],
            tableLineWidth: 0.1,
        });
    } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("No guarantor records found for this member.", 22, section1Y + 12);
    }

    // ============================
    // 📈 SECTION 2: Member Has These Guarantors
    // ============================
    const nextY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : section1Y + 25;

    // Section Header
    doc.setFillColor(0, 150, 136);
    doc.roundedRect(15, nextY, 180, 8, 2, 2, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("2. MEMBER HAS THESE GUARANTORS", 22, nextY + 5.5);

    if (Array.isArray(hasGuarantors) && hasGuarantors.length > 0) {
        autoTable(doc, {
            startY: nextY + 12,
            head: [["S.No", "Name", "Amount of Loan", "Type of Loan"]],
            headStyles: {
                fillColor: [0, 150, 136],
                textColor: 255,
                fontStyle: "bold",
                fontSize: 10,
            },
            body: hasGuarantors.map((g, i) => [
                i + 1,
                g.name || "-",
                formatAmount(g.amountOfLoan),
                g.typeOfLoan || "-",
            ]),
            styles: {
                halign: "left",
                font: "helvetica",
                fontSize: 9,
                cellPadding: 3,
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { left: 15, right: 15 },
            tableLineColor: [200, 200, 200],
            tableLineWidth: 0.1,
        });
    } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("No guarantors found for this member.", 22, nextY + 12);
    }

    // ============================
    // 📊 SUMMARY SECTION
    // ============================
    const summaryY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : nextY + 25;

    doc.setFillColor(255, 248, 225);
    doc.roundedRect(15, summaryY, 180, 20, 3, 3, 'F');
    doc.setDrawColor(255, 193, 7);
    doc.roundedRect(15, summaryY, 180, 20, 3, 3, 'S');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 152, 0);
    doc.text("SUMMARY", 22, summaryY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    // Calculate totals safely
    const totalGuarantorFor = guarantorFor.reduce((sum, g) => {
        const amount = typeof g.amountOfLoan === 'string' ? parseFloat(g.amountOfLoan) : g.amountOfLoan;
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const totalHasGuarantors = hasGuarantors.reduce((sum, g) => {
        const amount = typeof g.amountOfLoan === 'string' ? parseFloat(g.amountOfLoan) : g.amountOfLoan;
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    doc.text(`Total Guaranteed Amount: ${formatAmount(totalGuarantorFor)}`, 22, summaryY + 15);
    doc.text(`Total Guarantors: ${hasGuarantors.length}`, 120, summaryY + 15);

    // ============================
    // 🏁 FOOTER
    // ============================
    const date = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const time = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    doc.setFillColor(55, 71, 79);
    doc.rect(0, 280, 210, 20, 'F');

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated on: ${date} at ${time}`, 15, 288);
    doc.text("Guarantor Management System", 105, 288, { align: "center" });
    doc.text("Page 1 of 1", 180, 288, { align: "right" });

    // ============================
    // 💾 DOWNLOAD & PREVIEW
    // ============================
    const fileName = `${member.personalDetails?.nameOfMember?.replace(/\s+/g, '_') || "Member"}_Guarantor_Report.pdf`;

    // Open in new tab
    const pdfBlob = doc.output("bloburl");
    window.open(pdfBlob, "_blank");

    // Download
    doc.save(fileName);
};