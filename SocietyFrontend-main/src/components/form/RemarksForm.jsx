import React from "react";
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
  Comment as RemarksIcon,
  FamilyRestroom as FamilyIcon,
  Person as NomineeIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const RemarksForm = ({ formData, handleChange }) => {
  const theme = useTheme();

  // Family Members - ensure it's always an array
  const familyMembers = Array.isArray(formData.familyMembers) ? formData.familyMembers : [];

  // Nominee Details
  const nominee = formData.nomineeDetails || {
    nomineeName: "",
    relationWithApplicant: "",
    introduceBy: "",
    memberShipNo: "",
  };

  // Family Member Check
  const hasFamilyMember = formData.hasFamilyMember || "no";

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

  // Handle family member checkbox change
  const handleFamilyMemberCheck = (value) => {
    handleChange("hasFamilyMember", null, value);
    if (value === "no") {
      handleChange("familyMembers", null, []);
    }
  };

  // Handle changes for family member fields
  const handleFamilyMemberChange = (index, field, value) => {
    const updatedFamilyMembers = [...familyMembers];
    updatedFamilyMembers[index] = {
      ...updatedFamilyMembers[index],
      [field]: value,
    };
    handleChange("familyMembers", null, updatedFamilyMembers);
  };

  // Handle nominee changes
  const handleNomineeChange = (field, value) => {
    const updatedNominee = {
      ...nominee,
      [field]: value,
    };
    handleChange("nomineeDetails", null, updatedNominee);
  };

  // Add new family member
  const addFamilyMember = () => {
    const updatedFamilyMembers = [
      ...familyMembers,
      {
        membershipNo: "",
        name: "",
        relationWithApplicant: ""
      },
    ];
    handleChange("familyMembers", null, updatedFamilyMembers);
  };

  // Delete family member
  const deleteFamilyMember = (index) => {
    const updatedFamilyMembers = familyMembers.filter((_, i) => i !== index);
    handleChange("familyMembers", null, updatedFamilyMembers);
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
        {/* ----------------------- */}
        {/* Family Information Section */}
        {/* ----------------------- */}
        <Box sx={{ mb: 5 }}>
          <SectionHeader
            icon={<FamilyIcon />}
            title="Family Information"
            subtitle="Details of family members who are society members"
            sx={{ mb: 3 }}
          />

          {/* Family Member Check */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: theme.palette.primary.main }}>
              11. Any family member a member of the society?
            </Typography>
            <RadioGroup
              row
              value={hasFamilyMember}
              onChange={(e) => handleFamilyMemberCheck(e.target.value)}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </Box>

          {/* Family Members List - Only show if yes */}
          {hasFamilyMember === "yes" && (
            <Box>
              {familyMembers.map((member, index) => (
                <Box
                  key={index}
                  sx={{
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: 3,
                    p: 3,
                    mb: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                  }}
                >
                  <Grid container spacing={3}>
                    {/* Membership No */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <StyledTextField
                        label="12. Membership No"
                        value={member.membershipNo || ""}
                        onChange={(e) =>
                          handleFamilyMemberChange(index, "membershipNo", e.target.value)
                        }
                        sx={textFieldStyles}
                      />
                    </Grid>

                    {/* Name of Member */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <StyledTextField
                        label="13. Name of Member"
                        value={member.name || ""}
                        onChange={(e) =>
                          handleFamilyMemberChange(index, "name", e.target.value)
                        }
                        sx={textFieldStyles}
                      />
                    </Grid>

                    {/* Relation with Applicant */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <StyledTextField
                        select
                        label="14. Relation with Applicant"
                        value={member.relationWithApplicant || ""}
                        onChange={(e) =>
                          handleFamilyMemberChange(index, "relationWithApplicant", e.target.value)
                        }
                        sx={textFieldStyles}
                      >
                        <MenuItem value="">Select Relation</MenuItem>
                        <MenuItem value="FATHER">Father</MenuItem>
                        <MenuItem value="MOTHER">Mother</MenuItem>
                        <MenuItem value="SPOUSE">Spouse</MenuItem>
                        <MenuItem value="SON">Son</MenuItem>
                        <MenuItem value="DAUGHTER">Daughter</MenuItem>
                        <MenuItem value="BROTHER">Brother</MenuItem>
                        <MenuItem value="SISTER">Sister</MenuItem>
                        <MenuItem value="GRANDFATHER">Grandfather</MenuItem>
                        <MenuItem value="GRANDMOTHER">Grandmother</MenuItem>
                        <MenuItem value="UNCLE">Uncle</MenuItem>
                        <MenuItem value="AUNT">Aunt</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </StyledTextField>
                    </Grid>
                  </Grid>

                  {/* Delete Button */}
                  {familyMembers.length > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        sx={{ borderRadius: 2, px: 3 }}
                        onClick={() => deleteFamilyMember(index)}
                      >
                        Remove Member
                      </Button>
                    </Box>
                  )}
                </Box>
              ))}

              {/* Add Family Member Button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: 2, px: 3 }}
                  onClick={addFamilyMember}
                >
                  Add Another Family Member
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* ----------------------- */}
        {/* Nominee & Introducer Section */}
        {/* ----------------------- */}
        <Box>
          <SectionHeader
            icon={<NomineeIcon />}
            title="Nominee & Introducer Details"
            subtitle="Information about nominee and introducer"
            sx={{ mb: 3 }}
          />

          <Box
            sx={{
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              borderRadius: 3,
              p: 4,
              background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            }}
          >
            <Grid container spacing={3}>
              {/* Nominee Name */}
              <Grid size={{ xs: 12, md: 6 }}>
                <StyledTextField
                  label="15. Nominee Name"
                  value={nominee.nomineeName || ""}
                  onChange={(e) =>
                    handleNomineeChange("nomineeName", e.target.value)
                  }
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Relation With Applicant */}
              <Grid size={{ xs: 12, md: 6 }}>
                <StyledTextField
                  select
                  label="16. Relation with Applicant"
                  value={nominee.relationWithApplicant || ""}
                  onChange={(e) =>
                    handleNomineeChange("relationWithApplicant", e.target.value)
                  }
                  sx={textFieldStyles}
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

              {/* Introduced By */}
              <Grid size={{ xs: 12, md: 6 }}>
                <StyledTextField
                  label="17. Introduced By"
                  value={nominee.introduceBy || ""}
                  onChange={(e) =>
                    handleNomineeChange("introduceBy", e.target.value)
                  }
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Membership No */}
              <Grid size={{ xs: 12, md: 6 }}>
                <StyledTextField
                  label="18. Membership No"
                  value={nominee.memberShipNo || ""}
                  onChange={(e) =>
                    handleNomineeChange("memberShipNo", e.target.value)
                  }
                  sx={textFieldStyles}
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