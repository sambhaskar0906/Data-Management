// member.controller.js
import fs from "fs";
import Member from "../models/members.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const safeParse = (value, fallback = {}) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value ?? fallback;
  } catch {
    return fallback;
  }
};


const tryUploadFile = async (file) => {
  if (!file) return "";
  try {
    const uploaded = await uploadOnCloudinary(file.path);
    // remove local file if exists
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (unlinkErr) {
      console.warn("Could not delete temp file:", unlinkErr.message);
    }
    return uploaded?.secure_url || "";
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    // attempt to delete file anyway
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (unlinkErr) {
      // ignore
    }
    return "";
  }
};

// ======================================================
//  ✔️ CREATE MEMBER
// ======================================================
export const createMember = async (req, res) => {
  try {
    console.log("🟢 Raw Request Body:", req.body);
    console.log("🟢 Request Files:", req.files ? Object.keys(req.files) : "none");

    // Parse nested JSON fields (FormData sends them as strings)
    const personalDetails = safeParse(req.body.personalDetails, {});
    const addressDetails = safeParse(req.body.addressDetails, {});
    const familyDetails = safeParse(req.body.familyDetails, {});
    const loanDetails = safeParse(req.body.loanDetails, []);
    const referenceDetails = safeParse(req.body.referenceDetails, []);
    const guaranteeDetails = safeParse(req.body.guaranteeDetails, {});
    const professionalDetails = safeParse(req.body.professionalDetails, {});
    const bankDetails = safeParse(req.body.bankDetails, {});
    const documents = safeParse(req.body.documents, {});
    const nomineeDetails = safeParse(req.body.nomineeDetails, {});

    // Upload files (if any)
    const fileFields = {};

    if (req.files && typeof req.files === "object") {
      for (const [fieldname, files] of Object.entries(req.files)) {
        // multer may give array per field
        const file = Array.isArray(files) ? files[0] : files;
        fileFields[fieldname] = await tryUploadFile(file);
      }
    }

    // Build member object aligned with schema
    const memberData = {
      personalDetails: {
        ...personalDetails,
      },

      addressDetails: {
        ...addressDetails,
        permanentAddressBillPhoto: fileFields.permanentAddressBillPhoto || addressDetails.permanentAddressBillPhoto || "",
        currentResidentalBillPhoto: fileFields.currentResidentalBillPhoto || addressDetails.currentResidentalBillPhoto || "",
        previousCurrentAddress: addressDetails.previousCurrentAddress || [],
      },

      familyDetails: familyDetails || {},

      loanDetails: Array.isArray(loanDetails) ? loanDetails : [],

      referenceDetails: Array.isArray(referenceDetails) ? referenceDetails : referenceDetails ? [referenceDetails] : [],

      guaranteeDetails: guaranteeDetails || {},

      documents: {
        ...documents,
        passportSize: fileFields.passportSize || documents.passportSize || "",
        panNoPhoto: fileFields.panNoPhoto || documents.panNoPhoto || "",
        aadhaarNoPhoto: fileFields.aadhaarNoPhoto || documents.aadhaarNoPhoto || "",
        rationCardPhoto: fileFields.rationCardPhoto || documents.rationCardPhoto || "",
        drivingLicensePhoto: fileFields.drivingLicensePhoto || documents.drivingLicensePhoto || "",
        voterIdPhoto: fileFields.voterIdPhoto || documents.voterIdPhoto || "",
        passportNoPhoto: fileFields.passportNoPhoto || documents.passportNoPhoto || "",
      },

      professionalDetails: {
        ...professionalDetails,
        inCaseOfService: professionalDetails.inCaseOfService ?? false,
        inCaseOfBusiness: professionalDetails.inCaseOfBusiness ?? false,
        serviceDetails: professionalDetails.serviceDetails || {},
        businessDetails: {
          ...(professionalDetails.businessDetails || {}),
          gstCertificate: fileFields.gstCertificate || (professionalDetails.businessDetails ? professionalDetails.businessDetails.gstCertificate : "") || "",
        },
      },

      bankDetails: bankDetails || {},
      nomineeDetails: nomineeDetails || {},
    };

    console.log("✅ Final data to save (create):", JSON.stringify(memberData, null, 2));

    const newMember = new Member(memberData);
    const savedMember = await newMember.save();

    return res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: savedMember,
    });
  } catch (error) {
    console.error("❌ Error creating member:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ======================================================
//  ✔️ GET MEMBER BY ID
// ======================================================
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }
    return res.status(200).json({ success: true, data: member });
  } catch (error) {
    console.error("❌ getMemberById error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
//  ✔️ GET ALL MEMBERS
// ======================================================
export const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find();
    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.error("❌ getAllMembers error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
//  ✔️ UPDATE MEMBER (supports files + JSON fields)
//     - uses findById + Object.assign + save so pre('save') runs
// ======================================================
export const updateMember = async (req, res) => {
  try {
    console.log("🟢 updateMember body:", req.body);
    console.log("🟢 updateMember files:", req.files ? Object.keys(req.files) : "none");

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    // Parse incoming fields (support partial)
    const incomingPersonalDetails = req.body.personalDetails ? safeParse(req.body.personalDetails, {}) : undefined;
    const incomingAddressDetails = req.body.addressDetails ? safeParse(req.body.addressDetails, {}) : undefined;
    const incomingFamilyDetails = req.body.familyDetails ? safeParse(req.body.familyDetails, {}) : undefined;
    const incomingLoanDetails = req.body.loanDetails ? safeParse(req.body.loanDetails, []) : undefined;
    const incomingReferenceDetails = req.body.referenceDetails ? safeParse(req.body.referenceDetails, []) : undefined;
    const incomingGuaranteeDetails = req.body.guaranteeDetails ? safeParse(req.body.guaranteeDetails, {}) : undefined;
    const incomingProfessionalDetails = req.body.professionalDetails ? safeParse(req.body.professionalDetails, {}) : undefined;
    const incomingBankDetails = req.body.bankDetails ? safeParse(req.body.bankDetails, {}) : undefined;
    const incomingDocuments = req.body.documents ? safeParse(req.body.documents, {}) : undefined;

    // Upload files (if any)
    const fileFields = {};
    if (req.files && typeof req.files === "object") {
      for (const [fieldname, files] of Object.entries(req.files)) {
        const file = Array.isArray(files) ? files[0] : files;
        fileFields[fieldname] = await tryUploadFile(file);
      }
    }

    // Merge updates carefully so nested objects are preserved
    if (incomingPersonalDetails) {
      member.personalDetails = { ...(member.personalDetails || {}), ...incomingPersonalDetails };
    }

    if (incomingAddressDetails) {
      member.addressDetails = { ...(member.addressDetails || {}), ...incomingAddressDetails };

      // merge photos if uploaded
      if (fileFields.permanentAddressBillPhoto) member.addressDetails.permanentAddressBillPhoto = fileFields.permanentAddressBillPhoto;
      if (fileFields.currentResidentalBillPhoto) member.addressDetails.currentResidentalBillPhoto = fileFields.currentResidentalBillPhoto;
    } else {
      // still allow replacing photos even if no address JSON provided
      if (fileFields.permanentAddressBillPhoto) {
        member.addressDetails = { ...(member.addressDetails || {}), permanentAddressBillPhoto: fileFields.permanentAddressBillPhoto };
      }
      if (fileFields.currentResidentalBillPhoto) {
        member.addressDetails = { ...(member.addressDetails || {}), currentResidentalBillPhoto: fileFields.currentResidentalBillPhoto };
      }
    }

    if (incomingFamilyDetails) {
      member.familyDetails = { ...(member.familyDetails || {}), ...incomingFamilyDetails };
    }

    if (incomingLoanDetails !== undefined) {
      member.loanDetails = Array.isArray(incomingLoanDetails) ? incomingLoanDetails : member.loanDetails;
    }

    if (incomingReferenceDetails !== undefined) {
      member.referenceDetails = Array.isArray(incomingReferenceDetails) ? incomingReferenceDetails : member.referenceDetails;
    }

    if (incomingGuaranteeDetails) {
      member.guaranteeDetails = { ...(member.guaranteeDetails || {}), ...incomingGuaranteeDetails };
    }

    if (incomingDocuments) {
      member.documents = { ...(member.documents || {}), ...incomingDocuments };
      // map file uploads to documents
      const docFields = [
        "passportSize",
        "panNoPhoto",
        "aadhaarNoPhoto",
        "rationCardPhoto",
        "drivingLicensePhoto",
        "voterIdPhoto",
        "passportNoPhoto",
      ];
      for (const df of docFields) {
        if (fileFields[df]) member.documents[df] = fileFields[df];
      }
    } else {
      // even if no documents JSON, still set uploaded files
      const docFields = [
        "passportSize",
        "panNoPhoto",
        "aadhaarNoPhoto",
        "rationCardPhoto",
        "drivingLicensePhoto",
        "voterIdPhoto",
        "passportNoPhoto",
      ];
      member.documents = member.documents || {};
      for (const df of docFields) {
        if (fileFields[df]) member.documents[df] = fileFields[df];
      }
    }

    if (incomingProfessionalDetails) {
      member.professionalDetails = { ...(member.professionalDetails || {}), ...incomingProfessionalDetails };

      // handle GST certificate upload
      member.professionalDetails.businessDetails = member.professionalDetails.businessDetails || {};
      if (fileFields.gstCertificate) {
        member.professionalDetails.businessDetails.gstCertificate = fileFields.gstCertificate;
      } else if (incomingProfessionalDetails?.businessDetails?.gstCertificate) {
        member.professionalDetails.businessDetails.gstCertificate = incomingProfessionalDetails.businessDetails.gstCertificate;
      }
    } else if (fileFields.gstCertificate) {
      member.professionalDetails = member.professionalDetails || {};
      member.professionalDetails.businessDetails = { ...(member.professionalDetails.businessDetails || {}), gstCertificate: fileFields.gstCertificate };
    }

    if (incomingBankDetails) {
      member.bankDetails = { ...(member.bankDetails || {}), ...incomingBankDetails };
    }

    // Save (triggers pre('save') that tracks previous address)
    await member.save();

    return res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: member,
    });
  } catch (error) {
    console.error("❌ updateMember error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
//  ✔️ DELETE MEMBER
// ======================================================
export const deleteMember = async (req, res) => {
  try {
    const deleted = await Member.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }
    return res.status(200).json({ success: true, message: "Member deleted successfully" });
  } catch (error) {
    console.error("❌ deleteMember error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================================
//  ✔️ MISSING FIELDS CHECKER
// ======================================================
export const getMissingFieldsForMember = async (req, res) => {
  try {
    const { membershipNumber, nameOfMember } = req.query;

    if (!membershipNumber && !nameOfMember) {
      return res.status(400).json({
        success: false,
        message: "Please provide either membershipNumber or nameOfMember.",
      });
    }

    const member = await Member.findOne({
      $or: [
        { "personalDetails.membershipNumber": membershipNumber },
        { "personalDetails.nameOfMember": nameOfMember },
      ],
    }).lean();

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    // Template based on your schema (fields you care about)
    const schemaTemplate = {
      personalDetails: {
        nameOfMember: "",
        membershipNumber: "",
        nameOfFather: "",
        nameOfMother: "",
        dateOfBirth: "",
        ageInYears: "",
        membershipDate: "",
        amountInCredit: "",
        gender: "",
        maritalStatus: "",
        religion: "",
        caste: "",
        phoneNo: "",
        alternatePhoneNo: "",
        emailId: "",
      },
      addressDetails: {
        permanentAddress: {
          flatHouseNo: "",
          areaStreetSector: "",
          locality: "",
          landmark: "",
          city: "",
          country: "",
          state: "",
          pincode: "",
        },
        permanentAddressBillPhoto: "",
        currentResidentalAddress: {
          flatHouseNo: "",
          areaStreetSector: "",
          locality: "",
          landmark: "",
          city: "",
          country: "",
          state: "",
          pincode: "",
        },
        currentResidentalBillPhoto: "",
        previousCurrentAddress: [],
      },
      referenceDetails: [
        {
          referenceName: "",
          referenceMno: "",
        },
      ],
      documents: {
        passportSize: "",
        panNo: "",
        rationCard: "",
        drivingLicense: "",
        aadhaarNo: "",
        voterId: "",
        passportNo: "",
        panNoPhoto: "",
        rationCardPhoto: "",
        drivingLicensePhoto: "",
        aadhaarNoPhoto: "",
        voterIdPhoto: "",
        passportNoPhoto: "",
      },
      professionalDetails: {
        qualification: "",
        occupation: "",
        inCaseOfService: false,
        serviceType: "",
        serviceDetails: {
          fullNameOfCompany: "",
          addressOfCompany: "",
          monthlyIncome: "",
          designation: "",
          dateOfJoining: "",
          employeeCode: "",
          dateOfRetirement: "",
          officeNo: "",
        },
        inCaseOfBusiness: false,
        businessDetails: {
          fullNameOfCompany: "",
          addressOfCompany: "",
          businessStructure: "",
          gstCertificate: "",
        },
      },
      familyDetails: {
        familyMembersMemberOfSociety: false,
        familyMember: [],
        familyMemberNo: [],
      },
      bankDetails: {
        bankName: "",
        branch: "",
        accountNumber: "",
        ifscCode: "",
      },
      guaranteeDetails: {
        whetherMemberHasGivenGuaranteeInOtherSociety: false,
        otherSociety: [],
        whetherMemberHasGivenGuaranteeInOurSociety: false,
        ourSociety: [],
      },
      loanDetails: [],
    };

    // Recursive function that returns flat keys and detailed object of missing
    const findMissingFields = (schemaObj, dataObj) => {
      const missingFlat = [];
      const missingDetailed = {};

      const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

      for (const key in schemaObj) {
        const schemaVal = schemaObj[key];
        const dataVal = dataObj ? dataObj[key] : undefined;

        // If schemaVal is an array (template), treat accordingly
        if (Array.isArray(schemaVal)) {
          // If dataVal is not an array or empty
          if (!Array.isArray(dataVal) || dataVal.length === 0) {
            missingFlat.push(key);
            missingDetailed[key] = schemaVal;
          } else {
            // For arrays of objects, check first element as template
            if (schemaVal.length > 0 && isPlainObject(schemaVal[0])) {
              // collect missing inside each array element
              const arrDetailed = [];
              let anyMissing = false;
              for (let i = 0; i < dataVal.length; i++) {
                const { flat, detailed } = findMissingFields(schemaVal[0], dataVal[i]);
                if (flat.length > 0) {
                  anyMissing = true;
                  arrDetailed.push({ index: i, missingFlat: flat, missingDetailed: detailed });
                }
              }
              if (anyMissing) {
                missingFlat.push(key);
                missingDetailed[key] = arrDetailed;
              }
            }
          }
        } else if (isPlainObject(schemaVal)) {
          // nested object
          const { flat, detailed } = findMissingFields(schemaVal, dataVal || {});
          if (flat.length > 0) {
            missingFlat.push(...flat.map((f) => `${key}.${f}`));
            missingDetailed[key] = detailed;
          }
        } else {
          // primitive template value
          if (dataVal === undefined || dataVal === null || dataVal === "") {
            missingFlat.push(key);
            missingDetailed[key] = schemaVal;
          }
        }
      }

      return { flat: missingFlat, detailed: missingDetailed };
    };

    const { flat: missingFields, detailed: missingFieldsDetailed } = findMissingFields(schemaTemplate, member);

    return res.status(200).json({
      success: true,
      message: "Missing fields retrieved successfully.",
      member: {
        nameOfMember: member.personalDetails?.nameOfMember || null,
        membershipNumber: member.personalDetails?.membershipNumber || null,
      },
      totalMissing: missingFields.length,
      missingFields,
      missingFieldsDetailed,
    });
  } catch (error) {
    console.error("❌ getMissingFieldsForMember error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ======================================================
//  ✔️ ADD GUARANTOR
// ======================================================
export const addGuarantor = async (req, res) => {
  try {
    // Support JSON body or FormData JSON string
    const membershipNumber = req.body.membershipNumber || req.body.membershipNo;
    const nameOfMember = req.body.nameOfMember;
    const guarantors = safeParse(req.body.guarantors, req.body.guarantors || []);

    if (!membershipNumber && !nameOfMember) {
      return res.status(400).json({ success: false, message: "Please provide either membershipNumber or nameOfMember." });
    }

    if (!Array.isArray(guarantors) || guarantors.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide at least one guarantor in an array." });
    }

    const borrower = await Member.findOne({
      $or: [
        { "personalDetails.membershipNumber": membershipNumber },
        { "personalDetails.nameOfMember": nameOfMember },
      ],
    });

    if (!borrower) {
      return res.status(404).json({ success: false, message: "Borrower not found." });
    }

    borrower.guaranteeDetails = borrower.guaranteeDetails || {};
    borrower.guaranteeDetails.ourSociety = borrower.guaranteeDetails.ourSociety || [];
    borrower.guaranteeDetails.whetherMemberHasGivenGuaranteeInOurSociety = true;

    for (const gRaw of guarantors) {
      const g = typeof gRaw === "string" ? safeParse(gRaw, {}) : gRaw;
      const { nameOfMember: guarantorName, membershipNo, amountOfLoan, typeOfLoan, ifIrregular } = g;
      if (!guarantorName || !membershipNo) {
        console.warn("Skipping guarantor with missing name or membershipNo:", g);
        continue;
      }

      // Check guarantor exists in members collection
      const guarantorMember = await Member.findOne({ "personalDetails.membershipNumber": membershipNo });
      if (!guarantorMember) {
        console.warn(`Guarantor ${guarantorName} (${membershipNo}) not found — skipping.`);
        continue;
      }

      borrower.guaranteeDetails.ourSociety.push({
        nameOfMember: guarantorName,
        membershipNo,
        amountOfLoan: amountOfLoan || "",
        typeOfLoan: typeOfLoan || "",
        ifIrregular: ifIrregular || "",
      });
    }

    await borrower.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Guarantors added successfully.",
      borrower: {
        nameOfMember: borrower.personalDetails.nameOfMember,
        membershipNumber: borrower.personalDetails.membershipNumber,
        guaranteeDetails: borrower.guaranteeDetails,
      },
    });
  } catch (error) {
    console.error("❌ addGuarantor error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ======================================================
//  ✔️ GET GUARANTOR RELATIONS BY MEMBER
// ======================================================
export const getGuarantorRelationsByMember = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res.status(400).json({ success: false, message: "Please provide member name or membership number in 'search' query." });
    }

    const member = await Member.findOne({
      $or: [
        { "personalDetails.nameOfMember": { $regex: search, $options: "i" } },
        { "personalDetails.membershipNumber": search },
      ],
    }).lean();

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    const membershipNumber = member.personalDetails?.membershipNumber;

    const myGuarantors =
      (member.guaranteeDetails?.ourSociety || []).map((g) => ({
        name: g.nameOfMember,
        membershipNumber: g.membershipNo || g.membershipNo, // defensive
        amountOfLoan: g.amountOfLoan,
        typeOfLoan: g.typeOfLoan,
        ifIrregular: g.ifIrregular,
      })) || [];

    // Find members who listed this member as guarantor
    const forWhomIAmGuarantorRaw = await Member.find({
      "guaranteeDetails.ourSociety.membershipNo": membershipNumber,
    })
      .select("personalDetails.nameOfMember personalDetails.membershipNumber guaranteeDetails.ourSociety")
      .lean();

    const forWhomIAmGuarantor = forWhomIAmGuarantorRaw.map((m) => {
      const match = (m.guaranteeDetails?.ourSociety || []).find((g) => g.membershipNo === membershipNumber);
      return {
        name: m.personalDetails?.nameOfMember,
        membershipNumber: m.personalDetails?.membershipNumber,
        amountOfLoan: match?.amountOfLoan,
        typeOfLoan: match?.typeOfLoan,
        ifIrregular: match?.ifIrregular,
      };
    });

    return res.status(200).json({
      success: true,
      member: {
        _id: member._id,
        name: member.personalDetails?.nameOfMember,
        membershipNumber,
      },
      myGuarantors,
      forWhomIAmGuarantor,
    });
  } catch (error) {
    console.error("❌ getGuarantorRelationsByMember error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};