import React from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';

const FormHeader = ({ activeStep, totalSteps }) => {
    return (
        <Card sx={{
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    🏛️ CATC MEMBER DOSSIER
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Complete Member Profile Management System
                </Typography>
                <Chip
                    label={`Step ${activeStep + 1} of ${totalSteps}`}
                    sx={{
                        mt: 2,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 'bold'
                    }}
                />
            </CardContent>
        </Card>
    );
};

export default FormHeader;