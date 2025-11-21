import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Field mapping (moved from MemberDetails)
export const FIELD_MAP = {
    // Personal
    "personalDetails.membershipNumber": "Membership No",
    "personalDetails.membershipDate": "Membership Date",
    "personalDetails.title": "Title",
    "personalDetails.nameOfMember": "Member Name",
    "personalDetails.nameOfFather": "Father's Name",
    "personalDetails.nameOfMother": "Mother's Name",
    "personalDetails.dateOfBirth": "Date of Birth",
    "personalDetails.ageInYears": "Age (Years)",
    "personalDetails.minor": "Is Minor",
    "personalDetails.gender": "Gender",
    "personalDetails.religion": "Religion",
    "personalDetails.maritalStatus": "Marital Status",
    "personalDetails.caste": "Caste",
    "personalDetails.phoneNo": "Phone No",
    "personalDetails.alternatePhoneNo": "Alternate Phone",
    "personalDetails.emailId": "Email",
    "personalDetails.nameOfSpouse": "Spouse's Name",
    "personalDetails.amountInCredit": "Amount In Credit",


    // Address
    "addressDetails.permanentAddress": "Permanent Address",
    "addressDetails.permanentAddressBillPhoto": "Permanent Address Bill Photo",
    "addressDetails.currentResidentalAddress": "Current Address",
    "addressDetails.currentResidentalBillPhoto": "Current Address Bill Photo",
    "addressDetails.previousCurrentAddress": "Previous Addresses",

    // References
    "referenceDetails": "References",

    // Documents - Text Fields
    "documents.panNo": "PAN No",
    "documents.panNoPhoto": "PAN Card Photo",
    "documents.rationCard": "Ration Card",
    "documents.rationCardPhoto": "Ration Card Photo",
    "documents.drivingLicense": "Driving License",
    "documents.drivingLicensePhoto": "Driving License Photo",
    "documents.aadhaarNo": "Aadhaar No",
    "documents.aadhaarNoPhoto": "Aadhaar Card Photo",
    "documents.voterId": "Voter ID",
    "documents.voterIdPhoto": "Voter ID Photo",
    "documents.passportNo": "Passport No",
    "documents.passportNoPhoto": "Passport Photo",
    "documents.passportSize": "Passport Size Photo",

    // Professional - Basic
    "professionalDetails.qualification": "Qualification",
    "professionalDetails.occupation": "Occupation",

    // Professional - Employment Type
    "professionalDetails.inCaseOfServiceGovt": "Government Service",
    "professionalDetails.inCaseOfPrivate": "Private Service",
    "professionalDetails.inCaseOfService": "Service",
    "professionalDetails.serviceType": "Service Type",

    // Professional - Service Details
    "professionalDetails.serviceDetails.fullNameOfCompany": "Company Name",
    "professionalDetails.serviceDetails.addressOfCompany": "Company Address",
    "professionalDetails.serviceDetails.monthlyIncome": "Monthly Income",
    "professionalDetails.serviceDetails.designation": "Designation",
    "professionalDetails.serviceDetails.dateOfJoining": "Date of Joining",
    "professionalDetails.serviceDetails.employeeCode": "Employee Code",
    "professionalDetails.serviceDetails.dateOfRetirement": "Date of Retirement",
    "professionalDetails.serviceDetails.officeNo": "Office Phone",

    // Professional - Business
    "professionalDetails.inCaseOfBusiness": "Business",
    "professionalDetails.businessDetails.fullNameOfCompany": "Business Name",
    "professionalDetails.businessDetails.addressOfCompany": "Business Address",
    "professionalDetails.businessDetails.businessStructure": "Business Structure",
    "professionalDetails.businessDetails.gstCertificate": "GST Certificate",

    // Family
    "familyDetails.familyMembersMemberOfSociety": "Family Members in Society",
    "familyDetails.familyMember": "Family Member Names",
    "familyDetails.familyMemberNo": "Family Member Phones",

    // Bank
    "bankDetails.bankName": "Bank Name",
    "bankDetails.branch": "Bank Branch",
    "bankDetails.accountNumber": "Account Number",
    "bankDetails.ifscCode": "IFSC Code",

    // Guarantee - Other Society
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOtherSociety": "Guarantee Given in Other Society",
    "guaranteeDetails.otherSociety": "Other Society Guarantees",

    // Guarantee - Our Society
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOurSociety": "Guarantee Given in Our Society",
    "guaranteeDetails.ourSociety": "Our Society Guarantees",

    // Loans
    "loanDetails": "Loan Details",

    // Nominee
    "nomineeDetails.nomineeName": "Nominee Name",
    "nomineeDetails.relationWithApplicant": "Relation with Applicant",
    "nomineeDetails.introduceBy": "Introduced By",
    "nomineeDetails.memberShipNo": "Membership No",
};

