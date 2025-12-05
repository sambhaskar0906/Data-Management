import React from "react";
import { Box, Typography, Avatar, Button, Stack, Divider } from "@mui/material";
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
                background: "#ffffff",
                borderRadius: 3,
                px: 3,
                py: 2,
                mb: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: "1px solid #e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            {/* LEFT SIDE */}
            <Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: "#1a237e",
                        letterSpacing: "0.5px"
                    }}
                >
                    CA Co-Operative Thrift & Credit Society
                </Typography>

                <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 0.3 }}
                >
                    Welcome to the Admin Dashboard
                </Typography>
            </Box>

            {/* RIGHT SIDE */}
            <Stack direction="row" spacing={2} alignItems="center">
                <Box textAlign="right">
                    <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600 }}
                    >
                        Admin
                    </Typography>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        System Manager
                    </Typography>
                </Box>

                {/* Avatar Block */}
                <Avatar
                    sx={{
                        bgcolor: "#3f51b5",
                        width: 42,
                        height: 42,
                        fontSize: 18,
                        fontWeight: 700,
                        boxShadow: "0 2px 6px rgba(63,81,181,0.3)"
                    }}
                >
                    A
                </Avatar>

                <Divider orientation="vertical" flexItem />

                {/* Logout Button */}
                <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2.5,
                        borderRadius: 2,
                        boxShadow: "0 2px 5px rgba(244,67,54,0.3)",
                        "&:hover": {
                            boxShadow: "0 3px 8px rgba(244,67,54,0.5)",
                        },
                    }}
                >
                    Logout
                </Button>
            </Stack>
        </Box>
    );
};

export default Header;
