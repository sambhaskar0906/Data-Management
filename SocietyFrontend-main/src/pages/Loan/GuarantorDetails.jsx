import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Grid,
    Card,
    CardContent,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Alert,
    Divider
} from "@mui/material";
import { AddCircle, Delete, PersonAdd, Security } from "@mui/icons-material";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { fetchAllMembers } from "../../features/member/memberSlice";
import { useDispatch, useSelector } from "react-redux";

// Validation Schema for Guarantor
const guarantorValidationSchema = Yup.object({
    accountType: Yup.string().required('Account Type is required'),
    accountNumber: Yup.string().required('Account Number is required'),
    fileNumber: Yup.string().required('File Number is required'),
    //accountName: Yup.string().required('Account Name is required'),
    memberId: Yup.string().required('Member selection is required'),
    membershipNumber: Yup.string().required('Membership Number is required'),
    name: Yup.string().required('Name is required'),
    address: Yup.string().required('Address is required')
});

const GuarantorDetails = ({ loanFormData, onGuarantorSubmit, guarantorDetails }) => {
    const [guarantors, setGuarantors] = useState(guarantorDetails.guarantors || []);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    // Get members from Redux store with multiple possible state paths
    const members = useSelector((state) =>
        state.member?.members ||
        state.members?.members ||
        state.member?.data ||
        state.members?.data ||
        state.member?.list ||
        state.members?.list ||
        []
    );

    // Get loading state from Redux
    const membersLoading = useSelector((state) =>
        state.member?.loading ||
        state.members?.loading ||
        false
    );

    useEffect(() => {
        const loadMembers = async () => {
            setLoading(true);
            try {
                await dispatch(fetchAllMembers());
            } catch (error) {
                console.error("Error fetching members:", error);
            } finally {
                setLoading(false);
            }
        };

        loadMembers();
    }, [dispatch]);

    const initialValues = {
        accountType: "",
        accountNumber: "",
        fileNumber: "",
        accountName: "",
        memberId: "",
        membershipNumber: "",
        name: "",
        address: ""
    };

    const handleAddGuarantor = (values, { resetForm }) => {
        const selectedMember = members.find(
            (member) => member.id === values.memberId || member._id === values.memberId
        );

        const pd = selectedMember?.personalDetails || {};

        const newGuarantor = {
            id: Date.now(),

            // FROM FORM
            accountType: values.accountType,
            accountNumber: values.accountNumber,
            fileNumber: values.fileNumber,

            // REQUIRED FOR BACKEND
            memberId: values.memberId,
            membershipNumber: values.membershipNumber,
            memberName: pd.nameOfMember || "",
            mobileNumber: pd.phoneNo || "",

            // UI fields
            name: values.name,
            address: values.address,

            memberData: selectedMember
        };

        setGuarantors([...guarantors, newGuarantor]);
        resetForm();
    };


    const removeGuarantor = (id) => {
        setGuarantors(guarantors.filter(guarantor => guarantor.id !== id));
    };

    const handleSubmit = () => {
        if (guarantors.length === 0) {
            alert("Please add at least one guarantor");
            return;
        }

        setSubmitted(true);

        const guarantorPayload = {
            guarantors: guarantors
        };

        console.log("📋 Guarantor Payload:", guarantorPayload);
        onGuarantorSubmit({
            guarantors: guarantors.map(g => ({
                memberId: g.memberId,
                membershipNumber: g.membershipNumber,
                fullName: g.name,
                mobileNumber: g.mobileNumber,
                address: g.address,
                fileNumber: g.fileNumber,
                accountType: g.accountType,
                accountNumber: g.accountNumber

            }))
        });



    };

    // Handle member selection change
    const handleMemberChange = (event, setFieldValue) => {
        const memberId = event.target.value;
        setFieldValue('memberId', memberId);

        const selectedMember = members.find(
            (member) => member.id === memberId || member._id === memberId
        );

        if (selectedMember) {
            const pd = selectedMember.personalDetails || {};
            const permanent = selectedMember.addressDetails?.permanentAddress || {};

            // Convert object to single string
            const addressString = [
                permanent.flatHouseNo,
                permanent.areaStreetSector,
                permanent.locality,
                permanent.landmark,
                permanent.city,
                permanent.state,
                permanent.country,
                permanent.pincode ? `- ${permanent.pincode}` : ""
            ]
                .filter(Boolean)
                .join(", ");

            setFieldValue("membershipNumber", pd.membershipNumber || "");
            setFieldValue("name", pd.nameOfMember || "");
            setFieldValue("address", addressString || "");
        }
    };



    // Helper function to get member display name
    const getMemberDisplayName = (member) => {
        const pd = member.personalDetails || {};

        const name = pd.nameOfMember || "Unknown Member";
        const membershipNumber = pd.membershipNumber || "";

        return `${name}${membershipNumber ? " - " + membershipNumber : ""}`;
    };


    // Helper function to get member ID
    const getMemberId = (member) => member.id || member._id || "";


    return (
        <Box>
            {/* Header */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Security sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        GUARANTOR DETAILS
                    </Typography>
                    <Typography variant="h6">
                        Guarantor Information & Member Details
                    </Typography>
                </CardContent>
            </Card>

            {submitted && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Guarantor Details Submitted Successfully!
                </Alert>
            )}

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Members loaded: {members.length} | Loading: {loading.toString()}
                </Alert>
            )}

            {/* Add Guarantor Form */}
            <Card sx={{ mb: 3, p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
                    <PersonAdd sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Add New Guarantor
                </Typography>

                <Formik
                    initialValues={initialValues}
                    validationSchema={guarantorValidationSchema}
                    onSubmit={handleAddGuarantor}
                >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikSubmit, setFieldValue }) => (
                        <Form onSubmit={formikSubmit}>


                            <Grid container spacing={2}>
                                {/* Account Type */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Account Type</InputLabel>
                                        <Field
                                            as={Select}
                                            name="accountType"
                                            label="Account Type"
                                            error={touched.accountType && Boolean(errors.accountType)}
                                        >
                                            <MenuItem value="Loan">Loan</MenuItem>
                                            <MenuItem value="LAF">LAF</MenuItem>
                                            <MenuItem value="LAP">LAP</MenuItem>
                                        </Field>
                                        <ErrorMessage name="accountType" component="div" className="error-message" />
                                    </FormControl>
                                </Grid>

                                {/* Account Number */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        size="small"
                                        label="Account Number"
                                        name="accountNumber"
                                        error={touched.accountNumber && Boolean(errors.accountNumber)}
                                        helperText={touched.accountNumber && errors.accountNumber}
                                    />
                                </Grid>

                                {/* File Number */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        size="small"
                                        label="File Number"
                                        name="fileNumber"
                                        error={touched.fileNumber && Boolean(errors.fileNumber)}
                                        helperText={touched.fileNumber && errors.fileNumber}
                                    />
                                </Grid>

                                {/* Account Name */}
                                {/* <Grid size={{ xs: 12, md: 6 }}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        size="small"
                                        label="Account Name"
                                        name="accountName"
                                        error={touched.accountName && Boolean(errors.accountName)}
                                        helperText={touched.accountName && errors.accountName}
                                    />
                                </Grid> */}

                                {/* Member List Dropdown */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth size="small" error={touched.memberId && Boolean(errors.memberId)}>
                                        <InputLabel>Select Member</InputLabel>
                                        <Select
                                            name="memberId"
                                            value={values.memberId}
                                            label="Select Member"
                                            onChange={(e) => handleMemberChange(e, setFieldValue)}
                                            onBlur={handleBlur}
                                        >
                                            {loading || membersLoading ? (
                                                <MenuItem value="" disabled>Loading members...</MenuItem>
                                            ) : members.length > 0 ? (
                                                members.map((member) => {
                                                    const memberId = getMemberId(member);
                                                    const displayName = getMemberDisplayName(member);

                                                    return (
                                                        <MenuItem key={memberId} value={memberId}>
                                                            {displayName || `Member ${memberId}`}
                                                        </MenuItem>
                                                    );
                                                })
                                            ) : (
                                                <MenuItem value="" disabled>
                                                    No members available
                                                </MenuItem>
                                            )}
                                        </Select>
                                        <ErrorMessage name="memberId" component="div" className="error-message" />
                                    </FormControl>
                                </Grid>

                                {/* Membership Number */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        size="small"
                                        label="Membership Number"
                                        name="membershipNumber"
                                        error={touched.membershipNumber && Boolean(errors.membershipNumber)}
                                        helperText={touched.membershipNumber && errors.membershipNumber}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                    />
                                </Grid>

                                {/* Name */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        size="small"
                                        label="Guarantor Name"
                                        name="name"
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                    />
                                </Grid>

                                {/* Address */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        size="small"
                                        label="Address"
                                        name="address"
                                        multiline
                                        rows={2}
                                        error={touched.address && Boolean(errors.address)}
                                        helperText={touched.address && errors.address}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                    />
                                </Grid>

                                {/* Add Button */}
                                <Grid size={{ xs: 12 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<AddCircle />}
                                        sx={{ mt: 1 }}
                                        disabled={loading || membersLoading}
                                    >
                                        {loading || membersLoading ? 'Loading Members...' : 'Add Guarantor'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Form>
                    )}
                </Formik>
            </Card>

            {/* Guarantors List */}
            {guarantors.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                Added Guarantors ({guarantors.length})
                            </Typography>
                        </Box>

                        <TableContainer component={Paper} elevation={2}>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#ff7e5f' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Account Type</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Account No</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>File No</TableCell>
                                       // <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Account Name</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Member</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Membership No</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Address</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {guarantors.map((guarantor, index) => (
                                        <TableRow
                                            key={guarantor.id}
                                            sx={{
                                                '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                                                '&:hover': { backgroundColor: '#f0f0f0' }
                                            }}
                                        >
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{guarantor.accountType}</TableCell>
                                            <TableCell>{guarantor.accountNumber}</TableCell>
                                            <TableCell>{guarantor.fileNumber}</TableCell>
                                            <TableCell>{guarantor.accountName}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'green',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {guarantor.memberName || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{guarantor.membershipNumber || '-'}</TableCell>
                                            <TableCell>{guarantor.name}</TableCell>
                                            <TableCell>
                                                <Tooltip title={guarantor.address}>
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                                        {guarantor.address}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Remove guarantor">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => removeGuarantor(guarantor.id)}
                                                        size="small"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Submit Button */}
            {guarantors.length > 0 && (
                <Box textAlign="center" mt={4}>
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={handleSubmit}
                        sx={{
                            px: 6,
                            py: 1.5,
                            fontSize: '1.1rem',
                            background: 'linear-gradient(45deg, #ff7e5f 30%, #feb47b 90%)',
                            boxShadow: '0 3px 5px 2px rgba(255, 126, 95, .3)',
                        }}
                    >
                        Submit Guarantor Details & Continue
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default GuarantorDetails;