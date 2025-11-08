import React from 'react';
import { TextField } from '@mui/material';

const StyledTextField = ({ label, value, onChange, ...props }) => (
    <TextField
        fullWidth
        label={label}
        value={value}
        onChange={onChange}
        variant="outlined"
        size="small"
        sx={{
            '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f8fafc',
                '&:hover': {
                    backgroundColor: '#f1f5f9',
                }
            },
            '& .MuiInputLabel-root': {
                fontWeight: 500,
            }
        }}
        {...props}
    />
);

export default StyledTextField;