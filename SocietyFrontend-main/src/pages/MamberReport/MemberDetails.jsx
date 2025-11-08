// components/MemberDetails.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Tabs,
    Tab,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    TextField
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import { fetchMemberById, clearSelectedMember, updateMember } from "../../features/member/memberSlice";

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

const deepClone = (obj) => {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
};

const setValueByPath = (obj, path, value) => {
    if (!path) return obj;

    const newObj = deepClone(obj);
    const parts = path.split(".");
    let current = newObj;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (current[part] === undefined || current[part] === null) {
            current[part] = {};
        }
        current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;

    return newObj;
};

const isMissing = (value) => {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") {
        if (Object.keys(value).length === 0) return true;
        return Object.values(value).every(val =>
            val === undefined || val === null || val === "" ||
            (typeof val === 'object' && Object.keys(val).length === 0)
        );
    }
    return false;
};

const FIELD_MAP = {
    // Personal
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

    // Address
    "addressDetails.permanentAddress": "Permanent Address",
    "addressDetails.currentResidentalAddress": "Current Address",
    "addressDetails.permanentAddressBillPhoto": "Permanent Address Bill Photo",
    "addressDetails.previousCurrentAddress": "Previous Addresses",

    // References & guarantors
    "referenceDetails.referenceName": "Reference Name",
    "referenceDetails.referenceMno": "Reference Mobile",
    "referenceDetails.guarantorName": "Guarantor Name",
    "referenceDetails.gurantorMno": "Guarantor Mobile(s)",

    // Documents - Text Fields
    "documents.panNo": "PAN No",
    "documents.rationCard": "Ration Card",
    "documents.drivingLicense": "Driving License",
    "documents.aadhaarNo": "Aadhaar No",
    "documents.voterId": "Voter ID",
    "documents.passportNo": "Passport No",

    // Documents - Image Fields
    "documents.passportSize": "Passport Size Photo",
    "documents.panNoPhoto": "PAN Card Photo",
    "documents.rationCardPhoto": "Ration Card Photo",
    "documents.drivingLicensePhoto": "Driving License Photo",
    "documents.aadhaarNoPhoto": "Aadhaar Card Photo",
    "documents.voterIdPhoto": "Voter ID Photo",
    "documents.passportNoPhoto": "Passport Photo",

    // Professional
    "professionalDetails.qualification": "Qualification",
    "professionalDetails.occupation": "Occupation",

    // Family
    "familyDetails.familyMembersMemberOfSociety": "Family Members in Society",
    "familyDetails.familyMember": "Family Member Names",
    "familyDetails.familyMemberNo": "Family Member Phones",

    // Bank
    "bankDetails.bankName": "Bank Name",
    "bankDetails.branch": "Bank Branch",
    "bankDetails.accountNumber": "Account Number",
    "bankDetails.ifscCode": "IFSC Code",

    // Guarantee
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOtherSociety": "Guarantee Given in Other Society",
    "guaranteeDetails.otherSociety": "Other Society Guarantees",
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOurSociety": "Guarantee Given in Our Society",
    "guaranteeDetails.ourSociety": "Our Society Guarantees",

    // Loans
    "loanDetails": "Loan Details",
};

