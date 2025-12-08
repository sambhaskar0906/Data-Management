import React from 'react'

export const FieldMap = {

    //personal details
    "personalDetails.title": "Title",
    "personalDetails.nameOfMember": "Member Name",
    "personalDetails.membershipNumber": "Membership No",
    "personalDetails.membershipDate": "Membership Date",
    "personalDetails.fatherTitle": "Father's Title",
    "personalDetails.nameOfFather": "Father's Name",
    "personalDetails.motherTitle": "Mother's Title",
    "personalDetails.nameOfMother": "Mother's Name",
    "personalDetails.dateOfBirth": "Date of Birth",
    "personalDetails.ageInYears": "Age (Years)",
    "personalDetails.minor": "Minor",
    "personalDetails.civilScore": "Civil Score",
    "personalDetails.gender": "Gender",
    "personalDetails.maritalStatus": "Marital Status",
    "personalDetails.spouse": "Spouse's Title",
    "personalDetails.nameOfSpouse": "Spouse's Name",
    "personalDetails.religion": "Religion",
    "personalDetails.caste": "Caste",
    "personalDetails.phoneNo1": "Primary Number",
    "personalDetails.phoneNo2": "Secondary Number",
    "personalDetails.whatsapp": "WhatsApp Number",
    "personalDetails.landlineNo": "Residence Landline  Number",
    "personalDetails.landlineOffice": "Office Landline  Number",
    "personalDetails.emailId1": "Primary Email",
    "personalDetails.emailId2": "Secondary Email",
    "personalDetails.emailId3": "Optional Email",


    //address details
    "addressDetails.permanentAddress.flatHouseNo": "Permanent - Flat/House No",
    "addressDetails.permanentAddress.areaStreetSector": "Permanent - Area/Street/Sector",
    "addressDetails.permanentAddress.locality": "Permanent - Locality",
    "addressDetails.permanentAddress.landmark": "Permanent - Landmark",
    "addressDetails.permanentAddress.city": "Permanent - City",
    "addressDetails.permanentAddress.country": "Permanent - Country",
    "addressDetails.permanentAddress.state": "Permanent - State",
    "addressDetails.permanentAddress.pincode": "Permanent - Pincode",

    "addressDetails.currentResidentalAddress.flatHouseNo": "Current - Flat/House No",
    "addressDetails.currentResidentalAddress.areaStreetSector": "Current - Area/Street/Sector",
    "addressDetails.currentResidentalAddress.locality": "Current - Locality",
    "addressDetails.currentResidentalAddress.landmark": "Current - Landmark",
    "addressDetails.currentResidentalAddress.city": "Current - City",
    "addressDetails.currentResidentalAddress.country": "Current - Country",
    "addressDetails.currentResidentalAddress.state": "Current - State",
    "addressDetails.currentResidentalAddress.pincode": "Current - Pincode",

    // Professional - Basic
    "professionalDetails.qualification": "Qualification",
    "professionalDetails.occupation": "Occupation",
    "professionalDetails.degreeNumber": "Certificate of Membership",
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

    //bank details
    "bankDetails.accountHolderName": "Account Holder Name",
    "bankDetails.bankName": "Bank Name",
    "bankDetails.branch": "Branch",
    "bankDetails.accountNumber": "Account Number",
    "bankDetails.ifscCode": "IFSC Code",

    //family details
    "familyDetails.familyMember": "Member Names",
    "familyDetails.familyMemberNo": "Membership Number",
    "familyDetails.relationWithApplicant": "Relation With Member",

    //nominee details
    "nomineeDetails.nomineeName": "Nominee Name",
    "nomineeDetails.relationWithApplicant": "Relation with Member",
    "nomineeDetails.nomineeMobileNo": "Nominee Contact Number",

    //financial details
    "financialDetails.shareCapital": "Share Capital",
    "financialDetails.compulsory": "Compulsory Deposit",
    "financialDetails.optionalDeposit": "Optional Deposit",


}

export const imageFields = {
    "documents.passportSize": "Profile Photo",
    "documents.sign": "Signed Photo",
    "documents.aadhaarNoPhoto": "Aadhaar Photo",
    "documents.panNoPhoto": "PAN Photo",
    "documents.voterIdPhoto": "Voter ID Photo",
    "documents.passportNoPhoto": "Passport Photo",
    "documents.drivingLicense": "Driving License",
    "documents.rationCardPhoto": "Ration Card Photo",
    "addressDetails.permanentAddressBillPhoto": "Permanent - Bill Photo",
    "addressDetails.currentResidentalBillPhoto": "Current - Bill Photo",
    "professionalDetails.serviceDetails.bankStatement": "Bank Statement",
    "professionalDetails.serviceDetails.monthlySlip": "Monthly Slip",
    "professionalDetails.serviceDetails.idCard": "ID card",
    "professionalDetails.businessDetails.gstCertificate": "GST Certificate",
};

export const getValueByPath = (obj, path) => {
    if (!path) return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
        if (cur === undefined || cur === null) return undefined;
        cur = cur[p];
    }
    return cur;
};

export const setValueByPath = (obj, path, value) => {
    const parts = path.split(".");
    const newObj = JSON.parse(JSON.stringify(obj));
    let current = newObj;

    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
            current[parts[i]] = {};
        }
        current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
    return newObj;
};

export const isMissing = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
};

export const formatValueForUI = (value) => {
    if (isMissing(value)) return <span style={{ color: 'red', fontWeight: 700 }}>Missing</span>;

    if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('https'))) {
        return (
            <div>
                <img src={value} alt="doc" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 4, border: '1px solid #ddd' }} />
                <div style={{ marginTop: 6 }}>
                    <a href={value} target="_blank" rel="noreferrer" style={{ color: '#1976d2' }}>View Full Image</a>
                </div>
            </div>
        );
    }

    if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object') {
            return value.map((v, idx) => <div key={idx} style={{ marginBottom: 6 }}>{Object.entries(v).map(([k, vv]) => <div key={k}><strong>{k}:</strong> {String(vv)}</div>)}</div>);
        }
        return value.join(', ');
    }

    if (typeof value === 'object') {
        return Object.entries(value).map(([k, v]) => <div key={k}><strong>{k}:</strong> {String(v)}</div>);
    }

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
};

export const ServiceTypeOptions = {
    "government": "Government",
    "private": "Private",
    "business": "Business"
};

export const GenderOptions = {
    "male": "Male",
    "female": "Female",
    "other": "Other"
};

export const MaritalStatusOptions = {
    "single": "Single",
    "married": "Married",
    "divorced": "Divorced",
    "widowed": "Widowed"
};
