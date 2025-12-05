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
  FamilyRestroom as FamilyIcon,
  Person as NomineeIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const RemarksForm = ({ formData, handleChange }) => {
  const theme = useTheme();

  /* ================= FAMILY MEMBERS ================= */

  const familyMembers = Array.isArray(
    formData.professionalDetails?.familyMembers
  )
    ? formData.professionalDetails.familyMembers
    : [];

  const hasFamilyMember =
    formData.professionalDetails?.hasFamilyMember || "no";

  const handleFamilyMemberCheck = (value) => {
    handleChange("professionalDetails", "hasFamilyMember", value);
    if (value === "no") {
      handleChange("professionalDetails", "familyMembers", []);
    }
  };

  const handleFamilyMemberChange = (index, field, value) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("professionalDetails", "familyMembers", updated);
  };

  const addFamilyMember = () => {
    handleChange("professionalDetails", "familyMembers", [
      ...familyMembers,
      { membershipNo: "", name: "", relationWithApplicant: "" },
    ]);
  };

  const deleteFamilyMember = (index) => {
    handleChange(
      "professionalDetails",
      "familyMembers",
      familyMembers.filter((_, i) => i !== index)
    );
  };

  /* ================= NOMINEE ================= */

  const nominee = formData.nomineeDetails || {
    nomineeName: "",
    relationWithApplicant: "",
    nomineeMobileNo: "",
    introduceBy: "",
    memberShipNo: "",
  };


  const handleNomineeChange = (field, value) => {
    handleChange("nomineeDetails", null, {
      ...nominee,
      [field]: value,
    });
  };



  /* ================= COMMON STYLES ================= */

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
      height: "56px",
      "&.Mui-focused": {
        boxShadow: `0 0 0 2px ${alpha(
          theme.palette.primary.main,
          0.2
        )}`,
      },
    },
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <CardContent sx={{ p: 5 }}>
        {/* ================= FAMILY INFORMATION ================= */}
        <Box sx={{ mb: 5 }}>
          <SectionHeader
            icon={<FamilyIcon />}
            title="Family Information"
            subtitle="Details of family members who are society members"
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
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                    borderRadius: 3,
                    p: 3,
                    mb: 3,
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <StyledTextField
                        label="12. Membership No"
                        value={member.membershipNo || ""}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "membershipNo",
                            e.target.value
                          )
                        }
                        sx={textFieldStyles}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <StyledTextField
                        label="13. Name of Member"
                        value={member.name || ""}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        sx={textFieldStyles}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <StyledTextField
                        select
                        label="14. Relation with Applicant"
                        value={member.relationWithApplicant || ""}
                        onChange={(e) =>
                          handleFamilyMemberChange(
                            index,
                            "relationWithApplicant",
                            e.target.value
                          )
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
                  </Grid>

                  {familyMembers.length > 1 && (
                    <Box sx={{ textAlign: "right", mt: 2 }}>
                      <Button
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteFamilyMember(index)}
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
              >
                Add Family Member
              </Button>
            </Box>
          )}
        </Box>

        {/* ================= NOMINEE DETAILS ================= */}
        <SectionHeader
          icon={<NomineeIcon />}
          title="Nominee Details"
          subtitle="Information about the nominee"
        />

        <Box
          sx={{
            border: `1px solid ${alpha(
              theme.palette.secondary.main,
              0.2
            )}`,
            borderRadius: 3,
            p: 4,
          }}
        >
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <StyledTextField
                label="15. Nominee Name"
                value={nominee.nomineeName}
                onChange={(e) =>
                  handleNomineeChange("nomineeName", e.target.value)
                }
                sx={textFieldStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <StyledTextField
                select
                label="16. Relation with Applicant"
                value={nominee.relationWithApplicant}
                onChange={(e) =>
                  handleNomineeChange(
                    "relationWithApplicant",
                    e.target.value
                  )
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

            <Grid size={{ xs: 12, md: 4 }}>
              <StyledTextField
                label="17. Mobile Number"
                value={nominee.nomineeMobileNo}
                inputProps={{ maxLength: 10 }}
                onChange={(e) =>
                  handleNomineeChange("nomineeMobileNo", e.target.value)
                }
                sx={textFieldStyles}
              />
            </Grid>
          </Grid>
        </Box>
        <Box>
          <SectionHeader
            icon={<NomineeIcon />}
            title="Introduce / Witness"
            subtitle="Information about witness and introducer"
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


              {/* Relation With Applicant */}


              {/* Introduced By */}
              <Grid size={{ xs: 12, md: 6 }}>
                <StyledTextField
                  label="18. Introduced By"
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
                  label="19. Membership No"
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