import React, { useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Typography,
    Grid,
    Card,
    CardContent,
    Box
} from "@mui/material";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { FIELD_MAP, getValueByPath, isMissing, formatValueForUI } from "./MemberDetail";

const MemberView = ({ member, open, onClose, onSave, onDelete, loading }) => {
    const [activeView, setActiveView] = useState("all");

    if (!member) return null;

    const filteredFields = Object.keys(FIELD_MAP).filter((key) => {
        const value = getValueByPath(member, key);
        const missing = isMissing(value);

        if (activeView === "all") return true;
        if (activeView === "missing") return missing;
        if (activeView === "filled") return !missing;
        return true;
    });

    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <DialogTitle>
                <Typography variant="h5" fontWeight="bold">
                    Member Details – {member?.personalDetails?.nameOfMember}
                </Typography>
            </DialogTitle>

            <DialogContent dividers sx={{ bgcolor: "#f9f9f9" }}>
                {/* Filter buttons */}
                <Box display="flex" gap={2} mb={2}>
                    <Button
                        variant={activeView === "all" ? "contained" : "outlined"}
                        onClick={() => setActiveView("all")}
                    >
                        All Fields
                    </Button>
                    <Button
                        variant={activeView === "filled" ? "contained" : "outlined"}
                        onClick={() => setActiveView("filled")}
                    >
                        Filled
                    </Button>
                    <Button
                        variant={activeView === "missing" ? "contained" : "outlined"}
                        onClick={() => setActiveView("missing")}
                        color="error"
                    >
                        Missing
                    </Button>
                </Box>

                <Grid container spacing={2}>
                    {filteredFields.map((key) => {
                        const label = FIELD_MAP[key];
                        const value = getValueByPath(member, key);
                        const missing = isMissing(value);

                        // ************* SPECIAL CASE: Previous Addresses *************
                        if (key === "addressDetails.previousCurrentAddress") {
                            return (
                                <Grid size={{ xs: 12 }} key={key}>
                                    <Card variant="outlined" sx={{ borderColor: "primary.main" }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                                <Typography variant="h6" fontWeight={600}>
                                                    Previous Addresses
                                                </Typography>
                                            </Box>

                                            {Array.isArray(value) && value.length > 0 ? (
                                                value.map((addr, idx) => (
                                                    <Box
                                                        key={idx}
                                                        sx={{
                                                            border: "1px solid #ddd",
                                                            borderRadius: 2,
                                                            p: 2,
                                                            mb: 2,
                                                            bgcolor: "white"
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="subtitle1"
                                                            fontWeight="600"
                                                            mb={1}
                                                        >
                                                            Address {idx + 1}
                                                        </Typography>

                                                        <Grid container spacing={2}>
                                                            {Object.entries(addr).map(([k, v]) => (
                                                                k !== "_id" && (
                                                                    <Grid size={{ xs: 12, md: 4 }} key={k}>
                                                                        <Typography
                                                                            variant="caption"
                                                                            color="text.secondary"
                                                                        >
                                                                            {k}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body1"
                                                                            fontWeight="500"
                                                                        >
                                                                            {v}
                                                                        </Typography>
                                                                    </Grid>
                                                                )
                                                            ))}
                                                        </Grid>
                                                    </Box>
                                                ))
                                            ) : (
                                                <Typography color="error">
                                                    No previous addresses found
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        }

                        // ************* DEFAULT CASE FOR ALL FIELDS *************
                        return (
                            <Grid size={{ xs: 12, md: 4 }} key={key}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        borderColor: missing ? "error.main" : "success.main",
                                        bgcolor: missing ? "#fff5f5" : "#f5fff5"
                                    }}
                                >
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            {missing ? (
                                                <ErrorOutlineIcon color="error" />
                                            ) : (
                                                <CheckCircleOutlineIcon color="success" />
                                            )}
                                            <Typography
                                                variant="subtitle2"
                                                color={missing ? "error" : "success"}
                                            >
                                                {label}
                                            </Typography>
                                        </Box>

                                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                            {formatValueForUI(value)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                {filteredFields.length === 0 && (
                    <Box textAlign="center" mt={4}>
                        <Typography variant="h6" color="text.secondary">
                            No fields match this filter
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Close</Button>
                <Button
                    onClick={() => onDelete(member._id)}
                    color="error"
                    disabled={loading}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MemberView;
