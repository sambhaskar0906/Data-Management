import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  MenuItem,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  UploadFile as UploadIcon,
} from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const ProfessionalForm = ({ formData, handleChange }) => {
  const professionalDetails = formData.professionalDetails;
  const theme = useTheme();
  const [errors, setErrors] = useState({});

  // Validation patterns
  const validationPatterns = {
    degreeNumber: /^[A-Za-z0-9]{6,20}$/, // Degree numbers (6-20 alphanumeric)
    monthlyIncome: /^[0-9]{4,10}$/, // Monthly income (4-10 digits)
    phone: /^[0-9]{6,12}$/, // Office phone (6-12 digits)
    employeeCode: /^[A-Za-z0-9]{3,20}$/, // Employee code (3-20 alphanumeric)
    gstNumber: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/, // GST format
    companyName: /^[A-Za-z0-9\s&.,-]{3,100}$/, // Company names
    designation: /^[A-Za-z\s.-]{2,50}$/, // Designation
    address: /^[A-Za-z0-9\s,.-]{10,200}$/, // Address
    department: /^[A-Za-z\s&.-]{2,50}$/, // Department names
    date: /^\d{4}-\d{2}-\d{2}$/, // Date format YYYY-MM-DD
  };

  // Field validation
  const validateField = (fieldName, value, section = null) => {
    if (!value || value.trim() === "") {
      clearError(fieldName, section);
      return true;
    }

    let isValid = true;
    let errorMessage = "";

    switch (fieldName) {
      case "degreeNumber":
        isValid = validationPatterns.degreeNumber.test(value);
        errorMessage = "Enter a valid degree number (6-20 alphanumeric characters)";
        break;

      case "qualificationRemark":
        isValid = value.trim().length >= 3 && value.trim().length <= 100;
        errorMessage = "Qualification must be 3-100 characters";
        break;

      case "monthlyIncome":
        const income = parseInt(value);
        isValid = validationPatterns.monthlyIncome.test(value) && income > 0;
        errorMessage = "Enter a valid monthly income (positive number, 4-10 digits)";
        break;

      case "officeNo":
        isValid = validationPatterns.phone.test(value);
        errorMessage = "Enter a valid office number (6-12 digits)";
        break;

      case "employeeCode":
        isValid = validationPatterns.employeeCode.test(value);
        errorMessage = "Enter a valid employee code (3-20 alphanumeric characters)";
        break;

      case "fullNameOfCompany":
      case "addressOfCompany":
        isValid = validationPatterns.companyName.test(value);
        errorMessage = "Enter a valid name/address (3-100 characters)";
        break;

      case "designation":
        isValid = validationPatterns.designation.test(value);
        errorMessage = "Enter a valid designation (2-50 characters)";
        break;

      case "department":
        isValid = validationPatterns.department.test(value);
        errorMessage = "Enter a valid department name (2-50 characters)";
        break;

      case "gstNumber":
        const cleanGST = value.replace(/\s/g, '').toUpperCase();
        isValid = validationPatterns.gstNumber.test(cleanGST);
        errorMessage = "Enter a valid GST number (e.g., 22AAAAA0000A1Z5)";
        break;

      case "dateOfJoining":
      case "dateOfRetirement":
        isValid = validationPatterns.date.test(value);
        if (isValid) {
          const date = new Date(value);
          const today = new Date();
          if (fieldName === "dateOfJoining" && date > today) {
            isValid = false;
            errorMessage = "Date of joining cannot be in the future";
          } else if (fieldName === "dateOfRetirement" && date < today) {
            isValid = false;
            errorMessage = "Date of retirement cannot be in the past";
          } else {
            errorMessage = "Enter a valid date (YYYY-MM-DD)";
          }
        } else {
          errorMessage = "Enter a valid date (YYYY-MM-DD)";
        }
        break;

      default:
        break;
    }

    if (!isValid) {
      setError(fieldName, errorMessage, section);
    } else {
      clearError(fieldName, section);
    }

    return isValid;
  };

  const setError = (fieldName, errorMessage, section = null) => {
    const key = section ? `${section}_${fieldName}` : fieldName;
    setErrors(prev => ({ ...prev, [key]: errorMessage }));
  };

  const clearError = (fieldName, section = null) => {
    const key = section ? `${section}_${fieldName}` : fieldName;
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  const getError = (fieldName, section = null) => {
    const key = section ? `${section}_${fieldName}` : fieldName;
    return errors[key] || null;
  };

  // Validate all fields
  const validateAllFields = () => {
    const newErrors = {};

    // Validate qualification fields
    if (professionalDetails.qualification === "OTHERS" && professionalDetails.qualificationRemark) {
      const isValid = validateField("qualificationRemark", professionalDetails.qualificationRemark);
      if (!isValid) newErrors.qualificationRemark = getError("qualificationRemark");
    }

    if (professionalDetails.degreeNumber) {
      const isValid = validateField("degreeNumber", professionalDetails.degreeNumber);
      if (!isValid) newErrors.degreeNumber = getError("degreeNumber");
    }

    // Validate service/business details
    const section = professionalDetails.inCaseOfServiceGovt ? "service" :
      professionalDetails.inCaseOfPrivate ? "service" :
        professionalDetails.inCaseOfBusiness ? "business" : null;

    if (section) {
      const details = section === "business" ?
        professionalDetails.businessDetails :
        professionalDetails.serviceDetails;

      if (details) {
        if (details.fullNameOfCompany) {
          const isValid = validateField("fullNameOfCompany", details.fullNameOfCompany, section);
          if (!isValid) newErrors[`${section}_fullNameOfCompany`] = getError("fullNameOfCompany", section);
        }

        if (details.addressOfCompany) {
          const isValid = validateField("addressOfCompany", details.addressOfCompany, section);
          if (!isValid) newErrors[`${section}_addressOfCompany`] = getError("addressOfCompany", section);
        }

        if (details.monthlyIncome) {
          const isValid = validateField("monthlyIncome", details.monthlyIncome, section);
          if (!isValid) newErrors[`${section}_monthlyIncome`] = getError("monthlyIncome", section);
        }

        if (details.designation && section === "service") {
          const isValid = validateField("designation", details.designation, section);
          if (!isValid) newErrors[`${section}_designation`] = getError("designation", section);
        }

        if (details.department && section === "service" && professionalDetails.inCaseOfServiceGovt) {
          const isValid = validateField("department", details.department, section);
          if (!isValid) newErrors[`${section}_department`] = getError("department", section);
        }

        if (details.employeeCode && section === "service") {
          const isValid = validateField("employeeCode", details.employeeCode, section);
          if (!isValid) newErrors[`${section}_employeeCode`] = getError("employeeCode", section);
        }

        if (details.officeNo && section === "service") {
          const isValid = validateField("officeNo", details.officeNo, section);
          if (!isValid) newErrors[`${section}_officeNo`] = getError("officeNo", section);
        }

        if (details.dateOfJoining && section === "service") {
          const isValid = validateField("dateOfJoining", details.dateOfJoining, section);
          if (!isValid) newErrors[`${section}_dateOfJoining`] = getError("dateOfJoining", section);
        }

        if (details.dateOfRetirement && section === "service") {
          const isValid = validateField("dateOfRetirement", details.dateOfRetirement, section);
          if (!isValid) newErrors[`${section}_dateOfRetirement`] = getError("dateOfRetirement", section);
        }

        if (details.gstNumber && section === "business") {
          const isValid = validateField("gstNumber", details.gstNumber, section);
          if (!isValid) newErrors[`${section}_gstNumber`] = getError("gstNumber", section);
        }
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // File validation
  const validateFile = (file, maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
    if (!file) return null;

    if (!allowedTypes.includes(file.type)) {
      return "Please upload a valid file (JPEG, PNG, or PDF)";
    }

    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      return `File size should be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleProfessionalFieldChange = (field, value) => {
    handleChange("professionalDetails", field, value);

    // Clear error when field is being edited
    if (field === "qualificationRemark" || field === "degreeNumber") {
      clearError(field);

      // Validate field if it has value
      if (value) {
        validateField(field, value);
      }
    }
  };

  const handleServiceDetailsChange = (field, value) => {
    const section = professionalDetails.inCaseOfServiceGovt || professionalDetails.inCaseOfPrivate ? "service" : "business";

    const updatedDetails = {
      ...(section === "service" ? professionalDetails.serviceDetails : professionalDetails.businessDetails),
      [field]: value
    };

    handleChange("professionalDetails",
      section === "service" ? "serviceDetails" : "businessDetails",
      updatedDetails
    );

    // Clear error when field is being edited
    clearError(field, section);

    // Validate field if it has value
    if (value) {
      validateField(field, value, section);
    }
  };

  const handleFileUpload = (field, file, section) => {
    const error = validateFile(file, 5);
    if (error) {
      setError(field, error, section);
      return;
    }

    const updatedDetails = {
      ...(section === "service" ? professionalDetails.serviceDetails : professionalDetails.businessDetails),
      [field]: file
    };

    handleChange("professionalDetails",
      section === "service" ? "serviceDetails" : "businessDetails",
      updatedDetails
    );

    // Clear any previous file errors
    clearError(field, section);
  };

  // Common text field styles with error handling
  const textFieldStyles = (fieldName = null, section = null) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
      transition: 'all 0.2s ease-in-out',
      height: '56px',
      '&:hover': {
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
      },
      '&.Mui-error': {
        borderColor: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, 0.05),
        '&:hover': {
          backgroundColor: alpha(theme.palette.error.main, 0.08),
        }
      }
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.9rem',
      fontWeight: 500,
      '&.Mui-error': {
        color: theme.palette.error.main,
      }
    },
    '& .MuiFormHelperText-root': {
      fontSize: '0.75rem',
      marginLeft: 0,
      '&.Mui-error': {
        color: theme.palette.error.main,
        fontWeight: 500,
      }
    }
  });

  // Input formatting
  const formatInput = (fieldName, value) => {
    switch (fieldName) {
      case "gstNumber":
        return value.replace(/\s/g, '').toUpperCase();

      case "monthlyIncome":
      case "officeNo":
        return value.replace(/\D/g, '');

      case "fullNameOfCompany":
      case "designation":
      case "department":
        return value
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

      case "degreeNumber":
      case "employeeCode":
        return value.toUpperCase();

      default:
        return value;
    }
  };

  const handleInputChange = (e, field, section = null) => {
    const formattedValue = formatInput(field, e.target.value);

    if (section) {
      handleServiceDetailsChange(field, formattedValue);
    } else {
      handleProfessionalFieldChange(field, formattedValue);
    }
  };

  return (
    <Box>
      <Card sx={{
        borderRadius: 4,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }
      }}>
        <CardContent sx={{ p: 5 }}>
          <SectionHeader
            icon={
              <Box
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: 3,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <WorkIcon
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: 28
                  }}
                />
              </Box>
            }
            title="Professional Background"
            subtitle="Educational qualification and occupation details"
            sx={{
              mb: 4,
              '& .MuiTypography-h5': {
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.text.primary, 0.8)} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
              },
              '& .MuiTypography-subtitle1': {
                color: theme.palette.text.secondary,
                fontSize: '0.95rem',
              }
            }}
          />

          {/* ================= QUALIFICATION & OCCUPATION ================= */}
          <Grid container spacing={3}>
            {/* Qualification */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: theme.palette.primary.main }}>
                  Qualification *
                </Typography>
                <StyledTextField
                  select
                  fullWidth
                  label="Select Qualification"
                  value={professionalDetails.qualification || ""}
                  onChange={(e) => handleProfessionalFieldChange("qualification", e.target.value)}
                  error={!professionalDetails.qualification && Object.keys(errors).length > 0}
                  helperText={!professionalDetails.qualification && Object.keys(errors).length > 0 ? "Please select qualification" : ""}
                  sx={textFieldStyles()}
                >
                  <MenuItem value="">Select Qualification</MenuItem>
                  <MenuItem value="10TH">10th</MenuItem>
                  <MenuItem value="12TH">12th</MenuItem>
                  <MenuItem value="GRADUATED">Graduated</MenuItem>
                  <MenuItem value="POST_GRADUATED">Post Graduated</MenuItem>
                  <MenuItem value="CA">CA</MenuItem>
                  <MenuItem value="LLB">LLB</MenuItem>
                  <MenuItem value="DR">Doctor</MenuItem>
                  <MenuItem value="OTHERS">Others</MenuItem>
                </StyledTextField>
              </Box>

              {/* Others Remark Field */}
              {professionalDetails.qualification === "OTHERS" && (
                <StyledTextField
                  fullWidth
                  label="Please specify your qualification *"
                  value={professionalDetails.qualificationRemark || ""}
                  onChange={(e) => handleInputChange(e, "qualificationRemark")}
                  onBlur={(e) => validateField("qualificationRemark", e.target.value)}
                  error={!!getError("qualificationRemark")}
                  helperText={getError("qualificationRemark") || "Minimum 3 characters required"}
                  sx={textFieldStyles("qualificationRemark")}
                  placeholder="e.g., Diploma in Engineering"
                />
              )}
            </Grid>

            {/* Degree Number */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: theme.palette.primary.main }}>
                  Degree Number
                </Typography>
                <StyledTextField
                  fullWidth
                  label="Degree/Certificate Number"
                  value={professionalDetails.degreeNumber || ""}
                  onChange={(e) => handleInputChange(e, "degreeNumber")}
                  onBlur={(e) => validateField("degreeNumber", e.target.value)}
                  error={!!getError("degreeNumber")}
                  helperText={getError("degreeNumber") || "6-20 alphanumeric characters"}
                  sx={textFieldStyles("degreeNumber")}
                  placeholder="e.g., DEG2024001"
                  inputProps={{
                    maxLength: 20,
                    style: { textTransform: 'uppercase' }
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* ================= OCCUPATION TYPE SELECTION ================= */}
          <Box sx={{ mt: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 600 }}>
              Occupation Type *
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={professionalDetails.inCaseOfServiceGovt || false}
                      onChange={(e) => {
                        handleProfessionalFieldChange("inCaseOfServiceGovt", e.target.checked);
                        if (e.target.checked) {
                          handleProfessionalFieldChange("inCaseOfPrivate", false);
                          handleProfessionalFieldChange("inCaseOfBusiness", false);
                          handleProfessionalFieldChange("occupation", "GOVERNMENT_SERVICE");
                        }
                      }}
                      sx={{
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        }
                      }}
                    />
                  }
                  label="Government Service"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={professionalDetails.inCaseOfPrivate || false}
                      onChange={(e) => {
                        handleProfessionalFieldChange("inCaseOfPrivate", e.target.checked);
                        if (e.target.checked) {
                          handleProfessionalFieldChange("inCaseOfServiceGovt", false);
                          handleProfessionalFieldChange("inCaseOfBusiness", false);
                          handleProfessionalFieldChange("occupation", "PRIVATE_SERVICE");
                        }
                      }}
                      sx={{
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        }
                      }}
                    />
                  }
                  label="Private Service"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={professionalDetails.inCaseOfBusiness || false}
                      onChange={(e) => {
                        handleProfessionalFieldChange("inCaseOfBusiness", e.target.checked);
                        if (e.target.checked) {
                          handleProfessionalFieldChange("inCaseOfServiceGovt", false);
                          handleProfessionalFieldChange("inCaseOfPrivate", false);
                          handleProfessionalFieldChange("occupation", "BUSINESS");
                        }
                      }}
                      sx={{
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        }
                      }}
                    />
                  }
                  label="Business"
                />
              </Grid>
            </Grid>

            {!professionalDetails.inCaseOfServiceGovt && !professionalDetails.inCaseOfPrivate && !professionalDetails.inCaseOfBusiness &&
              Object.keys(errors).length > 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  Please select an occupation type
                </Typography>
              )}
          </Box>

          {/* ================= GOVERNMENT SERVICE DETAILS ================= */}
          {professionalDetails.inCaseOfServiceGovt && (
            <Box sx={{
              mt: 4,
              p: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}>
              <SectionHeader
                icon={<SchoolIcon />}
                title="Government Service Details"
                subtitle="Complete government job information"
                sx={{ mb: 3 }}
              />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Full Name of Company *"
                    value={professionalDetails.serviceDetails?.fullNameOfCompany || ""}
                    onChange={(e) => handleInputChange(e, "fullNameOfCompany", "service")}
                    onBlur={(e) => validateField("fullNameOfCompany", e.target.value, "service")}
                    error={!!getError("fullNameOfCompany", "service")}
                    helperText={getError("fullNameOfCompany", "service") || "Enter full government department name"}
                    sx={textFieldStyles("fullNameOfCompany", "service")}
                    placeholder="e.g., Ministry of Finance"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Department *"
                    value={professionalDetails.serviceDetails?.department || ""}
                    onChange={(e) => handleInputChange(e, "department", "service")}
                    onBlur={(e) => validateField("department", e.target.value, "service")}
                    error={!!getError("department", "service")}
                    helperText={getError("department", "service") || "Enter department name"}
                    sx={textFieldStyles("department", "service")}
                    placeholder="e.g., Accounts Department"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Address of Company *"
                    value={professionalDetails.serviceDetails?.addressOfCompany || ""}
                    onChange={(e) => handleInputChange(e, "addressOfCompany", "service")}
                    onBlur={(e) => validateField("addressOfCompany", e.target.value, "service")}
                    error={!!getError("addressOfCompany", "service")}
                    helperText={getError("addressOfCompany", "service") || "Enter complete office address"}
                    sx={textFieldStyles("addressOfCompany", "service")}
                    placeholder="e.g., Central Secretariat, New Delhi"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Monthly Income (₹) *"
                    type="number"
                    value={professionalDetails.serviceDetails?.monthlyIncome || ""}
                    onChange={(e) => handleInputChange(e, "monthlyIncome", "service")}
                    onBlur={(e) => validateField("monthlyIncome", e.target.value, "service")}
                    error={!!getError("monthlyIncome", "service")}
                    helperText={getError("monthlyIncome", "service") || "Enter monthly income in rupees"}
                    sx={textFieldStyles("monthlyIncome", "service")}
                    placeholder="e.g., 50000"
                    inputProps={{ min: "1000", max: "10000000" }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Designation *"
                    value={professionalDetails.serviceDetails?.designation || ""}
                    onChange={(e) => handleInputChange(e, "designation", "service")}
                    onBlur={(e) => validateField("designation", e.target.value, "service")}
                    error={!!getError("designation", "service")}
                    helperText={getError("designation", "service") || "Enter your designation"}
                    sx={textFieldStyles("designation", "service")}
                    placeholder="e.g., Deputy Secretary"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Employee Code"
                    value={professionalDetails.serviceDetails?.employeeCode || ""}
                    onChange={(e) => handleInputChange(e, "employeeCode", "service")}
                    onBlur={(e) => validateField("employeeCode", e.target.value, "service")}
                    error={!!getError("employeeCode", "service")}
                    helperText={getError("employeeCode", "service") || "3-20 alphanumeric characters"}
                    sx={textFieldStyles("employeeCode", "service")}
                    placeholder="e.g., EMP12345"
                    inputProps={{
                      maxLength: 20,
                      style: { textTransform: 'uppercase' }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Date of Joining *"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={professionalDetails.serviceDetails?.dateOfJoining || ""}
                    onChange={(e) => handleServiceDetailsChange("dateOfJoining", e.target.value)}
                    onBlur={(e) => validateField("dateOfJoining", e.target.value, "service")}
                    error={!!getError("dateOfJoining", "service")}
                    helperText={getError("dateOfJoining", "service")}
                    sx={textFieldStyles("dateOfJoining", "service")}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Date of Retirement *"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={professionalDetails.serviceDetails?.dateOfRetirement || ""}
                    onChange={(e) => handleServiceDetailsChange("dateOfRetirement", e.target.value)}
                    onBlur={(e) => validateField("dateOfRetirement", e.target.value, "service")}
                    error={!!getError("dateOfRetirement", "service")}
                    helperText={getError("dateOfRetirement", "service")}
                    sx={textFieldStyles("dateOfRetirement", "service")}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Office Number"
                    value={professionalDetails.serviceDetails?.officeNo || ""}
                    onChange={(e) => handleInputChange(e, "officeNo", "service")}
                    onBlur={(e) => validateField("officeNo", e.target.value, "service")}
                    error={!!getError("officeNo", "service")}
                    helperText={getError("officeNo", "service") || "6-12 digits only"}
                    sx={textFieldStyles("officeNo", "service")}
                    placeholder="e.g., 01123456789"
                    inputProps={{ maxLength: 12 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadIcon />}
                    sx={{
                      height: '56px',
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      backgroundColor: professionalDetails.serviceDetails?.bankStatement ?
                        alpha(theme.palette.success.main, 0.1) : undefined,
                      '&:hover': {
                        border: `1px solid ${theme.palette.primary.main}`,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    {professionalDetails.serviceDetails?.bankStatement
                      ? `Bank Statement Uploaded ✓`
                      : "Attach Bank Statement of 6 months *"}
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload("bankStatement", e.target.files[0], "service")}
                    />
                  </Button>
                  {getError("bankStatement", "service") && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                      {getError("bankStatement", "service")}
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadIcon />}
                    sx={{
                      height: '56px',
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      backgroundColor: professionalDetails.serviceDetails?.monthlySlip ?
                        alpha(theme.palette.success.main, 0.1) : undefined,
                      '&:hover': {
                        border: `1px solid ${theme.palette.primary.main}`,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    {professionalDetails.serviceDetails?.monthlySlip
                      ? `Monthly Slip Uploaded ✓`
                      : "Attach Monthly slip of last 6 months *"}
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload("monthlySlip", e.target.files[0], "service")}
                    />
                  </Button>
                  {getError("monthlySlip", "service") && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                      {getError("monthlySlip", "service")}
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadIcon />}
                    sx={{
                      height: '56px',
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      backgroundColor: professionalDetails.serviceDetails?.idCard ?
                        alpha(theme.palette.success.main, 0.1) : undefined,
                      '&:hover': {
                        border: `1px solid ${theme.palette.primary.main}`,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    {professionalDetails.serviceDetails?.idCard
                      ? `Office ID Uploaded ✓`
                      : "Attach Office ID *"}
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload("idCard", e.target.files[0], "service")}
                    />
                  </Button>
                  {getError("idCard", "service") && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                      {getError("idCard", "service")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ================= PRIVATE SERVICE DETAILS ================= */}
          {professionalDetails.inCaseOfPrivate && (
            <Box sx={{
              mt: 4,
              p: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
            }}>
              <SectionHeader
                icon={<BusinessIcon />}
                title="Private Service Details"
                subtitle="Complete private job information"
                sx={{ mb: 3 }}
              />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Full Name of Company *"
                    value={professionalDetails.serviceDetails?.fullNameOfCompany || ""}
                    onChange={(e) => handleInputChange(e, "fullNameOfCompany", "service")}
                    onBlur={(e) => validateField("fullNameOfCompany", e.target.value, "service")}
                    error={!!getError("fullNameOfCompany", "service")}
                    helperText={getError("fullNameOfCompany", "service") || "Enter full company name"}
                    sx={textFieldStyles("fullNameOfCompany", "service")}
                    placeholder="e.g., Tech Solutions Pvt. Ltd."
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Address of Company *"
                    value={professionalDetails.serviceDetails?.addressOfCompany || ""}
                    onChange={(e) => handleInputChange(e, "addressOfCompany", "service")}
                    onBlur={(e) => validateField("addressOfCompany", e.target.value, "service")}
                    error={!!getError("addressOfCompany", "service")}
                    helperText={getError("addressOfCompany", "service") || "Enter complete office address"}
                    sx={textFieldStyles("addressOfCompany", "service")}
                    placeholder="e.g., 123 Business Park, Mumbai"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Monthly Income (₹) *"
                    type="number"
                    value={professionalDetails.serviceDetails?.monthlyIncome || ""}
                    onChange={(e) => handleInputChange(e, "monthlyIncome", "service")}
                    onBlur={(e) => validateField("monthlyIncome", e.target.value, "service")}
                    error={!!getError("monthlyIncome", "service")}
                    helperText={getError("monthlyIncome", "service") || "Enter monthly income in rupees"}
                    sx={textFieldStyles("monthlyIncome", "service")}
                    placeholder="e.g., 75000"
                    inputProps={{ min: "1000", max: "10000000" }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Designation *"
                    value={professionalDetails.serviceDetails?.designation || ""}
                    onChange={(e) => handleInputChange(e, "designation", "service")}
                    onBlur={(e) => validateField("designation", e.target.value, "service")}
                    error={!!getError("designation", "service")}
                    helperText={getError("designation", "service") || "Enter your designation"}
                    sx={textFieldStyles("designation", "service")}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <StyledTextField
                    label="Employee Code"
                    value={professionalDetails.serviceDetails?.employeeCode || ""}
                    onChange={(e) => handleInputChange(e, "employeeCode", "service")}
                    onBlur={(e) => validateField("employeeCode", e.target.value, "service")}
                    error={!!getError("employeeCode", "service")}
                    helperText={getError("employeeCode", "service") || "3-20 alphanumeric characters"}
                    sx={textFieldStyles("employeeCode", "service")}
                    placeholder="e.g., EMP78901"
                    inputProps={{
                      maxLength: 20,
                      style: { textTransform: 'uppercase' }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <StyledTextField
                    label="Date of Joining *"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={professionalDetails.serviceDetails?.dateOfJoining || ""}
                    onChange={(e) => handleServiceDetailsChange("dateOfJoining", e.target.value)}
                    onBlur={(e) => validateField("dateOfJoining", e.target.value, "service")}
                    error={!!getError("dateOfJoining", "service")}
                    helperText={getError("dateOfJoining", "service")}
                    sx={textFieldStyles("dateOfJoining", "service")}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <StyledTextField
                    label="Date of Retirement"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={professionalDetails.serviceDetails?.dateOfRetirement || ""}
                    onChange={(e) => handleServiceDetailsChange("dateOfRetirement", e.target.value)}
                    onBlur={(e) => validateField("dateOfRetirement", e.target.value, "service")}
                    error={!!getError("dateOfRetirement", "service")}
                    helperText={getError("dateOfRetirement", "service")}
                    sx={textFieldStyles("dateOfRetirement", "service")}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Office Number"
                    value={professionalDetails.serviceDetails?.officeNo || ""}
                    onChange={(e) => handleInputChange(e, "officeNo", "service")}
                    onBlur={(e) => validateField("officeNo", e.target.value, "service")}
                    error={!!getError("officeNo", "service")}
                    helperText={getError("officeNo", "service") || "6-12 digits only"}
                    sx={textFieldStyles("officeNo", "service")}
                    placeholder="e.g., 02298765432"
                    inputProps={{ maxLength: 12 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadIcon />}
                    sx={{
                      height: '56px',
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                      backgroundColor: professionalDetails.serviceDetails?.idCard ?
                        alpha(theme.palette.success.main, 0.1) : undefined,
                      '&:hover': {
                        border: `1px solid ${theme.palette.secondary.main}`,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                      }
                    }}
                  >
                    {professionalDetails.serviceDetails?.idCard
                      ? `ID Card Uploaded ✓`
                      : "Attach ID Card *"}
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload("idCard", e.target.files[0], "service")}
                    />
                  </Button>
                  {getError("idCard", "service") && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                      {getError("idCard", "service")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ================= BUSINESS DETAILS ================= */}
          {professionalDetails.inCaseOfBusiness && (
            <Box sx={{
              mt: 4,
              p: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha('#4CAF50', 0.05)} 0%, ${alpha('#8BC34A', 0.05)} 100%)`,
              border: `1px solid ${alpha('#4CAF50', 0.2)}`
            }}>
              <SectionHeader
                icon={<BusinessIcon />}
                title="Business Details"
                subtitle="Business information & GST details"
                sx={{ mb: 3 }}
              />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Full Name of Company/Firm *"
                    value={professionalDetails.businessDetails?.fullNameOfCompany || ""}
                    onChange={(e) => handleInputChange(e, "fullNameOfCompany", "business")}
                    onBlur={(e) => validateField("fullNameOfCompany", e.target.value, "business")}
                    error={!!getError("fullNameOfCompany", "business")}
                    helperText={getError("fullNameOfCompany", "business") || "Enter full business name"}
                    sx={textFieldStyles("fullNameOfCompany", "business")}
                    placeholder="e.g., Sharma Traders & Co."
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Address of Company/Firm *"
                    value={professionalDetails.businessDetails?.addressOfCompany || ""}
                    onChange={(e) => handleInputChange(e, "addressOfCompany", "business")}
                    onBlur={(e) => validateField("addressOfCompany", e.target.value, "business")}
                    error={!!getError("addressOfCompany", "business")}
                    helperText={getError("addressOfCompany", "business") || "Enter business address"}
                    sx={textFieldStyles("addressOfCompany", "business")}
                    placeholder="e.g., Shop No. 5, Market Street, Delhi"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    select
                    label="Business Structure *"
                    value={professionalDetails.businessDetails?.businessStructure || ""}
                    onChange={(e) => handleServiceDetailsChange("businessStructure", e.target.value)}
                    error={!professionalDetails.businessDetails?.businessStructure && Object.keys(errors).length > 0}
                    helperText={!professionalDetails.businessDetails?.businessStructure && Object.keys(errors).length > 0 ?
                      "Please select business structure" : ""}
                    sx={textFieldStyles("businessStructure", "business")}
                  >
                    <MenuItem value="">Select Business Structure</MenuItem>
                    <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                    <MenuItem value="PROPRIETORSHIP">Proprietorship</MenuItem>
                    <MenuItem value="PARTNERSHIP">Partnership</MenuItem>
                    <MenuItem value="LLP">LLP</MenuItem>
                    <MenuItem value="PVT_LTD">Private Limited</MenuItem>
                  </StyledTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="GST Number"
                    value={professionalDetails.businessDetails?.gstNumber || ""}
                    onChange={(e) => handleInputChange(e, "gstNumber", "business")}
                    onBlur={(e) => validateField("gstNumber", e.target.value, "business")}
                    error={!!getError("gstNumber", "business")}
                    helperText={getError("gstNumber", "business") || "Format: 22AAAAA0000A1Z5"}
                    sx={textFieldStyles("gstNumber", "business")}
                    placeholder="e.g., 22AAAAA0000A1Z5"
                    inputProps={{
                      maxLength: 15,
                      style: { textTransform: 'uppercase' }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Monthly Income (₹) *"
                    type="number"
                    value={professionalDetails.businessDetails?.monthlyIncome || ""}
                    onChange={(e) => handleInputChange(e, "monthlyIncome", "business")}
                    onBlur={(e) => validateField("monthlyIncome", e.target.value, "business")}
                    error={!!getError("monthlyIncome", "business")}
                    helperText={getError("monthlyIncome", "business") || "Enter average monthly income"}
                    sx={textFieldStyles("monthlyIncome", "business")}
                    placeholder="e.g., 100000"
                    inputProps={{ min: "1000", max: "10000000" }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadIcon />}
                    sx={{
                      height: '56px',
                      borderRadius: 2,
                      border: `1px solid ${alpha('#4CAF50', 0.3)}`,
                      backgroundColor: professionalDetails.businessDetails?.gstCertificate ?
                        alpha(theme.palette.success.main, 0.1) : undefined,
                      '&:hover': {
                        border: `1px solid #4CAF50`,
                        backgroundColor: alpha('#4CAF50', 0.04),
                      }
                    }}
                  >
                    {professionalDetails.businessDetails?.gstCertificate
                      ? `GST Certificate Uploaded ✓`
                      : "Upload GST Certificate"}
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload("gstCertificate", e.target.files[0], "business")}
                    />
                  </Button>
                  {getError("gstCertificate", "business") && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                      {getError("gstCertificate", "business")}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfessionalForm;