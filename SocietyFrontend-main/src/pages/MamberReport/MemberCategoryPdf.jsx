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

// Format date to DD/MM/YYYY
const formatDate = (dateValue) => {
    if (!dateValue) return "";
    
    try {
        const date = new Date(dateValue);
        // Check if date is valid
        if (isNaN(date.getTime())) return String(dateValue);
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.warn("Date formatting error:", error);
        return String(dateValue);
    }
};

export const formatValuePlain = (value, fieldKey) => {
    if (value === undefined || value === null) return "";
    
    // Handle date fields specifically
    if (fieldKey === "personalDetails.dateOfBirth" || 
        fieldKey === "personalDetails.membershipDate" ||
        fieldKey === "professionalDetails.serviceDetails.dateOfJoining" ||
        fieldKey === "professionalDetails.serviceDetails.dateOfRetirement") {
        return formatDate(value);
    }
    
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

// Function to load image and convert to base64
const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg');
                resolve(dataURL);
            } catch (error) {
                reject(error);
            }
        };
        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };
        img.src = url;
    });
};

// Generate PDF
export const generateMemberFieldsPDF = async (member, category, viewType = "all") => {
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
            doc.setTextColor(0, 0, 0);
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }
    };

    // Add society name at top center
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("CA Co-Operative Thrift & Credit Society LTD", doc.internal.pageSize.width / 2, 15, { align: 'center' });
    doc.setFont(undefined, 'normal');

    // Get passport size photo URL
    const passportPhotoUrl = getValueByPath(member, "documents.passportSize");
    let startY = 35; // Start position for member info section

    // Create member info section with photo and text side by side
    if (passportPhotoUrl && (category === "personalDetails" || category === "all")) {
        try {
            const pageWidth = doc.internal.pageSize.width;
            const photoWidth = 25;
            const photoHeight = 25;
            const photoX = pageWidth - 40; // Right side with margin
            const photoY = startY;
            
            // Try to load and add the actual image
            try {
                const imageData = await loadImageAsBase64(passportPhotoUrl);
                doc.addImage(imageData, 'JPEG', photoX, photoY, photoWidth, photoHeight);
            } catch (imageError) {
                console.warn("Could not load passport photo image, using placeholder:", imageError);
                // Fallback to placeholder if image loading fails
                doc.setFillColor(240, 240, 240);
                doc.rect(photoX, photoY, photoWidth, photoHeight, 'F');
                doc.setFontSize(6);
                doc.setTextColor(100, 100, 100);
                doc.text("Photo", photoX + photoWidth/2, photoY + photoHeight/2, { align: 'center' });
            }
            
            // Add photo border
            doc.setDrawColor(150);
            doc.setLineWidth(0.5);
            doc.rect(photoX, photoY, photoWidth, photoHeight);
            
        } catch (error) {
            console.warn("Could not add passport photo to PDF:", error);
        }
    }

    // Add member information on the left side (same line as photo)
    const infoStartX = 14;
    const infoStartY = startY;
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Member Report - ${memberName}`, infoStartX, infoStartY);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Membership: ${membershipNumber}`, infoStartX, infoStartY + 7);
    doc.text(`Category: ${categoryDisplay} | View: ${viewType}`, infoStartX, infoStartY + 14);
    doc.text(`Generated: ${new Date().toLocaleString()}`, infoStartX, infoStartY + 21);

    // Adjust startY for the table (below both photo and text)
    startY += 35; // Increased space to accommodate the member info section

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
        startY: startY,
        head: [["S. No", "Field", "Value"]],
        body,
        styles: { 
            fontSize: 9, 
            cellPadding: 3,
            textColor: [0, 0, 0],
            fontStyle: 'normal'
        },
        headStyles: { 
            fillColor: [25, 118, 210], 
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
        },
        bodyStyles: {
            textColor: [0, 0, 0]
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
            textColor: [0, 0, 0]
        },
        columnStyles: {
            0: { cellWidth: 12, textColor: [0, 0, 0] },
            1: { cellWidth: 60, textColor: [0, 0, 0] },
            2: { cellWidth: 'auto', textColor: [0, 0, 0] }
        },
        theme: 'grid',
    });

    // Add page numbers after the table is completely drawn
    addPageNumbers(doc);

    const fileName = `${memberName.replace(/\s+/g, "_")}_${categoryDisplay.replace(/\s+/g, "_")}_${viewType}_${Date.now()}.pdf`;
    doc.save(fileName);
};