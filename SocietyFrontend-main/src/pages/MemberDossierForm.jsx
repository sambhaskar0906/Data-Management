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
import BankGuaranteeForm from "../components/form/BankGuaranteeForm";
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
      membershipNumber: "",
      nameOfFather: "",
      nameOfMother: "",
      dateOfBirth: "",
      ageInYears: "",
      membershipDate: "",
      amountInCredit: "",
      gender: "",
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
    bankDetails: [{
      bankName: "",
      branch: "",
      accountNumber: "",
      ifscCode: "",
    }],

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
    { label: "Bank & Guarantee", icon: "🏦" },
    { label: "Remarks", icon: "📝" }
  ];

  const handleChange = useCallback((section, field, value) => {
    setFormData((prev) => {
      if (section === 'bankDetails' || section === 'remarks') {
        return {
          ...prev,
          [section]: value // Directly set the array value
        };
      }

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

    // Debug: Log current form data
    console.log("📋 Current Form Data:", JSON.stringify(formData, null, 2));

    try {
      const formDataToSend = new FormData();

      const values = formData;

      // --- PERSONAL INFORMATION ---
      Object.entries(values.personalInformation || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formDataToSend.append(`personalDetails[${key}]`, value.toString());
          console.log(`✅ Added personalDetails[${key}]:`, value);
        }
      });

      // --- ADDRESS DETAILS ---
      // Permanent Address
      Object.entries(values.Address?.permanentAddress || {}).forEach(([key, value]) => {
        if (key !== 'proofDocument' && value !== null && value !== undefined && value !== "") {
          formDataToSend.append(`addressDetails[permanentAddress][${key}]`, value.toString());
          console.log(`✅ Added addressDetails[permanentAddress][${key}]:`, value);
        }
      });

      // Current Residential Address
      Object.entries(values.Address?.currentResidentialAddress || {}).forEach(([key, value]) => {
        if (key !== 'proofDocument' && value !== null && value !== undefined && value !== "") {
          formDataToSend.append(`addressDetails[currentResidentalAddress][${key}]`, value.toString());
          console.log(`✅ Added addressDetails[currentResidentalAddress][${key}]:`, value);
        }
      });

      // Address Proof Files
      if (values.Address?.permanentAddress?.proofDocument instanceof File) {
        formDataToSend.append('permanentAddressBillPhoto', values.Address.permanentAddress.proofDocument);
        console.log("✅ Added permanentAddressBillPhoto file");
      }
      if (values.Address?.currentResidentialAddress?.proofDocument instanceof File) {
        formDataToSend.append('currentResidentalBillPhoto', values.Address.currentResidentialAddress.proofDocument);
        console.log("✅ Added currentResidentalBillPhoto file");
      }

      // --- IDENTITY PROOFS (Documents) ---
      const idProofs = values.identityProofs || {};

      // Document numbers
      if (idProofs.panNumber) {
        formDataToSend.append('documents[panNo]', idProofs.panNumber);
        console.log("✅ Added documents[panNo]:", idProofs.panNumber);
      }
      if (idProofs.aadhaarCardNumber) {
        formDataToSend.append('documents[aadhaarNo]', idProofs.aadhaarCardNumber);
        console.log("✅ Added documents[aadhaarNo]:", idProofs.aadhaarCardNumber);
      }
      if (idProofs.rationCardNumber) {
        formDataToSend.append('documents[rationCard]', idProofs.rationCardNumber);
      }
      if (idProofs.drivingLicenseNumber) {
        formDataToSend.append('documents[drivingLicense]', idProofs.drivingLicenseNumber);
      }
      if (idProofs.voterIdNumber) {
        formDataToSend.append('documents[voterId]', idProofs.voterIdNumber);
      }
      if (idProofs.passportNumber) {
        formDataToSend.append('documents[passportNo]', idProofs.passportNumber);
      }

      // Document photos
      if (idProofs.passportSizePhoto instanceof File) {
        formDataToSend.append('passportSize', idProofs.passportSizePhoto);
        console.log("✅ Added passportSize file");
      }
      if (idProofs.panCardPhoto instanceof File) {
        formDataToSend.append('panNoPhoto', idProofs.panCardPhoto);
      }
      if (idProofs.aadhaarFrontPhoto instanceof File) {
        formDataToSend.append('aadhaarNoPhoto', idProofs.aadhaarFrontPhoto);
      }
      if (idProofs.rationFrontPhoto instanceof File) {
        formDataToSend.append('rationCardPhoto', idProofs.rationFrontPhoto);
      }
      if (idProofs.drivingFrontPhoto instanceof File) {
        formDataToSend.append('drivingLicensePhoto', idProofs.drivingFrontPhoto);
      }
      if (idProofs.voterFrontPhoto instanceof File) {
        formDataToSend.append('voterIdPhoto', idProofs.voterFrontPhoto);
      }
      if (idProofs.passportPhoto instanceof File) {
        formDataToSend.append('passportNoPhoto', idProofs.passportPhoto);
      }

      // --- PROFESSIONAL DETAILS ---
      Object.entries(values.professionalDetails || {}).forEach(([key, value]) => {
        if (key !== 'familyMemberMemberOfSociety' && key !== 'familyMembers' && value !== null && value !== undefined && value !== "") {
          formDataToSend.append(`professionalDetails[${key}]`, value.toString());
        }
      });

      // --- FAMILY DETAILS ---
      if (values.professionalDetails?.familyMemberMemberOfSociety) {
        formDataToSend.append('familyDetails[familyMembersMemberOfSociety]', 'true');

        values.professionalDetails.familyMembers?.forEach((member, index) => {
          if (member.name) formDataToSend.append(`familyDetails[familyMember][${index}]`, member.name);
          if (member.membershipNo) formDataToSend.append(`familyDetails[familyMemberNo][${index}]`, member.membershipNo);
        });
      } else {
        formDataToSend.append('familyDetails[familyMembersMemberOfSociety]', 'false');
      }

      // --- BANK DETAILS ---
      (values.bankDetails || []).forEach((bank, index) => {
        Object.entries(bank || {}).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            formDataToSend.append(`bankDetails[${key}]`, value.toString());
          }
        });
      });

      // --- LOAN DETAILS ---
      (values.remarks || []).forEach((remark, index) => {
        formDataToSend.append(`loanDetails[${index}][loanType]`, "Personal");
        if (remark.loanAmount) formDataToSend.append(`loanDetails[${index}][amount]`, remark.loanAmount);
        if (remark.purposeOfLoan) formDataToSend.append(`loanDetails[${index}][purpose]`, remark.purposeOfLoan);
        if (remark.loanDate) formDataToSend.append(`loanDetails[${index}][dateOfLoan]`, remark.loanDate);
      });

      // --- REFERENCE DETAILS ---
      formDataToSend.append('referenceDetails[referenceName]', "");
      formDataToSend.append('referenceDetails[referenceMno]', "");
      formDataToSend.append('referenceDetails[guarantorName]', "");

      // --- GUARANTEE DETAILS ---
      formDataToSend.append('guaranteeDetails[whetherMemberHasGivenGuaranteeInOtherSociety]', 'false');
      formDataToSend.append('guaranteeDetails[whetherMemberHasGivenGuaranteeInOurSociety]', 'false');

      // --- DEBUG LOGS ---
      console.log("🟡 Final FormData entries:");
      let hasData = false;
      for (const pair of formDataToSend.entries()) {
        console.log(pair[0], ":", pair[1]);
        if (pair[1] && pair[1] !== "") {
          hasData = true;
        }
      }

      if (!hasData) {
        showSnackbar("No form data to submit. Please fill in the form.", "error");
        return;
      }

      console.log("🚀 Dispatching createMember thunk...");
      await dispatch(createMember(formDataToSend)).unwrap();
      console.log("✅ Thunk dispatched successfully");

      showSnackbar("✅ Member created successfully!", "success");

      // Reset form after successful submission
      setActiveStep(0);

    } catch (err) {
      console.error("❌ Failed to create member:", err);
      showSnackbar(`Error: ${err.message || "Failed to create member"}`, "error");
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
        return <BankGuaranteeForm {...commonProps} />;
      case 5:
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