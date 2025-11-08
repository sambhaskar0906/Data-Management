import React from "react";
import {
  Card,
  CardContent,
  Grid,
  MenuItem,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const PersonalInfoForm = ({ formData, handleChange }) => {
  const personalInfo = formData.personalInformation;

  // Handle changes and update parent state
  const handleFieldChange = (field, value) => {
    handleChange('personalInformation', field, value);
  };

  // Auto-calculate age when date of birth changes
  const handleDateOfBirthChange = (dateString) => {
    handleFieldChange('dateOfBirth', dateString);

    if (dateString) {
      const dob = new Date(dateString);
      const today = new Date();

      let years = today.getFullYear() - dob.getFullYear();
      let months = today.getMonth() - dob.getMonth();

      if (months < 0) {
        years -= 1;
        months += 12;
      }

      const ageString = `${years} years, ${months} months`;
      handleFieldChange('ageInYears', ageString);
    } else {
      handleFieldChange('ageInYears', "");
    }
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
      <CardContent sx={{ p: 4 }}>
        <SectionHeader
          icon={<PersonIcon />}
          title="Personal Information"
          subtitle="Basic member details and identification"
        />

        <Grid container spacing={3}>
          {/* Name of Member */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledTextField
              label="Name of Member"
              name="nameOfMember"
              value={personalInfo.nameOfMember || ""}
              onChange={(e) => handleFieldChange('nameOfMember', e.target.value)}
            />
          </Grid>

          {/* Name of Father */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledTextField
              label="Name of Father"
              name="nameOfFather"
              value={personalInfo.nameOfFather || ""}
              onChange={(e) => handleFieldChange('nameOfFather', e.target.value)}
            />
          </Grid>

          {/* Name of Mother */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledTextField
              label="Name of Mother"
              name="nameOfMother"
              value={personalInfo.nameOfMother || ""}
              onChange={(e) => handleFieldChange('nameOfMother', e.target.value)}
            />
          </Grid>

          {/* Date of Birth */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledTextField
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              InputLabelProps={{ shrink: true }}
              value={personalInfo.dateOfBirth || ""}
              onChange={(e) => handleDateOfBirthChange(e.target.value)}
            />
          </Grid>

          {/* Age in Years (auto-calculated) */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledTextField
              label="Age in Years"
              name="ageInYears"
              value={personalInfo.ageInYears || ""}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          {/* Gender */}
          <Grid size={{ xs: 6, sm: 6, md: 2 }}>
            <StyledTextField
              select
              label="Gender"
              name="gender"
              value={personalInfo.gender || ""}
              onChange={(e) => handleFieldChange('gender', e.target.value)}
            >
              <MenuItem value="">Select Gender</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </StyledTextField>
          </Grid>

          {/* Religion */}
          <Grid size={{ xs: 6, sm: 6, md: 2 }}>
            <StyledTextField
              select
              label="Religion"
              name="religion"
              value={personalInfo.religion || ""}
              onChange={(e) => handleFieldChange('religion', e.target.value)}
            >
              <MenuItem value="">Select Religion</MenuItem>
              <MenuItem value="Hindu">Hinduism</MenuItem>
              <MenuItem value="Muslim">Islam</MenuItem>
              <MenuItem value="Christian">Christianity</MenuItem>
              <MenuItem value="Sikh">Sikhism</MenuItem>
              <MenuItem value="Buddhist">Buddhism</MenuItem>
              <MenuItem value="Jain">Jainism</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </StyledTextField>
          </Grid>

          {/* Marital Status */}
          <Grid size={{ xs: 6, sm: 6, md: 2 }}>
            <StyledTextField
              select
              label="Marital Status"
              name="maritalStatus"
              value={personalInfo.maritalStatus || ""}
              onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
            >
              <MenuItem value="">Select Status</MenuItem>
              <MenuItem value="Single">Single</MenuItem>
              <MenuItem value="Married">Married</MenuItem>
              <MenuItem value="Divorced">Divorced</MenuItem>
              <MenuItem value="Widowed">Widowed</MenuItem>
            </StyledTextField>
          </Grid>

          {/* Caste */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledTextField
              select
              label="Caste"
              name="caste"
              value={personalInfo.caste || ""}
              onChange={(e) => handleFieldChange('caste', e.target.value)}
            >
              <MenuItem value="">Select Caste</MenuItem>
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="OBC">Other Backward Classes (OBC)</MenuItem>
              <MenuItem value="SC">Scheduled Caste (SC)</MenuItem>
              <MenuItem value="ST">Scheduled Tribe (ST)</MenuItem>
            </StyledTextField>
          </Grid>

          {/* Membership Number */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledTextField
              label="Membership No."
              name="membershipNumber"
              value={personalInfo.membershipNumber || ""}
              onChange={(e) => handleFieldChange('membershipNumber', e.target.value)}
            />
          </Grid>

          {/* Membership Date */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledTextField
              label="Membership Date"
              type="date"
              name="membershipDate"
              InputLabelProps={{ shrink: true }}
              value={personalInfo.membershipDate || ""}
              onChange={(e) => handleFieldChange('membershipDate', e.target.value)}
            />
          </Grid>

          {/* Amount in Credit */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledTextField
              label="Amount in Credit"
              type="number"
              name="amountInCredit"
              value={personalInfo.amountInCredit || ""}
              onChange={(e) => handleFieldChange('amountInCredit', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledTextField
              label="Phone Number"
              name="phoneNo"
              value={personalInfo.phoneNo || ""}
              onChange={(e) => handleFieldChange('phoneNo', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledTextField
              label="Alternate Phone Number"
              name="alternatePhoneNo"
              value={personalInfo.alternatePhoneNo || ""}
              onChange={(e) => handleFieldChange('alternatePhoneNo', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StyledTextField
              label="Email Id"
              name="emailId"
              type="email"
              value={personalInfo.emailId || ""}
              onChange={(e) => handleFieldChange('emailId', e.target.value)}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;