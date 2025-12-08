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
                py: 2.5,
                mb: 3,
                boxShadow: "0 5px 16px rgba(0,0,0,0.08)",
                border: "1px solid #e6e6e6",
                position: "relative",
                overflow: "hidden",
            }}
        >

            {/* 🔵 Gradient Blue Accent Strip */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: 6,
                    background: "linear-gradient(90deg, #1A237E, #1976D2, #4FC3F7)",
                }}
            />

            {/* Header Content */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 1,
                }}
            >
                {/* LEFT SIDE */}
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            color: "#1A237E",
                            letterSpacing: "0.8px",
                            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                            fontSize: "20px"
                        }}
                    >
                        CA Co-Operative Thrift & Credit Society
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            color: "#555",
                            mt: 0.3,
                            fontWeight: 500
                        }}
                    >
                        Welcome to the Admin Dashboard
                    </Typography>
                </Box>

                {/* RIGHT SIDE */}
                <Stack direction="row" spacing={2.5} alignItems="center">
                    <Box textAlign="right">
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 700,
                                color: "#1A237E"
                            }}
                        >
                            Admin
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                        >
                            System Manager
                        </Typography>
                    </Box>

                    {/* Avatar */}
                    <Avatar
                        sx={{
                            bgcolor: "#1A237E",
                            width: 46,
                            height: 46,
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#fff",
                            boxShadow: "0 4px 10px rgba(26,35,126,0.4)",
                            border: "2px solid #4FC3F7"
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
                            px: 3,
                            borderRadius: 2,
                            letterSpacing: 0.3,
                            backgroundColor: "#D32F2F",
                            boxShadow: "0 3px 8px rgba(211,47,47,0.35)",
                            "&:hover": {
                                backgroundColor: "#b71c1c",
                                boxShadow: "0 5px 14px rgba(183,28,28,0.45)",
                            },
                        }}
                    >
                        Logout
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
};

export default Header;
