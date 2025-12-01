import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Field mapping (moved from MemberDetails)
export const FIELD_MAP = {
    // Personal - Combined title and name
    "personalDetails.titleCombinedName": "Member Name",
    "personalDetails.membershipDate": "Membership Date",
    "personalDetails.membershipNumber": "Membership No",
    "personalDetails.fatherCombinedName": "Father's Name",
    "personalDetails.motherCombinedName": "Mother's Name",
    "personalDetails.dateOfBirth": "Date of Birth",
    "personalDetails.ageInYears": "Age (Years)",
    "personalDetails.minor": "Is Minor",
    "personalDetails.gender": "Gender",
    "personalDetails.religion": "Religion",
    "personalDetails.caste": "Caste",
    "personalDetails.maritalStatus": "Marital Status",

    "personalDetails.amountInCredit": "Amount In Credit",


    "personalDetails.phoneNo": "Phone No",
    "personalDetails.alternatePhoneNo": "Alternate Phone",
    "personalDetails.emailId": "Email",
    "personalDetails.nameOfSpouse": "Spouse's Name",


    // Address
    "addressDetails.permanentAddress": "Permanent Address",
    "addressDetails.currentResidentalAddress": "Current Address",
    "addressDetails.previousCurrentAddress": "Previous Addresses",

    // Documents - Text Fields
    "documents.panNo": "PAN No",
    "documents.rationCard": "Ration Card",
    "documents.drivingLicense": "Driving License",
    "documents.aadhaarNo": "Aadhaar No",
    "documents.voterId": "Voter ID",
    "documents.passportNo": "Passport No",

    // Professional - Basic
    "professionalDetails.qualification": "Qualification",
    "professionalDetails.occupation": "Occupation",
    "professionalDetails.degreeNumber": "Degree Number",

    // Professional - Employment Type
    "professionalDetails.inCaseOfServiceGovt": "Government Service",
    // "professionalDetails.inCaseOfPrivate": "Private Service",
    // "professionalDetails.inCaseOfService": "Service",
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
    "familyDetails.familyMember": "Family Member Names",
    "familyDetails.familyMemberNo": "Family MemberShip Number",
    "familyDetails.relationWithApplicant": "Relation With Applicant",

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
    nomineeDetails: "Nominee Details",
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
        if (addressObj.cityTown) addressParts.push(addressObj.cityTown);
        if (addressObj.district) addressParts.push(addressObj.district);
        if (addressObj.state) addressParts.push(addressObj.state);
        if (addressObj.country) addressParts.push(addressObj.country);
        if (addressObj.pinCode) addressParts.push(`Pincode: ${addressObj.pinCode}`);

        return addressParts.join(", ");
    } catch (error) {
        console.warn("Address formatting error:", error);
        // Fallback to original formatting if error occurs
        try {
            return Object.entries(addressObj).map(([k, v]) => `${k}: ${formatValuePlain(v)}`).join("; ");
        } catch {
            return JSON.stringify(addressObj);
        }
    }
};

// Update the formatValuePlain function to handle the virtual field properly
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

    // Address fields
    if (
        fieldKey === "addressDetails.permanentAddress" ||
        fieldKey === "addressDetails.currentResidentalAddress"
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

    // Array
    if (Array.isArray(value)) {
        if (value.length === 0) return "";
        if (typeof value[0] === "object") {
            return value
                .map(v =>
                    Object.entries(v)
                        .map(([k, val]) => `${k}: ${formatValuePlain(val, k, member)}`)
                        .join("; ")
                )
                .join(" | ");
        }
        return value.join(", ");
    }

    // Object
    if (typeof value === "object") {
        return Object.entries(value)
            .map(([k, v]) => `${k}: ${formatValuePlain(v, k, member)}`)
            .join("; ");
    }

    return String(value);
};

// Update the getValueByPath function to handle virtual fields
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

    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
        if (cur === undefined || cur === null) return undefined;
        cur = cur[p];
    }
    return cur;
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

// Get fields by category and view type