// Image Display in Card Component
const ImageDisplay = ({ imageUrl, alt, height = 120 }) => {
    const [imgError, setImgError] = useState(false);

    if (!imageUrl || imgError) {
        return (
            <Box
                sx={{
                    height: height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    border: '1px dashed #ddd'
                }}
            >
                <Typography variant="caption" color="text.secondary">
                    No Image
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <img
                src={imageUrl}
                alt={alt}
                style={{
                    maxWidth: '100%',
                    height: height,
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                }}
                onError={() => setImgError(true)}
                onLoad={() => setImgError(false)}
            />
        </Box>
    );
};

// Edit Field Dialog Component
const EditFieldDialog = ({ open, onClose, fieldKey, fieldName, currentValue, onSave, loading, isImageField = false }) => {
    const [value, setValue] = useState(currentValue || "");
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        setValue(currentValue || "");
        setFile(null);
        setPreviewUrl("");
    }, [currentValue, open]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setValue(selectedFile.name);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSave = () => {
        if (isImageField && file) {
            onSave(fieldKey, file);
        } else {
            onSave(fieldKey, value);
        }
    };

    const handleClose = () => {
        setValue(currentValue || "");
        setFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        onClose();
    };

    const isCloudinaryUrl = currentValue && currentValue.includes('cloudinary');

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Edit {fieldName}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Field: {fieldName}
                    </Typography>

                    {isImageField ? (
                        <>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Current File: {currentValue ? "Uploaded" : "No file uploaded"}
                            </Typography>

                            {currentValue && !file && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                        Current Image:
                                    </Typography>
                                    <ImageDisplay
                                        imageUrl={currentValue}
                                        alt="Current"
                                        height={150}
                                    />
                                    {isCloudinaryUrl && (
                                        <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                                            ✅ Cloudinary URL
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                    Upload New Image:
                                </Typography>
                                <input
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px dashed #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </Box>

                            {previewUrl && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                        New Image Preview:
                                    </Typography>
                                    <ImageDisplay
                                        imageUrl={previewUrl}
                                        alt="Preview"
                                        height={150}
                                    />
                                </Box>
                            )}
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Current Value: {currentValue || "Empty"}
                            </Typography>
                            <TextField
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                placeholder={`Enter value for ${fieldName}`}
                                sx={{ mt: 2 }}
                            />
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={loading || (isImageField && !file && !currentValue)}
                >
                    {loading ? <CircularProgress size={24} /> : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const MemberDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedMember, loading, error, operationLoading } = useSelector((state) => state.members);

    const [viewType, setViewType] = useState('all');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Image field names array
    const imageFields = [
        'documents.passportSize',
        'documents.panNoPhoto',
        'documents.rationCardPhoto',
        'documents.drivingLicensePhoto',
        'documents.aadhaarNoPhoto',
        'documents.voterIdPhoto',
        'documents.passportNoPhoto',
        'addressDetails.permanentAddressBillPhoto'
    ];

    useEffect(() => {
        if (id) {
            dispatch(fetchMemberById(id));
        }
    }, [id, dispatch]);

    useEffect(() => {
        return () => {
            dispatch(clearSelectedMember());
        };
    }, [dispatch]);

    const handleEditField = (fieldKey, fieldName, currentValue) => {
        setSelectedField({
            key: fieldKey,
            name: fieldName,
            value: currentValue,
            isImage: imageFields.includes(fieldKey)
        });
        setEditDialogOpen(true);
    };

    const handleSaveField = async (fieldKey, newValue) => {
        try {
            console.log('Updating field:', fieldKey, 'with value:', newValue);

            const isImageField = imageFields.includes(fieldKey);
            const formData = new FormData();

            if (isImageField && newValue instanceof File) {
                formData.append(fieldKey, newValue);
                formData.append('fieldPath', fieldKey);
            } else {
                const updateData = {};
                const parts = fieldKey.split('.');
                let current = updateData;

                for (let i = 0; i < parts.length - 1; i++) {
                    current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = newValue;

                Object.keys(updateData).forEach(section => {
                    if (typeof updateData[section] === 'object') {
                        Object.keys(updateData[section]).forEach(subSection => {
                            if (typeof updateData[section][subSection] === 'object') {
                                Object.keys(updateData[section][subSection]).forEach(field => {
                                    const formKey = `${section}[${subSection}][${field}]`;
                                    formData.append(formKey, updateData[section][subSection][field] || '');
                                });
                            } else {
                                const formKey = `${section}[${subSection}]`;
                                formData.append(formKey, updateData[section][subSection] || '');
                            }
                        });
                    } else {
                        formData.append(section, updateData[section] || '');
                    }
                });
            }

            const result = await dispatch(updateMember({
                id: selectedMember._id,
                formData: formData
            })).unwrap();

            console.log('Update successful:', result);

            setSnackbarMessage(`"${FIELD_MAP[fieldKey]}" updated successfully!`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setEditDialogOpen(false);

            setTimeout(() => {
                dispatch(fetchMemberById(id));
            }, 1500);

        } catch (error) {
            console.error('Error updating field:', error);
            setSnackbarMessage(`Error updating field: ${error.message || 'Something went wrong'}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setSelectedField(null);
    };

    const handleNavigateToEditForm = () => {
        navigate(`/edit-member/${id}`);
    };

    const handleDownloadPDF = () => {
        // Ye function separate PDF component ko call karega
        navigate(`/member-pdf/${id}?viewType=${viewType}`);
    };

    const formatValue = (value, fieldKey) => {
        if (isMissing(value)) return <span style={{ color: "red", fontWeight: "bold" }}>Missing</span>;

        if (imageFields.includes(fieldKey)) {
            const hasImage = value && (value.includes('cloudinary') || value.includes('http'));
            if (hasImage) {
                return (
                    <Box sx={{ mt: 1 }}>
                        <ImageDisplay
                            imageUrl={value}
                            alt={FIELD_MAP[fieldKey]}
                            height={120}
                        />
                    </Box>
                );
            }
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <ImageIcon color="disabled" fontSize="small" />
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No Image
                    </Typography>
                </Box>
            );
        }

        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(", ") : "Empty Array";
        }
        if (typeof value === "object" && value !== null) {
            const entries = Object.entries(value);
            if (entries.length === 0) return "Empty Object";
            return entries.map(([k, v]) => (
                <div key={k}><strong>{k}:</strong> {v || "Empty"}</div>
            ));
        }
        if (typeof value === "boolean") return value ? "Yes" : "No";
        return value || "Empty";
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading member details...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading member: {error.message || error.toString()}
                </Alert>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Box>
        );
    }

    if (!selectedMember) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">
                    Member not found.
                </Alert>
                <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Box>
        );
    }

    const filteredFields = Object.keys(FIELD_MAP).filter(fieldKey => {
        const value = getValueByPath(selectedMember, fieldKey);
        const missing = isMissing(value);

        if (viewType === 'all') return true;
        if (viewType === 'missing') return missing;
        if (viewType === 'filled') return !missing;
        return true;
    });

    const missingCount = Object.keys(FIELD_MAP).filter(f => isMissing(getValueByPath(selectedMember, f))).length;
    const filledCount = Object.keys(FIELD_MAP).length - missingCount;

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ color: "primary.main", fontWeight: "bold" }}>
                        Member Details
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant={viewType === 'all' ? "contained" : "outlined"}
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => navigate(`/member-pdf/${id}?viewType=all`)}
                        color="primary"
                    >
                        All PDF
                    </Button>
                    <Button
                        variant={viewType === 'filled' ? "contained" : "outlined"}
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => navigate(`/member-pdf/${id}?viewType=filled`)}
                        color="success"
                    >
                        Filled PDF
                    </Button>
                    <Button
                        variant={viewType === 'missing' ? "contained" : "outlined"}
                        startIcon={<ErrorOutlineIcon />}
                        onClick={() => navigate(`/member-pdf/${id}?viewType=missing`)}
                        color="error"
                    >
                        Missing PDF
                    </Button>
                </Box>
            </Box>

            {/* Member Info Summary */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Member Name: {getValueByPath(selectedMember, "personalDetails.nameOfMember") || "Unknown Member"}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                            label={`Membership: ${getValueByPath(selectedMember, "personalDetails.membershipNumber") || "N/A"}`}
                            variant="outlined"
                        />
                        <Chip
                            label={`Phone: ${getValueByPath(selectedMember, "personalDetails.phoneNo") || "N/A"}`}
                            variant="outlined"
                        />
                        <Chip
                            label={`Email: ${getValueByPath(selectedMember, "personalDetails.emailId") || "N/A"}`}
                            variant="outlined"
                        />
                        <Chip
                            label={`Filled: ${filledCount}/${Object.keys(FIELD_MAP).length}`}
                            color="success"
                            variant="outlined"
                        />
                        <Chip
                            label={`Missing: ${missingCount}`}
                            color="error"
                            variant="outlined"
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
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
            </Box>

            {/* Fields Grid */}
            <Grid container spacing={2}>
                {filteredFields.map((fieldKey) => {
                    const fieldName = FIELD_MAP[fieldKey];
                    const value = getValueByPath(selectedMember, fieldKey);
                    const missing = isMissing(value);
                    const isImageField = imageFields.includes(fieldKey);
                    const hasImage = isImageField && value && (value.includes('cloudinary') || value.includes('http'));
                    const displayValue = formatValue(value, fieldKey);

                    return (
                        <Grid size={{ xs: 12, md: 4 }} key={fieldKey}>
                            <Card
                                variant="outlined"
                                sx={{
                                    borderColor: missing ? 'error.main' : hasImage ? 'success.main' : 'primary.main',
                                    backgroundColor: missing ? '#fff5f5' : hasImage ? '#f0fff0' : '#f5fff5',
                                    height: '100%',
                                    '&:hover': {
                                        boxShadow: 3,
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s ease-in-out'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {missing ? (
                                                <ErrorOutlineIcon color="error" fontSize="small" />
                                            ) : hasImage ? (
                                                <CheckCircleOutlineIcon color="success" fontSize="small" />
                                            ) : (
                                                <CheckCircleOutlineIcon color="primary" fontSize="small" />
                                            )}
                                            <Typography variant="subtitle2" color={missing ? "error" : hasImage ? "success" : "primary"}>
                                                {fieldName}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditField(fieldKey, fieldName, value)}
                                            title="Edit this field"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                        {displayValue}
                                    </Typography>
                                    {isImageField && hasImage && (
                                        <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                                            ✅ Image Uploaded
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}

                {filteredFields.length === 0 && (
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                {viewType === 'missing' ? "No missing fields found!" : "No filled fields found!"}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {selectedMember.loanDetails && selectedMember.loanDetails.length > 0 && viewType !== 'missing' && (
                    <Grid size={{ xs: 12 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="subtitle2" color="primary" gutterBottom>
                                        Loan Details
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<EditIcon />}
                                        onClick={() => handleNavigateToEditForm()}
                                    >
                                        Edit Loans
                                    </Button>
                                </Box>
                                {selectedMember.loanDetails.map((loan, index) => (
                                    <Box key={index} sx={{ mb: 2, p: 1, border: "1px solid #eee", borderRadius: 1 }}>
                                        <Typography variant="body2">
                                            <strong>Loan {index + 1}:</strong><br />
                                            <strong>Type:</strong> {loan.loanType || 'N/A'}<br />
                                            <strong>Amount:</strong> {loan.amount || 'N/A'}<br />
                                            <strong>Purpose:</strong> {loan.purpose || 'N/A'}<br />
                                            <strong>Date:</strong> {loan.dateOfLoan || 'N/A'}
                                        </Typography>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {/* Edit Field Dialog */}
            <EditFieldDialog
                open={editDialogOpen}
                onClose={handleCloseEditDialog}
                fieldKey={selectedField?.key}
                fieldName={selectedField?.name}
                currentValue={selectedField?.value}
                onSave={handleSaveField}
                loading={operationLoading.update}
                isImageField={selectedField?.isImage}
            />

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MemberDetails;