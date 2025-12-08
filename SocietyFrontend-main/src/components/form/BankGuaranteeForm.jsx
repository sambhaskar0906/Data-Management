import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import {
  AccountBalance as BankIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const BankGuaranteeForm = ({ formData, handleChange }) => {
  const theme = useTheme();
  const [errors, setErrors] = useState({});

  // Ensure bankDetails is always an array with safe fallback
  const bankDetails = Array.isArray(formData.bankDetails) ? formData.bankDetails : [];

  // Validation patterns
  const validationPatterns = {
    bankName: /^[A-Za-z\s&.-]{3,100}$/, // Bank names with spaces, &, ., -
    branch: /^[A-Za-z0-9\s&.,-]{3,100}$/, // Branch names with alphanumeric and punctuation
    accountNumber: /^[0-9]{9,18}$/, // Account numbers typically 9-18 digits
    ifscCode: /^[A-Z]{4}0[A-Z0-9]{6}$/, // Standard IFSC code format
  };

  // Error handling with index support
  const validateField = (index, fieldName, value) => {
    if (!value || value.trim() === "") {
      clearError(index, fieldName);
      return true;
    }

    let isValid = true;
    let errorMessage = "";

    switch (fieldName) {
      case "bankName":
        isValid = validationPatterns.bankName.test(value.trim());
        errorMessage = "Enter a valid bank name (3-100 characters, letters, spaces, &, ., -)";
        break;

      case "branch":
        isValid = validationPatterns.branch.test(value.trim());
        errorMessage = "Enter a valid branch name (3-100 characters)";
        break;

      case "accountNumber":
        isValid = validationPatterns.accountNumber.test(value);
        errorMessage = "Enter a valid account number (9-18 digits)";
        break;

      case "ifscCode":
        const cleanIFSC = value.replace(/\s/g, '').toUpperCase();
        isValid = validationPatterns.ifscCode.test(cleanIFSC);
        errorMessage = "Enter a valid IFSC code (e.g., SBIN0001234)";
        break;

      default:
        break;
    }

    if (!isValid) {
      setError(index, fieldName, errorMessage);
    } else {
      clearError(index, fieldName);
    }

    return isValid;
  };

  const setError = (index, fieldName, errorMessage) => {
    const key = `${fieldName}_${index}`;
    setErrors(prev => ({ ...prev, [key]: errorMessage }));
  };

  const clearError = (index, fieldName) => {
    const key = `${fieldName}_${index}`;
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  const getError = (index, fieldName) => {
    const key = `${fieldName}_${index}`;
    return errors[key] || null;
  };

  // Validate all bank details
  const validateAllBankDetails = () => {
    const newErrors = {};

    bankDetails.forEach((bank, index) => {
      if (bank.bankName) {
        const isValid = validateField(index, "bankName", bank.bankName);
        if (!isValid) newErrors[`bankName_${index}`] = getError(index, "bankName");
      }

      if (bank.branch) {
        const isValid = validateField(index, "branch", bank.branch);
        if (!isValid) newErrors[`branch_${index}`] = getError(index, "branch");
      }

      if (bank.accountNumber) {
        const isValid = validateField(index, "accountNumber", bank.accountNumber);
        if (!isValid) newErrors[`accountNumber_${index}`] = getError(index, "accountNumber");
      }

      if (bank.ifscCode) {
        const isValid = validateField(index, "ifscCode", bank.ifscCode);
        if (!isValid) newErrors[`ifscCode_${index}`] = getError(index, "ifscCode");
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Format input values
  const formatInputValue = (fieldName, value) => {
    switch (fieldName) {
      case "ifscCode":
        // Remove spaces and convert to uppercase
        return value.replace(/\s/g, '').toUpperCase();

      case "accountNumber":
        // Remove non-digits
        return value.replace(/\D/g, '');

      case "bankName":
      case "branch":
        // Capitalize first letter of each word
        return value
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

      default:
        return value;
    }
  };

  // Handle changes for bank detail fields
  const handleBankDetailChange = (index, field, value) => {
    const formattedValue = formatInputValue(field, value);

    const updatedBankDetails = [...bankDetails];
    updatedBankDetails[index] = {
      ...updatedBankDetails[index],
      [field]: formattedValue
    };
    handleChange('bankDetails', null, updatedBankDetails);

    // Clear error when field is being edited
    clearError(index, field);

    // Validate field if it has value
    if (formattedValue.trim()) {
      validateField(index, field, formattedValue);
    }
  };

  // Add new bank detail
  const addBankDetail = () => {
    const updatedBankDetails = [
      ...bankDetails,
      { bankName: "", branch: "", accountNumber: "", ifscCode: "" }
    ];
    handleChange('bankDetails', null, updatedBankDetails);
  };

  // Remove bank detail
  const removeBankDetail = (index) => {
    // Clear errors for this bank detail
    ["bankName", "branch", "accountNumber", "ifscCode"].forEach(field => {
      clearError(index, field);
    });

    const updatedBankDetails = bankDetails.filter((_, i) => i !== index);
    handleChange('bankDetails', null, updatedBankDetails);
  };

  // Prevent form submission on button click
  const handleButtonClick = (e) => {
    e.preventDefault();
    addBankDetail();
  };

  // Common text field styles
  const textFieldStyles = (index, fieldName) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
      transition: 'all 0.2s ease-in-out',
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

  return (
    <Box>
      {/* BANK DETAILS */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          mb: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
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
                <BankIcon
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: 28
                  }}
                />
              </Box>
            }
            title="Bank Account Details"
            subtitle="Add one or more bank accounts"
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

          {bankDetails.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.03),
              }}
            >
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                No bank accounts added yet. Add your first bank account.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleButtonClick}
                type="button"
                sx={{ borderRadius: 2 }}
              >
                Add Bank Account
              </Button>
            </Box>
          ) : (
            <>
              {bankDetails.map((bank, index) => (
                <Box
                  key={index}
                  sx={{
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: 3,
                    p: 4,
                    mb: 4,
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 4,
                      height: '100%',
                      background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <BankIcon fontSize="small" />
                      Bank Account {index + 1}
                    </Typography>

                    {bankDetails.length > 1 && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={(e) => {
                          e.preventDefault();
                          removeBankDetail(index);
                        }}
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <StyledTextField
                        label="Account Holder Name"
                        value={bank?.accountHolderName || ""}
                        onChange={(e) => handleBankDetailChange(index, 'accountHolderName', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <StyledTextField
                        label="Bank Name *"
                        value={bank?.bankName || ""}
                        onChange={(e) => handleBankDetailChange(index, 'bankName', e.target.value)}
                        onBlur={(e) => validateField(index, "bankName", e.target.value)}
                        error={!!getError(index, "bankName")}
                        helperText={getError(index, "bankName") || "Enter full bank name (e.g., State Bank of India)"}
                        sx={textFieldStyles(index, "bankName")}
                        placeholder="e.g., State Bank of India"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <StyledTextField
                        label="Branch *"
                        value={bank?.branch || ""}
                        onChange={(e) => handleBankDetailChange(index, 'branch', e.target.value)}
                        onBlur={(e) => validateField(index, "branch", e.target.value)}
                        error={!!getError(index, "branch")}
                        helperText={getError(index, "branch") || "Enter branch location"}
                        sx={textFieldStyles(index, "branch")}
                        placeholder="e.g., Main Branch, Mumbai"
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <StyledTextField
                        label="Account Number *"
                        value={bank?.accountNumber || ""}
                        onChange={(e) => handleBankDetailChange(index, 'accountNumber', e.target.value)}
                        onBlur={(e) => validateField(index, "accountNumber", e.target.value)}
                        error={!!getError(index, "accountNumber")}
                        helperText={getError(index, "accountNumber") || "9-18 digits only"}
                        sx={textFieldStyles(index, "accountNumber")}
                        placeholder="Enter account number"
                        inputProps={{
                          maxLength: 18,
                          pattern: "[0-9]*"
                        }}
                        fullWidth
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <StyledTextField
                        label="IFSC Code *"
                        value={bank?.ifscCode || ""}
                        onChange={(e) => handleBankDetailChange(index, 'ifscCode', e.target.value)}
                        onBlur={(e) => validateField(index, "ifscCode", e.target.value)}
                        error={!!getError(index, "ifscCode")}
                        helperText={getError(index, "ifscCode") || "Format: ABCD0123456"}
                        sx={textFieldStyles(index, "ifscCode")}
                        placeholder="e.g., SBIN0001234"
                        inputProps={{
                          maxLength: 11,
                          style: { textTransform: 'uppercase' }
                        }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleButtonClick}
                  type="button"
                  sx={{
                    borderRadius: 2,
                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
                    '&:hover': {
                      border: `2px dashed ${theme.palette.primary.main}`,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    }
                  }}
                >
                  Add Another Bank Account
                </Button>
              </Box>
            </>
          )}

        </CardContent>
      </Card>
    </Box>
  );
};

export default BankGuaranteeForm;