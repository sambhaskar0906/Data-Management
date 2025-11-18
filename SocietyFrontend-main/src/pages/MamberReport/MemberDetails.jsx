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

// ADD THESE IMPORTS
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const getValueByPath = (obj, path) => {
    if (!path || !obj) return undefined;
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
    "personalDetails.title": "Title",
    "personalDetails.nameOfMember": "Member Name",
    "personalDetails.membershipNumber": "Membership No",
    "personalDetails.minor": "Is Minor",
    "personalDetails.nameOfFather": "Father's Name",
    "personalDetails.nameOfMother": "Mother's Name",
    "personalDetails.nameOfSpouse": "Spouse's Name",
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
    "addressDetails.permanentAddressBillPhoto": "Permanent Address Bill Photo",
    "addressDetails.currentResidentalAddress": "Current Address",
    "addressDetails.currentResidentalBillPhoto": "Current Address Bill Photo",
    "addressDetails.previousCurrentAddress": "Previous Addresses",

    // References
    "referenceDetails": "References",

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

    // Professional - Basic
    "professionalDetails.qualification": "Qualification",
    "professionalDetails.occupation": "Occupation",

    // Professional - Employment Type
    "professionalDetails.inCaseOfServiceGovt": "Government Service",
    "professionalDetails.inCaseOfPrivate": "Private Service",
    "professionalDetails.inCaseOfService": "Service",
    "professionalDetails.serviceType": "Service Type",

    // Professional - Service Details
    "professionalDetails.serviceDetails.fullNameOfCompany": "Company Name",
    "professionalDetails.serviceDetails.addressOfCompany": "Company Address",
    "professionalDetails.serviceDetails.monthlyIncome": "Monthly Income",
    "professionalDetails.serviceDetails.designation": "Designation",
    "professionalDetails.serviceDetails.dateOfJoining": "Date of Joining",
    "professionalDetails.serviceDetails.employeeCode": "Employee Code",
    "professionalDetails.serviceDetails.dateOfRetirement": "Date of Retirement",
    "professionalDetails.serviceDetails.officeNo": "Office Phone",

    // Professional - Business
    "professionalDetails.inCaseOfBusiness": "Business",
    "professionalDetails.businessDetails.fullNameOfCompany": "Business Name",
    "professionalDetails.businessDetails.addressOfCompany": "Business Address",
    "professionalDetails.businessDetails.businessStructure": "Business Structure",
    "professionalDetails.businessDetails.gstCertificate": "GST Certificate",

    // Family
    "familyDetails.familyMembersMemberOfSociety": "Family Members in Society",
    "familyDetails.familyMember": "Family Member Names",
    "familyDetails.familyMemberNo": "Family Member Phones",

    // Bank
    "bankDetails.bankName": "Bank Name",
    "bankDetails.branch": "Bank Branch",
    "bankDetails.accountNumber": "Account Number",
    "bankDetails.ifscCode": "IFSC Code",

    // Guarantee - Other Society
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOtherSociety": "Guarantee Given in Other Society",
    "guaranteeDetails.otherSociety": "Other Society Guarantees",

    // Guarantee - Our Society
    "guaranteeDetails.whetherMemberHasGivenGuaranteeInOurSociety": "Guarantee Given in Our Society",
    "guaranteeDetails.ourSociety": "Our Society Guarantees",

    // Loans
    "loanDetails": "Loan Details",

    // Nominee
    "nomineeDetails.nomineeName": "Nominee Name",
    "nomineeDetails.relationWithApplicant": "Relation with Applicant",
    "nomineeDetails.introduceBy": "Introduced By",
    "nomineeDetails.memberShipNo": "Membership No",
};

