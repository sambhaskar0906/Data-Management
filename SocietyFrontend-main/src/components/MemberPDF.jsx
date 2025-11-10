// components/MemberPDF.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Container,
    Paper,
    Grid,
    Card,
    CardContent
} from "@mui/material";
import {
    ArrowBack,
    Download,
    CheckCircle,
    Error as ErrorIcon,
    PictureAsPdf
} from "@mui/icons-material";
import { fetchMemberById } from "../features/member/memberSlice";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const FIELD_MAP = {
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
    "addressDetails.permanentAddress": "Permanent Address",
    "addressDetails.currentResidentalAddress": "Current Address",
    "addressDetails.permanentAddressBillPhoto": "Permanent Address Bill Photo",
    "addressDetails.previousCurrentAddress": "Previous Addresses",
    "referenceDetails.referenceName": "Reference Name",
    "referenceDetails.referenceMno": "Reference Mobile",
    "referenceDetails.guarantorName": "Guarantor Name",
    "referenceDetails.gurantorMno": "Guarantor Mobile(s)",
    "documents.panNo": "PAN No",
    "documents.rationCard": "Ration Card",
    "documents.drivingLicense": "Driving License",
    "documents.aadhaarNo": "Aadhaar No",
    "documents.voterId": "Voter ID",
    "documents.passportNo": "Passport No",
    "documents.passportSize": "Passport Size Photo",
    "documents.panNoPhoto": "PAN Card Photo",
    "documents.rationCardPhoto": "Ration Card Photo",
    "documents.drivingLicensePhoto": "Driving License Photo",
    "documents.aadhaarNoPhoto": "Aadhaar Card Photo",
    "documents.voterIdPhoto": "Voter ID Photo",
    "documents.passportNoPhoto": "Passport Photo",
    "professionalDetails.qualification": "Qualification",
    "professionalDetails.occupation": "Occupation",
    "familyDetails.familyMembersMemberOfSociety": "Family Members in Society",
    "familyDetails.familyMember": "Family Member Names",
    "familyDetails.familyMemberNo": "Family Member Phones",
    "bankDetails.bankName": "Bank Name",
    "bankDetails.branch": "Bank Branch",
    "bankDetails.accountNumber": "Account Number",
    "bankDetails.ifscCode": "IFSC Code",
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOtherSociety": "Guarantee Given in Other Society",
    "guaranteeDetails.otherSociety": "Other Society Guarantees",
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOurSociety": "Guarantee Given in Our Society",
    "guaranteeDetails.ourSociety": "Our Society Guarantees",
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

const MemberPDF = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedMember, loading, error } = useSelector((state) => state.members);
    const pdfRef = useRef();

    const viewType = searchParams.get('viewType') || 'all';

    useEffect(() => {
        if (id) {
            dispatch(fetchMemberById(id));
        }
    }, [id, dispatch]);

    const downloadPDF = async () => {
        const element = pdfRef.current;
        if (!element) return;

        try {
            // Hide download button before capturing
            const downloadButton = element.querySelector('#download-button');
            if (downloadButton) {
                downloadButton.style.display = 'none';
            }

            // Use better PDF generation approach
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Calculate content dimensions
            const canvas = await html2canvas(element, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                scrollX: 0,
                scrollY: 0,
                width: element.scrollWidth,
                height: element.scrollHeight,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png', 1.0);

            // Calculate image dimensions to fit page width with margins
            const margin = 10; // 10mm margin on all sides
            const contentWidth = pageWidth - (2 * margin);
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add content to PDF with proper page breaking
            let heightLeft = imgHeight;
            let position = margin;
            let pageNumber = 1;

            // First page
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - (2 * margin));

            // Add page numbers
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text(
                `Page ${pageNumber}`,
                pageWidth / 2,
                pageHeight - 5,
                { align: 'center' }
            );

            // Additional pages if needed
            while (heightLeft > 0) {
                position = -heightLeft + margin;
                pdf.addPage();
                pageNumber++;

                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);

                // Add page number
                pdf.setFontSize(10);
                pdf.setTextColor(100);
                pdf.text(
                    `Page ${pageNumber}`,
                    pageWidth / 2,
                    pageHeight - 5,
                    { align: 'center' }
                );

                heightLeft -= (pageHeight - (2 * margin));
            }

            // Show download button again
            if (downloadButton) {
                downloadButton.style.display = 'block';
            }

            const memberName = selectedMember?.personalDetails?.nameOfMember || 'member';
            const membershipNo = selectedMember?.personalDetails?.membershipNumber || 'unknown';

            pdf.save(`${memberName}_${membershipNo}_${viewType}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            // Show download button again in case of error
            const downloadButton = element.querySelector('#download-button');
            if (downloadButton) {
                downloadButton.style.display = 'block';
            }
        }
    };

    // Filter fields based on viewType
    const getFilteredFields = () => {
        if (!selectedMember) return [];

        return Object.keys(FIELD_MAP).filter(fieldKey => {
            const value = getValueByPath(selectedMember, fieldKey);
            const missing = isMissing(value);

            if (viewType === 'all') return true;
            if (viewType === 'missing') return missing;
            if (viewType === 'filled') return !missing;
            return true;
        });
    };

    const getFieldStatusCounts = () => {
        if (!selectedMember) return { total: 0, filled: 0, missing: 0 };

        const fields = Object.keys(FIELD_MAP);
        const filled = fields.filter(f => !isMissing(getValueByPath(selectedMember, f))).length;
        const missing = fields.filter(f => isMissing(getValueByPath(selectedMember, f))).length;

        return {
            total: fields.length,
            filled,
            missing
        };
    };

    const formatValue = (value, fieldKey) => {
        if (isMissing(value)) return { text: "MISSING", status: "error" };

        // Handle object values properly
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            // Special handling for guarantee objects
            if (fieldKey.includes('guaranteeDetails')) {
                if (fieldKey.includes('ourSociety') || fieldKey.includes('otherSociety')) {
                    const guarantees = Object.values(value).filter(val =>
                        val && typeof val === 'object' && val.memberName
                    );
                    if (guarantees.length === 0) return { text: "No guarantees", status: "info" };

                    const formatted = guarantees.map(g =>
                        `${g.memberName || 'Unknown'} (${g.amount || 'N/A'})`
                    ).join(", ");
                    return { text: formatted, status: "success" };
                }
            }

            // General object handling
            const entries = Object.entries(value);
            if (entries.length === 0) return { text: "Not Provided", status: "info" };

            const formatted = Object.entries(value)
                .map(([k, v]) => {
                    if (v && typeof v === 'object') {
                        return `${k}: ${JSON.stringify(v)}`;
                    }
                    return `${k}: ${v || 'Not Provided'}`;
                })
                .join(", ");
            return { text: formatted, status: "success" };
        }

        if (Array.isArray(value)) {
            if (value.length === 0) return { text: "None", status: "info" };

            // Handle array of objects (like loan details)
            if (value[0] && typeof value[0] === 'object') {
                const formatted = value.map(item => {
                    if (item.loanType) {
                        return `${item.loanType} (₹${item.amount || '0'})`;
                    }
                    return JSON.stringify(item);
                }).join(", ");
                return { text: formatted, status: "success" };
            }

            return {
                text: value.length > 0 ? value.join(", ") : "None",
                status: value.length > 0 ? "success" : "info"
            };
        }

        if (typeof value === "boolean") return { text: value ? "Yes" : "No", status: "success" };

        // Format date strings
        if (typeof value === "string" && value.includes('T') && !isNaN(Date.parse(value))) {
            try {
                const date = new Date(value);
                return { text: date.toLocaleDateString('en-IN'), status: "success" };
            } catch (e) {
                return { text: value, status: "success" };
            }
        }

        return { text: value || "Not Provided", status: value ? "success" : "info" };
    };

    const getViewTypeColor = () => {
        switch (viewType) {
            case 'all': return '#1976d2';
            case 'filled': return '#2e7d32';
            case 'missing': return '#d32f2f';
            default: return '#1976d2';
        }
    };

    const getViewTypeIcon = () => {
        switch (viewType) {
            case 'all': return <PictureAsPdf />;
            case 'filled': return <CheckCircle />;
            case 'missing': return <ErrorIcon />;
            default: return <PictureAsPdf />;
        }
    };

    // Function to handle image display
    const renderImageField = (fieldKey, value) => {
        if (!value || typeof value !== 'string') return null;

        // Check if it's a base64 image or URL
        const isBase64 = value.startsWith('data:image') || value.startsWith('blob:');
        const isURL = value.startsWith('http') || value.startsWith('/');

        if (isBase64 || isURL) {
            return (
                <Box sx={{ mt: 0.5 }}>
                    <img
                        src={value}
                        alt={FIELD_MAP[fieldKey]}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '80px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </Box>
            );
        }

        return null;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading member details...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading member: {error.message || error.toString()}
                </Alert>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Container>
        );
    }

    if (!selectedMember) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="info">
                    Member not found.
                </Alert>
                <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </Container>
        );
    }

    const personalDetails = selectedMember.personalDetails || {};
    const loanDetails = selectedMember.loanDetails || [];
    const filteredFields = getFilteredFields();
    const statusCounts = getFieldStatusCounts();
    const viewTypeColor = getViewTypeColor();

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            {/* Header Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    size="small"
                >
                    Back
                </Button>
                <Button
                    id="download-button"
                    variant="contained"
                    sx={{
                        backgroundColor: viewTypeColor,
                        '&:hover': { backgroundColor: viewTypeColor, opacity: 0.9 }
                    }}
                    startIcon={<Download />}
                    onClick={downloadPDF}
                    size="small"
                >
                    Download {viewType.toUpperCase()} PDF
                </Button>
            </Box>

            {/* PDF Content - Fixed for proper PDF generation */}
            <Paper
                ref={pdfRef}
                sx={{
                    p: 3,
                    backgroundColor: '#ffffff',
                    boxShadow: 2,
                    border: `2px solid ${viewTypeColor}`,
                    borderRadius: '8px',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    width: '100%',
                    minHeight: 'auto',
                    margin: '0 auto',
                    boxSizing: 'border-box',
                    position: 'relative'
                }}
            >
                {/* Header */}
                <Box sx={{
                    background: `linear-gradient(135deg, ${viewTypeColor} 0%, #000000 100%)`,
                    color: 'white',
                    p: 3,
                    borderRadius: '6px',
                    mb: 3,
                    textAlign: 'center',
                    border: `2px solid ${viewTypeColor}`
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        {getViewTypeIcon()}
                        <Typography variant="h4" sx={{
                            fontWeight: 'bold',
                            ml: 1,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                        }}>
                            {viewType.toUpperCase()} REPORT
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{
                        opacity: 0.9,
                        mb: 0.5
                    }}>
                        {personalDetails.nameOfMember || 'Unknown Member'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        ID: {personalDetails.membershipNumber || 'N/A'} | {new Date().toLocaleDateString()}
                    </Typography>
                </Box>

                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <CompactStatCard
                            title="TOTAL FIELDS"
                            value={statusCounts.total}
                            color="#1976d2"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <CompactStatCard
                            title="FILLED FIELDS"
                            value={statusCounts.filled}
                            color="#2e7d32"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <CompactStatCard
                            title="MISSING FIELDS"
                            value={statusCounts.missing}
                            color="#d32f2f"
                        />
                    </Grid>
                </Grid>

                {/* Fields Display */}
                {filteredFields.length === 0 ? (
                    <Box sx={{
                        textAlign: 'center',
                        py: 6,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 2,
                        mb: 3,
                        border: '2px dashed #dee2e6'
                    }}>
                        <ErrorIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {viewType === 'missing'
                                ? "🎉 All Fields Are Filled!"
                                : viewType === 'filled'
                                    ? "No Filled Fields Found"
                                    : "No Data Available"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {viewType === 'missing'
                                ? "All required information has been provided."
                                : "No data matches your current view."}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{
                            color: viewTypeColor,
                            fontWeight: 'bold',
                            borderBottom: `2px solid ${viewTypeColor}`,
                            pb: 1,
                            mb: 2
                        }}>
                            📋 Document Fields ({filteredFields.length})
                        </Typography>

                        <Grid container spacing={2}>
                            {filteredFields.map((fieldKey) => {
                                const value = getValueByPath(selectedMember, fieldKey);
                                const formatted = formatValue(value, fieldKey);
                                const isImageField = fieldKey.includes('Photo') || fieldKey.includes('Size');

                                return (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fieldKey}>
                                        <CompactFieldCard
                                            fieldName={FIELD_MAP[fieldKey]}
                                            value={formatted.text}
                                            status={formatted.status}
                                            isImageField={isImageField}
                                        />
                                        {isImageField && renderImageField(fieldKey, value)}
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )}

                {/* Loan Details */}
                {viewType !== 'missing' && loanDetails && loanDetails.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{
                            color: '#00897b',
                            fontWeight: 'bold',
                            borderBottom: '2px solid #00897b',
                            pb: 1,
                            mb: 2
                        }}>
                            💰 Loan Details ({loanDetails.length})
                        </Typography>
                        <Grid container spacing={2}>
                            {loanDetails.map((loan, index) => (
                                <Grid size={{ xs: 12, md: 6 }} key={index}>
                                    <Card sx={{
                                        border: '2px solid #00897b',
                                        backgroundColor: '#e0f2f1',
                                        p: 2,
                                        borderRadius: '6px'
                                    }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" sx={{
                                                color: '#00695c',
                                                fontWeight: 'bold',
                                                mb: 1
                                            }}>
                                                {loan.loanType || 'General Loan'}
                                            </Typography>
                                            <CompactDetailRow label="Loan Amount" value={loan.amount ? `₹${loan.amount}` : 'Not Specified'} />
                                            <CompactDetailRow label="Purpose" value={loan.purpose || 'Not Specified'} />
                                            <CompactDetailRow label="Status" value={loan.status || 'Active'} />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Footer */}
                <Box sx={{
                    pt: 2,
                    borderTop: `2px solid ${viewTypeColor}`,
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    p: 2,
                    borderRadius: '6px',
                    mt: 3
                }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                        Member Management System | {viewType.toUpperCase()} Report |
                        Generated on {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')}
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

// Compact Stat Card Component
const CompactStatCard = ({ title, value, color }) => (
    <Card sx={{
        textAlign: 'center',
        p: 2,
        backgroundColor: `${color}15`,
        border: `2px solid ${color}`,
        borderRadius: '6px'
    }}>
        <Typography variant="h4" sx={{
            color,
            fontWeight: 'bold',
            lineHeight: 1,
            mb: 1
        }}>
            {value}
        </Typography>
        <Typography variant="subtitle2" sx={{
            color,
            fontWeight: 'bold',
            lineHeight: 1,
            textTransform: 'uppercase'
        }}>
            {title}
        </Typography>
    </Card>
);

// Compact Field Card Component
const CompactFieldCard = ({ fieldName, value, status, isImageField }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'success': return '#2e7d32';
            case 'error': return '#d32f2f';
            case 'info': return '#1976d2';
            default: return '#666666';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'info': return 'ℹ️';
            default: return '📄';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'success': return 'Filled';
            case 'error': return 'Missing';
            case 'info': return 'Not Provided';
            default: return 'Unknown';
        }
    };

    return (
        <Card sx={{
            p: 1.5,
            border: `1px solid ${getStatusColor()}`,
            backgroundColor: `${getStatusColor()}08`,
            borderRadius: '4px',
            mb: 1
        }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Typography variant="body2" sx={{
                    lineHeight: 1,
                    fontSize: '16px',
                    mt: 0.25
                }}>
                    {getStatusIcon()}
                </Typography>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{
                            fontWeight: 'bold',
                            color: getStatusColor(),
                            lineHeight: 1.2,
                            flex: 1
                        }}>
                            {fieldName}
                        </Typography>
                        <Typography variant="caption" sx={{
                            color: getStatusColor(),
                            fontWeight: 'bold',
                            backgroundColor: `${getStatusColor()}20`,
                            px: 1,
                            py: 0.25,
                            borderRadius: '8px',
                            ml: 1
                        }}>
                            {getStatusText()}
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{
                        color: status === 'error' ? '#d32f2f' : 'text.primary',
                        fontStyle: status === 'error' ? 'italic' : 'normal',
                        lineHeight: 1.3,
                        fontSize: '0.8rem'
                    }}>
                        {isImageField && value !== "MISSING" && value !== "Not Provided" ?
                            "✓ Image Available" :
                            (value.length > 60 ? value.substring(0, 60) + '...' : value)
                        }
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};

// Compact Detail Row Component
const CompactDetailRow = ({ label, value }) => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 0.5,
        borderBottom: '1px solid #e0e0e0',
        '&:last-child': {
            borderBottom: 'none'
        }
    }}>
        <Typography variant="caption" sx={{
            fontWeight: 'bold',
            color: '#555'
        }}>
            {label}:
        </Typography>
        <Typography variant="caption" sx={{
            color: '#333',
            fontWeight: 'medium'
        }}>
            {value}
        </Typography>
    </Box>
);

export default MemberPDF;