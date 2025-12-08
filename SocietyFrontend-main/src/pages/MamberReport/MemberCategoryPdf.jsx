import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const FIELD_MAP = {
    // Personal - Combined title and name
    "personalDetails.titleCombinedName": "Member Name",
    "personalDetails.membershipDate": "Membership Date",
    "personalDetails.membershipNumber": "Membership No",
    "personalDetails.fatherCombinedName": "Father's Name",
    "personalDetails.motherCombinedName": "Mother's Name",
    "personalDetails.dateOfBirth": "Date of Birth",
    "personalDetails.ageInYears": "Age (Years)",
    "personalDetails.minor": "Minor",
    "personalDetails.gender": "Gender",
    "personalDetails.religion": "Religion",
    "personalDetails.caste": "Category",
    "personalDetails.maritalStatus": "Marital Status",

    "personalDetails.phoneNo1": "Primary Number",
    "personalDetails.phoneNo2": "Secondary Number",
    "personalDetails.whatsapp": "WhatsApp Number",
    "personalDetails.landlineNo": "Residence Landline  Number",
    "personalDetails.landlineOffice": "Office Landline  Number",
    "personalDetails.emailId1": "Primary Email",
    "personalDetails.emailId2": "Secondary Email",
    "personalDetails.emailId3": "Optional Email",
    "personalDetails.nameOfSpouse": "Spouse's Name",

    // Address
    "addressDetails.currentResidentalAddress": "Current Address",
    "addressDetails.permanentAddress": "Permanent Address",
    "addressDetails.previousCurrentAddress": "Previous Addresses",

    // Documents - Text Fields
    "documents.aadhaarNo": "Aadhaar No",
    "documents.panNo": "PAN No",
    "documents.rationCard": "Ration Card",
    "documents.drivingLicense": "Driving License",
    "documents.voterId": "Voter ID",
    "documents.passportNo": "Passport No",

    // Professional - Basic
    "professionalDetails.qualification": "Qualification",
    "professionalDetails.occupation": "Occupation",
    "professionalDetails.degreeNumber": "Certificate of Membership",

    // Professional - Employment Type
    "professionalDetails.serviceType": "Service Type",

    // Professional - Service Details
    "professionalDetails.serviceDetails.fullNameOfCompany": "Company Name",
    "professionalDetails.serviceDetails.addressOfCompany": "Company Address",
    "professionalDetails.serviceDetails.monthlyIncome": "Monthly Income",
    "professionalDetails.serviceDetails.designation": "Designation",
    "professionalDetails.serviceDetails.dateOfJoining": "Date of Joining",
    "professionalDetails.serviceDetails.dateOfRetirement": "Date of Retirement",
    "professionalDetails.serviceDetails.employeeCode": "Employee Code",
    "professionalDetails.serviceDetails.officeNo": "Office Phone",

    // Professional - Business
    "professionalDetails.inCaseOfBusiness": "Business",
    "professionalDetails.businessDetails.fullNameOfCompany": "Business Name",
    "professionalDetails.businessDetails.addressOfCompany": "Business Address",
    "professionalDetails.businessDetails.businessStructure": "Business Structure",
    "professionalDetails.businessDetails.gstCertificate": "GST Certificate",

    "familyDetails.familyMember": "Member Names",
    "familyDetails.familyMemberNo": "Membership Number",
    "familyDetails.relationWithApplicant": "Relation With Member",

    "nomineeDetails.nomineeName": "Nominee Name",
    "nomineeDetails.relationWithApplicant": "Relation with Member",
    "nomineeDetails.nomineeMobileNo": "Nominee Contact Number",
    "financialDetails.shareCapital": "Share Capital",
    "financialDetails.compulsory": "Compulsory Deposit",
    "financialDetails.optionalDeposit": "Optional Deposit",

    "creditDetails.cibilScore": "Cibil Score"
};

export const CATEGORY_MAP = {
    personalDetails: "Personal Details",
    addressDetails: "Address Details",
    documents: "Documents",
    professionalDetails: "Professional Details",
    bankDetails: "Bank Details",
    familyDetails: "Family Details",
    nomineeDetails: "Nominee Details",
    introductionDetails: "Introducer/Witness By",
    financialDetails: "Financial Details As on 31/03/2025",
    creditDetails: "CIBIL Score Details",
};

