import React, { useState } from "react";
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

// Validation Schema for Guarantor
const guarantorValidationSchema = Yup.object({
    accountType: Yup.string().required('Account Type is required'),
    accountNumber: Yup.string().required('Account Number is required'),
    fileNumber: Yup.string().required('File Number is required'),
    accountName: Yup.string().required('Account Name is required'),
    suretyOption: Yup.string().required('Surety Option is required'),
    membershipNumber: Yup.string().when('suretyOption', {
        is: 'given',
        then: schema => schema.required('Membership Number is required for Given surety'),
        otherwise: schema => schema.notRequired()
    }),
    name: Yup.string().required('Name is required'),
    address: Yup.string().required('Address is required')
});

const GuarantorDetails = ({ loanFormData, onGuarantorSubmit, guarantorDetails }) => {
    const [guarantors, setGuarantors] = useState(guarantorDetails.guarantors || []);
    const [submitted, setSubmitted] = useState(false);

    const initialValues = {
        accountType: "",
        accountNumber: "",
        fileNumber: "",
        accountName: "",
        suretyOption: "",
        membershipNumber: "",
        name: "",
        address: ""
    };

    const handleAddGuarantor = (values, { resetForm }) => {
        const newGuarantor = {
            id: Date.now(),
            ...values
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
        onGuarantorSubmit(guarantorPayload);
    };

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
                        Guarantor Information & Surety Details
                    </Typography>
                </CardContent>
            </Card>

            {submitted && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Guarantor Details Submitted Successfully!
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
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                        <Form>
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
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        size="small"
                                        label="Account Name"
                                        name="accountName"
                                        error={touched.accountName && Boolean(errors.accountName)}
                                        helperText={touched.accountName && errors.accountName}
                                    />
                                </Grid>

                                {/* Surety Option */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Surety Option</InputLabel>
                                        <Field
                                            as={Select}
                                            name="suretyOption"
                                            label="Surety Option"
                                            error={touched.suretyOption && Boolean(errors.suretyOption)}
                                        >
                                            <MenuItem value="given">Given</MenuItem>
                                            <MenuItem value="taken">Taken</MenuItem>
                                        </Field>
                                        <ErrorMessage name="suretyOption" component="div" className="error-message" />
                                    </FormControl>
                                </Grid>

                                {/* Membership Number (conditionally shown) */}
                                {values.suretyOption === 'given' && (
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Field
                                            as={TextField}
                                            fullWidth
                                            size="small"
                                            label="Membership Number"
                                            name="membershipNumber"
                                            error={touched.membershipNumber && Boolean(errors.membershipNumber)}
                                            helperText={touched.membershipNumber && errors.membershipNumber}
                                        />
                                    </Grid>
                                )}

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
                                    />
                                </Grid>

                                {/* Add Button */}
                                <Grid size={{ xs: 12 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<AddCircle />}
                                        sx={{ mt: 1 }}
                                    >
                                        Add Guarantor
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
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Account Name</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Surety</TableCell>
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
                                                        color: guarantor.suretyOption === 'given' ? 'green' : 'blue',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {guarantor.suretyOption?.toUpperCase()}
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