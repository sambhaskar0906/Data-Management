import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
} from "@mui/material";
import {
    AccountBalance as FinanceIcon,
} from "@mui/icons-material";
import SectionHeader from "../../layout/SectionHeader";

const FinancialDetailsForm = ({ formData = {}, handleChange }) => {
    // Initialize with empty array if not exists
    const financialDetails = formData?.financialDetails || [];

    // Get the first entry or create a default one
    const currentEntry = financialDetails[0] || {
        shareCapital: "",
        optionalDeposit: "",
        compulsory: ""
    };

    // Handle field changes
    const handleFieldChange = (field, value) => {
        const updatedEntry = {
            ...currentEntry,
            [field]: value
        };

        // Create new array with updated entry
        let updatedDetails;
        if (financialDetails.length === 0) {
            // If array is empty, add the entry
            updatedDetails = [updatedEntry];
        } else {
            // If array has entries, update the first one
            updatedDetails = [...financialDetails];
            updatedDetails[0] = updatedEntry;
        }

        // Call handleChange with updated array
        if (handleChange) {
            handleChange('financialDetails', null, updatedDetails);
        }
    };

    return (
        <Box>
            <Card
                sx={{
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    mb: 3,
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <SectionHeader
                        icon={<FinanceIcon />}
                        title="Financial Details"
                        subtitle="Enter Share Capital (SC), Optional Deposit (OD), and Compulsory (CD) amounts"
                    />

                    <Box
                        sx={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 2,
                            p: 3,
                            backgroundColor: "#fafafa",
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Share Capital (SC)"
                                    value={currentEntry.shareCapital || ""}
                                    onChange={(e) => handleFieldChange('shareCapital', e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <Box component="span" sx={{ mr: 1, color: 'text.secondary' }}>₹</Box>
                                        ),
                                    }}
                                    helperText="Company's share capital"
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Optional Deposit (OD)"
                                    value={currentEntry.optionalDeposit || ""}
                                    onChange={(e) => handleFieldChange('optionalDeposit', e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <Box component="span" sx={{ mr: 1, color: 'text.secondary' }}>₹</Box>
                                        ),
                                    }}
                                    helperText="Optional deposits if any"
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label="Compulsory (CD)"
                                    value={currentEntry.compulsory || ""}
                                    onChange={(e) => handleFieldChange('compulsory', e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <Box component="span" sx={{ mr: 1, color: 'text.secondary' }}>₹</Box>
                                        ),
                                    }}
                                    helperText="Compulsory Deposits"
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default FinancialDetailsForm;