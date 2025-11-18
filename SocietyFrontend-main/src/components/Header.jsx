import React from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("auth");
        navigate("/login");
    };

    return (
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
                Welcome to CA Co-Operative Thrift & Credit Society
            </Typography>

            <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2">Hi, Admin</Typography>

                <Avatar sx={{ bgcolor: "#3f51b5" }}>A</Avatar>

                {/* 🔐 Logout Button */}
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );
};

export default Header;