// Helper functions

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

// Special function to format address objects without keys
const formatAddressValue = (addressObj) => {
    if (!addressObj || typeof addressObj !== 'object') return "";

    try {
        const addressParts = [];

        // Add address components in a logical order without field names
        if (addressObj.flatHouseNo) addressParts.push(addressObj.flatHouseNo);
        if (addressObj.areaStreetSector) addressParts.push(addressObj.areaStreetSector);
        if (addressObj.landmark) addressParts.push(addressObj.landmark);
        if (addressObj.cityTown || addressObj.city) addressParts.push(addressObj.cityTown || addressObj.city);
        if (addressObj.district) addressParts.push(addressObj.district);
        if (addressObj.state) addressParts.push(addressObj.state);
        if (addressObj.country) addressParts.push(addressObj.country);
        if (addressObj.pinCode || addressObj.pincode) addressParts.push(`Pincode: ${addressObj.pinCode || addressObj.pincode}`);

        return addressParts.join(", ");
    } catch (error) {
        console.warn("Address formatting error:", error);
        return JSON.stringify(addressObj);
    }
};

export const formatValuePlain = (value, fieldKey, member) => {
    if (value === undefined || value === null) return "";

    // Special case: Title + Name merge - handle virtual fields
    if (fieldKey === "personalDetails.titleCombinedName") {
        const title = member?.personalDetails?.title || "";
        const name = member?.personalDetails?.nameOfMember || "";
        const combined = `${title} ${name}`.trim();
        return combined || "—";
    }

    if (fieldKey === "personalDetails.fatherCombinedName") {
        const title = member?.personalDetails?.fatherTitle || "";
        const name = member?.personalDetails?.nameOfFather || "";
        const combined = `${title} ${name}`.trim();
        return combined || "—";
    }

    if (fieldKey === "personalDetails.motherCombinedName") {
        const title = member?.personalDetails?.motherTitle || "";
        const name = member?.personalDetails?.nameOfMother || "";
        const combined = `${title} ${name}`.trim();
        return combined || "—";
    }

    if (fieldKey === "addressDetails.previousCurrentAddress") {
        if (Array.isArray(value)) {
            if (value.length === 0) return "No previous addresses";

            const formattedAddresses = value.map((addr, index) => {
                const formatted = formatAddressValue(addr);
                return `• Address ${index + 1}: ${formatted}`;
            });

            return formattedAddresses.join('\n'); // Single line spacing
        }
        return formatAddressValue(value);
    }

    // Current and Permanent Address fields
    if (
        fieldKey === "addressDetails.currentResidentalAddress" ||
        fieldKey === "addressDetails.permanentAddress"
    ) {
        return formatAddressValue(value);
    }

    // Date fields
    if (
        fieldKey === "personalDetails.dateOfBirth" ||
        fieldKey === "personalDetails.membershipDate" ||
        fieldKey === "professionalDetails.serviceDetails.dateOfJoining" ||
        fieldKey === "professionalDetails.serviceDetails.dateOfRetirement"
    ) {
        return formatDate(value);
    }

    // Boolean
    if (typeof value === "boolean") return value ? "Yes" : "No";

    // Array (excluding previous addresses which is handled above)
    if (Array.isArray(value)) {
        if (value.length === 0) return "";
        if (typeof value[0] === "object") {
            // For other object arrays, use line breaks
            return value
                .map(v => formatAddressValue(v))
                .join("\n");
        }
        return value.join(", ");
    }

    // Object
    if (typeof value === "object") {
        return formatAddressValue(value);
    }

    return String(value);
};