// Enhanced Image Display Component with Full Image View
const ImageDisplay = ({ imageUrl, alt, height = 120 }) => {
    const [imgError, setImgError] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);

    const handleImageClick = () => {
        if (imageUrl && !imgError) {
            setShowFullImage(true);
        }
    };

    const handleCloseFullImage = () => {
        setShowFullImage(false);
    };

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
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                        opacity: 0.8,
                        transition: 'opacity 0.2s'
                    }
                }}
                onClick={handleImageClick}
                title="Click to view full image"
            >
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

            {/* Full Image Modal */}
            <Dialog
                open={showFullImage}
                onClose={handleCloseFullImage}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{alt}</Typography>
                        <Button
                            onClick={handleCloseFullImage}
                            color="primary"
                        >
                            Close
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                        <img
                            src={imageUrl}
                            alt={alt}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                                borderRadius: '8px'
                            }}
                        />
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button
                            variant="outlined"
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open Image in New Tab
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
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

    // Image field names array - UPDATED
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

    // Enhanced formatValue function to handle objects properly - UPDATED
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
                                <strong>Member:</strong> {guarantee.nameOfMember || 'N/A'}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                <strong>Membership No:</strong> {guarantee.membershipNo || 'N/A'}
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

        // Handle Reference Details (array of objects)
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

    // Convert values to plain text suitable for Excel/PDF
    const formatValuePlain = (value, fieldKey) => {
        if (value === undefined || value === null) return "";
        if (typeof value === "boolean") return value ? "Yes" : "No";
        if (Array.isArray(value)) {
            if (value.length === 0) return "";
            // If array of objects, stringify each object concisely
            if (typeof value[0] === "object") {
                return value.map(v => {
                    try { return Object.entries(v).map(([k, val]) => `${k}: ${formatValuePlain(val)}`).join("; "); }
                    catch { return JSON.stringify(v); }
                }).join(" | ");
            }
            return value.join(", ");
        }
        if (typeof value === "object") {
            // For address objects, flatten commonly used keys
            try {
                return Object.entries(value).map(([k, v]) => `${k}: ${formatValuePlain(v)}`).join("; ");
            } catch {
                return JSON.stringify(value);
            }
        }
        // For image URLs, just show "Image URL" or the URL itself truncated
        if (typeof value === "string") {
            if (value.startsWith("http") || value.includes("cloudinary")) {
                return value;
            }
            return value;
        }
        return String(value);
    };

    // Return list of field keys filtered by viewType
    const getFieldsByView = (member, viewType) => {
        const keys = Object.keys(FIELD_MAP);
        if (viewType === "all") return keys;
        if (viewType === "filled") return keys.filter(k => {
            const v = getValueByPath(member, k);
            return !isMissing(v);
        });
        if (viewType === "missing") return keys.filter(k => {
            const v = getValueByPath(member, k);
            return isMissing(v);
        });
        return keys;
    };

    // Export member fields to Excel
    const exportMemberToExcel = (member, viewType = "all") => {
        if (!member) return;
        const fields = getFieldsByView(member, viewType);
        const rows = fields.map((key, idx) => ({
            "S. No": idx + 1,
            Field: FIELD_MAP[key] || key,
            Value: formatValuePlain(getValueByPath(member, key), key)
        }));
        const ws = XLSX.utils.json_to_sheet(rows, { header: ["S. No", "Field", "Value"] });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Member Report");
        const name = (getValueByPath(member, "personalDetails.nameOfMember") || "Member").replace(/\s+/g, "_");
        XLSX.writeFile(wb, `${name}_Fields_${viewType}_${Date.now()}.xlsx`);
    };

    // Generate PDF for member fields using jsPDF + autotable
    const generateMemberFieldsPDF = (member, viewType = "all") => {
        if (!member) return;
        const doc = new jsPDF();
        const memberName = getValueByPath(member, "personalDetails.nameOfMember") || "Member";
        const membershipNumber = getValueByPath(member, "personalDetails.membershipNumber") || "N/A";

        doc.setFontSize(16);
        doc.text(`Field Report - ${memberName}`, 14, 16);
        doc.setFontSize(10);
        doc.text(`Membership: ${membershipNumber} | View: ${viewType} | Generated: ${new Date().toLocaleString()}`, 14, 24);

        const fields = getFieldsByView(member, viewType);
        const body = fields.map((key, idx) => {
            const raw = getValueByPath(member, key);
            return [
                idx + 1,
                FIELD_MAP[key] || key,
                formatValuePlain(raw, key) || "—"
            ];
        });

        autoTable(doc, {
            startY: 36,
            head: [["S. No", "Field", "Value"]],
            body,
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [25, 118, 210], textColor: 255, fontSize: 10 },
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 60 },
                2: { cellWidth: 'auto' }
            },
            theme: 'grid'
        });

        const fileName = `${memberName.replace(/\s+/g, "_")}_Fields_${viewType}_${Date.now()}.pdf`;
        doc.save(fileName);
    };

    // Export Excel then generate PDF
    const exportMemberThenDownload = (member, viewType = "all") => {
        if (!member) return;
        // try {
        //     exportMemberToExcel(member, viewType);
        // } catch (e) {
        //     console.error("Excel export failed:", e);
        // }
        try {
            generateMemberFieldsPDF(member, viewType);
        } catch (e) {
            console.error("PDF generation failed:", e);
        }
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
                        onClick={() => exportMemberThenDownload(selectedMember, 'all')}
                        color="primary"
                    >
                        All PDF
                    </Button>
                    <Button
                        variant={viewType === 'filled' ? "contained" : "outlined"}
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => exportMemberThenDownload(selectedMember, 'filled')}
                        color="success"
                    >
                        Filled PDF
                    </Button>
                    <Button
                        variant={viewType === 'missing' ? "contained" : "outlined"}
                        startIcon={<ErrorOutlineIcon />}
                        onClick={() => exportMemberThenDownload(selectedMember, 'missing')}
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

                    // Check if it's a special field that needs more space - UPDATED
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