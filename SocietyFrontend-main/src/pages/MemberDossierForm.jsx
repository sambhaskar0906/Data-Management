import React, { useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Button,
  Fade,
  Snackbar,
  Alert,
  Typography
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";

// Import components
import FormHeader from "../layout/FormHeader";
import FormStepper from "../layout/FormStepper";
import PersonalInfoForm from "../components/form/PersonalInfoForm";
import AddressForm from "../components/form/AddressForm";
import IdentityVerificationForm from "../components/form/IdentityVerificationForm";
import ProfessionalFamilyForm from "../components/form/ProfessionalFamilyForm";
import RemarksForm from "../components/form/RemarksForm";
import { useDispatch, useSelector } from "react-redux";
import { createMember, clearMemberState } from "../features/member/memberSlice";

const MemberDossierForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const dispatch = useDispatch();

  const { loading, successMessage, error, operationLoading } = useSelector((state) => state.members);

  const [formData, setFormData] = useState({
    personalInformation: {
      nameOfMember: "",
      title: "",
      minor: "",
      membershipNumber: "",
      nameOfFather: "",
      nameOfMother: "",
      dateOfBirth: "",
      ageInYears: "",
      membershipDate: "",
      amountInCredit: "",
      gender: "",
      nameOfSpouse: "",
      religion: "",
      maritalStatus: "",
      caste: "",
      phoneNo: "",
      alternatePhoneNo: "",
      emailId: "",
    },

    Address: {
      permanentAddress: {
        flatHouseNo: "",
        areaStreetSector: "",
        locality: "",
        landmark: "",
        city: "",
        country: "",
        state: "",
        pincode: "",
        proofDocument: null,
      },
      sameAsPermanent: false,
      currentResidentialAddress: {
        flatHouseNo: "",
        areaStreetSector: "",
        locality: "",
        landmark: "",
        city: "",
        country: "",
        state: "",
        pincode: "",
        proofDocument: null,
      },
    },

    identityProofs: {
      passportSizePhoto: null,
      passportSizePreview: "",

      panNumber: "",
      panCardPhoto: null,
      panCardPreview: "",

      aadhaarCardNumber: "",
      aadhaarFrontPhoto: null,
      aadhaarBackPhoto: null,
      aadhaarFrontPreview: "",
      aadhaarBackPreview: "",

      rationCardNumber: "",
      rationFrontPhoto: null,
      rationBackPhoto: null,
      rationFrontPreview: "",
      rationBackPreview: "",

      drivingLicenseNumber: "",
      drivingFrontPhoto: null,
      drivingBackPhoto: null,
      drivingFrontPreview: "",
      drivingBackPreview: "",

      voterIdNumber: "",
      voterFrontPhoto: null,
      voterBackPhoto: null,
      voterFrontPreview: "",
      voterBackPreview: "",

      passportNumber: "",
      passportPhoto: null,
      passportPreview: "",
    },

    professionalDetails: {
      qualification: "",
      occupation: "",
      familyMemberMemberOfSociety: false,
      familyMembers: [
        {
          name: "",
          membershipNo: "",
        },
      ],
    },

    nomineeDetails: {
      nomineeName: "",
      relationWithApplicant: "",
      introduceBy: "",
      memberShipNo: "",
    },

    remarks: [
      {
        loanAmount: "",
        purposeOfLoan: "",
        loanDate: "",
      },
    ],
  });


  const steps = [
    { label: "Personal Info", icon: "👤" },
    { label: "Address & Contact", icon: "🏠" },
    { label: "Identity Proof", icon: "🆔" },
    { label: "Professional & Family", icon: "💼" },
    { label: "Remarks", icon: "📝" }
  ];

  const handleChange = useCallback((section, field, value) => {
    setFormData((prev) => {

      // When field === null → replace the entire object/array
      if (field === null) {
        return {
          ...prev,
          [section]: value,
        };
      }

      // Arrays like bankDetails and remarks handled directly
      if (Array.isArray(prev[section])) {
        return {
          ...prev,
          [section]: value,
        };
      }

      // Normal nested object update
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  }, []);



  // NEW: Deep nested handleChange for address fields
  const handleNestedChange = useCallback((section, subSection, field, value) => {
    console.log(`🔄 Updating ${section}.${subSection}.${field} to:`, value);

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [field]: value,
        },
      },
    }));
  }, []);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
    dispatch(clearMemberState());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📋 Current Form Data:", JSON.stringify(formData, null, 2));

    try {
      const formDataToSend = new FormData();
      const values = formData;

      /* -----------------------------------------
         PERSONAL DETAILS
      ----------------------------------------- */
      Object.entries(values.personalInformation || {}).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          formDataToSend.append(`personalDetails[${key}]`, value);
        }
      });

      /* -----------------------------------------
         ADDRESS DETAILS
      ----------------------------------------- */

      // Permanent Address
      Object.entries(values.Address?.permanentAddress || {}).forEach(([key, value]) => {
        if (key !== "proofDocument" && value) {
          formDataToSend.append(
            `addressDetails[permanentAddress][${key}]`,
            value.toString()
          );
        }
      });

      // Permanent Address proof
      if (values.Address?.permanentAddress?.proofDocument instanceof File) {
        formDataToSend.append(
          "addressDetails[permanentAddressBillPhoto]",
          values.Address.permanentAddress.proofDocument
        );
      }

      // Current Residential Address
      Object.entries(values.Address?.currentResidentialAddress || {}).forEach(
        ([key, value]) => {
          if (key !== "proofDocument" && value) {
            formDataToSend.append(
              `addressDetails[currentResidentalAddress][${key}]`,
              value.toString()
            );
          }
        }
      );

      // Current Address proof
      if (values.Address?.currentResidentialAddress?.proofDocument instanceof File) {
        formDataToSend.append(
          "addressDetails[currentResidentalBillPhoto]",
          values.Address.currentResidentialAddress.proofDocument
        );
      }

      /* -----------------------------------------
         DOCUMENTS (Identity Proofs)
      ----------------------------------------- */
      const idProofs = values.identityProofs || {};

      // Numbers
      const docNumberMap = {
        panNumber: "panNo",
        aadhaarCardNumber: "aadhaarNo",
        rationCardNumber: "rationCard",
        drivingLicenseNumber: "drivingLicense",
        voterIdNumber: "voterId",
        passportNumber: "passportNo",
      };

      Object.entries(docNumberMap).forEach(([formKey, dbKey]) => {
        if (idProofs[formKey]) {
          formDataToSend.append(`documents[${dbKey}]`, idProofs[formKey]);
        }
      });

      // Photos
      const photoMap = {
        passportSizePhoto: "passportSize",
        panCardPhoto: "panNoPhoto",
        aadhaarFrontPhoto: "aadhaarNoPhoto",
        rationFrontPhoto: "rationCardPhoto",
        drivingFrontPhoto: "drivingLicensePhoto",
        voterFrontPhoto: "voterIdPhoto",
        passportPhoto: "passportNoPhoto",
      };

      Object.entries(photoMap).forEach(([formKey, dbKey]) => {
        if (idProofs[formKey] instanceof File) {
          formDataToSend.append(dbKey, idProofs[formKey]);
        }
      });

      /* -----------------------------------------
         PROFESSIONAL DETAILS
      ----------------------------------------- */
      const pro = values.professionalDetails || {};

      if (pro.qualification)
        formDataToSend.append(
          "professionalDetails[qualification]",
          pro.qualification
        );

      if (pro.occupation)
        formDataToSend.append("professionalDetails[occupation]", pro.occupation);

      /* ------ SERVICE (Govt / Pvt) ------- */
      if (pro.inCaseOfServiceGovt) {
        formDataToSend.append("professionalDetails[inCaseOfService]", true);
        formDataToSend.append("professionalDetails[serviceType]", "Govt");
      }

      if (pro.inCaseOfPrivate) {
        formDataToSend.append("professionalDetails[inCaseOfService]", true);
        formDataToSend.append("professionalDetails[serviceType]", "Pvt");
      }

      /* ------ SERVICE DETAILS ------- */
      if (pro.serviceDetails) {
        Object.entries(pro.serviceDetails).forEach(([key, value]) => {
          if (value) {
            formDataToSend.append(
              `professionalDetails[serviceDetails][${key}]`,
              value.toString()
            );
          }
        });
      }

      /* ------ BUSINESS ------- */
      if (pro.inCaseOfBusiness) {
        formDataToSend.append("professionalDetails[inCaseOfBusiness]", true);
      }

      /* ------ BUSINESS DETAILS ------- */
      if (pro.businessDetails) {
        Object.entries(pro.businessDetails).forEach(([key, value]) => {
          if (key !== "gstCertificate" && value) {
            formDataToSend.append(
              `professionalDetails[businessDetails][${key}]`,
              value.toString()
            );
          }
        });

        // GST File
        if (pro.businessDetails.gstCertificate instanceof File) {
          formDataToSend.append(
            "professionalDetails[businessDetails][gstCertificate]",
            pro.businessDetails.gstCertificate
          );
        }
      }

      /* -----------------------------------------
         FAMILY DETAILS
      ----------------------------------------- */
      formDataToSend.append(
        "familyDetails[familyMembersMemberOfSociety]",
        pro.familyMemberMemberOfSociety ? "true" : "false"
      );

      if (pro.familyMembers?.length) {
        pro.familyMembers.forEach((mem, index) => {
          if (mem.name)
            formDataToSend.append(
              `familyDetails[familyMember][${index}]`,
              mem.name
            );
          if (mem.membershipNo)
            formDataToSend.append(
              `familyDetails[familyMemberNo][${index}]`,
              mem.membershipNo
            );
        });
      }

      /* -----------------------------------------
         LOAN DETAILS
      ----------------------------------------- */
      (values.remarks || []).forEach((remark, index) => {
        formDataToSend.append(`loanDetails[${index}][loanType]`, "Personal");

        if (remark.loanAmount)
          formDataToSend.append(
            `loanDetails[${index}][amount]`,
            remark.loanAmount
          );

        if (remark.purposeOfLoan)
          formDataToSend.append(
            `loanDetails[${index}][purpose]`,
            remark.purposeOfLoan
          );

        if (remark.loanDate)
          formDataToSend.append(
            `loanDetails[${index}][dateOfLoan]`,
            remark.loanDate
          );
      });

      /* -----------------------------------------
         REFERENCES
      ----------------------------------------- */
      const ref = values.referenceDetails || {};
      if (ref.referenceName)
        formDataToSend.append(
          `referenceDetails[0][referenceName]`,
          ref.referenceName
        );
      if (ref.referenceMno)
        formDataToSend.append(
          `referenceDetails[0][referenceMno]`,
          ref.referenceMno
        );

      /* -----------------------------------------
         GUARANTEE DETAILS (default false)
      ----------------------------------------- */
      formDataToSend.append(
        "guaranteeDetails[whetherMemberHasGivenGuaranteeInOtherSociety]",
        "false"
      );
      formDataToSend.append(
        "guaranteeDetails[whetherMemberHasGivenGuaranteeInOurSociety]",
        "false"
      );

      /* -----------------------------------------
         NOMINEE DETAILS
      ----------------------------------------- */
      const nom = values.nomineeDetails || {};
      Object.entries(nom).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(`nomineeDetails[${key}]`, value.toString());
        }
      });

      /* -----------------------------------------
         DEBUG: Show final FormData
      ----------------------------------------- */
      console.log("🟡 Final FormData:");
      for (const [key, value] of formDataToSend.entries()) {
        console.log(key, ":", value);
      }

      /* -----------------------------------------
         SEND REQUEST
      ----------------------------------------- */
      await dispatch(createMember(formDataToSend)).unwrap();

      showSnackbar("✅ Member created successfully!", "success");
      setActiveStep(0);

    } catch (err) {
      console.error("❌ Failed to create member:", err);
      showSnackbar(err.message || "Failed to create member", "error");
    }
  };


  // Show success/error messages from Redux state
  React.useEffect(() => {
    if (successMessage) {
      setSnackbar({ open: true, message: successMessage, severity: "success" });
    }
    if (error) {
      setSnackbar({ open: true, message: error.message || "An error occurred", severity: "error" });
    }
  }, [successMessage, error]);

  const renderStepContent = (step) => {
    const commonProps = {
      formData,
      handleChange,
      handleNestedChange
    };

    switch (step) {
      case 0:
        return <PersonalInfoForm {...commonProps} />;
      case 1:
        return <AddressForm {...commonProps} />;
      case 2:
        return <IdentityVerificationForm {...commonProps} />;
      case 3:
        return <ProfessionalFamilyForm {...commonProps} />;
      case 4:
        return <RemarksForm {...commonProps} />;
      default:
        return null;
    }
  };

  const isSubmitting = operationLoading?.create || loading;

  return (
    <Box sx={{
      flexGrow: 1,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <FormHeader
          activeStep={activeStep}
          totalSteps={steps.length}
        />

        {/* Stepper */}
        <FormStepper
          activeStep={activeStep}
          steps={steps}
        />

        {/* Form Content */}
        <Fade in={true} timeout={600}>
          <Box>
            {renderStepContent(activeStep)}
          </Box>
        </Fade>

        {/* Navigation Buttons */}
        <Card sx={{ mt: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                disabled={activeStep === 0 || isSubmitting}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a67d8',
                    backgroundColor: '#f0f4ff'
                  }
                }}
              >
                Previous
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  sx={{
                    px: 6,
                    py: 1.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  disabled={isSubmitting}
                  sx={{
                    px: 6,
                    py: 1.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MemberDossierForm;