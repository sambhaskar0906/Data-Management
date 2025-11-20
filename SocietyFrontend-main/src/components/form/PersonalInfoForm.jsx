import React, { useState, useEffect } from "react";
import { Card, CardContent, Grid, Box, useTheme, alpha } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";
import Autocomplete from "@mui/material/Autocomplete";

const PersonalInfoForm = ({ formData, handleChange }) => {
  const personalInfo = formData.personalInformation;
  const [dobError, setDobError] = useState("");
  const theme = useTheme();

  const handleFieldChange = (field, value) => {
    handleChange("personalInformation", field, value);
  };

  const ComboBox = ({ label, fieldName, value, options }) => {
    const [inputValue, setInputValue] = useState(value || "");

    useEffect(() => {
      setInputValue(value || "");
    }, [value]);

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
        }}
        onBlur={() => {
          handleFieldChange(fieldName, inputValue);
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            transition: 'all 0.2s ease-in-out',
            height: '56px', // Fixed height
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 0.9),
            },
            '&.Mui-focused': {
              backgroundColor: theme.palette.background.paper,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
            }
          },
          '& .MuiAutocomplete-input': {
            padding: '8.5px 4px 8.5px 6px !important', // Match textfield padding
          }
        }}
        renderInput={(params) => (
          <StyledTextField
            {...params}
            label={label}
            sx={{
              '& .MuiInputLabel-root': {
                fontSize: '0.9rem',
                fontWeight: 500,
              },
              '& .MuiInputBase-root': {
                height: '56px', // Consistent height
              }
            }}
          />
        )}
      />
    );
  };

  // DOB age logic
  const handleDateOfBirthChange = (dateString) => {
    handleFieldChange("dateOfBirth", dateString);

    if (!dateString) {
      handleFieldChange("ageInYears", "");
      handleFieldChange("isMinor", "");
      setDobError("");
      return;
    }

    const dob = new Date(dateString);
    const today = new Date();

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

    const isMinor = years < 18 ? "Yes" : "No";
    setDobError("");

    handleFieldChange("ageInYears", `${years} years, ${months} months`);
    handleFieldChange("isMinor", isMinor);
  };

  // Common text field styles
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
      transition: 'all 0.2s ease-in-out',
      height: '56px', // Fixed height for all text fields
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
              onChange={(e) =>
                handleFieldChange("membershipNumber", e.target.value)
              }
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
              onChange={(e) =>
                handleFieldChange("membershipDate", e.target.value)
              }
              sx={textFieldStyles}
            />
          </Grid>

          {/* Title ComboBox */}
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
              sx={textFieldStyles}
            />
          </Grid>

          {/* Father Title + Name */}
          <Grid size={{ xs: 12, md: 2 }}>
            <ComboBox
              label="Father Title"
              fieldName="fatherTitle"
              value={personalInfo.fatherTitle}
              options={["Mr", "Dr", "CA", "Advocate"]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Name of Father"
              name="nameOfFather"
              value={personalInfo.nameOfFather || ""}
              onChange={(e) => handleFieldChange("nameOfFather", e.target.value)}
              sx={textFieldStyles}
            />
          </Grid>

          {/* Mother Title + Name */}
          <Grid size={{ xs: 12, md: 2 }}>
            <ComboBox
              label="Mother Title"
              fieldName="motherTitle"
              value={personalInfo.motherTitle}
              options={["Mrs", "Miss", "Dr", "CA", "Advocate"]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Name of Mother"
              name="nameOfMother"
              value={personalInfo.nameOfMother || ""}
              onChange={(e) => handleFieldChange("nameOfMother", e.target.value)}
              sx={textFieldStyles}
            />
          </Grid>

          {/* DOB */}
          <Grid size={{ xs: 12, md: 3 }}>
            <StyledTextField
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              InputLabelProps={{ shrink: true }}
              value={personalInfo.dateOfBirth || ""}
              onChange={(e) => handleDateOfBirthChange(e.target.value)}
              error={!!dobError}
              helperText={dobError}
              sx={textFieldStyles}
            />
          </Grid>

          {/* Age */}
          <Grid size={{ xs: 12, md: 3 }}>
            <StyledTextField
              label="Age in Years"
              name="ageInYears"
              value={personalInfo.ageInYears || ""}
              InputProps={{ readOnly: true }}
              sx={{
                ...textFieldStyles,
                '& .MuiOutlinedInput-root': {
                  ...textFieldStyles['& .MuiOutlinedInput-root'],
                }
              }}
            />
          </Grid>

          {/* Minor */}
          <Grid size={{ xs: 12, md: 2 }}>
            <ComboBox
              label="Minor"
              fieldName="isMinor"
              value={personalInfo.isMinor}
              options={["Yes", "No"]}
            />
          </Grid>

          {/* Guardian Fields (if minor) */}
          {personalInfo.isMinor === "Yes" && (
            <>
              <Grid size={{ xs: 12, md: 4 }}>
                <StyledTextField
                  label="Guardian Name"
                  name="guardianName"
                  value={personalInfo.guardianName || ""}
                  onChange={(e) => handleFieldChange("guardianName", e.target.value)}
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <ComboBox
                  label="Relation with Guardian"
                  fieldName="guardianRelation"
                  value={personalInfo.guardianRelation}
                  options={[
                    "Father",
                    "Mother",
                    "Grandfather",
                    "Grandmother",
                    "Uncle",
                    "Aunt",
                  ]}
                />
              </Grid>
            </>
          )}

          {/* Gender */}
          <Grid size={{ xs: 12, md: 2 }}>
            <ComboBox
              label="Gender"
              fieldName="gender"
              value={personalInfo.gender}
              options={["Male", "Female", "Other"]}
            />
          </Grid>

          {/* Religion */}
          <Grid size={{ xs: 12, md: 2 }}>
            <ComboBox
              label="Religion"
              fieldName="religion"
              value={personalInfo.religion}
              options={[
                "Hindu",
                "Muslim",
                "Christian",
                "Sikh",
                "Buddhist",
                "Jain",
              ]}
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

          {/* Spouse Fields */}
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

          {/* Contact Information Section Visual Break */}
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

          {/* Phone */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Phone Number"
              name="phoneNo"
              value={personalInfo.phoneNo || ""}
              onChange={(e) => handleFieldChange("phoneNo", e.target.value)}
              sx={textFieldStyles}
            />
          </Grid>

          {/* Alternate Phone */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Alternate Phone Number"
              name="alternatePhoneNo"
              value={personalInfo.alternatePhoneNo || ""}
              onChange={(e) =>
                handleFieldChange("alternatePhoneNo", e.target.value)
              }
              sx={textFieldStyles}
            />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12, md: 4 }}>
            <StyledTextField
              label="Email Id"
              name="emailId"
              type="email"
              value={personalInfo.emailId || ""}
              onChange={(e) => handleFieldChange("emailId", e.target.value)}
              sx={textFieldStyles}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;