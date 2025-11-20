import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Badge as BadgeIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const IdentityVerificationForm = ({ formData, handleChange }) => {
  const identityProofs = formData.identityProofs;
  const theme = useTheme();

  // Handle changes for identity proof fields
  const handleIdentityFieldChange = (field, value) => {
    handleChange('identityProofs', field, value);
  };

  // 🔹 Generic file upload handler
  const handleFileUpload = (fileField, previewField, e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      handleIdentityFieldChange(fileField, file);
      handleIdentityFieldChange(previewField, preview);
    }
  };

  // 🔹 Helper component for file + preview (FULL IMAGE DISPLAY)
  const UploadBox = ({ label, fileField, previewField, height = 140 }) => (
    <Box sx={{ textAlign: "center" }}>
      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadIcon />}
        fullWidth
        sx={{
          mt: 1,
          borderRadius: 2,
          border: `2px dashed ${theme.palette.primary.main}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            border: `2px dashed ${theme.palette.primary.dark}`,
          },
        }}
      >
        {identityProofs[fileField]
          ? `Uploaded: ${identityProofs[fileField].name}`
          : label}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFileUpload(fileField, previewField, e)}
        />
      </Button>

      {identityProofs[previewField] && (
        <Box
          component="img"
          src={identityProofs[previewField]}
          alt={label}
          sx={{
            mt: 2,
            width: "100%",
            maxWidth: 220,
            height: height,
            objectFit: "contain",
            borderRadius: 2,
            border: `2px solid ${theme.palette.primary.main}`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            backgroundColor: "#fff",
          }}
        />
      )}
    </Box>
  );

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
              <BadgeIcon
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: 28
                }}
              />
            </Box>
          }
          title="Identity Verification"
          subtitle="Upload required documents and signatures"
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

        {/* 🔹 Passport Size Photo & Signature Section */}
        <Grid container spacing={4} sx={{ mt: 2 }} alignItems="center">
          {/* Passport Size Photo */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                p: 3,
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 600 }}>
                Passport Size Photo
              </Typography>
              <UploadBox
                label="Upload Passport Size Photo"
                fileField="passportSizePhoto"
                previewField="passportSizePreview"
                height={180}
              />
            </Box>
          </Grid>

          {/* Signed Photo with Digital Signature */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                p: 3,
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main, fontWeight: 600 }}>
                Signed Photo with Digital Signature
              </Typography>

              {/* Signature Upload */}
              <UploadBox
                label="Upload Signed Photo with Signature"
                fileField="signedPhoto"
                previewField="signedPhotoPreview"
                height={120}
              />
            </Box>
          </Grid>
        </Grid>

        {/* 🔹 Aadhaar Card */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 600 }}>
            Aadhaar Card
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <StyledTextField
                label="Aadhaar Number"
                name="aadhaarCardNumber"
                value={identityProofs.aadhaarCardNumber || ""}
                onChange={(e) => handleIdentityFieldChange('aadhaarCardNumber', e.target.value)}
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
            <Grid item xs={12} sm={4}>
              <UploadBox
                label="Upload Aadhaar Front Photo"
                fileField="aadhaarFrontPhoto"
                previewField="aadhaarFrontPreview"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <UploadBox
                label="Upload Aadhaar Back Photo"
                fileField="aadhaarBackPhoto"
                previewField="aadhaarBackPreview"
              />
            </Grid>
          </Grid>
        </Box>

        {/* 🔹 PAN Card */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 600 }}>
            PAN Card
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <StyledTextField
                label="PAN Number"
                name="panNumber"
                value={identityProofs.panNumber || ""}
                onChange={(e) => handleIdentityFieldChange('panNumber', e.target.value)}
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
            <Grid item xs={12} sm={8}>
              <UploadBox
                label="Upload PAN Card Photo"
                fileField="panCardPhoto"
                previewField="panCardPreview"
              />
            </Grid>
          </Grid>
        </Box>

        {/* 🔹 Voter ID Card */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 600 }}>
            Voter ID Card
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <StyledTextField
                label="Voter ID Number"
                name="voterIdNumber"
                value={identityProofs.voterIdNumber || ""}
                onChange={(e) => handleIdentityFieldChange('voterIdNumber', e.target.value)}
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
            <Grid item xs={12} sm={4}>
              <UploadBox
                label="Upload Voter ID Front Photo"
                fileField="voterFrontPhoto"
                previewField="voterFrontPreview"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <UploadBox
                label="Upload Voter ID Back Photo"
                fileField="voterBackPhoto"
                previewField="voterBackPreview"
              />
            </Grid>
          </Grid>
        </Box>

        {/* 🔹 Passport */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 600 }}>
            Passport
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <StyledTextField
                label="Passport Number"
                name="passportNumber"
                value={identityProofs.passportNumber || ""}
                onChange={(e) => handleIdentityFieldChange('passportNumber', e.target.value)}
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
            <Grid item xs={12} sm={8}>
              <UploadBox
                label="Upload Passport Photo"
                fileField="passportPhoto"
                previewField="passportPreview"
              />
            </Grid>
          </Grid>
        </Box>

        {/* 🔹 Driving License */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 600 }}>
            Driving License
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <StyledTextField
                label="Driving License Number"
                name="drivingLicenseNumber"
                value={identityProofs.drivingLicenseNumber || ""}
                onChange={(e) => handleIdentityFieldChange('drivingLicenseNumber', e.target.value)}
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
            <Grid item xs={12} sm={4}>
              <UploadBox
                label="Upload DL Front Photo"
                fileField="drivingFrontPhoto"
                previewField="drivingFrontPreview"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <UploadBox
                label="Upload DL Back Photo"
                fileField="drivingBackPhoto"
                previewField="drivingBackPreview"
              />
            </Grid>
          </Grid>
        </Box>

        {/* 🔹 Ration Card */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 600 }}>
            Ration Card
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <StyledTextField
                label="Ration Card Number"
                name="rationCardNumber"
                value={identityProofs.rationCardNumber || ""}
                onChange={(e) => handleIdentityFieldChange('rationCardNumber', e.target.value)}
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
            <Grid item xs={12} sm={4}>
              <UploadBox
                label="Upload Ration Front Photo"
                fileField="rationFrontPhoto"
                previewField="rationFrontPreview"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <UploadBox
                label="Upload Ration Back Photo"
                fileField="rationBackPhoto"
                previewField="rationBackPreview"
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default IdentityVerificationForm;