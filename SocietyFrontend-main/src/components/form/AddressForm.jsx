import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Button,
  MenuItem,
  useTheme,
  alpha,
  Fade,
} from "@mui/material";
import {
  Home as HomeIcon,
  UploadFile as UploadFileIcon,
  Business as BusinessIcon
} from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const AddressForm = ({ formData, handleChange, handleNestedChange }) => {
  const addressData = formData.Address;
  const theme = useTheme();

  // Handle changes for address fields
  const handleAddressFieldChange = (addressType, field, value) => {
    handleNestedChange('Address', addressType, field, value);
  };

  // Handle file upload
  const handleFileUpload = (addressType, file) => {
    handleNestedChange('Address', addressType, 'proofDocument', file);
  };

  // Handle residence type change
  const handleResidenceTypeChange = (value) => {
    handleChange('Address', 'residenceType', value);

    // Reset company address if residence type is not company provided
    if (value !== 'COMPANY_PROVIDED') {
      const resetAddress = {
        flatHouseNo: "",
        areaStreetSector: "",
        locality: "",
        landmark: "",
        city: "",
        country: "",
        state: "",
        pincode: "",
        proofDocument: null,
      };
      Object.keys(resetAddress).forEach(field => {
        handleNestedChange('Address', 'companyProvidedAddress', field, resetAddress[field]);
      });
    }
  };

  // Copy current → permanent when checked
  const handleSameAddress = (e) => {
    const checked = e.target.checked;
    handleChange('Address', 'sameAsPermanent', checked);

    if (checked) {
      // Copy current residential address to permanent address
      const currentAddress = { ...addressData.currentResidentialAddress };
      Object.keys(currentAddress).forEach(field => {
        handleNestedChange('Address', 'permanentAddress', field, currentAddress[field]);
      });
    } else {
      // Reset permanent address
      const resetAddress = {
        flatHouseNo: "",
        areaStreetSector: "",
        locality: "",
        landmark: "",
        city: "",
        country: "",
        state: "",
        pincode: "",
        proofDocument: null,
      };
      Object.keys(resetAddress).forEach(field => {
        handleNestedChange('Address', 'permanentAddress', field, resetAddress[field]);
      });
    }
  };

  const renderAddressFields = (addressType, values, title, icon) => (
    <Box>
      {title && (
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: "#fff",
            px: 2,
            py: 1.5,
            mb: 2,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {icon}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledTextField
            label="Flat No. / House No. / Building"
            name={`${addressType}.flatHouseNo`}
            value={values.flatHouseNo || ""}
            onChange={(e) => handleAddressFieldChange(addressType, 'flatHouseNo', e.target.value)}
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
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledTextField
            label="Area / Street / Sector"
            name={`${addressType}.areaStreetSector`}
            value={values.areaStreetSector || ""}
            onChange={(e) => handleAddressFieldChange(addressType, 'areaStreetSector', e.target.value)}
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
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledTextField
            label="Locality"
            name={`${addressType}.locality`}
            value={values.locality || ""}
            onChange={(e) => handleAddressFieldChange(addressType, 'locality', e.target.value)}
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
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledTextField
            label="Landmark"
            name={`${addressType}.landmark`}
            value={values.landmark || ""}
            onChange={(e) => handleAddressFieldChange(addressType, 'landmark', e.target.value)}
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
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledTextField
            label="City"
            name={`${addressType}.city`}
            value={values.city || ""}
            onChange={(e) => handleAddressFieldChange(addressType, 'city', e.target.value)}
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
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledTextField
            label="Country"
            name={`${addressType}.country`}
            value={values.country || ""}
            onChange={(e) => handleAddressFieldChange(addressType, 'country', e.target.value)}
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
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledTextField
            label="State"
            name={`${addressType}.state`}
            value={values.state || ""}
            onChange={(e) => handleAddressFieldChange(addressType, 'state', e.target.value)}
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
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StyledTextField
            label="Pincode"
            name={`${addressType}.pincode`}
            value={values.pincode || ""}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, "");
              handleAddressFieldChange(addressType, 'pincode', onlyNums);
            }}
            inputProps={{ maxLength: 6 }}
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
              }
            }}
          />
        </Grid>

        {/* File Upload */}
        <Grid size={{ xs: 12 }}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<UploadFileIcon />}
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
            {values.proofDocument
              ? `Uploaded: ${values.proofDocument.name}`
              : "Upload Address Proof Document"}
            <input
              type="file"
              hidden
              accept="image/*,application/pdf"
              onChange={(e) => handleFileUpload(addressType, e.target.files[0])}
            />
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  // Check if residence type is selected
  const isResidenceTypeSelected = addressData.residenceType;

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
              <HomeIcon
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: 28
                }}
              />
            </Box>
          }
          title="Address Information"
          subtitle="Residential details and proof documentation"
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

        {/* Residence Type Selection */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                px: 3,
                py: 2,
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 600 }}>
                Residence Type
              </Typography>
              <StyledTextField
                select
                fullWidth
                label="Select Residence Type"
                value={addressData.residenceType || ""}
                onChange={(e) => handleResidenceTypeChange(e.target.value)}
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
                  }
                }}
              >
                <MenuItem value="">Select Residence Type</MenuItem>
                <MenuItem value="OWNED">Owned</MenuItem>
                <MenuItem value="RENTED">Rented</MenuItem>
                <MenuItem value="COMPANY_PROVIDED">Company Provided</MenuItem>
              </StyledTextField>
            </Box>
          </Grid>
        </Grid>

        {/* Address Fields - Only show when residence type is selected */}
        {isResidenceTypeSelected ? (
          <Fade in={isResidenceTypeSelected} timeout={500}>
            <Grid container spacing={4}>
              {/* Present/Correspondence Address */}
              <Grid size={{ xs: 12 }}>
                {renderAddressFields(
                  "currentResidentialAddress",
                  addressData.currentResidentialAddress,
                  "Present/Correspondence Address",
                  <HomeIcon sx={{ fontSize: 20 }} />
                )}
              </Grid>

              {/* Permanent Address */}
              <Grid size={{ xs: 12, md: 12 }}>
                <Box>
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      color: "#fff",
                      px: 2,
                      py: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <HomeIcon sx={{ fontSize: 20 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Permanent Address
                      </Typography>
                    </Box>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={addressData.sameAsPermanent || false}
                          onChange={handleSameAddress}
                          sx={{
                            color: "white",
                            '&.Mui-checked': {
                              color: "white",
                            }
                          }}
                        />
                      }
                      label="Same as Present Address"
                      sx={{
                        color: "#fff",
                        "& .MuiFormControlLabel-label": {
                          fontSize: "0.8rem",
                          fontWeight: 500
                        },
                      }}
                    />
                  </Box>

                  {renderAddressFields(
                    "permanentAddress",
                    addressData.permanentAddress,
                    "",
                    null
                  )}
                </Box>
              </Grid>

              {/* Company Provided Address - Only show if residence type is COMPANY_PROVIDED */}
              {addressData.residenceType === 'COMPANY_PROVIDED' && (
                <Grid size={{ xs: 12 }}>
                  {renderAddressFields(
                    "companyProvidedAddress",
                    addressData.companyProvidedAddress || {},
                    "Company Provided Address",
                    <BusinessIcon sx={{ fontSize: 20 }} />
                  )}
                </Grid>
              )}
            </Grid>
          </Fade>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: theme.palette.text.secondary,
            }}
          >
            <HomeIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Please Select Residence Type
            </Typography>
            <Typography variant="body2">
              Choose your residence type from the dropdown above to continue filling address details
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressForm;