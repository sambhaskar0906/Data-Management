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
import jsPDF from "jspdf";
import 'jspdf-autotable';
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import {
    fetchAllMembers,
    updateMember,
    deleteMember,
    clearError,
    clearSuccessMessage
} from "../../features/member/memberSlice";

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
    "bankDetails.civilScore": "Civil Score", // ✅ Civil Score added

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

// PDF Generation Functions
const generateMemberPDF = (member) => {
    const doc = new jsPDF();
    const memberName = getValueByPath(member, 'personalDetails.nameOfMember') || 'Unknown';
    const membershipNumber = getValueByPath(member, 'personalDetails.membershipNumber') || 'N/A';

    // Title
    doc.setFontSize(16);
    doc.setTextColor(40, 53, 147);
    doc.text(`Member Details - ${memberName}`, 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Membership Number: ${membershipNumber} | Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

    let yPosition = 35;

    // Function to add section
    const addSection = (title, fields, data) => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(40, 53, 147);
        doc.text(title, 14, yPosition);
        yPosition += 8;

        doc.setDrawColor(200, 200, 200);
        doc.line(14, yPosition, 196, yPosition);
        yPosition += 5;

        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);

        fields.forEach(fieldKey => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }

            const fieldName = FIELD_MAP[fieldKey];
            const value = getValueByPath(data, fieldKey);
            const displayValue = formatValueForPDF(value);

            doc.text(`${fieldName}:`, 16, yPosition);
            doc.setTextColor(20, 20, 20);
            doc.text(displayValue, 70, yPosition);
            doc.setTextColor(80, 80, 80);

            yPosition += 6;
        });

        yPosition += 10;
    };

    // Personal Details
    const personalFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('personalDetails'));
    addSection('Personal Details', personalFields, member);

    // Address Details
    const addressFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('addressDetails'));
    addSection('Address Details', addressFields, member);

    // Reference Details
    const referenceFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('referenceDetails'));
    addSection('Reference & Guarantor Details', referenceFields, member);

    // Document Details
    const documentFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('documents'));
    addSection('Document Details', documentFields, member);

    // Professional Details
    const professionalFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('professionalDetails'));
    addSection('Professional Details', professionalFields, member);

    // Family Details
    const familyFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('familyDetails'));
    addSection('Family Details', familyFields, member);

    // Bank Details
    const bankFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('bankDetails'));
    addSection('Bank Details', bankFields, member);

    // Guarantee Details
    const guaranteeFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('guaranteeDetails'));
    addSection('Guarantee Details', guaranteeFields, member);

    // Loan Details
    const loanFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('loanDetails'));
    addSection('Loan Details', loanFields, member);

    // Save the PDF
    doc.save(`Member_${membershipNumber}_${memberName.replace(/\s+/g, '_')}.pdf`);
};