export const getValueByPath = (obj, path) => {
    if (!path || !obj) return undefined;

    // Handle virtual fields
    if (path === "personalDetails.titleCombinedName") {
        const title = getValueByPath(obj, "personalDetails.title") || "";
        const name = getValueByPath(obj, "personalDetails.nameOfMember") || "";
        const combined = `${title} ${name}`.trim();
        return combined || undefined;
    }

    if (path === "personalDetails.fatherCombinedName") {
        const title = getValueByPath(obj, "personalDetails.fatherTitle") || "";
        const name = getValueByPath(obj, "personalDetails.nameOfFather") || "";
        const combined = `${title} ${name}`.trim();
        return combined || undefined;
    }

    if (path === "personalDetails.motherCombinedName") {
        const title = getValueByPath(obj, "personalDetails.motherTitle") || "";
        const name = getValueByPath(obj, "personalDetails.nameOfMother") || "";
        const combined = `${title} ${name}`.trim();
        return combined || undefined;
    }

    // Handle array notation (e.g., bankDetails[0].accountHolderName)
    if (path.includes('[') && path.includes(']')) {
        const match = path.match(/([^\.]+)\[(\d+)\](?:\.(.+))?/);
        if (match) {
            const arrayName = match[1];
            const index = parseInt(match[2], 10);
            const restPath = match[3];

            // Get the array
            const array = obj[arrayName];
            if (Array.isArray(array) && array[index]) {
                if (restPath) {
                    // Recursively get value from the object in array
                    return getValueByPath(array[index], restPath);
                }
                return array[index];
            }
            return undefined;
        }
    }

    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
        if (cur === undefined || cur === null) return undefined;
        cur = cur[p];
    }
    return cur;
};

// Add this function to get bank details table data
const getBankDetailsTableData = (member) => {
    const bankDetails = getValueByPath(member, "bankDetails");

    if (!bankDetails || !Array.isArray(bankDetails) || bankDetails.length === 0) {
        return [];
    }

    const tableData = bankDetails.map((bank, index) => {
        return [
            index + 1, // Serial number
            bank.accountHolderName || "—",
            bank.bankName || "—",
            bank.branch || "—",
            bank.accountNumber || "—",
            bank.ifscCode || "—"
        ];
    });

    return tableData;
};

// Update the isMissing function to handle the virtual field
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

export const getMemberFullName = (member) => {
    const title = getValueByPath(member, "personalDetails.title") || "";
    const name = getValueByPath(member, "personalDetails.nameOfMember") || "";

    if (title && name) return `${title} ${name}`;
    if (name) return name;
    if (title) return title;

    return "Member";
};

export const getOccupationType = (member) => {
    const prof = getValueByPath(member, "professionalDetails") || {};

    const occ = String(prof.occupation || "").toLowerCase();
    const serviceType = String(prof.inCaseOfService || "").toLowerCase();

    const isPrivate = prof.inCaseOfPrivate === true;
    const isGovt = prof.inCaseOfServiceGovt === true;
    const isBusiness = prof.inCaseOfBusiness === true;

    // PRIVATE SERVICE
    if (
        occ.includes("private") ||
        isPrivate ||
        serviceType.includes("private")
    ) return "private";

    // GOVERNMENT SERVICE
    if (
        occ.includes("government") ||
        isGovt ||
        serviceType.includes("government")
    ) return "government";

    // BUSINESS
    if (
        occ.includes("business") ||
        isBusiness ||
        serviceType.includes("business")
    ) return "business";

    return null;
};

export const filterFieldsByOccupation = (fields, member) => {
    const type = getOccupationType(member);

    return fields.filter(key => {
        // Always display basic professional fields
        if ([
            "professionalDetails.qualification",
            "professionalDetails.occupation",
            "professionalDetails.inCaseOfService",
            "professionalDetails.degreeNumber",
        ].includes(key)) {
            return true;
        }

        // GOVERNMENT SERVICE FIELDS
        if (type === "government") {
            return key.startsWith("professionalDetails.serviceDetails.")
                || key === "professionalDetails.inCaseOfServiceGovt";
        }

        // PRIVATE SERVICE FIELDS
        if (type === "private") {
            return key.startsWith("professionalDetails.serviceDetails.")
                || key === "professionalDetails.inCaseOfPrivate";
        }

        // BUSINESS FIELDS
        if (type === "business") {
            return key.startsWith("professionalDetails.businessDetails.")
                || key === "professionalDetails.inCaseOfBusiness";
        }

        // Default: show all non-professional fields
        return !key.startsWith("professionalDetails.");
    });
};

