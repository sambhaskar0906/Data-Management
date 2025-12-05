import jsPDF from "jspdf";
import "jspdf-autotable";
import { FIELD_MAP } from "./MemberDetail";
import { getValueByPath } from "./MemberDetail";

// --------------------------------------------------
// 🔹 REUSABLE BRAND HEADER FOR ALL PDF PAGES
// --------------------------------------------------
const addSocietyHeader = (doc) => {
    doc.setFillColor(40, 53, 147); // Blue bar
    doc.rect(0, 0, 210, 18, "F");

    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("CA Co-Operative Thrift & Credit Society Ltd.", 105, 11, { align: "center" });
};

// --------------------------------------------------
// 🔹 PAGE NUMBERS
// --------------------------------------------------
const addPageNumbers = (doc) => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        doc.setFontSize(9);
        doc.setTextColor(120);

        doc.text(
            `Page ${i} of ${pageCount}  •  CA Co-Operative Thrift & Credit Society`,
            105,
            292,
            { align: "center" }
        );
    }
};

// --------------------------------------------------
// 🔹 VALUE FORMATTER
// --------------------------------------------------
const formatValueForPDF = (value) => {
    if (!value) return "Not Provided";

    if (typeof value === "string" && value.startsWith("http")) return "Image Available";
    if (typeof value === "boolean") return value ? "Yes" : "No";

    if (Array.isArray(value)) {
        return value
            .map((v) =>
                typeof v === "object"
                    ? Object.entries(v)
                        .map(([k, val]) => `${k}: ${val}`)
                        .join(", ")
                    : v
            )
            .join(" | ");
    }

    if (typeof value === "object") {
        return Object.entries(value)
            .map(([k, val]) => `${k}: ${val}`)
            .join(", ");
    }

    return value.toString();
};

// --------------------------------------------------
// 🔹 SINGLE MEMBER PDF (Attractive Design)
// --------------------------------------------------
export const generateMemberPDF = (member) => {
    const doc = new jsPDF();

    addSocietyHeader(doc); // ADD HEADER

    const name = getValueByPath(member, "personalDetails.nameOfMember") || "Unknown";
    const mno = getValueByPath(member, "personalDetails.membershipNumber") || "N/A";

    // MAIN Title
    doc.setFontSize(15);
    doc.setTextColor(40, 53, 147);
    doc.text(`Member Details: ${name}`, 105, 28, { align: "center" });

    // Sub info
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Membership No: ${mno}`, 105, 34, { align: "center" });

    let y = 45;

    // --------------------------------------------------
    // ⭐ BEAUTIFUL SECTION COMPONENT
    // --------------------------------------------------
    const addSection = (title, keys, memberObj) => {
        if (y > 270) {
            doc.addPage();
            addSocietyHeader(doc);
            y = 28;
        }

        // Section Title Bar
        doc.setFillColor(230, 230, 255);
        doc.rect(12, y, 186, 8, "F");

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 53, 147);
        doc.text(title, 16, y + 5);

        y += 12;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30);

        keys.forEach((key) => {
            if (y > 280) {
                doc.addPage();
                addSocietyHeader(doc);
                y = 28;
            }

            const label = FIELD_MAP[key];
            const value = formatValueForPDF(getValueByPath(memberObj, key));

            doc.text(`${label}:`, 16, y);
            doc.text(value, 75, y);
            y += 6;
        });

        y += 6;
    };

    // --------------------------------------------------
    // ADDING SECTIONS
    // --------------------------------------------------
    addSection("Personal Details", Object.keys(FIELD_MAP).filter(k => k.startsWith("personalDetails")), member);
    addSection("Address Details", Object.keys(FIELD_MAP).filter(k => k.startsWith("addressDetails")), member);
    addSection("Document Details", Object.keys(FIELD_MAP).filter(k => k.startsWith("documents")), member);
    addSection("Professional Details", Object.keys(FIELD_MAP).filter(k => k.startsWith("professionalDetails")), member);
    addSection("Family Details", Object.keys(FIELD_MAP).filter(k => k.startsWith("familyDetails")), member);
    addSection("Bank Details", Object.keys(FIELD_MAP).filter(k => k.startsWith("bankDetails")), member);

    addPageNumbers(doc);

    doc.save(`Member_${name.replace(/\s+/g, "_")}.pdf`);
};

// --------------------------------------------------
// 🔹 MEMBERS LIST PDF (Attractive Table Styling)
// --------------------------------------------------
export const generateMembersListPDF = (members) => {
    const doc = new jsPDF();
    addSocietyHeader(doc);

    doc.setFontSize(15);
    doc.setTextColor(40, 53, 147);
    doc.text("Society Members List", 105, 25, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(
        `Generated on: ${new Date().toLocaleDateString()}  |  Total Members: ${members.length}`,
        105,
        31,
        { align: "center" }
    );

    // ----------------------------------------------------
    // ONLY THOSE COLUMNS YOU WANT IN PDF TABLE
    // ----------------------------------------------------
    const headers = [
        "S.No",
        "Member No",
        "Member Name",
        "Father Name",
        "Mobile No",
        "Email",
        "Introduced By"
    ];

    const rows = members.map((m, i) => [
        i + 1,
        getValueByPath(m, "personalDetails.membershipNumber") || "—",
        getValueByPath(m, "personalDetails.nameOfMember") || "—",
        getValueByPath(m, "personalDetails.nameOfFather") || "—",
        getValueByPath(m, "personalDetails.phoneNo") || "—",
        getValueByPath(m, "personalDetails.emailId") || "—",
        getValueByPath(m, "nomineeDetails.introduceBy") || "—"
    ]);

    doc.autoTable({
        startY: 38,
        head: [headers],
        body: rows,
        styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0] },
        headStyles: {
            fillColor: [40, 53, 147],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.2,
        margin: { top: 38, left: 5, right: 5 },
    });

    addPageNumbers(doc);

    doc.save(`Members_List_${new Date().toISOString().split("T")[0]}.pdf`);
};