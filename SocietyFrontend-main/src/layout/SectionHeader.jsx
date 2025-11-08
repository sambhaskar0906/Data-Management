import React from 'react';
import { Box, Typography } from '@mui/material';

const SectionHeader = ({ icon, title, subtitle }) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 4,
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        color: 'white'
    }}>
        <Box sx={{
            mr: 2,
            p: 1,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 2
        }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h5" fontWeight="bold">
                {title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {subtitle}
            </Typography>
        </Box>
    </Box>
);

export default SectionHeader;