const generateMembersListPDF = (members) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text('Members List Report', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Total Members: ${members.length}`, 105, 28, { align: 'center' });

    // Manual table creation
    let yPosition = 40;
    const lineHeight = 8;
    const colWidths = [15, 25, 35, 30, 45, 25, 20, 25]; // Column widths
    const pageHeight = doc.internal.pageSize.height;

    // Table headers
    const headers = ['S.No', 'Member No', 'Name', 'Phone', 'Email', 'City', 'Civil Score', 'Status'];

    // Draw header background
    doc.setFillColor(40, 53, 147);
    doc.rect(10, yPosition, 190, 10, 'F');

    // Draw header text
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    let xPosition = 12;
    headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition + 7);
        xPosition += colWidths[index];
    });

    yPosition += 12;

    // Table data
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);

    members.forEach((member, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;

            // Redraw headers on new page
            doc.setFillColor(40, 53, 147);
            doc.rect(10, yPosition, 190, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(9);
            let newX = 12;
            headers.forEach((header, idx) => {
                doc.text(header, newX, yPosition + 7);
                newX += colWidths[idx];
            });
            yPosition += 12;
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
        }

        const civilScore = getValueByPath(member, 'bankDetails.civilScore') || 'N/A';
        const civilScoreColor = civilScore >= 700 ? '#2e7d32' : civilScore >= 600 ? '#ed6c02' : '#d32f2f';

        const rowData = [
            (index + 1).toString(),
            truncateText(getValueByPath(member, 'personalDetails.membershipNumber') || 'N/A', 10),
            truncateText(getValueByPath(member, 'personalDetails.nameOfMember') || 'Unknown', 15),
            truncateText(getValueByPath(member, 'personalDetails.phoneNo') || 'N/A', 12),
            truncateText(getValueByPath(member, 'personalDetails.emailId') || 'N/A', 20),
            truncateText(getValueByPath(member, 'addressDetails.currentResidentalAddress.city') || 'N/A', 12),
            civilScore.toString(),
            'Active'
        ];

        // Draw row data
        xPosition = 12;
        rowData.forEach((cell, cellIndex) => {
            if (cellIndex === 6) { // Civil Score column
                doc.setTextColor(civilScoreColor);
            } else {
                doc.setTextColor(0, 0, 0);
            }
            doc.text(cell, xPosition, yPosition + 5);
            xPosition += colWidths[cellIndex];
        });

        // Draw horizontal line
        doc.setDrawColor(200, 200, 200);
        doc.line(10, yPosition + 7, 200, yPosition + 7);

        yPosition += lineHeight;
    });

    // Summary section
    if (yPosition < pageHeight - 20) {
        doc.setFontSize(10);
        doc.setTextColor(40, 53, 147);
        doc.text('Summary:', 14, yPosition + 10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Members: ${members.length}`, 14, yPosition + 17);

        // Civil Score Summary
        const scores = members.map(m => getValueByPath(m, 'bankDetails.civilScore')).filter(s => s && !isNaN(s));
        if (scores.length > 0) {
            const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
            doc.text(`Average Civil Score: ${avgScore}`, 14, yPosition + 24);
        }
    }

    doc.save(`Members_List_${new Date().toISOString().split('T')[0]}.pdf`);
};

// MemberView component ke andar
const handleAddressUpdate = () => {
    const currentFormData = { ...formData };

    // Get current address (jo ab previous banega)
    const currentAddress = getValueByPath(currentFormData, 'addressDetails.currentResidentalAddress');

    // Get existing previous addresses
    const previousAddresses = getValueByPath(currentFormData, 'addressDetails.previousCurrentAddress') || [];

    // Check if current address is not empty and different from the last previous address
    if (currentAddress &&
        Object.keys(currentAddress).some(key => currentAddress[key]) &&
        !isAddressEqual(currentAddress, previousAddresses[0])) {

        // Add current address to previous addresses (at beginning)
        const updatedPreviousAddresses = [currentAddress, ...previousAddresses];

        // Update form data with new previous addresses
        currentFormData.addressDetails.previousCurrentAddress = updatedPreviousAddresses;

        // Set form data
        setFormData(currentFormData);

        // Show success message
        alert('Current address moved to previous addresses! Now you can enter new current address.');
    } else {
        alert('Current address is empty or same as previous address. No changes made.');
    }
};

// Helper function to compare two addresses
const isAddressEqual = (addr1, addr2) => {
    if (!addr1 || !addr2) return false;

    const keys = ['flatHouseNo', 'areaStreetSector', 'locality', 'landmark', 'city', 'country', 'state', 'pincode'];
    return keys.every(key => addr1[key] === addr2[key]);
};

