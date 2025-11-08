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
  IconButton,
} from "@mui/material";
import {
  Work as WorkIcon,
  FamilyRestroom as FamilyIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const ProfessionalFamilyForm = ({ formData, handleChange }) => {
  const professionalDetails = formData.professionalDetails;

  // Handle changes for professional fields
  const handleProfessionalFieldChange = (field, value) => {
    handleChange('professionalDetails', field, value);
  };

  // Handle changes for family member fields
  const handleFamilyMemberChange = (index, field, value) => {
    const updatedFamilyMembers = [...professionalDetails.familyMembers];
    updatedFamilyMembers[index][field] = value;
    handleChange('professionalDetails', 'familyMembers', updatedFamilyMembers);
  };

  // Add new family member
  const addFamilyMember = () => {
    const updatedFamilyMembers = [
      ...professionalDetails.familyMembers,
      { name: "", membershipNo: "" }
    ];
    handleChange('professionalDetails', 'familyMembers', updatedFamilyMembers);
  };

  // Remove family member
  const removeFamilyMember = (index) => {
    const updatedFamilyMembers = professionalDetails.familyMembers.filter((_, i) => i !== index);
    handleChange('professionalDetails', 'familyMembers', updatedFamilyMembers);
  };

  return (
    <Box>
      {/* PROFESSIONAL BACKGROUND */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <SectionHeader
            icon={<WorkIcon />}
            title="Professional Background"
            subtitle="Educational and professional information"
          />

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Qualification"
                name="qualification"
                value={professionalDetails.qualification || ""}
                onChange={(e) => handleProfessionalFieldChange('qualification', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Occupation"
                name="occupation"
                value={professionalDetails.occupation || ""}
                onChange={(e) => handleProfessionalFieldChange('occupation', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* FAMILY INFORMATION */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <SectionHeader
            icon={<FamilyIcon />}
            title="Family Information"
            subtitle="Family members in society"
          />

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Checkbox */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="familyMemberMemberOfSociety"
                    checked={professionalDetails.familyMemberMemberOfSociety || false}
                    onChange={(e) => handleProfessionalFieldChange('familyMemberMemberOfSociety', e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body1">
                    Any family member a member of the society?
                  </Typography>
                }
              />
            </Grid>

            {/* Conditionally render multiple members */}
            {professionalDetails.familyMemberMemberOfSociety && (
              <Grid item xs={12}>
                {professionalDetails.familyMembers.map((member, index) => (
                  <Grid
                    container
                    spacing={2}
                    key={index}
                    alignItems="center"
                    sx={{
                      backgroundColor: "#f9fafb",
                      borderRadius: 2,
                      p: 2,
                      mb: 2,
                    }}
                  >
                    <Grid item xs={12} sm={5}>
                      <StyledTextField
                        label="Family Member Name"
                        name={`familyMembers[${index}].name`}
                        value={member.name || ""}
                        onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <StyledTextField
                        label="Membership Number"
                        name={`familyMembers[${index}].membershipNo`}
                        value={member.membershipNo || ""}
                        onChange={(e) => handleFamilyMemberChange(index, 'membershipNo', e.target.value)}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={2}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      {professionalDetails.familyMembers.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => removeFamilyMember(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                ))}

                {/* Add Member Button */}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addFamilyMember}
                >
                  Add Another Member
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfessionalFamilyForm;