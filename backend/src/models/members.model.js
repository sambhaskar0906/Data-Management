import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    // ===== BASIC DETAILS =====
    personalDetails: {
      title: { type: String },
      nameOfMember: { type: String },
      membershipNumber: { type: String },

      minor: {
        type: Boolean,
        default: false,
      },

      nameOfFather: { type: String },
      nameOfMother: { type: String },
      nameOfSpouse: { type: String },
      dateOfBirth: { type: Date },
      ageInYears: { type: String },
      membershipDate: { type: String },
      amountInCredit: { type: String },
      gender: { type: String },
      maritalStatus: { type: String },
      religion: { type: String },
      caste: { type: String },
      phoneNo: { type: String },
      alternatePhoneNo: { type: String },
      emailId: { type: String },
    },

    // ===== ADDRESS DETAILS =====
    addressDetails: {
      permanentAddress: {
        flatHouseNo: { type: String },
        areaStreetSector: { type: String },
        locality: { type: String },
        landmark: { type: String },
        city: { type: String },
        country: { type: String },
        state: { type: String },
        pincode: { type: String },
      },

      permanentAddressBillPhoto: { type: String },

      currentResidentalAddress: {
        flatHouseNo: { type: String },
        areaStreetSector: { type: String },
        locality: { type: String },
        landmark: { type: String },
        city: { type: String },
        country: { type: String },
        state: { type: String },
        pincode: { type: String },
      },

      currentResidentalBillPhoto: { type: String },

      previousCurrentAddress: [
        {
          flatHouseNo: String,
          areaStreetSector: String,
          locality: String,
          landmark: String,
          city: String,
          state: String,
          country: String,
          pincode: String,
        },
      ],
    },

    // ===== REFERENCES =====
    referenceDetails: [
      {
        referenceName: { type: String },
        referenceMno: { type: String },
      },
    ],

    // ===== DOCUMENTS =====
    documents: {
      passportSize: { type: String },
      panNo: { type: String },
      rationCard: { type: String },
      drivingLicense: { type: String },
      aadhaarNo: { type: String },
      voterId: { type: String },
      passportNo: { type: String },

      // PHOTOS
      panNoPhoto: { type: String },
      rationCardPhoto: { type: String },
      drivingLicensePhoto: { type: String },
      aadhaarNoPhoto: { type: String },
      voterIdPhoto: { type: String },
      passportNoPhoto: { type: String },
    },

    // ===== EDUCATION & OCCUPATION =====
    professionalDetails: {
      qualification: { type: String },
      occupation: { type: String },

      inCaseOfServiceGovt: { type: Boolean, default: false },
      inCaseOfPrivate: { type: Boolean, default: false },
      inCaseOfService: { type: Boolean, default: false },
      serviceType: { type: String },

      serviceDetails: {
        fullNameOfCompany: { type: String },
        addressOfCompany: { type: String },
        monthlyIncome: { type: String },
        designation: { type: String },
        dateOfJoining: { type: String },
        employeeCode: { type: String },
        dateOfRetirement: { type: String },
        officeNo: { type: String },
      },

      inCaseOfBusiness: { type: Boolean, default: false },
      businessDetails: {
        fullNameOfCompany: { type: String },
        addressOfCompany: { type: String },
        businessStructure: { type: String },
        gstCertificate: { type: String },  // holds image/pdf URL
      },


    },



    // ===== FAMILY DETAILS =====
    familyDetails: {
      familyMembersMemberOfSociety: { type: Boolean },
      familyMember: [{ type: String }],
      familyMemberNo: [{ type: String }],
    },

    // ===== BANK DETAILS =====
    bankDetails: {
      bankName: { type: String },
      branch: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
    },

    // ===== GUARANTEE DETAILS =====
    guaranteeDetails: {
      whetherMemberHasGivenGuaranteeInOtherSociety: { type: Boolean },
      otherSociety: [
        {
          nameOfSociety: { type: String },
          amountOfGuarantee: { type: String },
        },
      ],

      whetherMemberHasGivenGuaranteeInOurSociety: { type: Boolean },
      ourSociety: [
        {
          nameOfMember: { type: String },
          membershipNo: { type: String },
          amountOfLoan: { type: String },
          typeOfLoan: { type: String },
          ifIrregular: { type: String },
        },
      ],
    },

    // ===== LOAN DETAILS =====
    loanDetails: [
      {
        loanType: { type: String },
        amount: { type: String },
        purpose: { type: String },
        dateOfLoan: { type: String },
      },
    ],

    // ===== NOMINEE DETAILS =====
    nomineeDetails: {
      nomineeName: { type: String },
      relationWithApplicant: { type: String },
      introduceBy: { type: String },
      memberShipNo: { type: String },
    },
  },
  { timestamps: true }
);

// ===== Middleware: Track Address Changes =====
memberSchema.pre("save", async function (next) {
  if (!this.isModified("addressDetails.currentResidentalAddress")) {
    return next();
  }

  if (!this.isNew) {
    const oldDoc = await this.constructor.findById(this._id);

    if (oldDoc && oldDoc.addressDetails.currentResidentalAddress) {
      this.addressDetails.previousCurrentAddress = [
        ...(oldDoc.addressDetails.previousCurrentAddress || []),
        {
          ...oldDoc.addressDetails.currentResidentalAddress,
        },
      ];
    }
  }

  next();
});

const Member = mongoose.model("Member", memberSchema);
export default Member;