// Get fields by category and view type with conditional logic
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

    if (category === "all") {
        const filtered = filteredKeys.filter(key => {
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
            const value = getValueByPath(member, key);
            return !isMissing(value);
        });
        return filterFieldsByOccupation(filtered, member);
    }

    if (category === "missing") {
        const filtered = filteredKeys.filter(key => {
            const value = getValueByPath(member, key);
            return isMissing(value);
        });
        return filterFieldsByOccupation(filtered, member);
    }

    // Specific category
    const filtered = filteredKeys.filter(key => {
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

// Generate PDF
export const generateMemberFieldsPDF = async (member, category, viewType = "all") => {
    if (!member) return;

    const doc = new jsPDF();
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

    // Function to add category section
    const addCategorySection = (doc, categoryKey, categoryName, fields, startY) => {
        if (fields.length === 0) return startY;

        // Add category header
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(categoryName, 14, startY);

        if (categoryKey === "familyDetails") {
            const familyTableData = getFamilyMembersTableData(member);

            if (familyTableData.length > 0) {
                autoTable(doc, {
                    startY: startY + 5,
                    head: [["S. No", "Family Member's Name", "Family Membership Number", "Relation With Member"]],
                    body: familyTableData,
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
                        1: { cellWidth: 'auto', textColor: [0, 0, 0] },
                        2: { cellWidth: 'auto', textColor: [0, 0, 0] },
                        3: { cellWidth: 'auto', textColor: [0, 0, 0] }
                    },
                    theme: 'grid',
                });
            } else {
                // No family members data available
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                doc.text("No family members data available", 14, startY + 10);
                return startY + 15;
            }

            return doc.lastAutoTable.finalY + 10;
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
                fontSize: 9,
                cellPadding: 3,
                textColor: [0, 0, 0],
            },

            headStyles: {
                fillColor: [25, 118, 210],
                textColor: 255,
                fontSize: 10,
                fontStyle: "bold"
            },

            columnStyles: {
                0: { cellWidth: 25, fontStyle: "bold" },  // ⭐ No Wrap + Bold
                1: { cellWidth: 60, fontStyle: "bold" },  // ⭐ Particulars Bold
                2: { cellWidth: "auto" }
            },

            theme: "grid",
        });


        return doc.lastAutoTable.finalY + 10;
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
    if (category === "personalDetails" || category === "all") {
        try {
            const pageWidth = doc.internal.pageSize.width;
            const photoWidth = 25;
            const photoHeight = 25;
            const photoX = pageWidth - 40; // Right side with margin
            const photoY = startY;

            // If a URL exists, try to load & draw it. If it fails, fall back to placeholder.
            if (passportPhotoUrl) {
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
                    doc.text("Photo", photoX + (photoWidth / 2), photoY + (photoHeight / 2) + 1, { align: 'center' });
                }
            } else {
                // No URL provided — draw placeholder box with "Photo"
                doc.setFillColor(240, 240, 240);
                doc.rect(photoX, photoY, photoWidth, photoHeight, 'F');
                doc.setFontSize(6);
                doc.setTextColor(100, 100, 100);
                doc.text("Photo", photoX + (photoWidth / 2), photoY + (photoHeight / 2) + 1, { align: 'center' });
            }

            // Add photo border (draw in both real image and placeholder cases)
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
    doc.text(`Member Name - ${memberName}`, infoStartX, infoStartY);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Membership Number: ${membershipNumber}`, infoStartX, infoStartY + 7);
    // doc.text(`Category: ${categoryDisplay} | View: ${viewType}`, infoStartX, infoStartY + 14);
    doc.text(`Generated: ${new Date().toLocaleString()}`, infoStartX, infoStartY + 21);

    // Adjust startY for the content (below both photo and text)
    let currentY = startY + 35;

    if (category === "all") {
        // For "all" category, organize by individual categories
        const categories = Object.keys(CATEGORY_MAP);

        for (const categoryKey of categories) {
            const categoryFields = getFieldsByCategory(member, categoryKey, viewType);

            if (categoryFields.length > 0) {
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
                startY: startY + 5,
                head: [["S. No", "Particulars", "Member Details"]],

                body: body,

                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    textColor: [0, 0, 0],
                },

                headStyles: {
                    fillColor: [25, 118, 210],
                    textColor: 255,
                    fontSize: 10,
                    fontStyle: "bold"
                },

                columnStyles: {
                    0: { cellWidth: 25, fontStyle: "bold" },  // ⭐ No Wrap + Bold
                    1: { cellWidth: 60, fontStyle: "bold" },  // ⭐ Particulars Bold
                    2: { cellWidth: "auto" }
                },

                theme: "grid",
            });


        }
    }

    // Add page numbers after all content is drawn
    addPageNumbers(doc);

    const fileName = `${memberName.replace(/\s+/g, "_")}_${categoryDisplay.replace(/\s+/g, "_")}_${viewType}_${Date.now()}.pdf`;
    doc.save(fileName);
};