/***  NEUMORPHISM UI — UPDATED MEMBEREDITPAGE  ***/

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Button,
    CircularProgress,
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    Chip
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";

import { useDispatch, useSelector } from "react-redux";
import { updateMember } from "../../features/member/memberSlice";
import { FIELD_MAP, getValueByPath, setValueByPath, isMissing } from "./MemberDetail";

export default function MemberEditPage({ open, member, onClose }) {

    const dispatch = useDispatch();
    const { loading } = useSelector((s) => s.members);

    const [formData, setFormData] = useState(member);

    // Soft UI theme colors
    const neu = {
        bg: "#e9eef5",
        shadowLight: "rgba(255,255,255,0.8)",
        shadowDark: "rgba(0,0,0,0.15)"
    };

    useEffect(() => {
        setFormData(member);
    }, [member]);

    const handleFieldUpdate = (path, value) => {
        setFormData(prev => {
            const updated = setValueByPath(prev, path, value);
            return { ...updated };
        });
    };

    const handleSave = () => {
        dispatch(updateMember({ id: member._id, formData })).then(() => {
            onClose();
        });
    };

    // ---------------------------
    // Editable Field – NEW UI
    // ---------------------------
    const EditableField = ({ label, value, path, onUpdate, type = "text", options = [] }) => {

        const [isEditing, setIsEditing] = useState(false);
        const [editValue, setEditValue] = useState(value);

        useEffect(() => setEditValue(value), [value]);

        const saveField = () => {
            onUpdate(path, editValue);
            setIsEditing(false);
        };

        const keyHandler = (e) => {
            if (e.key === "Enter") saveField();
            if (e.key === "Escape") setIsEditing(false);
        };

        // Neumorphic View
        const ViewMode = (
            <Box
                sx={{
                    p: 1.6,
                    borderRadius: "14px",
                    cursor: "pointer",
                    background: neu.bg,
                    border: "0",

                    transition: "0.2s",

                }}
                onClick={() => setIsEditing(true)}
            >
                <Typography variant="body2" color="text.primary">
                    {isMissing(value) ? "Missing" : (value || "Not provided")}
                </Typography>
            </Box>
        );

        // Neumorphic Input
        const InputUI = (
            <TextField
                autoFocus
                fullWidth
                size="small"
                type={type}
                value={editValue || ""}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveField}
                onKeyDown={keyHandler}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        background: neu.bg,

                        "& fieldset": { border: "0" }
                    }
                }}
            />
        );

        return (
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.6 }}>
                    {label}
                </Typography>
                {isEditing ? InputUI : ViewMode}
            </Box>
        );
    };

    // ---------------------------
    // Editable Object
    // ---------------------------
    const EditableObjectField = ({ label, value, path, onUpdate, fields }) => {

        const updateInner = (key, val) => {
            const newObj = { ...(value || {}), [key]: val };
            onUpdate(path, newObj);
        };

        return (
            <Box
                sx={{
                    mb: 3,
                    p: 2.5,
                    borderRadius: "20px",
                    background: neu.bg,

                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                    {label}
                </Typography>

                <Grid container spacing={2}>
                    {fields.map((item) => (
                        <Grid size={{ xs: 12, md: 6 }} key={item.key}>
                            <EditableField
                                label={item.label}
                                value={value?.[item.key] || ""}
                                path={item.key}
                                type={item.type}
                                onUpdate={updateInner}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    };

    // ---------------------------
    // Editable Array (Neumorphic)
    // ---------------------------
    const EditableArrayField = ({ label, values, path, onUpdate }) => {

        const [isEditing, setIsEditing] = useState(false);
        const [editValue, setEditValue] = useState(values?.join(", ") || "");

        useEffect(() => {
            setEditValue(values?.join(", ") || "");
        }, [values]);

        const saveField = () => {
            const newArray = editValue.split(",").map(s => s.trim()).filter(Boolean);
            onUpdate(path, newArray);
            setIsEditing(false);
        };

        return (
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.6 }}>
                    {label}
                </Typography>

                {isEditing ? (
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveField}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "14px",
                                background: neu.bg,

                                "& fieldset": { border: "0" }
                            }
                        }}
                        placeholder="Comma separated values"
                    />
                ) : (
                    <Box
                        sx={{
                            p: 1.4,
                            borderRadius: "14px",
                            cursor: "pointer",
                            background: neu.bg,

                        }}
                        onClick={() => setIsEditing(true)}
                    >
                        {values?.length ? (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7 }}>
                                {values.map((item, i) => (
                                    <Chip
                                        key={i}
                                        label={item}
                                        size="small"
                                        sx={{
                                            background: neu.bg,
                                            borderRadius: "10px",

                                        }}
                                    />
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Click to add values
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
        );
    };

    if (!member) return null;

    const personalFields = Object.keys(FIELD_MAP).filter(f => f.startsWith("personalDetails"));
    const referenceFields = Object.keys(FIELD_MAP).filter(f => f.startsWith("referenceDetails") && !f.includes("gurantorMno"));
    const documentFields = Object.keys(FIELD_MAP).filter(f => f.startsWith("documents"));
    const bankFields = Object.keys(FIELD_MAP).filter(f => f.startsWith("bankDetails"));
    const professionalFields = Object.keys(FIELD_MAP).filter(f => f.startsWith("professionalDetails"));

    // ---------------------------
    // RETURN UI (Dialog)
    // ---------------------------
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "25px",
                    background: neu.bg,

                }
            }}
        >
            <DialogTitle
                sx={{
                    p: 2.5,
                    borderBottom: "none",
                    fontWeight: 700,
                    display: "flex",
                    justifyContent: "space-between"
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Edit Member: {getValueByPath(formData, "personalDetails.nameOfMember") || "Unknown"}
                </Typography>

                <IconButton
                    onClick={onClose}
                    sx={{
                        background: neu.bg,
                        borderRadius: "50%",

                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* ----------------------------------------------------------- */}
            {/* MAIN FORM SECTION */}
            {/* ----------------------------------------------------------- */}
            <DialogContent dividers sx={{ maxHeight: "75vh", border: "none", p: 3 }}>
                <Grid container spacing={3}>

                    {/* PERSONAL */}
                    <Grid size={{ xs: 12 }} >
                        <Accordion
                            defaultExpanded
                            sx={{
                                borderRadius: "20px",
                                background: neu.bg,

                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Personal Details
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {personalFields.map(fieldKey => (
                                        <Grid size={{ xs: 12, md: 4 }} key={fieldKey}>
                                            <EditableField
                                                label={FIELD_MAP[fieldKey]}
                                                value={getValueByPath(formData, fieldKey)}
                                                path={fieldKey}
                                                onUpdate={handleFieldUpdate}
                                                type={fieldKey.includes("date") ? "date" : "text"}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                    {/* PROFESSIONAL */}
                    <Grid size={{ xs: 12 }} >
                        <Accordion
                            sx={{
                                borderRadius: "20px",
                                background: neu.bg,
                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Professional Details
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {professionalFields.map(fieldKey => (
                                        <Grid size={{ xs: 12, md: 6 }} key={fieldKey}>
                                            <EditableField
                                                label={FIELD_MAP[fieldKey]}
                                                value={getValueByPath(formData, fieldKey)}
                                                path={fieldKey}
                                                onUpdate={handleFieldUpdate}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                    {/* ADDRESS */}
                    <Grid size={{ xs: 12 }} >
                        <Accordion
                            defaultExpanded
                            sx={{
                                borderRadius: "20px",
                                background: neu.bg,
                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Address Details
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                {/* Permanent */}
                                <EditableObjectField
                                    label="Permanent Address"
                                    value={getValueByPath(formData, "addressDetails.permanentAddress")}
                                    path="addressDetails.permanentAddress"
                                    onUpdate={handleFieldUpdate}
                                    fields={[
                                        { key: "flatHouseNo", label: "Flat/House No" },
                                        { key: "areaStreetSector", label: "Area/Street/Sector" },
                                        { key: "locality", label: "Locality" },
                                        { key: "landmark", label: "Landmark" },
                                        { key: "city", label: "City" },
                                        { key: "country", label: "Country" },
                                        { key: "state", label: "State" },
                                        { key: "pincode", label: "Pincode" }
                                    ]}
                                />

                                {/* Current */}
                                <EditableObjectField
                                    label="Current Residential Address"
                                    value={getValueByPath(formData, "addressDetails.currentResidentalAddress")}
                                    path="addressDetails.currentResidentalAddress"
                                    onUpdate={handleFieldUpdate}
                                    fields={[
                                        { key: "flatHouseNo", label: "Flat/House No" },
                                        { key: "areaStreetSector", label: "Area/Street/Sector" },
                                        { key: "locality", label: "Locality" },
                                        { key: "landmark", label: "Landmark" },
                                        { key: "city", label: "City" },
                                        { key: "country", label: "Country" },
                                        { key: "state", label: "State" },
                                        { key: "pincode", label: "Pincode" }
                                    ]}
                                />

                                {/* Previous */}
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                                        Previous Current Addresses
                                    </Typography>

                                    {getValueByPath(formData, "addressDetails.previousCurrentAddress")?.length > 0 ? (
                                        getValueByPath(formData, "addressDetails.previousCurrentAddress").map((addr, i) => (
                                            <Box
                                                key={i}
                                                sx={{
                                                    mb: 2,
                                                    p: 2,
                                                    borderRadius: "14px",
                                                    background: neu.bg,

                                                }}
                                            >
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                    Address #{i + 1}
                                                </Typography>

                                                {Object.entries(addr).map(([key, val]) => (
                                                    <Typography key={key} variant="body2">
                                                        <strong>{key}: </strong> {val || "—"}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No previous addresses found.
                                        </Typography>
                                    )}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                    {/* REFERENCES */}
                    <Grid size={{ xs: 12 }} >
                        <Accordion
                            sx={{
                                borderRadius: "20px",
                                background: neu.bg,

                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Reference & Guarantor Details
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {referenceFields.map(fieldKey => (
                                        <Grid size={{ xs: 12 }} key={fieldKey}>
                                            <EditableField
                                                label={FIELD_MAP[fieldKey]}
                                                value={getValueByPath(formData, fieldKey)}
                                                path={fieldKey}
                                                onUpdate={handleFieldUpdate}
                                            />
                                        </Grid>
                                    ))}

                                    <Grid size={{ xs: 12 }} >
                                        <EditableArrayField
                                            label="Guarantor Mobile Numbers"
                                            values={getValueByPath(formData, "referenceDetails.gurantorMno")}
                                            path="referenceDetails.gurantorMno"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </ Accordion>
                    </Grid>

                    {/* DOCUMENTS */}
                    <Grid size={{ xs: 12 }} >
                        <Accordion
                            sx={{
                                borderRadius: "20px",
                                background: neu.bg,

                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Document Details
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {documentFields.map(fieldKey => (
                                        <Grid size={{ xs: 12, md: 4 }} key={fieldKey}>
                                            <EditableField
                                                label={FIELD_MAP[fieldKey]}
                                                value={getValueByPath(formData, fieldKey)}
                                                path={fieldKey}
                                                onUpdate={handleFieldUpdate}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </ Grid>

                    {/* BANK */}
                    <Grid size={{ xs: 12 }} >
                        <Accordion
                            sx={{
                                borderRadius: "20px",
                                background: neu.bg,

                                "&:before": { display: "none" }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Bank Details
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {bankFields.map(fieldKey => (
                                        <Grid size={{ xs: 12, md: 4 }} key={fieldKey}>
                                            <EditableField
                                                label={FIELD_MAP[fieldKey]}
                                                value={getValueByPath(formData, fieldKey)}
                                                path={fieldKey}
                                                onUpdate={handleFieldUpdate}
                                                type={fieldKey.includes("civilScore") ? "number" : "text"}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                </Grid >
            </DialogContent >

            {/* FOOTER */}
            <DialogActions DialogActions
                sx={{
                    p: 2.5,
                    borderTop: "none",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2
                }
                }
            >
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        px: 3,
                        borderRadius: "14px",
                        background: neu.bg,

                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                    disabled={loading}
                    onClick={handleSave}
                    sx={{
                        px: 3,
                        borderRadius: "14px",
                        background: "#4b70f5",
                        color: "#fff",

                        "&:hover": { background: "#3a5be0" }
                    }}
                >
                    {loading ? "Saving..." : "Save"}
                </Button>
            </DialogActions >
        </Dialog >
    );
}
