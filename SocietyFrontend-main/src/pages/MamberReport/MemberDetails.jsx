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
    FormControl,
    Snackbar,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import { fetchMemberById, clearSelectedMember, updateMember } from "../../features/member/memberSlice";

// Import from the new PDF generator
import {
    FIELD_MAP,
    getValueByPath,
    isMissing,
    generateMemberFieldsPDF,
} from "./MemberCategoryPdf";

// Import components
import ImageDisplay from "./ImageDisplay";
import EditFieldDialog from "./MemberEdit";

// Image field names array
const imageFields = [
    'documents.passportSize',
    'documents.panNoPhoto',
    'documents.rationCardPhoto',
    'documents.drivingLicensePhoto',
    'documents.aadhaarNoPhoto',
    'documents.voterIdPhoto',
    'documents.passportNoPhoto',
    'addressDetails.permanentAddressBillPhoto',
    'addressDetails.currentResidentalBillPhoto',
    'professionalDetails.businessDetails.gstCertificate'
];

const MemberDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedMember, loading, error, operationLoading } = useSelector((state) => state.members);

    const [viewType, setViewType] = useState('all');
    const [category, setCategory] = useState('all');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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

    const handleDownload = () => {
        if (!selectedMember) return;

        try {
            generateMemberFieldsPDF(selectedMember, category, viewType);
        } catch (e) {
            console.error("PDF generation failed:", e);
            setSnackbarMessage("Error generating PDF");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    // const handleExcelDownload = () => {
    //     if (!selectedMember) return;

    //     try {
    //         exportMemberToExcel(selectedMember, category, viewType);
    //     } catch (e) {
    //         console.error("Excel export failed:", e);
    //         setSnackbarMessage("Error generating Excel");
    //         setSnackbarSeverity("error");
    //         setSnackbarOpen(true);
    //     }
    // };

    // Enhanced formatValue function
    const formatValue = (value, fieldKey) => {
        if (isMissing(value)) return <span style={{ color: "red", fontWeight: "bold" }}>Missing</span>;

        // Handle image fields
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

        // Handle Our Society Guarantees
        if (fieldKey === 'guaranteeDetails.ourSociety' || fieldKey === 'guaranteeDetails.otherSociety') {
            if (!value || value.length === 0) return "No guarantees";

            return (
                <Box sx={{ mt: 1 }}>
                    {value.map((guarantee, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 1, p: 1.5, backgroundColor: '#f8f9fa' }}>
                            <Typography variant="body2" gutterBottom>
                                <Typography variant="body2" gutterBottom>
                                    <strong>Membership No:</strong> {guarantee.membershipNo || 'N/A'}
                                </Typography>
                                <strong>Member:</strong> {guarantee.nameOfMember || 'N/A'}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <strong>Loan Amount:</strong> ₹{guarantee.amountOfLoan || 'N/A'}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <strong>Loan Type:</strong> {guarantee.typeOfLoan || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Irregular:</strong> {guarantee.ifIrregular === 'Yes' ? 'Yes ⚠️' : 'No ✅'}
                            </Typography>
                        </Card>
                    ))}
                </Box>
            );
        }

        // Handle Loan Details
        if (fieldKey === 'loanDetails') {
            if (!value || value.length === 0) return "No loans";

            return (
                <Box sx={{ mt: 1 }}>
                    {value.map((loan, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 1, p: 1.5, backgroundColor: '#f0f8ff' }}>
                            <Typography variant="body2" gutterBottom>
                                <strong>Loan Type:</strong> {loan.loanType || 'N/A'}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <strong>Amount:</strong> ₹{loan.amount || 'N/A'}
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

        // Handle Reference Details
        if (fieldKey === 'referenceDetails') {
            if (!value || value.length === 0) return "No references";

            return (
                <Box sx={{ mt: 1 }}>
                    {value.map((reference, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 1, p: 1.5, backgroundColor: '#f0f8ff' }}>
                            <Typography variant="body2" gutterBottom>
                                <strong>Name:</strong> {reference.referenceName || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Mobile:</strong> {reference.referenceMno || 'N/A'}
                            </Typography>
                        </Card>
                    ))}
                </Box>
            );
        }

        // Handle Service Details
        if (fieldKey.startsWith('professionalDetails.serviceDetails.')) {
            if (!value || typeof value !== 'object') return "No service details";

            return (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2"><strong>Company:</strong> {value.fullNameOfCompany || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Address:</strong> {value.addressOfCompany || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Income:</strong> {value.monthlyIncome || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Designation:</strong> {value.designation || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Joining Date:</strong> {value.dateOfJoining || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Employee Code:</strong> {value.employeeCode || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Retirement Date:</strong> {value.dateOfRetirement || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Office Phone:</strong> {value.officeNo || 'N/A'}</Typography>
                </Box>
            );
        }

        // Handle Business Details
        if (fieldKey.startsWith('professionalDetails.businessDetails.')) {
            if (!value || typeof value !== 'object') return "No business details";

            return (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2"><strong>Company:</strong> {value.fullNameOfCompany || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Address:</strong> {value.addressOfCompany || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Structure:</strong> {value.businessStructure || 'N/A'}</Typography>
                    {value.gstCertificate && (
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" gutterBottom><strong>GST Certificate:</strong></Typography>
                            <ImageDisplay
                                imageUrl={value.gstCertificate}
                                alt="GST Certificate"
                                height={120}
                            />
                        </Box>
                    )}
                </Box>
            );
        }

        // Handle Nominee Details
        if (fieldKey.startsWith('nomineeDetails.')) {
            if (!value || typeof value !== 'object') return "No nominee details";

            return (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2"><strong>Name:</strong> {value.nomineeName || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Relation:</strong> {value.relationWithApplicant || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Membership No:</strong> {value.mobileNo || 'N/A'}</Typography>
                </Box>
            );
        }

        if (fieldKey.startsWith('witnessDetails.')) {
            if (!value || typeof value !== 'object') return "No witness details";

            return (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2"><strong>Introduced By:</strong> {value.introduceBy || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Membership No:</strong> {value.memberShipNo || 'N/A'}</Typography>
                </Box>
            );
        }

        // Handle Previous Addresses
        if (fieldKey === 'addressDetails.previousCurrentAddress') {
            if (!value || value.length === 0) return "No previous addresses";

            return (
                <Box sx={{ mt: 1 }}>
                    {value.map((address, index) => (
                        <Card key={index} variant="outlined" sx={{ mb: 1, p: 1.5, backgroundColor: '#fff8e1' }}>
                            <Typography variant="body2" gutterBottom><strong>Address {index + 1}:</strong></Typography>
                            <Typography variant="body2"><strong>House No:</strong> {address.flatHouseNo || 'N/A'}</Typography>
                            <Typography variant="body2"><strong>Area:</strong> {address.areaStreetSector || 'N/A'}</Typography>
                            <Typography variant="body2"><strong>Locality:</strong> {address.locality || 'N/A'}</Typography>
                            <Typography variant="body2"><strong>Landmark:</strong> {address.landmark || 'N/A'}</Typography>
                            <Typography variant="body2"><strong>City:</strong> {address.city || 'N/A'}</Typography>
                            <Typography variant="body2"><strong>State:</strong> {address.state || 'N/A'}</Typography>
                            <Typography variant="body2"><strong>Pincode:</strong> {address.pincode || 'N/A'}</Typography>
                            <Typography variant="body2"><strong>Country:</strong> {address.country || 'N/A'}</Typography>
                        </Card>
                    ))}
                </Box>
            );
        }

        // Handle address objects
        if (fieldKey === 'addressDetails.permanentAddress' || fieldKey === 'addressDetails.currentResidentalAddress') {
            if (!value || typeof value !== 'object') return "No address data";

            return (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2"><strong>House No:</strong> {value.flatHouseNo || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Area:</strong> {value.areaStreetSector || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Locality:</strong> {value.locality || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Landmark:</strong> {value.landmark || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>City:</strong> {value.city || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>State:</strong> {value.state || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Pincode:</strong> {value.pincode || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Country:</strong> {value.country || 'N/A'}</Typography>
                </Box>
            );
        }

        // Handle arrays
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(", ") : "No data";
        }

        // Handle objects
        if (typeof value === "object" && value !== null) {
            const entries = Object.entries(value);
            if (entries.length === 0) return "No data";
            return (
                <Box sx={{ mt: 1 }}>
                    {entries.map(([k, v]) => (
                        <Typography key={k} variant="body2">
                            <strong>{k}:</strong> {v || "N/A"}
                        </Typography>
                    ))}
                </Box>
            );
        }

        if (typeof value === "boolean") return value ? "Yes" : "No";
        return value || "No data";
    };

    // Get filtered fields based on category and view type
    const getFilteredFields = () => {
        const allKeys = Object.keys(FIELD_MAP);

        if (category === "all") {
            return allKeys.filter(key => {
                const value = getValueByPath(selectedMember, key);
                const missing = isMissing(value);

                if (viewType === "all") return true;
                if (viewType === "filled") return !missing;
                if (viewType === "missing") return missing;
                return true;
            });
        }

        if (category === "filled") {
            return allKeys.filter(key => {
                const value = getValueByPath(selectedMember, key);
                return !isMissing(value);
            });
        }

        if (category === "missing") {
            return allKeys.filter(key => {
                const value = getValueByPath(selectedMember, key);
                return isMissing(value);
            });
        }

        // Specific category
        return allKeys.filter(key => {
            const value = getValueByPath(selectedMember, key);
            const missing = isMissing(value);
            const matchesCategory = key.startsWith(category);

            if (viewType === "all") return matchesCategory;
            if (viewType === "filled") return matchesCategory && !missing;
            if (viewType === "missing") return matchesCategory && missing;
            return matchesCategory;
        });
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

    const filteredFields = getFilteredFields();
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

            {/* Download Section */}
            <Card sx={{ mb: 3, p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Category Details</InputLabel>
                        <Select
                            value={category}
                            label="Category Details"
                            onChange={(e) => setCategory(e.target.value)}
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="filled">Filled</MenuItem>
                            <MenuItem value="missing">Missing</MenuItem>
                            <MenuItem value="personalDetails">Personal</MenuItem>
                            <MenuItem value="addressDetails">Address</MenuItem>
                            <MenuItem value="documents">Document</MenuItem>
                            <MenuItem value="professionalDetails">Professional</MenuItem>
                            <MenuItem value="familyDetails">Family</MenuItem>
                            <MenuItem value="bankDetails">Bank</MenuItem>
                            <MenuItem value="referenceDetails">Reference</MenuItem>
                            <MenuItem value="guaranteeDetails">Guarantee</MenuItem>
                            <MenuItem value="loanDetails">Loan</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={handleDownload}
                        color="primary"
                    >
                        Download PDF
                    </Button>
                </Box>
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

                    const isSpecialField = fieldKey === 'guaranteeDetails.ourSociety' ||
                        fieldKey === 'guaranteeDetails.otherSociety' ||
                        fieldKey === 'loanDetails' ||
                        fieldKey === 'addressDetails.permanentAddress' ||
                        fieldKey === 'addressDetails.currentResidentalAddress' ||
                        fieldKey === 'referenceDetails' ||
                        fieldKey === 'addressDetails.previousCurrentAddress' ||
                        fieldKey.startsWith('professionalDetails.serviceDetails.') ||
                        fieldKey.startsWith('professionalDetails.businessDetails.') ||
                        fieldKey.startsWith('nomineeDetails.');

                    const displayValue = formatValue(value, fieldKey);

                    return (
                        <Grid
                            size={{
                                xs: 12,
                                md: isSpecialField ? 12 : 4,
                                lg: isSpecialField ? 6 : 4
                            }}
                            key={fieldKey}
                        >
                            <Card
                                variant="outlined"
                                sx={{
                                    borderColor: missing ? 'error.main' : hasImage ? 'success.main' : 'primary.main',
                                    backgroundColor: missing ? '#fff5f5' : hasImage ? '#f0fff0' : isSpecialField ? '#f8f9fa' : '#f5fff5',
                                    height: isSpecialField ? 'auto' : '100%',
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
                                            ✅ Image Uploaded (Click to view full size)
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