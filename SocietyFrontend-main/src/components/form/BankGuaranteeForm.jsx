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
      { bankName: "", branch: "", accountNumber: "", ifscCode: "" }
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
            subtitle="Add one or more bank accounts"
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
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, fontWeight: "bold" }}
              >
                Bank Account {index + 1}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Bank Name"
                    value={bank?.bankName || ""}
                    onChange={(e) => handleBankDetailChange(index, 'bankName', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Branch"
                    value={bank?.branch || ""}
                    onChange={(e) => handleBankDetailChange(index, 'branch', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Account Number"
                    value={bank?.accountNumber || ""}
                    onChange={(e) => handleBankDetailChange(index, 'accountNumber', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="IFSC Code"
                    value={bank?.ifscCode || ""}
                    onChange={(e) => handleBankDetailChange(index, 'ifscCode', e.target.value)}
                  />
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
          >
            Add Another Bank
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BankGuaranteeForm;