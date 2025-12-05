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
    MenuItem,
    Avatar,
    Paper,
    Divider,
    Tooltip,
    alpha
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import PersonIcon from "@mui/icons-material/Person";
import DownloadIcon from "@mui/icons-material/Download";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import { fetchMemberById, clearSelectedMember } from "../../features/member/memberSlice";

// Import from the new PDF generator
import {
    FIELD_MAP,
    getValueByPath,
    isMissing,
    generateMemberFieldsPDF,
} from "./MemberCategoryPdf";

// Import components
import ImageDisplay from "./ImageDisplay";

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
    const { selectedMember, loading, error } = useSelector((state) => state.members);

    const [viewType, setViewType] = useState('all');
    const [category, setCategory] = useState('all');
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

    // Get completion percentage
    const getCompletionPercentage = () => {
        const totalFields = Object.keys(FIELD_MAP).length;
        const filledFields = totalFields - Object.keys(FIELD_MAP).filter(f =>
            isMissing(getValueByPath(selectedMember, f))
        ).length;
        return Math.round((filledFields / totalFields) * 100);
    };

    // Enhanced formatValue function
    const formatValue = (value, fieldKey) => {
        if (isMissing(value)) return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ErrorOutlineIcon fontSize="small" color="error" />
                <Typography variant="body2" color="error" fontWeight={500}>
                    Missing
                </Typography>
            </Box>
        );

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                    <ImageIcon color="disabled" fontSize="small" />
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No Image
                    </Typography>
                </Box>
            );
        }

        // Handle arrays of objects (like previous addresses, guarantees, loans, references)
        if (Array.isArray(value)) {
            if (value.length === 0) return "No data";

            // Check if array contains objects
            if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                // Handle previous addresses array
                if (fieldKey === 'addressDetails.previousCurrentAddress') {
                    return (
                        <Box sx={{ mt: 1 }}>
                            {value.map((address, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        p: 1.5,
                                        mb: 1,
                                        bgcolor: '#f8f9fa',
                                        borderRadius: 1,
                                        borderLeft: '3px solid #3b82f6'
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={600} gutterBottom>
                                        Address {index + 1}
                                    </Typography>
                                    <Typography variant="body2">
                                        {address.flatHouseNo || ''} {address.areaStreetSector || ''}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {address.locality || ''}, {address.city || ''} - {address.pincode || ''}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    );
                }

                // Handle guarantee details arrays
                if (fieldKey === 'guaranteeDetails.ourSociety' || fieldKey === 'guaranteeDetails.otherSociety') {
                    return (
                        <Box sx={{ mt: 1 }}>
                            {value.map((guarantee, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        p: 1.5,
                                        mb: 1,
                                        bgcolor: '#f0f9ff',
                                        borderRadius: 1,
                                        borderLeft: '3px solid #10b981'
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={600} gutterBottom>
                                        Guarantee {index + 1}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Name:</strong> {guarantee.nameOfMember || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Membership No:</strong> {guarantee.membershipNo || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Amount:</strong> ₹{guarantee.amountOfLoan || 'N/A'}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    );
                }

                // Handle loan details array
                if (fieldKey === 'loanDetails') {
                    return (
                        <Box sx={{ mt: 1 }}>
                            {value.map((loan, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        p: 1.5,
                                        mb: 1,
                                        bgcolor: '#fef3c7',
                                        borderRadius: 1,
                                        borderLeft: '3px solid #f59e0b'
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={600} gutterBottom>
                                        Loan {index + 1}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Type:</strong> {loan.loanType || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Amount:</strong> ₹{loan.amount || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Date:</strong> {loan.dateOfLoan ? new Date(loan.dateOfLoan).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    );
                }

                // Handle reference details array
                if (fieldKey === 'referenceDetails') {
                    return (
                        <Box sx={{ mt: 1 }}>
                            {value.map((reference, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        p: 1.5,
                                        mb: 1,
                                        bgcolor: '#f5f3ff',
                                        borderRadius: 1,
                                        borderLeft: '3px solid #8b5cf6'
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={600} gutterBottom>
                                        Reference {index + 1}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Name:</strong> {reference.referenceName || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Mobile:</strong> {reference.referenceMno || 'N/A'}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    );
                }

                // Generic object array display
                return (
                    <Box sx={{ mt: 1 }}>
                        {value.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    p: 1,
                                    mb: 1,
                                    bgcolor: '#f8f9fa',
                                    borderRadius: 1
                                }}
                            >
                                {Object.entries(item).map(([k, v]) => (
                                    <Typography key={k} variant="body2">
                                        <strong>{k}:</strong> {v || "N/A"}
                                    </Typography>
                                ))}
                            </Box>
                        ))}
                    </Box>
                );
            }

            // Array of simple values (strings, numbers, etc.)
            return value.join(", ");
        }

        // Handle objects (like address objects, nominee details, etc.)
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

        // Handle numeric values with currency
        if (typeof value === "number" && (fieldKey.includes('amount') || fieldKey.includes('income') || fieldKey.includes('salary'))) {
            return (
                <Typography variant="body2" fontWeight={600} color="success.main">
                    ₹{value.toLocaleString('en-IN')}
                </Typography>
            );
        }

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
    const completionPercentage = getCompletionPercentage();

    return (
        <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'white', borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#f1f5f9' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ color: "#1e293b", fontWeight: 700 }}>
                        Member Profile
                    </Typography>
                </Box>

                {/* Member Profile Card */}
                <Paper elevation={0} sx={{ p: 3, bgcolor: '#f0f9ff', borderRadius: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                        <Avatar sx={{ width: 70, height: 70, bgcolor: '#3b82f6', fontSize: '1.5rem' }}>
                            {getValueByPath(selectedMember, "personalDetails.nameOfMember")?.charAt(0) || 'M'}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {getValueByPath(selectedMember, "personalDetails.nameOfMember") || "Unknown Member"}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                <Chip
                                    icon={<BadgeIcon />}
                                    label={`ID: ${getValueByPath(selectedMember, "personalDetails.membershipNumber") || "N/A"}`}
                                    variant="filled"
                                    size="small"
                                    color="primary"
                                />
                                <Chip
                                    icon={<PhoneIcon />}
                                    label={getValueByPath(selectedMember, "personalDetails.phoneNo1") || "N/A"}
                                    variant="outlined"
                                    size="small"
                                />
                                <Chip
                                    icon={<EmailIcon />}
                                    label={getValueByPath(selectedMember, "personalDetails.emailId1") || "N/A"}
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Progress Section */}
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                                Profile Completion
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="primary">
                                {completionPercentage}%
                            </Typography>
                        </Box>
                        <Box sx={{ height: 6, bgcolor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                            <Box sx={{
                                height: '100%',
                                width: `${completionPercentage}%`,
                                bgcolor: '#3b82f6',
                                borderRadius: 3
                            }} />
                        </Box>
                    </Box>

                    {/* Stats */}
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 4 }}>
                            <Box sx={{ p: 1.5, textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={800} color="success.main">
                                    {filledCount}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Filled
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                            <Box sx={{ p: 1.5, textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={800} color="error.main">
                                    {missingCount}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Missing
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                            <Box sx={{ p: 1.5, textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={800} color="primary.main">
                                    {Object.keys(FIELD_MAP).length}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Total
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Controls */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Filter by Category</InputLabel>
                        <Select
                            value={category}
                            label="Filter by Category"
                            onChange={(e) => setCategory(e.target.value)}
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="all">All Categories</MenuItem>
                            <MenuItem value="filled">✅ Filled Only</MenuItem>
                            <MenuItem value="missing">❌ Missing Only</MenuItem>
                            <Divider />
                            <MenuItem value="personalDetails">👤 Personal</MenuItem>
                            <MenuItem value="addressDetails">🏠 Address</MenuItem>
                            <MenuItem value="documents">📄 Documents</MenuItem>
                            <MenuItem value="professionalDetails">💼 Professional</MenuItem>
                            <MenuItem value="familyDetails">👨‍👩‍👧‍👦 Family</MenuItem>
                            <MenuItem value="bankDetails">🏦 Bank</MenuItem>
                            <MenuItem value="referenceDetails">🤝 Reference</MenuItem>
                            <MenuItem value="guaranteeDetails">🛡️ Guarantee</MenuItem>
                            <MenuItem value="loanDetails">💰 Loan</MenuItem>
                        </Select>
                    </FormControl>

                    <Tooltip title="Download PDF Report">
                        <Button
                            variant="contained"
                            startIcon={<PictureAsPdfIcon />}
                            onClick={handleDownload}
                            sx={{
                                borderRadius: 2,
                                bgcolor: '#1e293b',
                                '&:hover': { bgcolor: '#334155' }
                            }}
                        >
                            Export PDF
                        </Button>
                    </Tooltip>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={viewType} onChange={(e, newValue) => setViewType(newValue)}>
                        <Tab
                            value="all"
                            label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography>All Fields</Typography>
                                    <Chip label={Object.keys(FIELD_MAP).length} size="small" />
                                </Box>
                            }
                        />
                        <Tab
                            value="missing"
                            label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <ErrorOutlineIcon color="error" fontSize="small" />
                                    <Typography>Missing</Typography>
                                    <Chip label={missingCount} size="small" color="error" />
                                </Box>
                            }
                        />
                        <Tab
                            value="filled"
                            label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CheckCircleOutlineIcon color="success" fontSize="small" />
                                    <Typography>Filled</Typography>
                                    <Chip label={filledCount} size="small" color="success" />
                                </Box>
                            }
                        />
                    </Tabs>
                </Box>
            </Paper>

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
                        fieldKey === 'referenceDetails' ||
                        fieldKey === 'addressDetails.previousCurrentAddress';

                    return (
                        <Grid
                            size={{
                                xs: 12,
                                md: isSpecialField ? 12 : 6,
                                lg: isSpecialField ? 12 : 4
                            }}
                            key={fieldKey}
                        >
                            <Card
                                sx={{
                                    border: `2px solid ${missing ? '#fca5a5' : hasImage ? '#86efac' : '#c7d2fe'}`,
                                    bgcolor: missing ? '#fff1f2' : hasImage ? '#f0fdf4' : 'white',
                                    borderRadius: 2,
                                    height: '100%',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: 3,
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {missing ? (
                                                <ErrorOutlineIcon color="error" fontSize="small" />
                                            ) : hasImage ? (
                                                <CheckCircleOutlineIcon color="success" fontSize="small" />
                                            ) : (
                                                <CheckCircleOutlineIcon color="primary" fontSize="small" />
                                            )}
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight={600}
                                                color={missing ? "error" : hasImage ? "success" : "primary"}
                                                sx={{ wordBreak: 'break-word' }}
                                            >
                                                {fieldName}
                                            </Typography>
                                        </Box>
                                        {hasImage && (
                                            <Chip
                                                label="Image"
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>

                                    <Box sx={{ ml: 3 }}>
                                        {formatValue(value, fieldKey)}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}

                {filteredFields.length === 0 && (
                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ textAlign: 'center', py: 6, borderRadius: 2 }}>
                            {viewType === 'missing' ? (
                                <>
                                    <CheckCircleOutlineIcon sx={{ fontSize: 50, color: '#22c55e', mb: 2 }} />
                                    <Typography variant="h6" color="success.main" gutterBottom>
                                        All Fields Complete! 🎉
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <ErrorOutlineIcon sx={{ fontSize: 50, color: '#64748b', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        No Fields Found
                                    </Typography>
                                </>
                            )}
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Snackbar */}
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