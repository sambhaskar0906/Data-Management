import React from "react";
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

  const handleProfessionalFieldChange = (field, value) => {
    handleChange("professionalDetails", field, value);
  };

  // Common text field styles
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
    }
  };

  return (
    <Box>
      {/* ===================== PROFESSIONAL BACKGROUND ===================== */}
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
                  Qualification
                </Typography>
                <StyledTextField
                  select
                  fullWidth
                  label="Select Qualification"
                  value={professionalDetails.qualification || ""}
                  onChange={(e) =>
                    handleProfessionalFieldChange("qualification", e.target.value)
                  }
                  sx={textFieldStyles}
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
                  label="Please specify your qualification"
                  value={professionalDetails.qualificationRemark || ""}
                  onChange={(e) =>
                    handleProfessionalFieldChange("qualificationRemark", e.target.value)
                  }
                  sx={textFieldStyles}
                />
              )}
            </Grid>
          </Grid>

          {/* ================= OCCUPATION TYPE SELECTION ================= */}
          <Box sx={{ mt: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 600 }}>
              Occupation Type
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
                    label="Full Name of Company/Department"
                    value={professionalDetails.serviceDetails?.fullNameOfCompany || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("serviceDetails", {
                        ...professionalDetails.serviceDetails,
                        fullNameOfCompany: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Address of Company"
                    value={professionalDetails.serviceDetails?.addressOfCompany || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("serviceDetails", {
                        ...professionalDetails.serviceDetails,
                        addressOfCompany: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Monthly Income"
                    type="number"
                    value={professionalDetails.serviceDetails?.monthlyIncome || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("serviceDetails", {
                        ...professionalDetails.serviceDetails,
                        monthlyIncome: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Designation"
                    value={professionalDetails.serviceDetails?.designation || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("serviceDetails", {
                        ...professionalDetails.serviceDetails,
                        designation: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <StyledTextField
                    label="Employee Code"
                    value={professionalDetails.serviceDetails?.employeeCode || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("serviceDetails", {
                        ...professionalDetails.serviceDetails,
                        employeeCode: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <StyledTextField
                    label="Date of Joining"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={professionalDetails.serviceDetails?.dateOfJoining || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("serviceDetails", {
                        ...professionalDetails.serviceDetails,
                        dateOfJoining: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <StyledTextField
                    label="Date of Retirement"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={professionalDetails.serviceDetails?.dateOfRetirement || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("serviceDetails", {
                        ...professionalDetails.serviceDetails,
                        dateOfRetirement: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Office Number"
                    value={professionalDetails.serviceDetails?.officeNo || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("serviceDetails", {
                        ...professionalDetails.serviceDetails,
                        officeNo: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
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
                      '&:hover': {
                        border: `1px solid ${theme.palette.primary.main}`,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    {professionalDetails.serviceDetails?.idCard
                      ? `ID Card Uploaded`
                      : "Attach ID Card"}
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        handleProfessionalFieldChange("serviceDetails", {
                          ...professionalDetails.serviceDetails,
                          idCard: e.target.files[0],
                        })
                      }
                    />
                  </Button>
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
                    label="Full Name of Company"
                    value={professionalDetails.privateServiceDetails?.fullNameOfCompany || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("privateServiceDetails", {
                        ...professionalDetails.privateServiceDetails,
                        fullNameOfCompany: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Address of Company"
                    value={professionalDetails.privateServiceDetails?.addressOfCompany || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("privateServiceDetails", {
                        ...professionalDetails.privateServiceDetails,
                        addressOfCompany: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Monthly Income"
                    type="number"
                    value={professionalDetails.privateServiceDetails?.monthlyIncome || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("privateServiceDetails", {
                        ...professionalDetails.privateServiceDetails,
                        monthlyIncome: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Designation"
                    value={professionalDetails.privateServiceDetails?.designation || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("privateServiceDetails", {
                        ...professionalDetails.privateServiceDetails,
                        designation: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <StyledTextField
                    label="Employee Code"
                    value={professionalDetails.privateServiceDetails?.employeeCode || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("privateServiceDetails", {
                        ...professionalDetails.privateServiceDetails,
                        employeeCode: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <StyledTextField
                    label="Date of Joining"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={professionalDetails.privateServiceDetails?.dateOfJoining || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("privateServiceDetails", {
                        ...professionalDetails.privateServiceDetails,
                        dateOfJoining: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <StyledTextField
                    label="Date of Retirement"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={professionalDetails.privateServiceDetails?.dateOfRetirement || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("privateServiceDetails", {
                        ...professionalDetails.privateServiceDetails,
                        dateOfRetirement: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Office Number"
                    value={professionalDetails.privateServiceDetails?.officeNo || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("privateServiceDetails", {
                        ...professionalDetails.privateServiceDetails,
                        officeNo: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
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
                      '&:hover': {
                        border: `1px solid ${theme.palette.secondary.main}`,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                      }
                    }}
                  >
                    {professionalDetails.privateServiceDetails?.idCard
                      ? `ID Card Uploaded`
                      : "Attach ID Card"}
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        handleProfessionalFieldChange("privateServiceDetails", {
                          ...professionalDetails.privateServiceDetails,
                          idCard: e.target.files[0],
                        })
                      }
                    />
                  </Button>
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
                    label="Full Name of Company/Firm"
                    value={professionalDetails.businessDetails?.fullNameOfCompany || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("businessDetails", {
                        ...professionalDetails.businessDetails,
                        fullNameOfCompany: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    label="Address of Company/Firm"
                    value={professionalDetails.businessDetails?.addressOfCompany || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("businessDetails", {
                        ...professionalDetails.businessDetails,
                        addressOfCompany: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <StyledTextField
                    select
                    label="Business Structure"
                    value={professionalDetails.businessDetails?.businessStructure || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("businessDetails", {
                        ...professionalDetails.businessDetails,
                        businessStructure: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
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
                    onChange={(e) =>
                      handleProfessionalFieldChange("businessDetails", {
                        ...professionalDetails.businessDetails,
                        gstNumber: e.target.value,
                      })
                    }
                    sx={textFieldStyles}
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
                      '&:hover': {
                        border: `1px solid #4CAF50`,
                        backgroundColor: alpha('#4CAF50', 0.04),
                      }
                    }}
                  >
                    {professionalDetails.businessDetails?.gstCertificate
                      ? `GST Certificate Uploaded`
                      : "Upload GST Certificate"}
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        handleProfessionalFieldChange("businessDetails", {
                          ...professionalDetails.businessDetails,
                          gstCertificate: e.target.files[0],
                        })
                      }
                    />
                  </Button>
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