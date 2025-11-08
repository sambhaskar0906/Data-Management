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
} from "@mui/material";
import { Home as HomeIcon, UploadFile as UploadFileIcon } from "@mui/icons-material";
import StyledTextField from "../../ui/StyledTextField";
import SectionHeader from "../../layout/SectionHeader";

const AddressForm = ({ formData, handleChange, handleNestedChange }) => {
  const addressData = formData.Address;

  // Handle changes for address fields
  const handleAddressFieldChange = (addressType, field, value) => {
    handleNestedChange('Address', addressType, field, value);
  };

  // Handle file upload
  const handleFileUpload = (addressType, file) => {
    handleNestedChange('Address', addressType, 'proofDocument', file);
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

  const renderAddressFields = (addressType, values) => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <StyledTextField
          label="Flat No. / House No. / Building"
          name={`${addressType}.flatHouseNo`}
          value={values.flatHouseNo || ""}
          onChange={(e) => handleAddressFieldChange(addressType, 'flatHouseNo', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StyledTextField
          label="Area / Street / Sector"
          name={`${addressType}.areaStreetSector`}
          value={values.areaStreetSector || ""}
          onChange={(e) => handleAddressFieldChange(addressType, 'areaStreetSector', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StyledTextField
          label="Locality"
          name={`${addressType}.locality`}
          value={values.locality || ""}
          onChange={(e) => handleAddressFieldChange(addressType, 'locality', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StyledTextField
          label="Landmark"
          name={`${addressType}.landmark`}
          value={values.landmark || ""}
          onChange={(e) => handleAddressFieldChange(addressType, 'landmark', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StyledTextField
          label="City"
          name={`${addressType}.city`}
          value={values.city || ""}
          onChange={(e) => handleAddressFieldChange(addressType, 'city', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StyledTextField
          label="Country"
          name={`${addressType}.country`}
          value={values.country || ""}
          onChange={(e) => handleAddressFieldChange(addressType, 'country', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StyledTextField
          label="State"
          name={`${addressType}.state`}
          value={values.state || ""}
          onChange={(e) => handleAddressFieldChange(addressType, 'state', e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StyledTextField
          label="Pincode"
          name={`${addressType}.pincode`}
          value={values.pincode || ""}
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/[^0-9]/g, "");
            handleAddressFieldChange(addressType, 'pincode', onlyNums);
          }}
          inputProps={{ maxLength: 6 }}
        />
      </Grid>

      {/* File Upload */}
      <Grid item xs={12}>
        <Button
          variant="outlined"
          component="label"
          fullWidth
          startIcon={<UploadFileIcon />}
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
  );

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
      <CardContent sx={{ p: 4 }}>
        <SectionHeader
          icon={<HomeIcon />}
          title="Address"
          subtitle="Residential information and references"
        />

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Current Residential Address FIRST */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                px: 2,
                py: 1,
                mb: 2,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Current Residential Address
              </Typography>
            </Box>

            {renderAddressFields(
              "currentResidentialAddress",
              addressData.currentResidentialAddress
            )}
          </Grid>

          {/* Permanent Address */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                px: 2,
                py: 1,
                mb: 2,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Permanent Address
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={addressData.sameAsPermanent || false}
                    onChange={handleSameAddress}
                    sx={{ color: "white" }}
                  />
                }
                label="Same as Current Address"
                sx={{
                  color: "#fff",
                  "& .MuiFormControlLabel-label": { fontSize: "0.9rem" },
                }}
              />
            </Box>

            {renderAddressFields(
              "permanentAddress",
              addressData.permanentAddress
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AddressForm;