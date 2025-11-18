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
  Business as BusinessIcon,
} from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const ProfessionalFamilyForm = ({ formData, handleChange }) => {
  const professionalDetails = formData.professionalDetails;

  const handleProfessionalFieldChange = (field, value) => {
    handleChange("professionalDetails", field, value);
  };

  // ----- FAMILY MEMBER HANDLERS -----
  const handleFamilyMemberChange = (index, field, value) => {
    const updated = [...professionalDetails.familyMembers];
    updated[index][field] = value;
    handleProfessionalFieldChange("familyMembers", updated);
  };

  const addFamilyMember = () => {
    handleProfessionalFieldChange("familyMembers", [
      ...professionalDetails.familyMembers,
      { name: "", membershipNo: "" },
    ]);
  };

  const removeFamilyMember = (index) => {
    handleProfessionalFieldChange(
      "familyMembers",
      professionalDetails.familyMembers.filter((_, i) => i !== index)
    );
  };

  return (
    <Box>

      {/* ===================== PROFESSIONAL BACKGROUND ===================== */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <SectionHeader
            icon={<WorkIcon />}
            title="Professional Background"
            subtitle="Educational and professional information"
          />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Qualification"
                value={professionalDetails.qualification || ""}
                onChange={(e) =>
                  handleProfessionalFieldChange("qualification", e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Occupation"
                value={professionalDetails.occupation || ""}
                onChange={(e) =>
                  handleProfessionalFieldChange("occupation", e.target.value)
                }
              />
            </Grid>
          </Grid>

          {/* --- JOB TYPE SELECTION --- */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
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
                  />
                }
                label="Government Employee"
              />
            </Grid>

            <Grid item xs={12}>
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
                  />
                }
                label="Private Job"
              />
            </Grid>

            <Grid item xs={12}>
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
                  />
                }
                label="Business"
              />
            </Grid>
          </Grid>

          {/* ================= JOB DETAILS (SERVICE) ================= */}
          {(professionalDetails.inCaseOfServiceGovt ||
            professionalDetails.inCaseOfPrivate) && (
              <Box sx={{ mt: 4, p: 3, borderRadius: 2, background: "#f5f7ff" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {professionalDetails.inCaseOfServiceGovt
                    ? "Government Job Details"
                    : "Private Job Details"}
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Company Name"
                      value={professionalDetails.serviceDetails?.fullNameOfCompany || ""}
                      onChange={(e) =>
                        handleProfessionalFieldChange("serviceDetails", {
                          ...professionalDetails.serviceDetails,
                          fullNameOfCompany: e.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Company Address"
                      value={professionalDetails.serviceDetails?.addressOfCompany || ""}
                      onChange={(e) =>
                        handleProfessionalFieldChange("serviceDetails", {
                          ...professionalDetails.serviceDetails,
                          addressOfCompany: e.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Monthly Income"
                      value={professionalDetails.serviceDetails?.monthlyIncome || ""}
                      onChange={(e) =>
                        handleProfessionalFieldChange("serviceDetails", {
                          ...professionalDetails.serviceDetails,
                          monthlyIncome: e.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Designation"
                      value={professionalDetails.serviceDetails?.designation || ""}
                      onChange={(e) =>
                        handleProfessionalFieldChange("serviceDetails", {
                          ...professionalDetails.serviceDetails,
                          designation: e.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
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
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <StyledTextField
                      label="Employee Code"
                      value={professionalDetails.serviceDetails?.employeeCode || ""}
                      onChange={(e) =>
                        handleProfessionalFieldChange("serviceDetails", {
                          ...professionalDetails.serviceDetails,
                          employeeCode: e.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
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
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Office Number"
                      value={professionalDetails.serviceDetails?.officeNo || ""}
                      onChange={(e) =>
                        handleProfessionalFieldChange("serviceDetails", {
                          ...professionalDetails.serviceDetails,
                          officeNo: e.target.value,
                        })
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

          {/* ================= BUSINESS DETAILS ================= */}
          {professionalDetails.inCaseOfBusiness && (
            <Box sx={{ mt: 4, p: 3, borderRadius: 2, background: "#fff6e5" }}>
              <SectionHeader
                icon={<BusinessIcon />}
                title="Business Details"
                subtitle="Business information & GST"
              />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Business / Company Name"
                    value={professionalDetails.businessDetails?.fullNameOfCompany || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("businessDetails", {
                        ...professionalDetails.businessDetails,
                        fullNameOfCompany: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Company Address"
                    value={professionalDetails.businessDetails?.addressOfCompany || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("businessDetails", {
                        ...professionalDetails.businessDetails,
                        addressOfCompany: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Business Structure"
                    value={professionalDetails.businessDetails?.businessStructure || ""}
                    onChange={(e) =>
                      handleProfessionalFieldChange("businessDetails", {
                        ...professionalDetails.businessDetails,
                        businessStructure: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" component="label" fullWidth>
                    Upload GST Certificate
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

                  {professionalDetails.businessDetails?.gstCertificate && (
                    <Typography sx={{ mt: 1, fontSize: 14, color: "green" }}>
                      File Selected ✔
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ================= FAMILY DETAILS ================= */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ p: 4 }}>
          <SectionHeader
            icon={<FamilyIcon />}
            title="Family Information"
            subtitle="Family members in society"
          />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={professionalDetails.familyMemberMemberOfSociety || false}
                    onChange={(e) =>
                      handleProfessionalFieldChange(
                        "familyMemberMemberOfSociety",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Any family member a member of the society?"
              />
            </Grid>

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
                        value={member.name}
                        onChange={(e) =>
                          handleFamilyMemberChange(index, "name", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <StyledTextField
                        label="Membership Number"
                        value={member.membershipNo}
                        onChange={(e) =>
                          handleFamilyMemberChange(index, "membershipNo", e.target.value)
                        }
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      sm={2}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      {professionalDetails.familyMembers.length > 1 && (
                        <IconButton color="error" onClick={() => removeFamilyMember(index)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                ))}

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