// Category mapping
export const CATEGORY_MAP = {
    personalDetails: "Personal Details",
    addressDetails: "Address Details",
    documents: "Documents",
    professionalDetails: "Professional Details",
    familyDetails: "Family Details",
    bankDetails: "Bank Details",
    referenceDetails: "Reference Details",
    guaranteeDetails: "Guarantee Details",
    loanDetails: "Loan Details"
};

// Helper functions
export const getValueByPath = (obj, path) => {
    if (!path || !obj) return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
        if (cur === undefined || cur === null) return undefined;
        cur = cur[p];
    }
    return cur;
};

export const isMissing = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") {
        if (Object.keys(value).length === 0) return true;
        return Object.values(value).every(val =>
            val === undefined || val === null || val === "" ||
            (typeof val === 'object' && Object.keys(val).length === 0)
        );
    }
    return false;
};

export const formatValuePlain = (value, fieldKey) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) {
        if (value.length === 0) return "";
        if (typeof value[0] === "object") {
            return value.map(v => {
                try {
                    return Object.entries(v).map(([k, val]) => `${k}: ${formatValuePlain(val)}`).join("; ");
                } catch {
                    return JSON.stringify(v);
                }
            }).join(" | ");
        }
        return value.join(", ");
    }
    if (typeof value === "object") {
        try {
            return Object.entries(value).map(([k, v]) => `${k}: ${formatValuePlain(v)}`).join("; ");
        } catch {
            return JSON.stringify(value);
        }
    }
    if (typeof value === "string") {
        if (value.startsWith("http") || value.includes("cloudinary")) {
            return value;
        }
        return value;
    }
    return String(value);
};

// Get fields by category and view type
export const getFieldsByCategory = (member, category, viewType = "all") => {
    const allKeys = Object.keys(FIELD_MAP);

    if (category === "all") {
        return allKeys.filter(key => {
            const value = getValueByPath(member, key);
            const missing = isMissing(value);

            if (viewType === "all") return true;
            if (viewType === "filled") return !missing;
            if (viewType === "missing") return missing;
            return true;
        });
    }

    if (category === "filled") {
        return allKeys.filter(key => {
            const value = getValueByPath(member, key);
            return !isMissing(value);
        });
    }

    if (category === "missing") {
        return allKeys.filter(key => {
            const value = getValueByPath(member, key);
            return isMissing(value);
        });
    }

    // Specific category
    return allKeys.filter(key => {
        const value = getValueByPath(member, key);
        const missing = isMissing(value);
        const matchesCategory = key.startsWith(category);

        if (viewType === "all") return matchesCategory;
        if (viewType === "filled") return matchesCategory && !missing;
        if (viewType === "missing") return matchesCategory && missing;
        return matchesCategory;
    });
};

// Generate PDF
export const generateMemberFieldsPDF = (member, category, viewType = "all") => {
    if (!member) return;

    const doc = new jsPDF();
    const memberName = getValueByPath(member, "personalDetails.nameOfMember") || "Member";
    const membershipNumber = getValueByPath(member, "personalDetails.membershipNumber") || "N/A";

    const categoryDisplay = category === "all" ? "All Fields" :
        category === "filled" ? "Filled Fields" :
            category === "missing" ? "Missing Fields" :
                CATEGORY_MAP[category] || category;

    // Add page number function
    const addPageNumbers = (doc) => {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }
    };

    doc.setFontSize(16);
    doc.text(`Member Report - ${memberName}`, 14, 16);
    doc.setFontSize(10);
    doc.text(`Membership: ${membershipNumber} | Category: ${categoryDisplay} | View: ${viewType}`, 14, 24);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    const fields = getFieldsByCategory(member, category, viewType);
    const body = fields.map((key, idx) => {
        const raw = getValueByPath(member, key);
        return [
            idx + 1,
            FIELD_MAP[key] || key,
            formatValuePlain(raw, key) || "—"
        ];
    });

    autoTable(doc, {
        startY: 36,
        head: [["S. No", "Field", "Value"]],
        body,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [25, 118, 210], textColor: 255, fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 12 },
            1: { cellWidth: 60 },
            2: { cellWidth: 'auto' }
        },
        theme: 'grid',
        // Add page number after table is drawn
        didDrawPage: (data) => {
            // This will be called for each page, but we'll add all page numbers at the end
        }
    });

    // Add page numbers after the table is completely drawn
    addPageNumbers(doc);

    const fileName = `${memberName.replace(/\s+/g, "_")}_${categoryDisplay.replace(/\s+/g, "_")}_${viewType}_${Date.now()}.pdf`;
    doc.save(fileName);
};