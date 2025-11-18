import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Box,
  Button,
} from "@mui/material";
import {
  Comment as RemarksIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const RemarksForm = ({ formData, handleChange }) => {
  // Ensure remarks is always an array with safe fallback
  const remarks = Array.isArray(formData.remarks) ? formData.remarks : [];

  // Nominee Details
  const nominee = formData.nomineeDetails || {
    nomineeName: "",
    relationWithApplicant: "",
    introduceBy: "",
    memberShipNo: "",
  };

  // Handle changes for remark fields
  const handleRemarkChange = (index, field, value) => {
    const updatedRemarks = [...remarks];
    updatedRemarks[index] = {
      ...updatedRemarks[index],
      [field]: value,
    };
    handleChange("remarks", null, updatedRemarks);
  };

  // Handle nominee changes
  const handleNomineeChange = (field, value) => {
    const updatedNominee = {
      ...nominee,
      [field]: value,
    };
    handleChange("nomineeDetails", null, updatedNominee);
  };

  // Add new remark
  const addRemark = () => {
    const updatedRemarks = [
      ...remarks,
      { loanAmount: "", purposeOfLoan: "", loanDate: "" },
    ];
    handleChange("remarks", null, updatedRemarks);
  };

  // Delete remark
  const deleteRemark = (index) => {
    const updatedRemarks = remarks.filter((_, i) => i !== index);
    handleChange("remarks", null, updatedRemarks);
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
      <CardContent sx={{ p: 4 }}>
        <SectionHeader
          icon={<RemarksIcon />}
          title="Final Remarks & Additional Information"
          subtitle="Complete the member dossier"
        />

        {/* ----------------------- */}
        {/* Loan Remarks Section */}
        {/* ----------------------- */}
        {remarks.map((remark, index) => (
          <Box
            key={index}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              p: 2,
              mb: 3,
            }}
          >
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Loan Amount */}
              <Grid item xs={12} sm={4}>
                <StyledTextField
                  label="Loan Amount"
                  type="number"
                  value={remark?.loanAmount || ""}
                  onChange={(e) =>
                    handleRemarkChange(index, "loanAmount", e.target.value)
                  }
                />
              </Grid>

              {/* Purpose of Loan */}
              <Grid item xs={12} sm={4}>
                <StyledTextField
                  label="Purpose of Loan"
                  value={remark?.purposeOfLoan || ""}
                  onChange={(e) =>
                    handleRemarkChange(index, "purposeOfLoan", e.target.value)
                  }
                />
              </Grid>

              {/* Loan Date */}
              <Grid item xs={12} sm={4}>
                <StyledTextField
                  label="Loan Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={remark?.loanDate || ""}
                  onChange={(e) =>
                    handleRemarkChange(index, "loanDate", e.target.value)
                  }
                />
              </Grid>
            </Grid>

            {/* Delete Button */}
            {remarks.length > 1 && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  sx={{ borderRadius: 2, px: 3 }}
                  onClick={() => deleteRemark(index)}
                >
                  Delete
                </Button>
              </Box>
            )}
          </Box>
        ))}

        {/* Add loan button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mb: 4,
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2, px: 3 }}
            onClick={addRemark}
          >
            Add Another Loan
          </Button>
        </Box>

        {/* ----------------------- */}
        {/* Nominee Details Section */}
        {/* ----------------------- */}
        <SectionHeader
          title="Nominee Details"
          subtitle="Information about the nominated person"
        />

        <Box
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            p: 3,
            mt: 2,
          }}
        >
          <Grid container spacing={3}>
            {/* Nominee Name */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Nominee Name"
                value={nominee.nomineeName || ""}
                onChange={(e) =>
                  handleNomineeChange("nomineeName", e.target.value)
                }
              />
            </Grid>

            {/* Relation With Applicant */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Relation with Applicant"
                value={nominee.relationWithApplicant || ""}
                onChange={(e) =>
                  handleNomineeChange("relationWithApplicant", e.target.value)
                }
              />
            </Grid>

            {/* Introduced By */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Introduced By"
                value={nominee.introduceBy || ""}
                onChange={(e) =>
                  handleNomineeChange("introduceBy", e.target.value)
                }
              />
            </Grid>

            {/* Membership No */}
            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Membership No"
                value={nominee.memberShipNo || ""}
                onChange={(e) =>
                  handleNomineeChange("memberShipNo", e.target.value)
                }
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RemarksForm;