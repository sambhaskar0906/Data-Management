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
    Box,
    IconButton,
    Chip
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { FIELD_MAP, getValueByPath, isMissing, formatValueForUI } from "./MemberDetail";

const MemberView = ({ member, open, onClose, onDelete, loading }) => {
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
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            PaperProps={{
                sx: {
                    background: "linear-gradient(to bottom right, #fdfdfd, #f3f6ff)",
                }
            }}
        >
            {/* TITLE BAR */}
            <DialogTitle
                sx={{
                    fontWeight: 700,
                    fontSize: "22px",
                    position: "relative",
                    pr: 6
                }}
            >
                Member Details – {member?.personalDetails?.nameOfMember}

                {/* CLOSE Icon Button */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 10,
                        top: 10,
                        bgcolor: "#fff",
                        boxShadow: 2,
                        "&:hover": { bgcolor: "#f0f0f0" }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ background: "transparent" }}>
                {/* FILTER BUTTONS */}
                <Box display="flex" gap={1.5} mb={2}>
                    {[
                        { id: "all", label: "All Fields" },
                        { id: "filled", label: "Filled" },
                        { id: "missing", label: "Missing" }
                    ].map((item) => (
                        <Chip
                            key={item.id}
                            label={item.label}
                            color={
                                item.id === "missing"
                                    ? "error"
                                    : item.id === activeView
                                        ? "primary"
                                        : "default"
                            }
                            variant={activeView === item.id ? "filled" : "outlined"}
                            onClick={() => setActiveView(item.id)}
                            sx={{
                                fontWeight: 600,
                                px: 2,
                                py: 1,
                                fontSize: "14px"
                            }}
                        />
                    ))}
                </Box>

                {/* FIELDS GRID */}
                <Grid container spacing={2}>
                    {filteredFields.map((key) => {
                        const label = FIELD_MAP[key];
                        const value = getValueByPath(member, key);
                        const missing = isMissing(value);

                        // ==== SPECIAL PREVIOUS ADDRESS SECTION ====
                        if (key === "addressDetails.previousCurrentAddress") {
                            return (
                                <Grid size={{ xs: 12 }} key={key}>
                                    <Card
                                        sx={{
                                            borderRadius: 3,
                                            boxShadow: 3,
                                            borderLeft: "6px solid #3949ab"
                                        }}
                                    >
                                        <CardContent>
                                            <Typography
                                                variant="h6"
                                                fontWeight="600"
                                                mb={2}
                                                color="primary"
                                            >
                                                Previous Addresses
                                            </Typography>

                                            {Array.isArray(value) && value.length > 0 ? (
                                                value.map((addr, idx) => (
                                                    <Box
                                                        key={idx}
                                                        sx={{
                                                            border: "1px solid #e0e0e0",
                                                            borderRadius: 2,
                                                            p: 2,
                                                            mb: 2,
                                                            background: "#fff",
                                                        }}
                                                    >
                                                        <Typography fontWeight="600" mb={1}>
                                                            Address {idx + 1}
                                                        </Typography>

                                                        <Grid container spacing={2}>
                                                            {Object.entries(addr).map(([k, v]) =>
                                                                k !== "_id" ? (
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
                                                                ) : null
                                                            )}
                                                        </Grid>
                                                    </Box>
                                                ))
                                            ) : (
                                                <Typography color="error">
                                                    No previous addresses found.
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        }

                        // ==== DEFAULT FIELD CARD ====
                        return (
                            <Grid size={{ xs: 12, md: 4 }} key={key}>
                                <Card
                                    sx={{
                                        borderRadius: 3,
                                        boxShadow: 2,
                                        transition: "0.2s",
                                        "&:hover": { boxShadow: 4 },
                                        borderLeft: `6px solid ${missing ? "#d32f2f" : "#2e7d32"}`,
                                        background: missing ? "#fff6f6" : "#f4fff4",
                                    }}
                                >
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                            {missing ? (
                                                <ErrorOutlineIcon color="error" />
                                            ) : (
                                                <CheckCircleOutlineIcon color="success" />
                                            )}
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="600"
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

                {/* EMPTY STATE */}
                {filteredFields.length === 0 && (
                    <Box textAlign="center" mt={4}>
                        <Typography variant="h6" color="text.secondary">
                            No fields match this filter.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={() => onDelete(member._id)}
                    color="error"
                    variant="contained"
                    disabled={loading}
                >
                    Delete Member
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MemberView;