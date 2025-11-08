import React from 'react';
import { Card, CardContent, Stepper, Step, StepLabel, Typography, Box } from '@mui/material';

const FormStepper = ({ activeStep, steps }) => {
    return (
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        backgroundColor: activeStep >= index ? '#667eea' : '#e5e7eb',
                                        color: activeStep >= index ? 'white' : '#9ca3af',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '1.2rem',
                                        boxShadow: activeStep >= index ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                                    }}>
                                        {activeStep > index ? '✓' : step.icon}
                                    </Box>
                                )}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color={activeStep >= index ? '#667eea' : '#9ca3af'}
                                >
                                    {step.label}
                                </Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </CardContent>
        </Card>
    );
};

export default FormStepper;