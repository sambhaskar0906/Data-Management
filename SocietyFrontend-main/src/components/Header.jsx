import React from "react";
import { Box, Typography, Avatar } from "@mui/material";

const Header = () => (
    <Box
        sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#fff",
            p: 2,
            boxShadow: 1,
            borderRadius: 2,
            mb: 2,
        }}
    >
        <Typography variant="h6" fontWeight="bold">
            Welcome to CA Co-Operative Thrift & Credit Socity
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">Hi, Raj Patel</Typography>
            <Avatar sx={{ bgcolor: "#3f51b5" }}>RP</Avatar>
        </Box>
    </Box>
);

export default Header;
