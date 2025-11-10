
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const GuarantorPdf = (member, guarantorFor = [], hasGuarantors = []) => {
    if (!member) {
        console.warn("⚠️ No member selected for PDF export");
        return;
    }

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // ============================
    // 🔹 HEADER
    // ============================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(25, 118, 210);
    doc.text("Guarantor Information Report", 55, 15);

    // ============================
    // 🔸 MEMBER DETAILS
    // ============================
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Member Name: ${member.personalDetails?.nameOfMember || "-"}`, 15, 30);
    doc.text(`Membership No: ${member.personalDetails?.membershipNumber || "-"}`, 15, 38);

    // ============================
    // SECTION 1: Member is Guarantor For
    // ============================
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 118, 210);
    doc.text("1️⃣ Member is Guarantor For:", 15, 50);

    if (Array.isArray(guarantorFor) && guarantorFor.length > 0) {
        autoTable(doc, {
            startY: 55,
            head: [["S.No", "Name", "Amount of Loan", "Type of Loan"]],
            headStyles: {
                fillColor: [25, 118, 210],
                textColor: 255,
                fontStyle: "bold",
            },
            body: guarantorFor.map((g, i) => [
                i + 1,
                g.name || "-",
                g.amountOfLoan || "-",
                g.typeOfLoan || "-",
            ]),
            styles: { halign: "left" },
            margin: { left: 15, right: 15 },
        });
    } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("No records found.", 20, 55);
    }

    // ============================
    // SECTION 2: Member Has These Guarantors
    // ============================
    const nextY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 70;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 118, 210);
    doc.text("2️⃣ Member Has These Guarantors:", 15, nextY);

    if (Array.isArray(hasGuarantors) && hasGuarantors.length > 0) {
        autoTable(doc, {
            startY: nextY + 5,
            head: [["S.No", "Name", "Amount of Loan", "Type of Loan"]],
            headStyles: {
                fillColor: [25, 118, 210],
                textColor: 255,
                fontStyle: "bold",
            },
            body: hasGuarantors.map((g, i) => [
                i + 1,
                g.name || "-",
                g.amountOfLoan || "-",
                g.typeOfLoan || "-",
            ]),
            styles: { halign: "left" },
            margin: { left: 15, right: 15 },
        });
    } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("No records found.", 20, nextY + 5);
    }

    // ============================
    // FOOTER / DOWNLOAD
    // ============================
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${date}`, 15, 285);

    // 🧾 Open preview + save
    const pdfBlob = doc.output("bloburl");
    window.open(pdfBlob, "_blank");
    doc.save(`${member.personalDetails?.nameOfMember || "Member"}_Guarantor_Report.pdf`);
};