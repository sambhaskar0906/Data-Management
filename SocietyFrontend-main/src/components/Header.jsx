import React from "react";
import { Box, Typography, Avatar, Button, Stack, Divider } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser, logoutLocal } from "../features/auth/authSlice";

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            // 1️⃣ Call logout API
            await dispatch(logoutUser()).unwrap();
        } catch (err) {
            console.warn("Logout API failed, clearing locally");
        } finally {
            // 2️⃣ Clear local auth (IMPORTANT)
            dispatch(logoutLocal());

            // 3️⃣ Remove token (safety)
            localStorage.removeItem("token");

            // 4️⃣ Redirect
            navigate("/login", { replace: true });
        }
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
            {/* Accent strip */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: 6,
                    background:
                        "linear-gradient(90deg, #1A237E, #1976D2, #4FC3F7)",
                }}
            />

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 1,
                }}
            >
                {/* LEFT */}
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            color: "#1A237E",
                            fontSize: "20px",
                        }}
                    >
                        CA Co-Operative Thrift & Credit Society
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: "#555", mt: 0.3 }}
                    >
                        Welcome to the Admin Dashboard
                    </Typography>
                </Box>

                {/* RIGHT */}
                <Stack direction="row" spacing={2.5} alignItems="center">
                    <Box textAlign="right">
                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: "#1A237E" }}
                        >
                            Admin
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            System Manager
                        </Typography>
                    </Box>

                    <Avatar
                        sx={{
                            bgcolor: "#1A237E",
                            width: 46,
                            height: 46,
                            fontWeight: 700,
                        }}
                    >
                        A
                    </Avatar>

                    <Divider orientation="vertical" flexItem />

                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                        Logout
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
};

export default Header;
