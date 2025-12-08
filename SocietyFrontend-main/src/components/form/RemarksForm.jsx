import React, { useState } from "react";
import {
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  MenuItem,
  useTheme,
  alpha,
  Typography
} from "@mui/material";
import {
  FamilyRestroom as FamilyIcon,
  Person as NomineeIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const RemarksForm = ({ formData, handleChange }) => {
  const theme = useTheme();
  const [errors, setErrors] = useState({});

  /* ================= FAMILY MEMBERS ================= */
  const familyMembers = Array.isArray(
    formData.professionalDetails?.familyMembers
  )
    ? formData.professionalDetails.familyMembers
    : [];

  const hasFamilyMember =
    formData.professionalDetails?.hasFamilyMember || "no";

  /* ================= NOMINEE ================= */
  const nominee = formData.nomineeDetails || {
    nomineeName: "",
    relationWithApplicant: "",
    nomineeMobileNo: "",
    introduceBy: "",
    memberShipNo: "",
  };

  /* ================= VALIDATION PATTERNS ================= */
  const validationPatterns = {
    phone: /^[6-9]\d{9}$/, // Indian mobile numbers starting with 6-9, 10 digits
    name: /^[A-Za-z\s.'-]{2,50}$/, // Names with letters, spaces, and common punctuation
    membershipNo: /^[A-Za-z0-9]{1,20}$/, // Alphanumeric membership numbers
  };

  /* ================= VALIDATION FUNCTIONS ================= */
  const validateField = (fieldName, value, index = null) => {
    if (!value || value.trim() === "") {
      clearError(fieldName, index);
      return true;
    }

    let isValid = true;
    let errorMessage = "";

    switch (fieldName) {
      case "nomineeMobileNo":
        isValid = validationPatterns.phone.test(value);
        errorMessage = "Enter a valid 10-digit mobile number starting with 6-9";
        break;

      case "nomineeName":
      case "introduceBy":
      case "name":
        isValid = validationPatterns.name.test(value);
        errorMessage = "Enter a valid name (2-50 characters, letters only)";
        break;

      case "memberShipNo":
      case "membershipNo":
        isValid = validationPatterns.membershipNo.test(value);
        errorMessage = "Enter a valid membership number (alphanumeric, max 20 characters)";
        break;

      case "relationWithApplicant":
        const validRelations = ["FATHER", "MOTHER", "SPOUSE", "SON", "DAUGHTER", "BROTHER", "SISTER", "OTHER"];
        isValid = validRelations.includes(value);
        errorMessage = "Please select a valid relation";
        break;

      default:
        break;
    }

    if (!isValid) {
      setError(fieldName, errorMessage, index);
    } else {
      clearError(fieldName, index);
    }

    return isValid;
  };

  const setError = (fieldName, errorMessage, index = null) => {
    const key = index !== null ? `${fieldName}_${index}` : fieldName;
    setErrors(prev => ({ ...prev, [key]: errorMessage }));
  };

  const clearError = (fieldName, index = null) => {
    const key = index !== null ? `${fieldName}_${index}` : fieldName;
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  const getError = (fieldName, index = null) => {
    const key = index !== null ? `${fieldName}_${index}` : fieldName;
    return errors[key] || null;
  };

  /* ================= VALIDATE ALL FIELDS ================= */
  const validateAllFields = () => {
    const newErrors = {};

    // Validate nominee fields
    if (nominee.nomineeMobileNo) {
      const isValid = validateField("nomineeMobileNo", nominee.nomineeMobileNo);
      if (!isValid) newErrors.nomineeMobileNo = getError("nomineeMobileNo");
    }

    if (nominee.nomineeName) {
      const isValid = validateField("nomineeName", nominee.nomineeName);
      if (!isValid) newErrors.nomineeName = getError("nomineeName");
    }

    if (nominee.introduceBy) {
      const isValid = validateField("introduceBy", nominee.introduceBy);
      if (!isValid) newErrors.introduceBy = getError("introduceBy");
    }

    if (nominee.memberShipNo) {
      const isValid = validateField("memberShipNo", nominee.memberShipNo);
      if (!isValid) newErrors.memberShipNo = getError("memberShipNo");
    }

    // Validate family members
    familyMembers.forEach((member, index) => {
      if (member.membershipNo) {
        const isValid = validateField("membershipNo", member.membershipNo, index);
        if (!isValid) newErrors[`membershipNo_${index}`] = getError("membershipNo", index);
      }

      if (member.name) {
        const isValid = validateField("name", member.name, index);
        if (!isValid) newErrors[`name_${index}`] = getError("name", index);
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  /* ================= PHONE NUMBER FORMATTING ================= */
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    return phoneNumber.substring(0, 10);
  };

  /* ================= FAMILY MEMBERS HANDLERS ================= */
  const handleFamilyMemberCheck = (value) => {
    handleChange("professionalDetails", "hasFamilyMember", value);
    if (value === "no") {
      handleChange("professionalDetails", "familyMembers", []);
      // Clear family member errors
      Object.keys(errors).forEach(key => {
        if (key.includes("_")) {
          const [fieldName, index] = key.split("_");
          if (["membershipNo", "name", "relationWithApplicant"].includes(fieldName)) {
            clearError(fieldName, index);
          }
        }
      });
    }
  };

  const handleFamilyMemberChange = (index, field, value) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("professionalDetails", "familyMembers", updated);

    // Clear error when field is being edited
    clearError(field, index);

    // Validate field if it has value
    if (value) {
      validateField(field, value, index);
    }
  };

  const addFamilyMember = () => {
    handleChange("professionalDetails", "familyMembers", [
      ...familyMembers,
      { membershipNo: "", name: "", relationWithApplicant: "" },
    ]);
  };

  const deleteFamilyMember = (index) => {
    // Clear errors for this family member
    ["membershipNo", "name", "relationWithApplicant"].forEach(field => {
      clearError(field, index);
    });

    handleChange(
      "professionalDetails",
      "familyMembers",
      familyMembers.filter((_, i) => i !== index)
    );
  };

  /* ================= NOMINEE HANDLERS ================= */
  const handleNomineeChange = (field, value) => {
    // Format phone number
    const formattedValue = field === "nomineeMobileNo" ? formatPhoneNumber(value) : value;

    handleChange("nomineeDetails", null, {
      ...nominee,
      [field]: formattedValue,
    });

    // Clear error when field is being edited
    clearError(field);

    // Validate field if it has value
    if (formattedValue) {
      validateField(field, formattedValue);
    }
  };

  /* ================= COMMON STYLES ================= */
  const textFieldStyles = (fieldName = null, index = null) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
      height: "56px",
      "&:hover": {
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
      },
      "&.Mui-focused": {
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
      },
      "&.Mui-error": {
        borderColor: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, 0.05),
        "&:hover": {
          backgroundColor: alpha(theme.palette.error.main, 0.08),
        }
      }
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.9rem",
      fontWeight: 500,
      "&.Mui-error": {
        color: theme.palette.error.main,
      }
    },
    "& .MuiFormHelperText-root": {
      fontSize: "0.75rem",
      marginLeft: 0,
      "&.Mui-error": {
        color: theme.palette.error.main,
        fontWeight: 500,
      }
    }
  });

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
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
      }}
    >
      <CardContent sx={{ p: 5 }}>
        {/* ================= FAMILY INFORMATION ================= */}
        <Box sx={{ mb: 5 }}>
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
                <FamilyIcon
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: 28
                  }}
                />
              </Box>
            }
            title="Family Information"
            subtitle="Details of family members who are society members"
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

          <Typography fontWeight={600} sx={{ mb: 2 }}>
            Any family member a member of the society?
          </Typography>

          <RadioGroup
            row
            value={hasFamilyMember}
            onChange={(e) =>
              handleFamilyMemberCheck(e.target.value)
            }
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>

          {hasFamilyMember === "yes" && (
            <Box sx={{ mt: 3 }}>
              {familyMembers.map((member, index) => (
                <Box
                  key={index}
                  sx={{
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: 3,
                    p: 3,
                    mb: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <StyledTextField
                        label="Membership No"
                        value={member.membershipNo || ""}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "membershipNo",
                            e.target.value
                          )
                        }
                        onBlur={(e) => validateField("membershipNo", e.target.value, index)}
                        error={!!getError("membershipNo", index)}
                        helperText={getError("membershipNo", index)}
                        sx={textFieldStyles("membershipNo", index)}
                        placeholder="Enter membership number"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <StyledTextField
                        label="Name of Member"
                        value={member.name || ""}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        onBlur={(e) => validateField("name", e.target.value, index)}
                        error={!!getError("name", index)}
                        helperText={getError("name", index)}
                        sx={textFieldStyles("name", index)}
                        placeholder="Enter full name"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <StyledTextField
                        select
                        label="Relation with Applicant"
                        value={member.relationWithApplicant || ""}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "relationWithApplicant",
                            e.target.value
                          )
                        }
                        onBlur={(e) => validateField("relationWithApplicant", e.target.value, index)}
                        error={!!getError("relationWithApplicant", index)}
                        helperText={getError("relationWithApplicant", index)}
                        sx={textFieldStyles("relationWithApplicant", index)}
                      >
                        <MenuItem value="">Select Relation</MenuItem>
                        <MenuItem value="FATHER">Father</MenuItem>
                        <MenuItem value="MOTHER">Mother</MenuItem>
                        <MenuItem value="SPOUSE">Spouse</MenuItem>
                        <MenuItem value="SON">Son</MenuItem>
                        <MenuItem value="DAUGHTER">Daughter</MenuItem>
                        <MenuItem value="BROTHER">Brother</MenuItem>
                        <MenuItem value="SISTER">Sister</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </StyledTextField>
                    </Grid>
                  </Grid>

                  {familyMembers.length > 1 && (
                    <Box sx={{ textAlign: "right", mt: 2 }}>
                      <Button
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteFamilyMember(index)}
                        size="small"
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </Box>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={addFamilyMember}
                variant="contained"
                sx={{ mt: 2 }}
              >
                Add Family Member
              </Button>
            </Box>
          )}
        </Box>

        {/* ================= NOMINEE DETAILS ================= */}
        <SectionHeader
          icon={
            <Box
              sx={{
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                borderRadius: 3,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
              }}
            >
              <NomineeIcon
                sx={{
                  color: theme.palette.secondary.main,
                  fontSize: 28
                }}
              />
            </Box>
          }
          title="Nominee Details"
          subtitle="Information about the nominee"
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

        <Box
          sx={{
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            borderRadius: 3,
            p: 4,
            mb: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          }}
        >
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <StyledTextField
                label="Nominee Name"
                value={nominee.nomineeName}
                onChange={(e) =>
                  handleNomineeChange("nomineeName", e.target.value)
                }
                onBlur={(e) => validateField("nomineeName", e.target.value)}
                error={!!getError("nomineeName")}
                helperText={getError("nomineeName")}
                sx={textFieldStyles("nomineeName")}
                placeholder="Enter nominee's full name"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <StyledTextField
                select
                label="Relation with Applicant"
                value={nominee.relationWithApplicant}
                onChange={(e) =>
                  handleNomineeChange(
                    "relationWithApplicant",
                    e.target.value
                  )
                }
                onBlur={(e) => validateField("relationWithApplicant", e.target.value)}
                error={!!getError("relationWithApplicant")}
                helperText={getError("relationWithApplicant")}
                sx={textFieldStyles("relationWithApplicant")}
              >
                <MenuItem value="">Select Relation</MenuItem>
                <MenuItem value="FATHER">Father</MenuItem>
                <MenuItem value="MOTHER">Mother</MenuItem>
                <MenuItem value="SPOUSE">Spouse</MenuItem>
                <MenuItem value="SON">Son</MenuItem>
                <MenuItem value="DAUGHTER">Daughter</MenuItem>
                <MenuItem value="BROTHER">Brother</MenuItem>
                <MenuItem value="SISTER">Sister</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </StyledTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <StyledTextField
                label="Mobile Number *"
                value={nominee.nomineeMobileNo}
                onChange={(e) =>
                  handleNomineeChange("nomineeMobileNo", e.target.value)
                }
                onBlur={(e) => validateField("nomineeMobileNo", e.target.value)}
                error={!!getError("nomineeMobileNo")}
                helperText={getError("nomineeMobileNo") || "10-digit number starting with 6-9"}
                sx={textFieldStyles("nomineeMobileNo")}
                placeholder="Enter 10-digit mobile number"
                inputProps={{
                  maxLength: 10,
                  pattern: "[6-9][0-9]{9}"
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* ================= WITNESS DETAILS ================= */}
        <Box>
          <SectionHeader
            icon={
              <Box
                sx={{
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  borderRadius: 3,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}
              >
                <NomineeIcon
                  sx={{
                    color: theme.palette.info.main,
                    fontSize: 28
                  }}
                />
              </Box>
            }
            title="Introduce / Witness"
            subtitle="Information about witness and introducer"
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

          <Box
            sx={{
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 3,
              p: 4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            }}
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <StyledTextField
                  label="Introduced By"
                  value={nominee.introduceBy || ""}
                  onChange={(e) =>
                    handleNomineeChange("introduceBy", e.target.value)
                  }
                  onBlur={(e) => validateField("introduceBy", e.target.value)}
                  error={!!getError("introduceBy")}
                  helperText={getError("introduceBy")}
                  sx={textFieldStyles("introduceBy")}
                  placeholder="Enter introducer's name"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <StyledTextField
                  label="Membership No"
                  value={nominee.memberShipNo || ""}
                  onChange={(e) =>
                    handleNomineeChange("memberShipNo", e.target.value)
                  }
                  onBlur={(e) => validateField("memberShipNo", e.target.value)}
                  error={!!getError("memberShipNo")}
                  helperText={getError("memberShipNo")}
                  sx={textFieldStyles("memberShipNo")}
                  placeholder="Enter membership number"
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RemarksForm;