export const getFieldsByCategory = (member, category, viewType = "all") => {
    const allKeys = Object.keys(FIELD_MAP);

    // Filter out spouse name if marital status is not married
    const filteredKeys = allKeys.filter(key => {
        // Always include all fields except spouse name
        if (key !== "personalDetails.nameOfSpouse") return true;

        // Only include spouse name if marital status is married
        const maritalStatus = getValueByPath(member, "personalDetails.maritalStatus") || "";
        return String(maritalStatus).toLowerCase() === "married";
    });

    // Special handling for introduction details
    if (category === "introductionDetails") {
        const introFields = ["nomineeDetails.memberShipNo", "nomineeDetails.introduceBy"];
        return introFields.filter(key => {
            const value = getValueByPath(member, key);
            if (viewType === "all") return true;
            if (viewType === "filled") return !isMissing(value);
            if (viewType === "missing") return isMissing(value);
            return true;
        });
    }

    // Special handling for nominee details - witness fields को exclude करें
    if (category === "nomineeDetails") {
        const nomineeFields = filteredKeys.filter(key =>
            key.startsWith("nomineeDetails.") &&
            !["nomineeDetails.memberShipNo", "nomineeDetails.introduceBy"].includes(key)
        );

        return nomineeFields.filter(key => {
            const value = getValueByPath(member, key);
            if (viewType === "all") return true;
            if (viewType === "filled") return !isMissing(value);
            if (viewType === "missing") return isMissing(value);
            return true;
        });
    }

    // Special handling for bank details - return empty array, handled separately
    if (category === "bankDetails") {
        return [];
    }

    if (category === "all") {
        const filtered = filteredKeys.filter(key => {
            // witness fields को exclude करें
            if (["nomineeDetails.memberShipNo", "nomineeDetails.introduceBy"].includes(key)) {
                return false;
            }

            const value = getValueByPath(member, key);
            const missing = isMissing(value);

            if (viewType === "all") return true;
            if (viewType === "filled") return !missing;
            if (viewType === "missing") return missing;
            return true;
        });

        // Apply occupation-based filtering for professional fields
        return filterFieldsByOccupation(filtered, member);
    }

    if (category === "filled") {
        const filtered = filteredKeys.filter(key => {
            // witness fields को exclude करें
            if (["nomineeDetails.memberShipNo", "nomineeDetails.introduceBy"].includes(key)) {
                return false;
            }

            const value = getValueByPath(member, key);
            return !isMissing(value);
        });
        return filterFieldsByOccupation(filtered, member);
    }

    if (category === "missing") {
        const filtered = filteredKeys.filter(key => {
            // witness fields को exclude करें
            if (["nomineeDetails.memberShipNo", "nomineeDetails.introduceBy"].includes(key)) {
                return false;
            }

            const value = getValueByPath(member, key);
            return isMissing(value);
        });
        return filterFieldsByOccupation(filtered, member);
    }

    // Specific category
    const filtered = filteredKeys.filter(key => {
        // witness fields को exclude करें
        if (["nomineeDetails.memberShipNo", "nomineeDetails.introduceBy"].includes(key)) {
            return false;
        }

        const value = getValueByPath(member, key);
        const missing = isMissing(value);
        const matchesCategory = key.startsWith(category);

        if (viewType === "all") return matchesCategory;
        if (viewType === "filled") return matchesCategory && !missing;
        if (viewType === "missing") return matchesCategory && missing;
        return matchesCategory;
    });

    // Apply occupation filtering for professional details
    if (category === "professionalDetails") {
        return filterFieldsByOccupation(filtered, member);
    }

    return filtered;
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

const getFamilyMembersTableData = (member) => {
    const familyMembers = getValueByPath(member, "familyDetails.familyMember");
    const familyMemberNos = getValueByPath(member, "familyDetails.familyMemberNo");
    const relations = getValueByPath(member, "familyDetails.relationWithApplicant");

    // If no family members data exists
    if (!familyMembers && !familyMemberNos && !relations) {
        return [];
    }

    let tableData = [];

    if (Array.isArray(familyMembers) && Array.isArray(familyMemberNos) && Array.isArray(relations)) {
        const maxLength = Math.max(familyMembers.length, familyMemberNos.length, relations.length);
        for (let i = 0; i < maxLength; i++) {
            const name = familyMembers[i] || "—";
            const memberNo = familyMemberNos[i] || "—";
            const relation = relations[i] || "—";

            if (name !== "—" || memberNo !== "—" || relation !== "—") {
                tableData.push([i + 1, name, memberNo, relation]);
            }
        }
    }
    return tableData;
};

export const generateMemberFieldsPDF = async (member, category, viewType = "all") => {
    if (!member) return;

    const doc = new jsPDF();
    const originalSetFontSize = doc.setFontSize;
    doc.setFontSize = function (size) {
        return originalSetFontSize.call(this, size - 2);
    };
    const memberName = getMemberFullName(member);

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

    // Function to get introduction/witness data
    const getIntroductionData = (member) => {
        const memberShipNo = getValueByPath(member, "nomineeDetails.memberShipNo");
        const introduceBy = getValueByPath(member, "nomineeDetails.introduceBy");

        const data = [];

        if (memberShipNo || introduceBy) {
            if (memberShipNo) {
                data.push(["1", "Membership No", memberShipNo || "—"]);
            }
            if (introduceBy) {
                data.push(["2", "Introduced By", introduceBy || "—"]);
            }
        }

        return data;
    };

    // Function to add category section (updated version with introduction section)
    const addCategorySection = (doc, categoryKey, categoryName, fields, startY) => {
        // Allow bankDetails, familyDetails, and introductionDetails even if fields array is empty
        if (fields.length === 0 &&
            categoryKey !== "introductionDetails" &&
            categoryKey !== "bankDetails" &&
            categoryKey !== "familyDetails") {
            return startY;
        }

        // Add category header
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(categoryName, 14, startY);

        // Handle bank details with table
        if (categoryKey === "bankDetails") {
            const bankTableData = getBankDetailsTableData(member);

            if (bankTableData.length > 0) {
                autoTable(doc, {
                    startY: startY + 5,
                    head: [["S. No", "Account Holder", "Bank Name", "Branch", "Account Number", "IFSC Code"]],
                    body: bankTableData,
                    styles: {
                        fontSize: 11,
                        cellPadding: 4,
                        textColor: [0, 0, 0],
                        fontStyle: 'normal',
                        lineHeight: 1.3
                    },
                    headStyles: {
                        fillColor: [25, 118, 210],
                        textColor: 255,
                        fontSize: 12,
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: { cellWidth: 15 },
                        1: { cellWidth: 40 },
                        2: { cellWidth: 35 },
                        3: { cellWidth: 30 },
                        4: { cellWidth: 40 },
                        5: { cellWidth: 35 }
                    },
                    theme: 'grid',
                });
                return doc.lastAutoTable.finalY + 10;
            } else {
                doc.setFontSize(11);
                doc.setFont(undefined, 'normal');
                doc.text("No bank details available", 14, startY + 10);
                return startY + 15;
            }
        }

        // Handle family details
        if (categoryKey === "familyDetails") {
            const familyTableData = getFamilyMembersTableData(member);

            if (familyTableData.length > 0) {
                autoTable(doc, {
                    startY: startY + 5,
                    head: [["S. No", "Member's Name", "Membership Number", "Relation With Member"]],
                    body: familyTableData,
                    styles: {
                        fontSize: 11,
                        cellPadding: 4,
                        textColor: [0, 0, 0],
                        fontStyle: 'normal',
                        lineHeight: 1.3
                    },
                    headStyles: {
                        fillColor: [25, 118, 210],
                        textColor: 255,
                        fontSize: 12,
                        fontStyle: 'bold'
                    },
                    bodyStyles: {
                        textColor: [0, 0, 0],
                        lineHeight: 1.3
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245],
                        textColor: [0, 0, 0]
                    },
                    columnStyles: {
                        0: { cellWidth: 15, textColor: [0, 0, 0] },
                        1: { cellWidth: 'auto', textColor: [0, 0, 0] },
                        2: { cellWidth: 'auto', textColor: [0, 0, 0] },
                        3: { cellWidth: 'auto', textColor: [0, 0, 0] }
                    },
                    theme: 'grid',
                });
            } else {
                // No family members data available
                doc.setFontSize(11);
                doc.setFont(undefined, 'normal');
                doc.text("No family members data available", 14, startY + 10);
                return startY + 15;
            }

            return doc.lastAutoTable.finalY + 10;
        }

        // Handle introduction/witness section
        if (categoryKey === "introductionDetails") {
            const introData = getIntroductionData(member);

            if (introData.length > 0) {
                autoTable(doc, {
                    startY: startY + 5,
                    head: [["S. No", "Particulars", "Details"]],
                    body: introData,
                    styles: {
                        fontSize: 11,
                        cellPadding: 4,
                        textColor: [0, 0, 0],
                        lineHeight: 1.3
                    },
                    headStyles: {
                        fillColor: [25, 118, 210],
                        textColor: 255,
                        fontSize: 12,
                        fontStyle: "bold"
                    },
                    columnStyles: {
                        0: { cellWidth: 25, fontStyle: "bold", cellPadding: 4 },
                        1: { cellWidth: 60, fontStyle: "bold", cellPadding: 4 },
                        2: { cellWidth: "auto", cellPadding: 4 }
                    },
                    theme: "grid",
                });
                return doc.lastAutoTable.finalY + 10;
            } else {
                // No introduction data available
                doc.setFontSize(11);
                doc.setFont(undefined, 'normal');
                doc.text("No introduction/witness data available", 14, startY + 10);
                return startY + 15;
            }
        }

        // Prepare table data with serial numbers starting from 1 for each category
        const body = fields.map((key, idx) => {
            let displayValue;

            // Handle virtual fields specially
            if (key === "personalDetails.titleCombinedName") {
                const title = getValueByPath(member, "personalDetails.title") || "";
                const name = getValueByPath(member, "personalDetails.nameOfMember") || "";
                displayValue = `${title} ${name}`.trim() || "—";
            } else if (key === "personalDetails.fatherCombinedName") {
                const title = getValueByPath(member, "personalDetails.fatherTitle") || "";
                const name = getValueByPath(member, "personalDetails.nameOfFather") || "";
                displayValue = `${title} ${name}`.trim() || "—";
            } else if (key === "personalDetails.motherCombinedName") {
                const title = getValueByPath(member, "personalDetails.motherTitle") || "";
                const name = getValueByPath(member, "personalDetails.nameOfMother") || "";
                displayValue = `${title} ${name}`.trim() || "—";
            } else {
                const raw = getValueByPath(member, key);
                displayValue = formatValuePlain(raw, key, member) || "—";
            }

            return [
                idx + 1, // Serial number starting from 1 for each category
                FIELD_MAP[key] || key,
                displayValue
            ];
        });

        autoTable(doc, {
            startY: startY + 5,
            head: [["S. No", "Particulars", "Member Details"]],

            body: body,

            styles: {
                fontSize: 11,
                cellPadding: 4,
                textColor: [0, 0, 0],
                lineHeight: 1.3,
                overflow: 'linebreak'
            },

            headStyles: {
                fillColor: [25, 118, 210],
                textColor: 255,
                fontSize: 12,
                fontStyle: "bold"
            },

            columnStyles: {
                0: { cellWidth: 25, fontStyle: "bold", cellPadding: 4 },
                1: { cellWidth: 60, fontStyle: "bold", cellPadding: 4 },
                2: { cellWidth: "auto", cellPadding: 4, minCellHeight: 15 }
            },

            theme: "grid",
        });

        return doc.lastAutoTable.finalY + 10;
    };

    // Add society name at top center
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text("CA Co-Operative Thrift & Credit Society LTD", doc.internal.pageSize.width / 2, 15, { align: 'center' });
    doc.setFont(undefined, 'normal');

    // Get passport size photo URL
    const passportPhotoUrl = getValueByPath(member, "documents.passportSize");
    let startY = 35; // Start position for member info section

    if (category === "personalDetails" || category === "all") {
        try {
            const pageWidth = doc.internal.pageSize.width;
            const photoWidth = 30;
            const photoHeight = 30;
            const photoX = pageWidth - 45;
            const photoY = startY;

            if (passportPhotoUrl) {
                try {
                    const imageData = await loadImageAsBase64(passportPhotoUrl);
                    doc.addImage(imageData, 'JPEG', photoX, photoY, photoWidth, photoHeight);
                } catch {
                    doc.setFillColor(240, 240, 240);
                    doc.rect(photoX, photoY, photoWidth, photoHeight, 'F');
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text("Photo", photoX + (photoWidth / 2), photoY + (photoHeight / 2) + 1, { align: 'center' });
                }
            } else {
                doc.setFillColor(240, 240, 240);
                doc.rect(photoX, photoY, photoWidth, photoHeight, 'F');
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text("Photo", photoX + (photoWidth / 2), photoY + (photoHeight / 2) + 1, { align: 'center' });
            }

            // Border
            doc.setDrawColor(150);
            doc.setLineWidth(0.5);
            doc.rect(photoX, photoY, photoWidth, photoHeight);

            // Add Status Below Photo
            const status = member?.status || "Active";
            doc.setFontSize(11);
            doc.setFont(undefined, "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(
                `Status: ${status}`,
                photoX + photoWidth / 2,
                photoY + photoHeight + 8,
                { align: "center" }
            );

        } catch (error) {
            console.warn("Could not add passport photo to PDF:", error);
        }
    }

    // Add member information on the left side (same line as photo)
    const infoStartX = 14;
    const infoStartY = startY;

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(`Member Name - ${memberName}`, infoStartX, infoStartY);

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Membership Number: ${membershipNumber}`, infoStartX, infoStartY + 8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, infoStartX, infoStartY + 24);

    // Adjust startY for the content (below both photo and text)
    let currentY = startY + 35;

    if (category === "all") {
        // For "all" category, organize by individual categories
        const categories = Object.keys(CATEGORY_MAP);

        for (const categoryKey of categories) {
            const categoryFields = getFieldsByCategory(member, categoryKey, viewType);

            // Show category if it has fields OR it's one of the special categories that might have tables
            const shouldShowCategory = categoryFields.length > 0 ||
                categoryKey === "introductionDetails" ||
                categoryKey === "bankDetails" ||
                categoryKey === "familyDetails";

            if (shouldShowCategory) {
                // Check if we need a new page
                if (currentY > doc.internal.pageSize.height - 50) {
                    doc.addPage();
                    currentY = 20;
                }

                currentY = addCategorySection(
                    doc,
                    categoryKey,
                    CATEGORY_MAP[categoryKey],
                    categoryFields,
                    currentY
                );
            }
        }
    } else {
        // For specific categories, use the existing single table approach
        const fields = getFieldsByCategory(member, category, viewType);

        if (fields.length > 0) {
            const body = fields.map((key, idx) => {
                let displayValue;

                // Handle virtual fields specially
                if (key === "personalDetails.titleCombinedName") {
                    const title = getValueByPath(member, "personalDetails.title") || "";
                    const name = getValueByPath(member, "personalDetails.nameOfMember") || "";
                    displayValue = `${title} ${name}`.trim() || "—";
                } else if (key === "personalDetails.fatherCombinedName") {
                    const title = getValueByPath(member, "personalDetails.fatherTitle") || "";
                    const name = getValueByPath(member, "personalDetails.nameOfFather") || "";
                    displayValue = `${title} ${name}`.trim() || "—";
                } else if (key === "personalDetails.motherCombinedName") {
                    const title = getValueByPath(member, "personalDetails.motherTitle") || "";
                    const name = getValueByPath(member, "personalDetails.nameOfMother") || "";
                    displayValue = `${title} ${name}`.trim() || "—";
                } else {
                    const raw = getValueByPath(member, key);
                    displayValue = formatValuePlain(raw, key, member) || "—";
                }

                return [
                    idx + 1,
                    FIELD_MAP[key] || key,
                    displayValue
                ];
            });

            autoTable(doc, {
                startY: currentY,
                head: [["S. No", "Particulars", "Member Details"]],

                body: body,

                styles: {
                    fontSize: 11,
                    cellPadding: 4,
                    textColor: [0, 0, 0],
                    lineHeight: 1.3,
                    overflow: 'linebreak'
                },

                headStyles: {
                    fillColor: [25, 118, 210],
                    textColor: 255,
                    fontSize: 12,
                    fontStyle: "bold"
                },

                columnStyles: {
                    0: { cellWidth: 25, fontStyle: "bold", cellPadding: 4 },
                    1: { cellWidth: 60, fontStyle: "bold", cellPadding: 4 },
                    2: { cellWidth: "auto", cellPadding: 4, minCellHeight: 15 }
                },

                theme: "grid",
            });

            currentY = doc.lastAutoTable.finalY + 10;
        } else if (category === "bankDetails" || category === "familyDetails" || category === "introductionDetails") {
            // Handle special categories that use table format
            currentY = addCategorySection(
                doc,
                category,
                CATEGORY_MAP[category],
                [],
                currentY
            );
        }
    }

    // Add page numbers after all content is drawn
    addPageNumbers(doc);

    const fileName = `${memberName.replace(/\s+/g, "_")}_${categoryDisplay.replace(/\s+/g, "_")}_${viewType}_${Date.now()}.pdf`;
    doc.save(fileName);
};