// Helper function to truncate long text
const truncateText = (text, maxLength) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatValueForPDF = (value) => {
    if (isMissing(value)) return 'Not Provided';

    // Check if value is a URL (image link)
    if (typeof value === "string" && (value.startsWith('http') || value.startsWith('https'))) {
        return 'Image Available';
    }

    if (Array.isArray(value)) {
        // Handle array of objects
        if (value.length > 0 && typeof value[0] === 'object') {
            return value.map(item =>
                Object.entries(item)
                    .map(([k, v]) => `${k}: ${formatValueForPDF(v)}`)
                    .join('; ')
            ).join(' | ');
        }
        return value.join(', ');
    }

    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([k, v]) => `${k}: ${formatValueForPDF(v)}`)
            .join('; ');
    }

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value.toString();
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

        // Check if value is a URL (image link)
        if (typeof value === "string" && (value.startsWith('http') || value.startsWith('https'))) {
            return (
                <Box>
                    <img
                        src={value}
                        alt="Document"
                        style={{
                            maxWidth: '100px',
                            maxHeight: '100px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                            View Full Image
                        </a>
                    </Typography>
                </Box>
            );
        }

        if (Array.isArray(value)) {
            // Handle array of objects (like ourSociety, loanDetails)
            if (value.length > 0 && typeof value[0] === 'object') {
                return (
                    <Box>
                        {value.map((item, index) => (
                            <Card key={index} variant="outlined" sx={{ mb: 1, p: 1 }}>
                                {Object.entries(item).map(([key, val]) => (
                                    <Typography key={key} variant="body2">
                                        <strong>{key}:</strong> {formatSingleValue(val)}
                                    </Typography>
                                ))}
                            </Card>
                        ))}
                    </Box>
                );
            }
            return value.join(", ");
        }

        if (typeof value === "object" && value !== null && !(value instanceof Date)) {
            return Object.entries(value).map(([k, v]) => (
                <div key={k}><strong>{k}:</strong> {formatValue(v)}</div>
            ));
        }

        if (typeof value === "boolean") return value ? "Yes" : "No";
        return value?.toString() || "";
    };

    // Helper function for single values (to avoid recursion)
    const formatSingleValue = (value) => {
        if (isMissing(value)) return 'Missing';
        if (typeof value === "string" && (value.startsWith('http') || value.startsWith('https'))) {
            return "Image Available";
        }
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "object") return JSON.stringify(value);
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

                                            {/* Current Address - With Special Update Logic */}
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Accordion defaultExpanded>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                        <Typography variant="h6" color="primary">
                                                            Current Residential Address
                                                        </Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        {editMode ? (
                                                            <Box>
                                                                <Box sx={{ mb: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                                                                    <Typography variant="body2" color="warning.main" gutterBottom>
                                                                        <strong>Note:</strong> To update address, first click "Move to Previous" then enter new address
                                                                    </Typography>
                                                                </Box>

                                                                {/* Move Current to Previous Button */}
                                                                <Button
                                                                    variant="outlined"
                                                                    color="warning"
                                                                    startIcon={<SaveIcon />}
                                                                    onClick={handleAddressUpdate}
                                                                    sx={{ mb: 2 }}
                                                                    fullWidth
                                                                >
                                                                    Move Current Address to Previous
                                                                </Button>

                                                                {/* Current Address Fields */}
                                                                <EditableObjectField
                                                                    label="Enter New Current Address"
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
                                                            </Box>
                                                        ) : (
                                                            // VIEW MODE - Display current address
                                                            <Box>
                                                                {Object.entries(getValueByPath(formData, 'addressDetails.currentResidentalAddress') || {}).map(([key, value]) => (
                                                                    <Box key={key} sx={{ mb: 1 }}>
                                                                        <Typography variant="subtitle2" color="primary">
                                                                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            {value || 'Not provided'}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </AccordionDetails>
                                                </Accordion>
                                            </Grid>
                                            {/* Previous Addresses */}
                                            <Grid size={{ xs: 12 }}>
                                                <Accordion>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                            <Typography variant="h6" color="primary">
                                                                Previous Address History
                                                            </Typography>
                                                            <Chip
                                                                label={`${getValueByPath(formData, 'addressDetails.previousCurrentAddress')?.length || 0} addresses`}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                        </Box>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        {(getValueByPath(formData, 'addressDetails.previousCurrentAddress') || []).length > 0 ? (
                                                            (getValueByPath(formData, 'addressDetails.previousCurrentAddress') || []).map((address, index) => (
                                                                <Card key={index} variant="outlined" sx={{ mb: 2, p: 2, backgroundColor: index === 0 ? '#e8f5e8' : '#f8f9fa' }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                        <Typography variant="subtitle1" color={index === 0 ? "success.main" : "text.primary"}>
                                                                            {index === 0 ? "Most Recent Previous Address" : `Previous Address ${index + 1}`}
                                                                        </Typography>
                                                                        <Chip
                                                                            label={index === 0 ? "Latest" : `#${index + 1}`}
                                                                            size="small"
                                                                            color={index === 0 ? "success" : "default"}
                                                                            variant="outlined"
                                                                        />
                                                                    </Box>

                                                                    <Grid container spacing={1}>
                                                                        {Object.entries(address).map(([key, value]) => (
                                                                            <Grid size={{ xs: 12, sm: 6 }} key={key}>
                                                                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                                                    <strong>
                                                                                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
                                                                                    </strong>
                                                                                    <span style={{ marginLeft: '8px', color: value ? 'inherit' : '#ff6b6b' }}>
                                                                                        {value || 'Not provided'}
                                                                                    </span>
                                                                                </Typography>
                                                                            </Grid>
                                                                        ))}
                                                                    </Grid>

                                                                    {index === 0 && (
                                                                        <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #ddd' }}>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                This was the previous current address before the last update
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                </Card>
                                                            ))
                                                        ) : (
                                                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                                                <Typography variant="body1" color="text.secondary" gutterBottom>
                                                                    No previous addresses found
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    When you update the current address, it will appear here as previous address history.
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </AccordionDetails>
                                                </Accordion>
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

                            {/* Bank Details Section - Civil Score Added */}
                            <Grid size={{ xs: 12 }}>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6" color="primary">
                                            Bank Details
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            {Object.keys(FIELD_MAP)
                                                .filter(f => f.startsWith('bankDetails'))
                                                .map(fieldKey => (
                                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fieldKey}>
                                                        <EditableField
                                                            label={FIELD_MAP[fieldKey]}
                                                            value={getValueByPath(formData, fieldKey)}
                                                            path={fieldKey}
                                                            onUpdate={handleFieldUpdate}
                                                            type={fieldKey.includes('civilScore') ? 'number' : 'text'}
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

                                // Special handling for specific fields
                                const renderFieldValue = () => {
                                    // Handle ourSociety guarantees
                                    if (fieldKey === 'guaranteeDetails.ourSociety' || fieldKey === 'guaranteeDetails.otherSociety') {
                                        if (missing) return <span style={{ color: "red", fontWeight: "bold" }}>Missing</span>;

                                        return (
                                            <Box>
                                                {value.map((guarantee, index) => (
                                                    <Card key={index} variant="outlined" sx={{ mb: 1, p: 1.5, backgroundColor: '#f8f9fa' }}>
                                                        <Typography variant="body2" gutterBottom>
                                                            <strong>Member:</strong> {guarantee.nameOfMember || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="body2" gutterBottom>
                                                            <strong>Membership No:</strong> {guarantee.membershipNo || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="body2" gutterBottom>
                                                            <strong>Loan Amount:</strong> {guarantee.amountOfLoan || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="body2" gutterBottom>
                                                            <strong>Loan Type:</strong> {guarantee.typeOfLoan || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            <strong>Irregular:</strong> {guarantee.ifIrregular || 'No'}
                                                        </Typography>
                                                    </Card>
                                                ))}
                                            </Box>
                                        );
                                    }

                                    // Handle loan details
                                    if (fieldKey === 'loanDetails') {
                                        if (missing) return <span style={{ color: "red", fontWeight: "bold" }}>Missing</span>;

                                        return (
                                            <Box>
                                                {value.map((loan, index) => (
                                                    <Card key={index} variant="outlined" sx={{ mb: 1, p: 1.5, backgroundColor: '#f0f8ff' }}>
                                                        <Typography variant="body2" gutterBottom>
                                                            <strong>Type:</strong> {loan.loanType || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="body2" gutterBottom>
                                                            <strong>Amount:</strong> {loan.amount || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="body2" gutterBottom>
                                                            <strong>Purpose:</strong> {loan.purpose || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            <strong>Date:</strong> {loan.dateOfLoan ? new Date(loan.dateOfLoan).toLocaleDateString() : 'N/A'}
                                                        </Typography>
                                                    </Card>
                                                ))}
                                            </Box>
                                        );
                                    }

                                    // Handle Civil Score with color coding
                                    if (fieldKey === 'bankDetails.civilScore') {
                                        if (missing) return <span style={{ color: "red", fontWeight: "bold" }}>Missing</span>;

                                        const score = parseInt(value);
                                        let color = '#d32f2f'; // red
                                        if (score >= 700) color = '#2e7d32'; // green
                                        else if (score >= 600) color = '#ed6c02'; // orange

                                        return (
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography
                                                    variant="body2"
                                                    style={{
                                                        color: color,
                                                        fontWeight: 'bold',
                                                        fontSize: '16px'
                                                    }}
                                                >
                                                    {value}
                                                </Typography>
                                                {score >= 700 && (
                                                    <Chip label="Excellent" size="small" color="success" variant="outlined" />
                                                )}
                                                {score >= 600 && score < 700 && (
                                                    <Chip label="Good" size="small" color="warning" variant="outlined" />
                                                )}
                                                {score < 600 && (
                                                    <Chip label="Needs Improvement" size="small" color="error" variant="outlined" />
                                                )}
                                            </Box>
                                        );
                                    }

                                    // Handle image fields
                                    if (fieldName.includes('Photo') || fieldName.includes('Size')) {
                                        if (missing) return <span style={{ color: "red", fontWeight: "bold" }}>Missing</span>;

                                        if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('https'))) {
                                            return (
                                                <Box>
                                                    <img
                                                        src={value}
                                                        alt={fieldName}
                                                        style={{
                                                            maxWidth: '150px',
                                                            maxHeight: '150px',
                                                            borderRadius: '4px',
                                                            border: '1px solid #ddd'
                                                        }}
                                                    />
                                                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                                        <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                                                            View Full Image
                                                        </a>
                                                    </Typography>
                                                </Box>
                                            );
                                        }
                                    }

                                    // Default formatting for other fields
                                    return formatValue(value);
                                };

                                return (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fieldKey}>
                                        <Card variant="outlined" sx={{
                                            borderColor: missing ? 'error.main' : 'success.main',
                                            backgroundColor: missing ? '#fff5f5' : '#f5fff5',
                                            height: '100%'
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
                                                    {renderFieldValue()}
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
        // Ensure address structure is correct
        const finalData = {
            ...updatedMember,
            addressDetails: {
                ...updatedMember.addressDetails,
                // Ensure previousCurrentAddress is always an array
                previousCurrentAddress: updatedMember.addressDetails.previousCurrentAddress || [],
                // Ensure currentResidentalAddress exists
                currentResidentalAddress: updatedMember.addressDetails.currentResidentalAddress || {}
            }
        };

        console.log('Saving member data:', finalData);

        dispatch(updateMember({
            id: updatedMember._id,
            formData: finalData
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

            {/* Search Field और PDF Download Button */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <TextField
                    placeholder="Search by name, membership number, phone, or email..."
                    fullWidth
                    size="small"
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
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => generateMembersListPDF(filteredMembers)}
                    disabled={loading || filteredMembers.length === 0}
                    sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
                >
                    Download PDF List
                </Button>
            </Box>

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
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Civil Score</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">
                                        {loading ? 'Loading members...' : 'No members found matching your search criteria'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMembers.map((member, index) => {
                                const civilScore = getValueByPath(member, 'bankDetails.civilScore');
                                const scoreColor = civilScore >= 700 ? '#2e7d32' : civilScore >= 600 ? '#ed6c02' : '#d32f2f';

                                return (
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
                                        <TableCell>
                                            <Chip
                                                label={civilScore || 'N/A'}
                                                size="small"
                                                style={{
                                                    backgroundColor: scoreColor,
                                                    color: 'white',
                                                    fontWeight: 'bold'
                                                }}
                                            />
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
                                );
                            })
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