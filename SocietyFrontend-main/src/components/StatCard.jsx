import React from "react";
import { Box, Typography } from "@mui/material";

const StatCard = ({ label, value, color = "#1976D2", icon }) => (
    <Box
        sx={{
            bgcolor: "#fff",
            p: 0,
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
            borderTop: "4px solid #1A237E",
            overflow: "hidden",
            transition: "0.3s",
            "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            },
        }}
    >
        {/* ICON SECTION */}
        <Box
            sx={{
                pt: 2,
                pb: 1,
            }}
        >
            <Box
                sx={{
                    width: 55,
                    height: 55,
                    borderRadius: "50%",
                    bgcolor: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                    color: "#fff",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                }}
            >
                {icon}
            </Box>
        </Box>

        {/* ⭐ LIGHT BACKGROUND TEXT SECTION */}
        <Box
            sx={{
                bgcolor: "#F5F7FF", // 🔹 light blue-ish attractive background
                py: 2,
                px: 2,
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
            }}
        >
            <Typography variant="h5" fontWeight={700} sx={{ color: "#1A237E" }}>
                {value}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    color: "#555",
                    fontWeight: 500,
                    mt: 0.5,
                }}
            >
                {label}
            </Typography>
        </Box>
    </Box>
);

export default StatCard;
