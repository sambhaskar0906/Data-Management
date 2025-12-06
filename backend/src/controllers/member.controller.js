import fs from "fs";
import Member from "../models/members.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// ---------------------------------------------------------
// SAFE JSON PARSE
// ---------------------------------------------------------
const safeParse = (value, fallback = {}) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value ?? fallback;
  } catch {
    return fallback;
  }
};

// ---------------------------------------------------------
// CLOUDINARY UPLOAD + CLEANUP
// ---------------------------------------------------------
const tryUploadFile = async (file) => {
  if (!file) return "";
  try {
    const uploaded = await uploadOnCloudinary(file.path);

    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return uploaded?.secure_url || "";
  } catch (err) {
    console.error("Cloudinary upload error:", err);

    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return "";
  }
};

// ---------------------------------------------------------
// CANONICAL FIELD NAMES FOR MULTER + CONTROLLER
// ---------------------------------------------------------
const FILE_FIELD_KEYS = {
  permanentAddressBillPhoto: "addressDetails[permanentAddressBillPhoto]",
  currentResidentalBillPhoto: "addressDetails[currentResidentalBillPhoto]",
  companyProvidedAddressBillPhoto: "companyProvidedAddressBillPhoto",

  passportSize: "passportSize",
  panNoPhoto: "panNoPhoto",
  aadhaarNoPhoto: "aadhaarNoPhoto",
  rationCardPhoto: "rationCardPhoto",
  drivingLicensePhoto: "drivingLicensePhoto",
  voterIdPhoto: "voterIdPhoto",
  passportNoPhoto: "passportNoPhoto",
  signedPhoto: "signedPhoto",
  bankStatement: "professionalDetails[serviceDetails][bankStatement]",
  idCard: "professionalDetails[serviceDetails][idCard]",
  monthlySlip: "professionalDetails[serviceDetails][montlySlip]",
  gstCertificate:
    "professionalDetails[businessDetails][gstCertificate]",
};

const mapReqFilesToCloudinary = async (req) => {
  const out = {};

  for (const [key, multerField] of Object.entries(FILE_FIELD_KEYS)) {
    const file = req.files?.[multerField]?.[0];
    out[key] = await tryUploadFile(file);
  }

  return out;
};

