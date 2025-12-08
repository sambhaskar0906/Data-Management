import React, { useState, useEffect } from "react";
import { Card, CardContent, Grid, Box, useTheme, alpha, Typography } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";
import Autocomplete from "@mui/material/Autocomplete";

const PersonalInfoForm = ({ formData, handleChange }) => {
  const personalInfo = formData.personalDetails || formData.personalInformation || {};
  const creditInfo = formData.creditDetails || formData.creditInformation || {};
  const [dobError, setDobError] = useState("");
  const [civilScoreText, setCivilScoreText] = useState("");
  const theme = useTheme();

  // State for field errors
  const [errors, setErrors] = useState({
    membershipNumber: "",
    membershipDate: "",
    title: "",
    nameOfMember: "",
    fatherTitle: "",
    nameOfFather: "",
    motherTitle: "",
    nameOfMother: "",
    dateOfBirth: "",
    ageInYears: "",
    minor: "",
    guardianName: "",
    guardianRelation: "",
    cibilScore: "",
    gender: "",
    religion: "",
    maritalStatus: "",
    spouseTitle: "",
    nameOfSpouse: "",
    caste: "",
    phoneNo1: "",
    phoneNo2: "",
    whatsapp: "",
    landlineNo: "",
    landlineOffice: "",
    emailId1: "",
    emailId2: "",
    emailId3: "",
  });

  const handleFieldChange = (field, value) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    if (formData.personalDetails) {
      handleChange("personalDetails", field, value);
    } else {
      handleChange("personalInformation", field, value);
    }
  };

  // Validation functions
  const validateField = (fieldName, value) => {
    let error = "";

    if (!value) return error; // Only validate if there's a value (not required)

    switch (fieldName) {
      // Mobile numbers validation (Indian mobile numbers)
      case "phoneNo1":
      case "phoneNo2":
      case "whatsapp":
        // Remove all non-digit characters
        const mobileDigits = value.replace(/\D/g, '');

        // Check if it's exactly 10 digits
        if (mobileDigits.length !== 10) {
          error = "Indian mobile number must be 10 digits";
        }
        // Check if starts with valid Indian prefix (6,7,8,9)
        else if (!/^[6-9]/.test(mobileDigits)) {
          error = "Indian mobile number should start with 6,7,8, or 9";
        }
        // Check if all digits are numbers
        else if (!/^\d{10}$/.test(mobileDigits)) {
          error = "Please enter valid 10-digit number";
        }
        break;

      // Landline numbers validation (6-12 digits with optional +, -, spaces)
      case "landlineNo":
      case "landlineOffice":
        // Remove all non-digit characters except +, -, spaces
        const landlineDigits = value.replace(/[^\d+\-\s]/g, '');
        const digitCount = (landlineDigits.match(/\d/g) || []).length;

        if (digitCount < 6 || digitCount > 12) {
          error = "Landline number should be 6 to 12 digits";
        }
        // Validate format (can contain +, -, spaces between digits)
        else if (!/^[\d+\-\s]{6,20}$/.test(landlineDigits)) {
          error = "Invalid landline number format";
        }
        break;

      // Email validation (must contain @)
      case "emailId1":
      case "emailId2":
      case "emailId3":
        // Basic email validation with @
        if (!value.includes('@')) {
          error = "Email must contain '@' symbol";
        }
        // More comprehensive email validation
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        // Check for spaces
        else if (/\s/.test(value)) {
          error = "Email cannot contain spaces";
        }
        // Check for double @
        else if ((value.match(/@/g) || []).length > 1) {
          error = "Email can only contain one '@' symbol";
        }
        break;

      // Text fields validation
      case "membershipNumber":
        if (!/^[A-Za-z0-9/-]+$/.test(value)) {
          error = "Only alphanumeric characters, hyphens and slashes allowed";
        }
        break;

      case "nameOfMember":
      case "nameOfFather":
      case "nameOfMother":
      case "guardianName":
      case "nameOfSpouse":
        if (value.length < 2) {
          error = "Name must be at least 2 characters";
        } else if (!/^[A-Za-z\s.'-]+$/.test(value)) {
          error = "Only letters, spaces, apostrophes, hyphens and dots allowed";
        }
        break;

      case "cibilScore":
        const score = parseInt(value);
        if (isNaN(score) || score < 300 || score > 900) {
          error = "Score must be between 300 and 900";
        }
        break;

      // Date validations
      case "membershipDate":
        const memDate = new Date(value);
        const today = new Date();
        if (memDate > today) {
          error = "Membership date cannot be in the future";
        }
        break;

      case "dateOfBirth":
        const dob = new Date(value);
        const todayDate = new Date();
        if (dob > todayDate) {
          error = "Date of birth cannot be in the future";
        } else {
          const age = todayDate.getFullYear() - dob.getFullYear();
          if (age > 120) {
            error = "Please enter a valid date of birth";
          }
        }
        break;

      // Selection validations
      case "title":
      case "fatherTitle":
      case "motherTitle":
      case "spouseTitle":
        if (!["Mr", "Mrs", "Miss", "Dr", "CA", "Advocate"].includes(value)) {
          error = "Please select a valid title";
        }
        break;

      case "gender":
        if (!["Male", "Female", "Other"].includes(value)) {
          error = "Please select a valid gender";
        }
        break;

      case "religion":
        if (!["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain"].includes(value)) {
          error = "Please select a valid religion";
        }
        break;

      case "maritalStatus":
        if (!["Single", "Married", "Divorced", "Widowed"].includes(value)) {
          error = "Please select a valid marital status";
        }
        break;

      case "caste":
        if (!["General", "OBC", "SC", "ST"].includes(value)) {
          error = "Please select a valid caste";
        }
        break;

      case "minor":
        if (!["Yes", "No"].includes(value)) {
          error = "Please select Yes or No";
        }
        break;

      case "guardianRelation":
        if (!["Father", "Mother", "Grandfather", "Grandmother", "Uncle", "Aunt"].includes(value)) {
          error = "Please select a valid relation";
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Handle field blur for validation
  const handleFieldBlur = (fieldName, value) => {
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error;
  };

  // Civil Score logic with validation
  const handleCivilScoreChange = (score) => {
    // Clear error first
    if (errors.cibilScore) {
      setErrors(prev => ({ ...prev, cibilScore: "" }));
    }

    handleChange("creditDetails", "cibilScore", score);

    if (!score) {
      setCivilScoreText("");
      return;
    }

    const numericScore = parseInt(score);
    if (isNaN(numericScore)) {
      setCivilScoreText("Invalid score");
      setErrors(prev => ({ ...prev, cibilScore: "Please enter a valid number" }));
      return;
    }

    // Validate score range
    if (numericScore < 300 || numericScore > 900) {
      setErrors(prev => ({ ...prev, cibilScore: "Score must be between 300 and 900" }));
      setCivilScoreText("Invalid Score");
      return;
    }

    if (numericScore >= 300 && numericScore <= 550) {
      setCivilScoreText("Poor");
    } else if (numericScore >= 551 && numericScore <= 650) {
      setCivilScoreText("Average");
    } else if (numericScore >= 651 && numericScore <= 750) {
      setCivilScoreText("Good");
    } else if (numericScore >= 751 && numericScore <= 900) {
      setCivilScoreText("Excellent");
    } else {
      setCivilScoreText("Invalid Score");
    }
  };

  // Mobile number input formatting
  const formatMobileNumber = (value) => {
    // Remove all non-digit characters
    return value.replace(/\D/g, '');
  };

  // Landline number input formatting
  const formatLandlineNumber = (value) => {
    // Allow digits, +, -, and spaces
    return value.replace(/[^\d+\-\s]/g, '');
  };

  // Handle mobile number change with formatting
  const handleMobileChange = (field, value) => {
    const formattedValue = formatMobileNumber(value);
    handleFieldChange(field, formattedValue);
  };

  // Handle landline number change with formatting
  const handleLandlineChange = (field, value) => {
    const formattedValue = formatLandlineNumber(value);
    handleFieldChange(field, formattedValue);
  };

  // DOB age logic with validation
  const handleDateOfBirthChange = (dateString) => {
    // Clear previous errors
    if (errors.dateOfBirth) {
      setErrors(prev => ({ ...prev, dateOfBirth: "" }));
    }

    handleFieldChange("dateOfBirth", dateString);

    if (!dateString) {
      handleFieldChange("ageInYears", "");
      handleFieldChange("minor", "");
      setDobError("");
      return;
    }

    const dob = new Date(dateString);
    const today = new Date();

    // Validate date is not in future
    if (dob > today) {
      setErrors(prev => ({ ...prev, dateOfBirth: "Date of birth cannot be in the future" }));
      setDobError("Date of birth cannot be in the future");
      handleFieldChange("ageInYears", "");
      handleFieldChange("minor", "");
      return;
    }

    // Validate reasonable age
    const ageDiff = today.getFullYear() - dob.getFullYear();
    if (ageDiff > 120) {
      setErrors(prev => ({ ...prev, dateOfBirth: "Please enter a valid date of birth" }));
      setDobError("Please enter a valid date of birth");
      handleFieldChange("ageInYears", "");
      handleFieldChange("minor", "");
      return;
    }

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
      months -= 1;
      days += 30;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const isMinor = years < 18 ? true : false;
    setDobError("");

    handleFieldChange("ageInYears", `${years} years, ${months} months`);
    handleFieldChange("minor", isMinor ? "Yes" : "No");
  };

  const ComboBox = ({ label, fieldName, value, options, ...props }) => {
    const [inputValue, setInputValue] = useState(value || "");

    useEffect(() => {
      setInputValue(value || "");
    }, [value]);

    const handleBlur = () => {
      const error = handleFieldBlur(fieldName, inputValue);
      if (!error) {
        handleFieldChange(fieldName, inputValue);
      }
    };

    return (
      <Autocomplete
        freeSolo
        options={options}
        value={value || ""}
        inputValue={inputValue}
        onInputChange={(e, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(e, newVal) => {
          handleFieldChange(fieldName, newVal || "");
          handleFieldBlur(fieldName, newVal || "");
        }}
        onBlur={handleBlur}
        sx={{
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
            }
          },
          '& .MuiAutocomplete-input': {
            padding: '8.5px 4px 8.5px 6px !important',
          }
        }}
        renderInput={(params) => (
          <StyledTextField
            {...params}
            label={label}
            error={!!errors[fieldName]}
            helperText={errors[fieldName]}
            sx={{
              '& .MuiInputLabel-root': {
                fontSize: '0.9rem',
                fontWeight: 500,
              },
              '& .MuiInputBase-root': {
                height: '56px',
              }
            }}
          />
        )}
        {...props}
      />
    );
  };

  const textFieldStyles = {
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
      }
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.9rem',
      fontWeight: 500,
    }
  };

  return (
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
              <PersonIcon
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: 28
                }}
              />
            </Box>
          }
          title="Personal Information"
          subtitle="Basic member details and identification"
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

        <Grid container spacing={3}>
          {/* Membership Number */}
          <Grid size={{ xs: 12, md: 3 }}>
            <StyledTextField
              label="Membership No."
              name="membershipNumber"
              value={personalInfo.membershipNumber || ""}
              onChange={(e) => handleFieldChange("membershipNumber", e.target.value)}
              onBlur={(e) => handleFieldBlur("membershipNumber", e.target.value)}
              error={!!errors.membershipNumber}
              helperText={errors.membershipNumber}
              sx={textFieldStyles}
            />
          </Grid>

          {/* Membership Date */}
          <Grid size={{ xs: 12, md: 3 }}>
            <StyledTextField
              label="Membership Date"
              type="date"
              name="membershipDate"
              InputLabelProps={{ shrink: true }}
              value={personalInfo.membershipDate || ""}
              onChange={(e) => handleFieldChange("membershipDate", e.target.value)}
              onBlur={(e) => handleFieldBlur("membershipDate", e.target.value)}
              error={!!errors.membershipDate}
              helperText={errors.membershipDate}
              sx={textFieldStyles}
            />
          </Grid>

          {/* Title */}
          <Grid size={{ xs: 12, md: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <ComboBox
                label="Title"
                fieldName="title"
                value={personalInfo.title}
                options={["Mr", "Mrs", "Miss", "Dr", "CA", "Advocate"]}
              />
            </Box>
          </Grid>

          {/* Name of Member */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Name of Member"
              name="nameOfMember"
              value={personalInfo.nameOfMember || ""}
              onChange={(e) => handleFieldChange("nameOfMember", e.target.value)}
              onBlur={(e) => handleFieldBlur("nameOfMember", e.target.value)}
              error={!!errors.nameOfMember}
              helperText={errors.nameOfMember}
              sx={textFieldStyles}
            />
          </Grid>

          {/* Father Title */}
          <Grid size={{ xs: 12, md: 2 }}>
            <ComboBox
              label="Father Title"
              fieldName="fatherTitle"
              value={personalInfo.fatherTitle}
              options={["Mr", "Dr", "CA", "Advocate"]}
            />
          </Grid>

          {/* Name of Father */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Name of Father"
              name="nameOfFather"
              value={personalInfo.nameOfFather || ""}
              onChange={(e) => handleFieldChange("nameOfFather", e.target.value)}
              onBlur={(e) => handleFieldBlur("nameOfFather", e.target.value)}
              error={!!errors.nameOfFather}
              helperText={errors.nameOfFather}
              sx={textFieldStyles}
            />
          </Grid>

          {/* Mother Title */}
          <Grid size={{ xs: 12, md: 2 }}>
            <ComboBox
              label="Mother Title"
              fieldName="motherTitle"
              value={personalInfo.motherTitle}
              options={["Mrs", "Miss", "Dr", "CA", "Advocate"]}
            />
          </Grid>

          {/* Name of Mother */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Name of Mother"
              name="nameOfMother"
              value={personalInfo.nameOfMother || ""}
              onChange={(e) => handleFieldChange("nameOfMother", e.target.value)}
              onBlur={(e) => handleFieldBlur("nameOfMother", e.target.value)}
              error={!!errors.nameOfMother}
              helperText={errors.nameOfMother}
              sx={textFieldStyles}
            />
          </Grid>

          {/* Date of Birth */}
          <Grid size={{ xs: 12, md: 3 }}>
            <StyledTextField
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              InputLabelProps={{ shrink: true }}
              value={personalInfo.dateOfBirth || ""}
              onChange={(e) => handleDateOfBirthChange(e.target.value)}
              error={!!errors.dateOfBirth || !!dobError}
              helperText={errors.dateOfBirth || dobError}
              sx={textFieldStyles}
            />
          </Grid>

          {/* Age in Years (auto-calculated) */}
          <Grid size={{ xs: 12, md: 3 }}>
            <StyledTextField
              label="Age in Years"
              name="ageInYears"
              value={personalInfo.ageInYears || ""}
              InputProps={{ readOnly: true }}
              error={!!errors.ageInYears}
              helperText={errors.ageInYears}
              sx={{
                ...textFieldStyles,
                '& .MuiOutlinedInput-root': {
                  ...textFieldStyles['& .MuiOutlinedInput-root'],
                }
              }}
            />
          </Grid>

          {/* Minor */}
          <Grid size={{ xs: 12, md: 3 }}>
            <ComboBox
              label="Minor"
              fieldName="minor"
              value={personalInfo.minor === true ? "Yes" : personalInfo.minor === false ? "No" : personalInfo.minor || ""}
              options={["Yes", "No"]}
            />
          </Grid>

          {/* Guardian fields for minors */}
          {personalInfo.minor === true && (
            <>
              <Grid size={{ xs: 12, md: 4 }}>
                <StyledTextField
                  label="Guardian Name"
                  name="guardianName"
                  value={personalInfo.guardianName || ""}
                  onChange={(e) => handleFieldChange("guardianName", e.target.value)}
                  onBlur={(e) => handleFieldBlur("guardianName", e.target.value)}
                  error={!!errors.guardianName}
                  helperText={errors.guardianName}
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <ComboBox
                  label="Relation with Guardian"
                  fieldName="guardianRelation"
                  value={personalInfo.guardianRelation}
                  options={["Father", "Mother", "Grandfather", "Grandmother", "Uncle", "Aunt"]}
                />
              </Grid>
            </>
          )}

          {/* Civil Score */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <StyledTextField
                label="Civil Score"
                name="cibilScore"
                type="number"
                value={creditInfo.cibilScore || ""}
                onChange={(e) => handleCivilScoreChange(e.target.value)}
                onBlur={(e) => handleFieldBlur("cibilScore", e.target.value)}
                error={!!errors.cibilScore}
                helperText={errors.cibilScore}
                sx={textFieldStyles}
                InputProps={{
                  endAdornment: (
                    <Box
                      component="span"
                      sx={{
                        color: civilScoreText === "Excellent" ? 'success.main' :
                          civilScoreText === "Good" ? 'warning.main' :
                            civilScoreText === "Average" ? 'info.main' :
                              civilScoreText === "Poor" ? 'error.main' : 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        minWidth: 80,
                        textAlign: 'right'
                      }}
                    >
                      {civilScoreText}
                    </Box>
                  ),
                }}
              />
            </Box>
          </Grid>

          {/* Gender */}
          <Grid size={{ xs: 12, md: 3 }}>
            <ComboBox
              label="Gender"
              fieldName="gender"
              value={personalInfo.gender}
              options={["Male", "Female", "Other"]}
            />
          </Grid>

          {/* Religion */}
          <Grid size={{ xs: 12, md: 3 }}>
            <ComboBox
              label="Religion"
              fieldName="religion"
              value={personalInfo.religion}
              options={["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain"]}
            />
          </Grid>

          {/* Marital Status */}
          <Grid size={{ xs: 12, md: 3 }}>
            <ComboBox
              label="Marital Status"
              fieldName="maritalStatus"
              value={personalInfo.maritalStatus}
              options={["Single", "Married", "Divorced", "Widowed"]}
            />
          </Grid>

          {/* Spouse fields for married */}
          {personalInfo.maritalStatus === "Married" && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <ComboBox
                    label="Spouse Title"
                    fieldName="spouseTitle"
                    value={personalInfo.spouseTitle}
                    options={["Mr", "Mrs", "Dr", "CA", "Advocate"]}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 9 }}>
                  <StyledTextField
                    label="Name of Spouse"
                    name="nameOfSpouse"
                    value={personalInfo.nameOfSpouse || ""}
                    onChange={(e) => handleFieldChange("nameOfSpouse", e.target.value)}
                    onBlur={(e) => handleFieldBlur("nameOfSpouse", e.target.value)}
                    error={!!errors.nameOfSpouse}
                    helperText={errors.nameOfSpouse}
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* Caste */}
          <Grid size={{ xs: 12, md: 3 }}>
            <ComboBox
              label="Caste"
              fieldName="caste"
              value={personalInfo.caste}
              options={["General", "OBC", "SC", "ST"]}
            />
          </Grid>

          {/* Divider */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
                my: 2,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -2,
                  left: 0,
                  width: '100px',
                  height: 2,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
                }
              }}
            />
          </Grid>

          {/* Contact Information */}
          {/* Primary Number - Indian Mobile */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Primary Number"
              name="phoneNo1"
              value={personalInfo.phoneNo1 || ""}
              onChange={(e) => handleMobileChange("phoneNo1", e.target.value)}
              onBlur={(e) => handleFieldBlur("phoneNo1", e.target.value)}
              error={!!errors.phoneNo1}
              helperText={errors.phoneNo1}
              placeholder="Enter 10-digit Indian mobile number"
              inputProps={{
                maxLength: 10,
                inputMode: 'numeric'
              }}
              sx={textFieldStyles}
            />
          </Grid>

          {/* Secondary Number - Indian Mobile */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Secondary Number"
              name="phoneNo2"
              value={personalInfo.phoneNo2 || ""}
              onChange={(e) => handleMobileChange("phoneNo2", e.target.value)}
              onBlur={(e) => handleFieldBlur("phoneNo2", e.target.value)}
              error={!!errors.phoneNo2}
              helperText={errors.phoneNo2}
              placeholder="Enter 10-digit Indian mobile number"
              inputProps={{
                maxLength: 10,
                inputMode: 'numeric'
              }}
              sx={textFieldStyles}
            />
          </Grid>

          {/* WhatsApp Number - Indian Mobile */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="WhatsApp Number"
              name="whatsapp"
              value={personalInfo.whatsapp || ""}
              onChange={(e) => handleMobileChange("whatsapp", e.target.value)}
              onBlur={(e) => handleFieldBlur("whatsapp", e.target.value)}
              error={!!errors.whatsapp}
              helperText={errors.whatsapp}
              placeholder="Enter 10-digit Indian mobile number"
              inputProps={{
                maxLength: 10,
                inputMode: 'numeric'
              }}
              sx={textFieldStyles}
            />
          </Grid>

          {/* Landline No. - 6-12 digits */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Landline No."
              name="landlineNo"
              value={personalInfo.landlineNo || ""}
              onChange={(e) => handleLandlineChange("landlineNo", e.target.value)}
              onBlur={(e) => handleFieldBlur("landlineNo", e.target.value)}
              error={!!errors.landlineNo}
              helperText={errors.landlineNo}
              placeholder="e.g., 022-1234567"
              sx={textFieldStyles}
            />
          </Grid>

          {/* Office Landline No. - 6-12 digits */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Office Landline No."
              name="landlineOffice"
              value={personalInfo.landlineOffice || ""}
              onChange={(e) => handleLandlineChange("landlineOffice", e.target.value)}
              onBlur={(e) => handleFieldBlur("landlineOffice", e.target.value)}
              error={!!errors.landlineOffice}
              helperText={errors.landlineOffice}
              placeholder="e.g., 022-1234567"
              sx={textFieldStyles}
            />
          </Grid>

          {/* Primary Email - must contain @ */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Primary Email"
              name="emailId1"
              type="email"
              value={personalInfo.emailId1 || ""}
              onChange={(e) => handleFieldChange("emailId1", e.target.value)}
              onBlur={(e) => handleFieldBlur("emailId1", e.target.value)}
              error={!!errors.emailId1}
              helperText={errors.emailId1}
              placeholder="name@example.com"
              sx={textFieldStyles}
            />
          </Grid>

          {/* Secondary Email - must contain @ */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Secondary Email"
              name="emailId2"
              type="email"
              value={personalInfo.emailId2 || ""}
              onChange={(e) => handleFieldChange("emailId2", e.target.value)}
              onBlur={(e) => handleFieldBlur("emailId2", e.target.value)}
              error={!!errors.emailId2}
              helperText={errors.emailId2}
              placeholder="name@example.com"
              sx={textFieldStyles}
            />
          </Grid>

          {/* Optional Email - must contain @ */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Optional Email"
              name="emailId3"
              type="email"
              value={personalInfo.emailId3 || ""}
              onChange={(e) => handleFieldChange("emailId3", e.target.value)}
              onBlur={(e) => handleFieldBlur("emailId3", e.target.value)}
              error={!!errors.emailId3}
              helperText={errors.emailId3}
              placeholder="name@example.com"
              sx={textFieldStyles}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;