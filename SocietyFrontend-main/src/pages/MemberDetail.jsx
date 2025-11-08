import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Stack,
    InputAdornment,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    Chip,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Switch,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    Alert,
    Snackbar,
    TableContainer
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import {
    fetchAllMembers,
    updateMember,
    deleteMember,
    clearError,
    clearSuccessMessage
} from "../features/member/memberSlice";

// Field mapping based on your MongoDB schema
const FIELD_MAP = {
    // Personal Details
    "personalDetails.nameOfMember": "Member Name",
    "personalDetails.membershipNumber": "Membership No",
    "personalDetails.nameOfFather": "Father's Name",
    "personalDetails.nameOfMother": "Mother's Name",
    "personalDetails.dateOfBirth": "Date of Birth",
    "personalDetails.ageInYears": "Age (Years)",
    "personalDetails.membershipDate": "Membership Date",
    "personalDetails.amountInCredit": "Amount In Credit",
    "personalDetails.gender": "Gender",
    "personalDetails.maritalStatus": "Marital Status",
    "personalDetails.religion": "Religion",
    "personalDetails.caste": "Caste",
    "personalDetails.phoneNo": "Phone No",
    "personalDetails.alternatePhoneNo": "Alternate Phone",
    "personalDetails.emailId": "Email",

    // Address - Permanent
    "addressDetails.permanentAddress.flatHouseNo": "Permanent - Flat/House No",
    "addressDetails.permanentAddress.areaStreetSector": "Permanent - Area/Street/Sector",
    "addressDetails.permanentAddress.locality": "Permanent - Locality",
    "addressDetails.permanentAddress.landmark": "Permanent - Landmark",
    "addressDetails.permanentAddress.city": "Permanent - City",
    "addressDetails.permanentAddress.country": "Permanent - Country",
    "addressDetails.permanentAddress.state": "Permanent - State",
    "addressDetails.permanentAddress.pincode": "Permanent - Pincode",
    "addressDetails.permanentAddressBillPhoto": "Permanent - Bill Photo",

    // Address - Current
    "addressDetails.currentResidentalAddress.flatHouseNo": "Current - Flat/House No",
    "addressDetails.currentResidentalAddress.areaStreetSector": "Current - Area/Street/Sector",
    "addressDetails.currentResidentalAddress.locality": "Current - Locality",
    "addressDetails.currentResidentalAddress.landmark": "Current - Landmark",
    "addressDetails.currentResidentalAddress.city": "Current - City",
    "addressDetails.currentResidentalAddress.country": "Current - Country",
    "addressDetails.currentResidentalAddress.state": "Current - State",
    "addressDetails.currentResidentalAddress.pincode": "Current - Pincode",
    "addressDetails.currentResidentalBillPhoto": "Current - Bill Photo",
    "addressDetails.previousCurrentAddress": "Previous Addresses",

    // References & Guarantors
    "referenceDetails.referenceName": "Reference Name",
    "referenceDetails.referenceMno": "Reference Mobile",
    "referenceDetails.guarantorName": "Guarantor Name",
    "referenceDetails.gurantorMno": "Guarantor Mobile(s)",

    // Documents
    "documents.passportSize": "Passport Size Photo",
    "documents.panNo": "PAN No",
    "documents.rationCard": "Ration Card",
    "documents.drivingLicense": "Driving License",
    "documents.aadhaarNo": "Aadhaar No",
    "documents.voterId": "Voter ID",
    "documents.passportNo": "Passport No",
    "documents.panNoPhoto": "PAN Photo",
    "documents.rationCardPhoto": "Ration Card Photo",
    "documents.drivingLicensePhoto": "DL Photo",
    "documents.aadhaarNoPhoto": "Aadhaar Photo",
    "documents.voterIdPhoto": "Voter ID Photo",
    "documents.passportNoPhoto": "Passport Photo",

    // Professional Details
    "professionalDetails.qualification": "Qualification",
    "professionalDetails.occupation": "Occupation",

    // Family Details
    "familyDetails.familyMembersMemberOfSociety": "Family Members in Society",
    "familyDetails.familyMember": "Family Member Names",
    "familyDetails.familyMemberNo": "Family Member Phones",

    // Bank Details
    "bankDetails.bankName": "Bank Name",
    "bankDetails.branch": "Bank Branch",
    "bankDetails.accountNumber": "Account Number",
    "bankDetails.ifscCode": "IFSC Code",

    // Guarantee Details
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOtherSociety": "Guarantee Given in Other Society",
    "guaranteeDetails.otherSociety": "Other Society Guarantees",
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOurSociety": "Guarantee Given in Our Society",
    "guaranteeDetails.ourSociety": "Our Society Guarantees",

    // Loan Details
    "loanDetails": "Loan Details",
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

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog = ({ open, onClose, onConfirm, member, loading }) => {
    const memberName = getValueByPath(member, 'personalDetails.nameOfMember') || 'Unknown';
    const membershipNumber = getValueByPath(member, 'personalDetails.membershipNumber') || 'N/A';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <ErrorOutlineIcon color="error" />
                    <Typography variant="h6">Confirm Delete</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    Are you sure you want to delete the following member? This action cannot be undone.
                </Typography>
                <Box sx={{ p: 2, backgroundColor: '#fff5f5', borderRadius: 1, mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {memberName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Membership No: {membershipNumber}
                    </Typography>
                </Box>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    This will permanently delete all member data including personal details, addresses, documents, and loan information.
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
                    disabled={loading}
                >
                    {loading ? 'Deleting...' : 'Delete Member'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Editable Field Component
const EditableField = ({ label, value, path, onUpdate, type = "text", options = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleSave = () => {
        onUpdate(path, editValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const renderViewMode = () => (
        <Box
            sx={{
                p: 1,
                border: '1px solid transparent',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                    border: '1px solid #1976d2',
                    backgroundColor: '#f0f8ff'
                }
            }}
            onClick={() => setIsEditing(true)}
        >
            <Typography variant="body2">
                {isMissing(value) ? (
                    <span style={{ color: 'red', fontStyle: 'italic' }}>Not set - Click to edit</span>
                ) : Array.isArray(value) ? (
                    value.join(', ')
                ) : typeof value === 'object' ? (
                    JSON.stringify(value)
                ) : (
                    value.toString()
                )}
            </Typography>
        </Box>
    );

    const renderEditMode = () => {
        if (type === "select") {
            return (
                <FormControl fullWidth size="small">
                    <Select
                        value={editValue || ''}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyPress={handleKeyPress}
                        autoFocus
                    >
                        {options.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }

        if (type === "textarea") {
            return (
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editValue || ''}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyPress={handleKeyPress}
                    autoFocus
                    size="small"
                />
            );
        }

        return (
            <TextField
                fullWidth
                value={editValue || ''}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyPress={handleKeyPress}
                autoFocus
                size="small"
                type={type}
            />
        );
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
                {label}
            </Typography>
            {isEditing ? renderEditMode() : renderViewMode()}
        </Box>
    );
};

// Array Field Component
const EditableArrayField = ({ label, values, path, onUpdate }) => {
    const [localItems, setLocalItems] = useState(values || []);
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim()) {
            const updatedItems = [...localItems, newItem.trim()];
            setLocalItems(updatedItems);
            onUpdate(path, updatedItems);
            setNewItem('');
        }
    };

    const handleRemoveItem = (index) => {
        const updatedItems = localItems.filter((_, i) => i !== index);
        setLocalItems(updatedItems);
        onUpdate(path, updatedItems);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddItem();
        }
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
                {label}
            </Typography>
            <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 1 }}>
                {localItems.map((item, index) => (
                    <Box key={index} sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 0.5,
                        borderBottom: index < localItems.length - 1 ? '1px solid #eee' : 'none'
                    }}>
                        <Typography variant="body2">{item}</Typography>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                        size="small"
                        placeholder="Add new item..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyPress={handleKeyPress}
                        fullWidth
                    />
                    <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddItem}
                        variant="outlined"
                    >
                        Add
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

// Object Field Component
const EditableObjectField = ({ label, value, path, onUpdate, fields }) => {
    const handleFieldUpdate = (fieldPath, fieldValue) => {
        const currentValue = value || {};
        const updatedValue = { ...currentValue, [fieldPath]: fieldValue };
        onUpdate(path, updatedValue);
    };

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" color="primary">
                    {label}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>
                    {fields.map(field => (
                        <Grid size={{ xs: 12, sm: 6 }} key={field.key}>
                            <EditableField
                                label={field.label}
                                value={value?.[field.key] || ''}
                                path={field.key}
                                onUpdate={handleFieldUpdate}
                                type={field.type}
                                options={field.options}
                            />
                        </Grid>
                    ))}
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};

// Complex Array Field Component (for loans, guarantees, etc.)
const EditableComplexArrayField = ({ label, items, path, onUpdate, fields }) => {
    const [localItems, setLocalItems] = useState(items || []);

    const handleAddItem = () => {
        const newItem = fields.reduce((acc, field) => {
            acc[field.key] = field.default || '';
            return acc;
        }, {});
        const updatedItems = [...localItems, newItem];
        setLocalItems(updatedItems);
        onUpdate(path, updatedItems);
    };

    const handleRemoveItem = (index) => {
        const updatedItems = localItems.filter((_, i) => i !== index);
        setLocalItems(updatedItems);
        onUpdate(path, updatedItems);
    };

    const handleItemUpdate = (index, field, value) => {
        const updatedItems = localItems.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setLocalItems(updatedItems);
        onUpdate(path, updatedItems);
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="primary">
                    {label}
                </Typography>
                <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    variant="outlined"
                >
                    Add
                </Button>
            </Box>

            {localItems.map((item, index) => (
                <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2">
                                Item {index + 1}
                            </Typography>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveItem(index);
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            {fields.map(field => (
                                <Grid size={{ xs: 12, sm: 6 }} key={field.key}>
                                    <EditableField
                                        label={field.label}
                                        value={item[field.key] || ''}
                                        path={field.key}
                                        onUpdate={(fieldPath, value) => handleItemUpdate(index, fieldPath, value)}
                                        type={field.type}
                                        options={field.options}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            ))}

            {localItems.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No items added. Click "Add" to create one.
                </Typography>
            )}
        </Box>
    );
};

// Member View Component with Edit Mode
const MemberView = ({ member, open, onClose, onSave, onDelete, loading }) => {
    const [viewType, setViewType] = useState('all');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState(member);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        setFormData(member);
    }, [member]);

    const handleFieldUpdate = (path, value) => {
        setFormData(prev => setValueByPath(prev, path, value));
    };

    const handleSave = () => {
        onSave(formData);
        setEditMode(false);
    };

    const handleCancel = () => {
        setFormData(member);
        setEditMode(false);
    };

    const handleDelete = () => {
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        onDelete(member._id);
        setDeleteDialogOpen(false);
    };

    const formatValue = (value) => {
        if (isMissing(value)) return <span style={{ color: "red", fontWeight: "bold" }}>Missing</span>;
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "object" && value !== null && !(value instanceof Date)) {
            return Object.entries(value).map(([k, v]) => (
                <div key={k}><strong>{k}:</strong> {formatValue(v)}</div>
            ));
        }
        if (typeof value === "boolean") return value ? "Yes" : "No";
        return value?.toString() || "";
    };

    const filteredFields = Object.keys(FIELD_MAP).filter(fieldKey => {
        const value = getValueByPath(formData, fieldKey);
        const missing = isMissing(value);

        if (viewType === 'all') return true;
        if (viewType === 'missing') return missing;
        if (viewType === 'filled') return !missing;
        return true;
    });

    const missingCount = Object.keys(FIELD_MAP).filter(f => isMissing(getValueByPath(formData, f))).length;
    const filledCount = Object.keys(FIELD_MAP).length - missingCount;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        const memberName = getValueByPath(formData, 'personalDetails.nameOfMember') || 'Unknown';

        printWindow.document.write(`
            <html>
                <head>
                    <title>${memberName} - Complete Details</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                        h1 { text-align: center; color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px; }
                        .section { margin: 20px 0; }
                        .section-title { background: #1976d2; color: white; padding: 10px; font-weight: bold; }
                        .field { margin: 8px 0; padding: 8px; border-bottom: 1px solid #eee; }
                        .field-label { font-weight: bold; color: #555; }
                        .field-value { margin-left: 10px; }
                        .missing { color: red; font-weight: bold; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <h1>Member Complete Details - ${memberName}</h1>
                    ${Object.keys(FIELD_MAP).map(fieldKey => {
            const value = getValueByPath(formData, fieldKey);
            const missing = isMissing(value);
            return `
                            <div class="field">
                                <span class="field-label">${FIELD_MAP[fieldKey]}:</span>
                                <span class="field-value ${missing ? 'missing' : ''}">
                                    ${missing ? 'Missing' : formatValue(value).toString()}
                                </span>
                            </div>
                        `;
        }).join('')}
                    <script>
                        window.onload = function() { window.print(); setTimeout(() => window.close(), 500); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!member) return null;

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { minHeight: '80vh' } }}>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">
                            {editMode ? 'Edit' : 'View'} Member: {getValueByPath(formData, "personalDetails.nameOfMember") || "Unknown"}
                            {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
                        </Typography>
                        <IconButton onClick={onClose} disabled={loading}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Tabs value={viewType} onChange={(e, newValue) => setViewType(newValue)}>
                            <Tab value="all" label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography>All Fields</Typography>
                                    <Chip label={Object.keys(FIELD_MAP).length} size="small" variant="outlined" />
                                </Box>
                            } />
                            <Tab value="missing" label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <ErrorOutlineIcon color="error" fontSize="small" />
                                    <Typography>Missing Fields</Typography>
                                    <Chip label={missingCount} size="small" color="error" variant="outlined" />
                                </Box>
                            } />
                            <Tab value="filled" label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CheckCircleOutlineIcon color="success" fontSize="small" />
                                    <Typography>Filled Fields</Typography>
                                    <Chip label={filledCount} size="small" color="success" variant="outlined" />
                                </Box>
                            } />
                        </Tabs>

                        <Box>
                            {editMode ? (
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        startIcon={<CancelIcon />}
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                                        variant="contained"
                                        onClick={handleSave}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </Button>
                                </Stack>
                            ) : (
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        startIcon={<DeleteIcon />}
                                        variant="outlined"
                                        color="error"
                                        onClick={handleDelete}
                                        disabled={loading}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        startIcon={<EditIcon />}
                                        variant="contained"
                                        onClick={() => setEditMode(true)}
                                        disabled={loading}
                                    >
                                        Edit All Fields
                                    </Button>
                                </Stack>
                            )}
                        </Box>
                    </Box>
                </Box>

                <DialogContent dividers sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                    {editMode ? (
                        // EDIT MODE - All fields editable
                        <Grid container spacing={3}>
                            {/* Personal Details */}
                            <Grid size={{ xs: 12 }}>
                                <Accordion defaultExpanded>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6" color="primary">
                                            Personal Details
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            {Object.keys(FIELD_MAP)
                                                .filter(f => f.startsWith('personalDetails'))
                                                .map(fieldKey => (
                                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fieldKey}>
                                                        <EditableField
                                                            label={FIELD_MAP[fieldKey]}
                                                            value={getValueByPath(formData, fieldKey)}
                                                            path={fieldKey}
                                                            onUpdate={handleFieldUpdate}
                                                            type={fieldKey.includes('date') ? 'date' : 'text'}
                                                        />
                                                    </Grid>
                                                ))}
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>

                            {/* Address Details */}
                            <Grid item xs={12}>
                                <Accordion defaultExpanded>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6" color="primary">
                                            Address Details
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            {/* Permanent Address */}
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <EditableObjectField
                                                    label="Permanent Address"
                                                    value={getValueByPath(formData, 'addressDetails.permanentAddress')}
                                                    path="addressDetails.permanentAddress"
                                                    onUpdate={handleFieldUpdate}
                                                    fields={[
                                                        { key: 'flatHouseNo', label: 'Flat/House No' },
                                                        { key: 'areaStreetSector', label: 'Area/Street/Sector' },
                                                        { key: 'locality', label: 'Locality' },
                                                        { key: 'landmark', label: 'Landmark' },
                                                        { key: 'city', label: 'City' },
                                                        { key: 'country', label: 'Country' },
                                                        { key: 'state', label: 'State' },
                                                        { key: 'pincode', label: 'Pincode' },
                                                    ]}
                                                />
                                            </Grid>

                                            {/* Current Address */}
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <EditableObjectField
                                                    label="Current Address"
                                                    value={getValueByPath(formData, 'addressDetails.currentResidentalAddress')}
                                                    path="addressDetails.currentResidentalAddress"
                                                    onUpdate={handleFieldUpdate}
                                                    fields={[
                                                        { key: 'flatHouseNo', label: 'Flat/House No' },
                                                        { key: 'areaStreetSector', label: 'Area/Street/Sector' },
                                                        { key: 'locality', label: 'Locality' },
                                                        { key: 'landmark', label: 'Landmark' },
                                                        { key: 'city', label: 'City' },
                                                        { key: 'country', label: 'Country' },
                                                        { key: 'state', label: 'State' },
                                                        { key: 'pincode', label: 'Pincode' },
                                                    ]}
                                                />
                                            </Grid>

                                            {/* Previous Addresses */}
                                            <Grid size={{ xs: 12 }}>
                                                <EditableArrayField
                                                    label="Previous Addresses"
                                                    values={getValueByPath(formData, 'addressDetails.previousCurrentAddress')}
                                                    path="addressDetails.previousCurrentAddress"
                                                    onUpdate={handleFieldUpdate}
                                                />
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>

                            {/* Reference Details */}
                            <Grid size={{ xs: 12 }}>
                                <Accordion defaultExpanded>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6" color="primary">
                                            Reference & Guarantor Details
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            {Object.keys(FIELD_MAP)
                                                .filter(f => f.startsWith('referenceDetails') && !f.includes('gurantorMno'))
                                                .map(fieldKey => (
                                                    <Grid size={{ xs: 12, sm: 6 }} key={fieldKey}>
                                                        <EditableField
                                                            label={FIELD_MAP[fieldKey]}
                                                            value={getValueByPath(formData, fieldKey)}
                                                            path={fieldKey}
                                                            onUpdate={handleFieldUpdate}
                                                        />
                                                    </Grid>
                                                ))}
                                            <Grid size={{ xs: 12 }}>
                                                <EditableArrayField
                                                    label="Guarantor Mobile Numbers"
                                                    values={getValueByPath(formData, 'referenceDetails.gurantorMno')}
                                                    path="referenceDetails.gurantorMno"
                                                    onUpdate={handleFieldUpdate}
                                                />
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>

                            {/* Add more sections for Documents, Professional, Family, Bank, Guarantee, Loan details */}
                            {/* Documents Section */}
                            <Grid size={{ xs: 12 }}>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6" color="primary">
                                            Document Details
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            {Object.keys(FIELD_MAP)
                                                .filter(f => f.startsWith('documents'))
                                                .map(fieldKey => (
                                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fieldKey}>
                                                        <EditableField
                                                            label={FIELD_MAP[fieldKey]}
                                                            value={getValueByPath(formData, fieldKey)}
                                                            path={fieldKey}
                                                            onUpdate={handleFieldUpdate}
                                                        />
                                                    </Grid>
                                                ))}
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>

                            {/* Loan Details */}
                            <Grid size={{ xs: 12 }}>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6" color="primary">
                                            Loan Details
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <EditableComplexArrayField
                                            label="Loans"
                                            items={getValueByPath(formData, 'loanDetails')}
                                            path="loanDetails"
                                            onUpdate={handleFieldUpdate}
                                            fields={[
                                                { key: 'loanType', label: 'Loan Type' },
                                                { key: 'amount', label: 'Amount' },
                                                { key: 'purpose', label: 'Purpose' },
                                                { key: 'dateOfLoan', label: 'Date of Loan', type: 'date' },
                                            ]}
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>

                        </Grid>
                    ) : (
                        // VIEW MODE - Read only with tabs
                        <Grid container spacing={2}>
                            {filteredFields.map((fieldKey) => {
                                const fieldName = FIELD_MAP[fieldKey];
                                const value = getValueByPath(formData, fieldKey);
                                const missing = isMissing(value);

                                return (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fieldKey}>
                                        <Card variant="outlined" sx={{
                                            borderColor: missing ? 'error.main' : 'success.main',
                                            backgroundColor: missing ? '#fff5f5' : '#f5fff5'
                                        }}>
                                            <CardContent sx={{ p: 2 }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                    {missing ? (
                                                        <ErrorOutlineIcon color="error" fontSize="small" />
                                                    ) : (
                                                        <CheckCircleOutlineIcon color="success" fontSize="small" />
                                                    )}
                                                    <Typography variant="subtitle2" color={missing ? "error" : "success"}>
                                                        {fieldName}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                    {formatValue(value)}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}

                            {filteredFields.length === 0 && (
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="h6" color="text.secondary">
                                            {viewType === 'missing'
                                                ? "No missing fields found!"
                                                : "No filled fields found!"}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>Close</Button>
                    {!editMode && (
                        <Button
                            startIcon={<PrintIcon />}
                            variant="contained"
                            onClick={handlePrint}
                            disabled={loading}
                        >
                            Print
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                member={member}
                loading={loading}
            />
        </>
    );
};

// Main Component
export default function MemberDetailsPage() {
    const dispatch = useDispatch();
    const { members, loading, error, successMessage, operationLoading } = useSelector(state => state.members);

    const [query, setQuery] = useState("");
    const [selectedMember, setSelectedMember] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchAllMembers());
    }, [dispatch]);

    useEffect(() => {
        if (error || successMessage) {
            setSnackbarOpen(true);
        }
    }, [error, successMessage]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
        if (error) dispatch(clearError());
        if (successMessage) dispatch(clearSuccessMessage());
    };

    const filteredMembers = useMemo(() => {
        const q = query.toLowerCase();
        return members.filter(member => {
            const name = getValueByPath(member, 'personalDetails.nameOfMember') || '';
            const memberNo = getValueByPath(member, 'personalDetails.membershipNumber') || '';
            const phone = getValueByPath(member, 'personalDetails.phoneNo') || '';
            const email = getValueByPath(member, 'personalDetails.emailId') || '';

            return (
                name.toLowerCase().includes(q) ||
                memberNo.toLowerCase().includes(q) ||
                phone.toLowerCase().includes(q) ||
                email.toLowerCase().includes(q)
            );
        });
    }, [query, members]);

    const handleView = (member) => {
        setSelectedMember(member);
        setViewDialogOpen(true);
    };

    const handleSave = (updatedMember) => {
        dispatch(updateMember({
            id: updatedMember._id,
            formData: updatedMember
        }));
    };

    const handleDeleteClick = (member) => {
        setMemberToDelete(member);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (memberToDelete) {
            dispatch(deleteMember(memberToDelete._id));
            setDeleteDialogOpen(false);
            setMemberToDelete(null);
        }
    };

    const handleDeleteInView = (memberId) => {
        dispatch(deleteMember(memberId));
        setViewDialogOpen(false);
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                Member Details Management
            </Typography>

            {/* Loading Indicator */}
            {loading && (
                <Box display="flex" justifyContent="center" my={2}>
                    <CircularProgress />
                </Box>
            )}

            {/* Search Field */}
            <TextField
                placeholder="Search by name, membership number, phone, or email..."
                fullWidth
                size="small"
                sx={{ mb: 3 }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Members Table */}
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '80px' }}>S.No</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Member No</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>City</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">
                                        {loading ? 'Loading members...' : 'No members found matching your search criteria'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMembers.map((member, index) => (
                                <TableRow
                                    key={member._id}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5',
                                            cursor: 'pointer'
                                        }
                                    }}
                                >
                                    <TableCell>
                                        <Typography fontWeight="medium" align="center">
                                            {index + 1}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="medium">
                                            {getValueByPath(member, 'personalDetails.membershipNumber')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="medium">
                                            {getValueByPath(member, 'personalDetails.nameOfMember')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{getValueByPath(member, 'personalDetails.phoneNo')}</TableCell>
                                    <TableCell>{getValueByPath(member, 'personalDetails.emailId')}</TableCell>
                                    <TableCell>
                                        {getValueByPath(member, 'addressDetails.currentResidentalAddress.city')}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                onClick={() => handleView(member)}
                                                title="View & Edit Complete Details"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => handleDeleteClick(member)}
                                                title="Delete Member"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* View & Edit Dialog */}
            <MemberView
                member={selectedMember}
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                onSave={handleSave}
                onDelete={handleDeleteInView}
                loading={operationLoading.update || operationLoading.delete}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                member={memberToDelete}
                loading={operationLoading.delete}
            />

            {/* Snackbar for notifications */}
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