import React from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Typography,
} from "@mui/material";
import {
  AccountBalance as BankIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Score as ScoreIcon,
} from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const BankGuaranteeForm = ({ formData, handleChange }) => {
  // Ensure bankDetails is always an array with safe fallback
  const bankDetails = Array.isArray(formData.bankDetails) ? formData.bankDetails : [];

  // Handle changes for bank detail fields
  const handleBankDetailChange = (index, field, value) => {
    const updatedBankDetails = [...bankDetails];
    updatedBankDetails[index] = {
      ...updatedBankDetails[index],
      [field]: value
    };
    handleChange('bankDetails', null, updatedBankDetails);
  };

  // Add new bank detail
  const addBankDetail = () => {
    const updatedBankDetails = [
      ...bankDetails,
      {
        bankName: "",
        branch: "",
        accountNumber: "",
        ifscCode: "",
        civilScore: ""
      }
    ];
    handleChange('bankDetails', null, updatedBankDetails);
  };

  // Remove bank detail
  const removeBankDetail = (index) => {
    const updatedBankDetails = bankDetails.filter((_, i) => i !== index);
    handleChange('bankDetails', null, updatedBankDetails);
  };

  // Prevent form submission on button click
  const handleButtonClick = (e) => {
    e.preventDefault();
    addBankDetail();
  };

  return (
    <Box>
      {/* BANK DETAILS */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <SectionHeader
            icon={<BankIcon />}
            title="Bank Account Details"
            subtitle="Add one or more bank accounts with civil score"
          />

          {bankDetails.map((bank, index) => (
            <Box
              key={index}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 3,
                mb: 3,
                backgroundColor: "#fafafa",
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  Bank Account {index + 1}
                </Typography>

                {/* Civil Score Badge */}
                {bank?.civilScore && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#e3f2fd',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      border: '1px solid #90caf9'
                    }}
                  >
                    <ScoreIcon sx={{ fontSize: 18, mr: 1, color: '#1976d2' }} />
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      Civil Score: {bank.civilScore}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Bank Name"
                    value={bank?.bankName || ""}
                    onChange={(e) => handleBankDetailChange(index, 'bankName', e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Branch"
                    value={bank?.branch || ""}
                    onChange={(e) => handleBankDetailChange(index, 'branch', e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Account Number"
                    value={bank?.accountNumber || ""}
                    onChange={(e) => handleBankDetailChange(index, 'accountNumber', e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="IFSC Code"
                    value={bank?.ifscCode || ""}
                    onChange={(e) => handleBankDetailChange(index, 'ifscCode', e.target.value)}
                    fullWidth
                  />
                </Grid>

                {/* Civil Score Field */}
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Civil Score (300-900)"
                    value={bank?.civilScore || ""}
                    onChange={(e) => handleBankDetailChange(index, 'civilScore', e.target.value)}
                    type="number"
                    inputProps={{
                      min: 300,
                      max: 900,
                      step: 1
                    }}
                    helperText="Score between 300-900"
                    fullWidth
                  />
                </Grid>

                {/* Civil Score Status Indicator */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    mt: 2
                  }}>
                    {bank?.civilScore && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          color: bank.civilScore >= 750 ? '#2e7d32' :
                            bank.civilScore >= 600 ? '#ed6c02' :
                              '#d32f2f'
                        }}
                      >
                        {bank.civilScore >= 750 ? 'Excellent Credit Score' :
                          bank.civilScore >= 600 ? 'Good Credit Score' :
                            'Poor Credit Score'}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {bankDetails.length > 1 && (
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.preventDefault();
                        removeBankDetail(index);
                      }}
                    >
                      Remove This Bank
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleButtonClick}
            type="button" // Important: prevent form submission
            sx={{ mt: 2 }}
          >
            Add Another Bank
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BankGuaranteeForm;