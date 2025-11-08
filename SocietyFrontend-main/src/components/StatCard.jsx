import React from "react";
import { Box, Typography } from "@mui/material";

const StatCard = ({ label, value, color, icon }) => (
    <Box
        sx={{
            bgcolor: "#fff",
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
            textAlign: "center",
        }}
    >
        <Box
            sx={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                bgcolor: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px",
            }}
        >
            {icon}
        </Box>
        <Typography variant="h5" fontWeight="bold">
            {value}
        </Typography>
        <Typography variant="body2" color="textSecondary">
            {label}
        </Typography>
    </Box>
);

export default StatCard;