// ---------------------------------------------------------
// CREATE MEMBER
// ---------------------------------------------------------
export const createMember = async (req, res) => {
  try {
    console.log("🟢 Raw Body:", req.body);
    console.log("🟢 Files:", Object.keys(req.files || {}));

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
    const financialDetails = safeParse(req.body.financialDetails, {});
    const creditDetails = safeParse(req.body.creditDetails, {});
    const uploadedFiles = await mapReqFilesToCloudinary(req);

    const memberData = {
      personalDetails,

      addressDetails: {
        ...addressDetails,
        permanentAddressBillPhoto:
          uploadedFiles.permanentAddressBillPhoto ||
          addressDetails.permanentAddressBillPhoto ||
          "",
        currentResidentalBillPhoto:
          uploadedFiles.currentResidentalBillPhoto ||
          addressDetails.currentResidentalBillPhoto ||
          "",
        companyProvidedAddressBillPhoto:
          uploadedFiles.companyProvidedAddressBillPhoto ||
          addressDetails.companyProvidedAddressBillPhoto ||
          "",
      },

      documents: {
        ...documents,
        passportSize:
          uploadedFiles.passportSize || documents.passportSize || "",
        panNoPhoto: uploadedFiles.panNoPhoto || documents.panNoPhoto || "",
        aadhaarNoPhoto:
          uploadedFiles.aadhaarNoPhoto || documents.aadhaarNoPhoto || "",
        rationCardPhoto:
          uploadedFiles.rationCardPhoto || documents.rationCardPhoto || "",
        drivingLicensePhoto:
          uploadedFiles.drivingLicensePhoto || documents.drivingLicensePhoto || "",
        voterIdPhoto:
          uploadedFiles.voterIdPhoto || documents.voterIdPhoto || "",
        passportNoPhoto:
          uploadedFiles.passportNoPhoto || documents.passportNoPhoto || "",
        signedPhoto:
          uploadedFiles.signedPhoto || documents.signedPhoto || "",


      },

      familyDetails,
      bankDetails,
      nomineeDetails,
      financialDetails,
      professionalDetails: {
        ...professionalDetails,
        qualification: professionalDetails.qualification || "",
        qualificationRemark: professionalDetails.qualificationRemark || "",
        occupation: professionalDetails.occupation || "",
        degreeNumber: professionalDetails.degreeNumber || "",
        inCaseOfServiceGovt: professionalDetails.inCaseOfServiceGovt || false,
        inCaseOfPrivate: professionalDetails.inCaseOfPrivate || false,
        inCaseOfService: professionalDetails.inCaseOfService || false,
        serviceType: professionalDetails.serviceType || "",


        serviceDetails: {
          ...(professionalDetails.serviceDetails || {}),
          fullNameOfCompany: professionalDetails.serviceDetails?.fullNameOfCompany || "",
          addressOfCompany: professionalDetails.serviceDetails?.addressOfCompany || "",
          department: professionalDetails.serviceDetails?.department || "",
          monthlyIncome: professionalDetails.serviceDetails?.monthlyIncome || "",
          designation: professionalDetails.serviceDetails?.designation || "",
          dateOfJoining: professionalDetails.serviceDetails?.dateOfJoining || "",
          employeeCode: professionalDetails.serviceDetails?.employeeCode || "",
          dateOfRetirement: professionalDetails.serviceDetails?.dateOfRetirement || "",
          officeNo: professionalDetails.serviceDetails?.officeNo || "",
          idCard: uploadedFiles.idCard || professionalDetails.serviceDetails?.idCard || "",
          monthlySlip: uploadedFiles.monthlySlip || professionalDetails.serviceDetails?.monthlySlip || "",
          bankStatement: uploadedFiles.bankStatement || professionalDetails.serviceDetails?.bankStatement || "",
        },


        inCaseOfBusiness: professionalDetails.inCaseOfBusiness || false,
        businessDetails: {
          ...(professionalDetails.businessDetails || {}),
          fullNameOfCompany: professionalDetails.businessDetails?.fullNameOfCompany || "",
          addressOfCompany: professionalDetails.businessDetails?.addressOfCompany || "",
          gstNumber: professionalDetails.businessDetails?.gstNumber || "",
          businessStructure: professionalDetails.businessDetails?.businessStructure || "",
          gstCertificate:
            uploadedFiles.gstCertificate || professionalDetails.businessDetails?.gstCertificate || "",
        },
      },

      loanDetails: Array.isArray(loanDetails) ? loanDetails : [],
      referenceDetails: Array.isArray(referenceDetails)
        ? referenceDetails
        : referenceDetails
          ? [referenceDetails]
          : [],
      guaranteeDetails,
      creditDetails,
    };

    const member = new Member(memberData);
    const saved = await member.save();

    return res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: saved,
    });
  } catch (err) {
    console.error("❌ createMember error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------------------------------------------
// UPDATE MEMBER
// ---------------------------------------------------------
export const updateMember = async (req, res) => {
  try {
    console.log("🟢 Update Body:", req.body);
    console.log("🟢 Update Files:", Object.keys(req.files || {}));

    const member = await Member.findById(req.params.id);
    if (!member)
      return res.status(404).json({ success: false, message: "Member not found" });

    const incoming = {
      personalDetails: safeParse(req.body.personalDetails, {}),
      addressDetails: safeParse(req.body.addressDetails, {}),
      familyDetails: safeParse(req.body.familyDetails, {}),
      loanDetails: safeParse(req.body.loanDetails, []),
      referenceDetails: safeParse(req.body.referenceDetails, []),
      guaranteeDetails: safeParse(req.body.guaranteeDetails, {}),
      professionalDetails: safeParse(req.body.professionalDetails, {}),
      bankDetails: safeParse(req.body.bankDetails, {}),
      documents: safeParse(req.body.documents, {}),
      financialDetails: safeParse(req.body.financialDetails, {}),
    };

    const uploadedFiles = await mapReqFilesToCloudinary(req);

    Object.assign(member, incoming); // soft merge

    // Merge file uploads
    Object.assign(member.addressDetails, {
      permanentAddressBillPhoto:
        uploadedFiles.permanentAddressBillPhoto ||
        member.addressDetails?.permanentAddressBillPhoto,
      currentResidentalBillPhoto:
        uploadedFiles.currentResidentalBillPhoto ||
        member.addressDetails?.currentResidentalBillPhoto,
      companyProvidedAddressBillPhoto:
        uploadedFiles.companyProvidedAddressBillPhoto ||
        member.addressDetails?.companyProvidedAddressBillPhoto,
    });

    const docFields = [
      "passportSize",
      "panNoPhoto",
      "aadhaarNoPhoto",
      "rationCardPhoto",
      "drivingLicensePhoto",
      "voterIdPhoto",
      "passportNoPhoto",
      "signedPhoto",
    ];

    member.documents = member.documents || {};
    for (const k of docFields) {
      if (uploadedFiles[k]) member.documents[k] = uploadedFiles[k];
    }

    if (uploadedFiles.gstCertificate) {
      member.professionalDetails.businessDetails =
        member.professionalDetails.businessDetails || {};
      member.professionalDetails.businessDetails.gstCertificate =
        uploadedFiles.gstCertificate;
    }

    await member.save();

    return res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: member,
    });
  } catch (err) {
    console.error("❌ updateMember error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------------------------------------------
// OTHER CONTROLLERS REMAIN SAME
// ---------------------------------------------------------
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member)
      return res.status(404).json({ success: false, message: "Member not found" });

    return res.status(200).json({ success: true, data: member });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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
        signedPhoto: "",
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