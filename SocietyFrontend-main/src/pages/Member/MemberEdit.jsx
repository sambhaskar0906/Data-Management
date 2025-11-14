import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Typography,
    Stack,
    Grid,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Snackbar,
    Card,
    CardContent
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
    fetchMemberById,
    updateMember,
    clearError,
    clearSuccessMessage
} from "../../features/member/memberSlice";

// Aapka existing FIELD_MAP (same as above)
const FIELD_MAP = {
    // ... same FIELD_MAP as in ViewPage
};

const getValueByPath = (obj, path) => {
    if (!path) return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
        if (cur === undefined || cur === null) return undefined;
        cur = cur[p];
    }
    return cur;
};

const setValueByPath = (obj, path, value) => {
    const parts = path.split(".");
    const newObj = JSON.parse(JSON.stringify(obj));
    let current = newObj;

    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
            current[parts[i]] = {};
        }
        current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
    return newObj;
};

const isMissing = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
};

// Simple Editable Field Component
const EditableField = ({ label, value, path, onUpdate, type = "text" }) => {
    const [editValue, setEditValue] = useState(value || '');

    const handleSave = () => {
        onUpdate(path, editValue);
    };

    const handleChange = (e) => {
        setEditValue(e.target.value);
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
                {label}
            </Typography>
            <input
                type={type}
                value={editValue}
                onChange={handleChange}
                onBlur={handleSave}
                style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                }}
            />
        </Box>
    );
};

export default function MemberEditPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const { selectedMember, loading, error, successMessage, operationLoading } = useSelector(state => state.members);
    const [formData, setFormData] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchMemberById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedMember) {
            setFormData(selectedMember);
        }
    }, [selectedMember]);

    useEffect(() => {
        if (error || successMessage) {
            setSnackbarOpen(true);
        }
    }, [error, successMessage]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
        if (error) dispatch(clearError());
        if (successMessage) dispatch(clearSuccessMessage());

        if (successMessage) {
            // Redirect to view page after successful update
            setTimeout(() => {
                navigate(`/member/view/${id}`);
            }, 1000);
        }
    };

    const handleFieldUpdate = (path, value) => {
        setFormData(prev => setValueByPath(prev, path, value));
    };

    const handleSave = () => {
        if (formData) {
            dispatch(updateMember({
                id: formData._id,
                formData: formData
            }));
        }
    };

    const handleCancel = () => {
        navigate(`/member/view/${id}`);
    };

    const handleBack = () => {
        navigate('/memberdetail');
    };

    if (loading && !formData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!formData) {
        return (
            <Box p={3}>
                <Alert severity="error">Member not found</Alert>
            </Box>
        );
    }

    // Group fields by category
    const fieldCategories = {
        personal: Object.keys(FIELD_MAP).filter(f => f.startsWith('personalDetails')),
        address: Object.keys(FIELD_MAP).filter(f => f.startsWith('addressDetails')),
        reference: Object.keys(FIELD_MAP).filter(f => f.startsWith('referenceDetails')),
        documents: Object.keys(FIELD_MAP).filter(f => f.startsWith('documents')),
        professional: Object.keys(FIELD_MAP).filter(f => f.startsWith('professionalDetails')),
        family: Object.keys(FIELD_MAP).filter(f => f.startsWith('familyDetails')),
        bank: Object.keys(FIELD_MAP).filter(f => f.startsWith('bankDetails')),
        guarantee: Object.keys(FIELD_MAP).filter(f => f.startsWith('guaranteeDetails')),
        loan: Object.keys(FIELD_MAP).filter(f => f.startsWith('loanDetails')),
    };

    return (
        <Box p={3}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={handleBack} color="primary">
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                            Edit Member: {getValueByPath(formData, "personalDetails.nameOfMember") || "Unknown"}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Membership No: {getValueByPath(formData, "personalDetails.membershipNumber") || "N/A"}
                        </Typography>
                    </Box>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        disabled={operationLoading.update}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        startIcon={operationLoading.update ? <CircularProgress size={16} /> : <SaveIcon />}
                        variant="contained"
                        onClick={handleSave}
                        disabled={operationLoading.update}
                    >
                        {operationLoading.update ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Stack>
            </Box>

            {/* Edit Form with Accordions */}
            <Grid container spacing={3}>
                {/* Personal Details */}
                <Grid item xs={12}>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" color="primary">
                                Personal Details
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                {fieldCategories.personal.map(fieldKey => (
                                    <Grid item xs={12} sm={6} md={4} key={fieldKey}>
                                        <Card variant="outlined" sx={{ p: 2 }}>
                                            <EditableField
                                                label={FIELD_MAP[fieldKey]}
                                                value={getValueByPath(formData, fieldKey)}
                                                path={fieldKey}
                                                onUpdate={handleFieldUpdate}
                                                type={fieldKey.includes('date') ? 'date' : 'text'}
                                            />
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Address Details */}
                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" color="primary">
                                Address Details
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                {fieldCategories.address.map(fieldKey => (
                                    <Grid item xs={12} sm={6} md={4} key={fieldKey}>
                                        <Card variant="outlined" sx={{ p: 2 }}>
                                            <EditableField
                                                label={FIELD_MAP[fieldKey]}
                                                value={getValueByPath(formData, fieldKey)}
                                                path={fieldKey}
                                                onUpdate={handleFieldUpdate}
                                            />
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Reference Details */}
                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" color="primary">
                                Reference & Guarantor Details
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                {fieldCategories.reference.map(fieldKey => (
                                    <Grid item xs={12} sm={6} key={fieldKey}>
                                        <Card variant="outlined" sx={{ p: 2 }}>
                                            <EditableField
                                                label={FIELD_MAP[fieldKey]}
                                                value={getValueByPath(formData, fieldKey)}
                                                path={fieldKey}
                                                onUpdate={handleFieldUpdate}
                                            />
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Document Details */}
                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" color="primary">
                                Document Details
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                {fieldCategories.documents.map(fieldKey => (
                                    <Grid item xs={12} sm={6} md={4} key={fieldKey}>
                                        <Card variant="outlined" sx={{ p: 2 }}>
                                            <EditableField
                                                label={FIELD_MAP[fieldKey]}
                                                value={getValueByPath(formData, fieldKey)}
                                                path={fieldKey}
                                                onUpdate={handleFieldUpdate}
                                            />
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Add more sections for other categories... */}

            </Grid>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={error ? 'error' : 'success'}
                    sx={{ width: '100%' }}
                >
                    {error || successMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}