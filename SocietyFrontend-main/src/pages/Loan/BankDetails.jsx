import React from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper
} from '@mui/material';
import { Formik, Form, Field } from 'formik';

const BankDetails = ({ onBankDetailsSubmit, bankDetails }) => {
    const initialValues = {
        bankName: bankDetails.bankName || '',
        branchName: bankDetails.branchName || '',
        accountNumber: bankDetails.accountNumber || '',
        ifscCode: bankDetails.ifscCode || '',
        accountHolderName: bankDetails.accountHolderName || ''
    };

    const validationSchema = {
        bankName: (value) => !value ? 'Bank Name is required' : null,
        branchName: (value) => !value ? 'Branch Name is required' : null,
        accountNumber: (value) => {
            if (!value) return 'Account Number is required';
            if (!/^\d+$/.test(value)) return 'Account Number must contain only digits';
            if (value.length < 9) return 'Account Number must be at least 9 digits';
            if (value.length > 18) return 'Account Number cannot exceed 18 digits';
            return null;
        },
        ifscCode: (value) => {
            if (!value) return 'IFSC Code is required';
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) return 'Invalid IFSC Code format';
            return null;
        },
        accountHolderName: (value) => !value ? 'Account Holder Name is required' : null
    };

    const validateForm = (values) => {
        const errors = {};
        Object.keys(validationSchema).forEach(key => {
            const error = validationSchema[key](values[key]);
            if (error) errors[key] = error;
        });
        return errors;
    };

    const handleSubmit = (values, { setSubmitting }) => {
        onBankDetailsSubmit(values);
        setSubmitting(false);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Bank Details
            </Typography>

            <Formik
                initialValues={initialValues}
                validate={validateForm}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                    <Form>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Field name="bankName">
                                {({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Bank Name"
                                        variant="outlined"
                                        fullWidth
                                        error={touched.bankName && Boolean(errors.bankName)}
                                        helperText={touched.bankName && errors.bankName}
                                    />
                                )}
                            </Field>

                            <Field name="branchName">
                                {({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Branch Name"
                                        variant="outlined"
                                        fullWidth
                                        error={touched.branchName && Boolean(errors.branchName)}
                                        helperText={touched.branchName && errors.branchName}
                                    />
                                )}
                            </Field>

                            <Field name="accountNumber">
                                {({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Account Number"
                                        variant="outlined"
                                        fullWidth
                                        error={touched.accountNumber && Boolean(errors.accountNumber)}
                                        helperText={touched.accountNumber && errors.accountNumber}
                                    />
                                )}
                            </Field>

                            <Field name="ifscCode">
                                {({ field }) => (
                                    <TextField
                                        {...field}
                                        label="IFSC Code"
                                        variant="outlined"
                                        fullWidth
                                        error={touched.ifscCode && Boolean(errors.ifscCode)}
                                        helperText={touched.ifscCode && errors.ifscCode}
                                        placeholder="e.g., SBIN0001234"
                                    />
                                )}
                            </Field>

                            <Field name="accountHolderName">
                                {({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Account Holder Name"
                                        variant="outlined"
                                        fullWidth
                                        error={touched.accountHolderName && Boolean(errors.accountHolderName)}
                                        helperText={touched.accountHolderName && errors.accountHolderName}
                                    />
                                )}
                            </Field>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting}
                                sx={{ mt: 2 }}
                            >
                                Continue to PDC Details
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Paper>
    );
};

export default BankDetails;