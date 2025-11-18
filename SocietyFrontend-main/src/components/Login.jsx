import React, { useState } from "react";
import {
    Box,
    TextField,
    Typography,
    Button,
    Paper,
    InputAdornment,
} from "@mui/material";
import { Email, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        if (email === "admin@co-operative.in" && password === "Admin@123") {
            localStorage.setItem("auth", "true");
            navigate("/dashboard");
        } else {
            setError("Invalid Email or Password");
        }
    };

    return (
        <Box
            sx={{
                height: "97vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg,#2C3E50,#4CA1AF)",
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    width: 400,
                    padding: 4,
                    borderRadius: 4,
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{ mb: 1, color: "#2C3E50" }}
                >
                    CA Co-operative Society
                </Typography>

                <Typography sx={{ mb: 3, opacity: 0.8 }}>
                    Admin Login Panel
                </Typography>

                <form onSubmit={handleLogin}>
                    <TextField
                        label="Email"
                        fullWidth
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Email />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {error && (
                        <Typography color="error" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                            mt: 3,
                            py: 1,
                            fontSize: "16px",
                            background: "#2C3E50",
                            "&:hover": { background: "#1a242f" },
                        }}
                    >
                        Login
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default Login;
