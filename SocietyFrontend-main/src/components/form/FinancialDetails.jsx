import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    useTheme,
    alpha,
} from "@mui/material";
import {
    AccountBalance as FinanceIcon,
} from "@mui/icons-material";
import SectionHeader from "../../layout/SectionHeader";

const FinancialDetailsForm = ({ formData = {}, handleChange }) => {
    const theme = useTheme();
    const [errors, setErrors] = useState({});

    // Initialize with empty array if not exists
    const financialDetails = formData?.financialDetails || [];

    // Get the first entry or create a default one
    const currentEntry = financialDetails[0] || {
        shareCapital: "",
        optionalDeposit: "",
        compulsory: ""
    };

    // Validation function for numeric values
    const validateNumberField = (fieldName, value) => {
        if (!value || value.trim() === "") {
            clearError(fieldName);
            return true;
        }

        // Remove commas and spaces for validation
        const cleanValue = value.replace(/[,\s]/g, '');

        // Check if it's a valid number
        const isValid = /^\d+$/.test(cleanValue) && parseInt(cleanValue) >= 0;

        if (!isValid) {
            setError(fieldName, "Please enter a valid positive number");
        } else {
            clearError(fieldName);
        }

        return isValid;
    };

    // Format number with commas (Indian number format)
    const formatNumber = (value) => {
        // Remove all non-digit characters
        const cleanValue = value.replace(/[^\d]/g, '');

        if (cleanValue === '') return '';

        // Add commas for Indian numbering system
        return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Parse number (remove commas for storage)
    const parseNumber = (formattedValue) => {
        return formattedValue.replace(/[,\s]/g, '');
    };

    const setError = (fieldName, errorMessage) => {
        setErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
    };

    const clearError = (fieldName) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    const getError = (fieldName) => {
        return errors[fieldName] || null;
    };

    // Validate all fields
    const validateAllFields = () => {
        const newErrors = {};

        const fieldsToValidate = ["shareCapital", "optionalDeposit", "compulsory"];

        fieldsToValidate.forEach(field => {
            const value = currentEntry[field];
            const isValid = validateNumberField(field, value);
            if (!isValid) {
                newErrors[field] = getError(field) || "Please enter a valid positive number";
            }
        });

        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    // Handle field changes
    const handleFieldChange = (field, value) => {
        // Format the number for display
        const formattedValue = formatNumber(value);

        // Parse for storage (remove commas)
        const parsedValue = parseNumber(formattedValue);

        const updatedEntry = {
            ...currentEntry,
            [field]: formattedValue // Store formatted value for display
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
            // Store both formatted (for display) and parsed (for calculation) values
            handleChange('financialDetails', null, updatedDetails);
        }

        // Clear error when field is being edited
        clearError(field);

        // Validate field if it has value
        if (parsedValue) {
            validateNumberField(field, parsedValue);
        }
    };

    // Common text field styles
    const textFieldStyles = (fieldName) => ({
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
            },
            '&.Mui-focused': {
                backgroundColor: theme.palette.background.paper,
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
            },
            '&.Mui-error': {
                borderColor: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.05),
                '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                }
            }
        },
        '& .MuiInputLabel-root': {
            fontSize: '0.9rem',
            fontWeight: 500,
            '&.Mui-error': {
                color: theme.palette.error.main,
            }
        },
        '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            marginLeft: 0,
            '&.Mui-error': {
                color: theme.palette.error.main,
                fontWeight: 500,
            }
        }
    });

    // Calculate total
    const calculateTotal = () => {
        const shareCapital = parseInt(parseNumber(currentEntry.shareCapital) || 0);
        const optionalDeposit = parseInt(parseNumber(currentEntry.optionalDeposit) || 0);
        const compulsory = parseInt(parseNumber(currentEntry.compulsory) || 0);

        return shareCapital + optionalDeposit + compulsory;
    };

    const totalAmount = calculateTotal();

    return (
        <Box>
            <Card
                sx={{
                    borderRadius: 4,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                    mb: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
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
                }}
            >
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
                                <FinanceIcon
                                    sx={{
                                        color: theme.palette.primary.main,
                                        fontSize: 28
                                    }}
                                />
                            </Box>
                        }
                        title="Financial Details"
                        subtitle="Enter Share Capital (SC), Optional Deposit (OD), and Compulsory (CD) amounts"
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

                    <Box
                        sx={{
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            borderRadius: 3,
                            p: 4,
                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                            mb: 3,
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    label="Share Capital (SC)"
                                    value={currentEntry.shareCapital || ""}
                                    onChange={(e) => handleFieldChange('shareCapital', e.target.value)}
                                    onBlur={(e) => {
                                        const parsedValue = parseNumber(e.target.value);
                                        validateNumberField('shareCapital', parsedValue);
                                    }}
                                    error={!!getError('shareCapital')}
                                    helperText={getError('shareCapital') || "Company's share capital amount"}
                                    InputProps={{
                                        startAdornment: (
                                            <Box component="span" sx={{ mr: 1, color: 'text.secondary', fontWeight: 500 }}>₹</Box>
                                        ),
                                    }}
                                    placeholder="e.g., 50,000"
                                    fullWidth
                                    variant="outlined"
                                    sx={textFieldStyles('shareCapital')}
                                    inputProps={{
                                        inputMode: 'numeric',
                                        pattern: '[0-9,]*',
                                        maxLength: 15
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    label="Optional Deposit (OD)"
                                    value={currentEntry.optionalDeposit || ""}
                                    onChange={(e) => handleFieldChange('optionalDeposit', e.target.value)}
                                    onBlur={(e) => {
                                        const parsedValue = parseNumber(e.target.value);
                                        validateNumberField('optionalDeposit', parsedValue);
                                    }}
                                    error={!!getError('optionalDeposit')}
                                    helperText={getError('optionalDeposit') || "Optional deposits if any"}
                                    InputProps={{
                                        startAdornment: (
                                            <Box component="span" sx={{ mr: 1, color: 'text.secondary', fontWeight: 500 }}>₹</Box>
                                        ),
                                    }}
                                    placeholder="e.g., 10,000"
                                    fullWidth
                                    variant="outlined"
                                    sx={textFieldStyles('optionalDeposit')}
                                    inputProps={{
                                        inputMode: 'numeric',
                                        pattern: '[0-9,]*',
                                        maxLength: 15
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    label="Compulsory (CD)"
                                    value={currentEntry.compulsory || ""}
                                    onChange={(e) => handleFieldChange('compulsory', e.target.value)}
                                    onBlur={(e) => {
                                        const parsedValue = parseNumber(e.target.value);
                                        validateNumberField('compulsory', parsedValue);
                                    }}
                                    error={!!getError('compulsory')}
                                    helperText={getError('compulsory') || "Compulsory Deposits amount"}
                                    InputProps={{
                                        startAdornment: (
                                            <Box component="span" sx={{ mr: 1, color: 'text.secondary', fontWeight: 500 }}>₹</Box>
                                        ),
                                    }}
                                    placeholder="e.g., 5,000"
                                    fullWidth
                                    variant="outlined"
                                    sx={textFieldStyles('compulsory')}
                                    inputProps={{
                                        inputMode: 'numeric',
                                        pattern: '[0-9,]*',
                                        maxLength: 15
                                    }}
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