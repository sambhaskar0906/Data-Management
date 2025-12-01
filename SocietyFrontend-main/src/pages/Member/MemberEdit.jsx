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

    useEffect(() => {
        setFormData(member);
    }, [member]);

    const handleFieldUpdate = (path, value) => {
        setFormData(prev => setValueByPath(prev, path, value));
    };

    const handleSave = () => {
        dispatch(updateMember({ id: member._id, formData })).then(() => {
            onClose();
        });
    };

    const EditableField = ({ label, value, path, onUpdate, type = "text", options = [] }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editValue, setEditValue] = useState(value);

        useEffect(() => setEditValue(value), [value]);

        const saveField = () => {
            onUpdate(path, editValue);
            setIsEditing(false);
        };

        const cancelEdit = () => {
            setEditValue(value);
            setIsEditing(false);
        };

        const keyHandler = (e) => {
            if (e.key === "Enter") saveField();
            if (e.key === "Escape") cancelEdit();
        };

        const ViewMode = (
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: 1,
                    cursor: "pointer",
                    border: "1px solid #e0e0e0",
                    backgroundColor: isMissing(value) ? "#fff0f0" : "#fafafa",
                    "&:hover": {
                        border: "1px solid #1976d2",
                        backgroundColor: "#f0f8ff"
                    }
                }}
                onClick={() => setIsEditing(true)}
            >
                <Typography variant="body2" color={isMissing(value) ? "error" : "text.primary"}>
                    {isMissing(value) ? "Missing" : (value || "Not provided")}
                </Typography>
            </Box>
        );

        const EditMode = (() => {
            if (type === "select") {
                return (
                    <FormControl fullWidth size="small">
                        <Select
                            autoFocus
                            value={editValue || ""}
                            onBlur={saveField}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={keyHandler}
                        >
                            {options.map((o) => (
                                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            }

            if (type === "date") {
                return (
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        type="date"
                        value={editValue || ""}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveField}
                        onKeyDown={keyHandler}
                        InputLabelProps={{ shrink: true }}
                    />
                );
            }

            return (
                <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    type={type}
                    value={editValue || ""}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveField}
                    onKeyDown={keyHandler}
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            );
        })();

        return (
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    {label}
                </Typography>
                {isEditing ? EditMode : ViewMode}
            </Box>
        );
    };

    const EditableObjectField = ({ label, value, path, onUpdate, fields }) => {
        const updateInner = (key, val) => {
            const newObj = { ...(value || {}), [key]: val };
            onUpdate(path, newObj);
        };

        return (
            <Box sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ fontSize: "1.1rem", fontWeight: 600 }}>
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

    const EditableArrayField = ({ label, values, path, onUpdate }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [editValue, setEditValue] = useState(values?.join(", ") || "");

        useEffect(() => {
            setEditValue(values?.join(", ") || "");
        }, [values]);

        const saveField = () => {
            const newArray = editValue.split(",").map(item => item.trim()).filter(item => item);
            onUpdate(path, newArray);
            setIsEditing(false);
        };

        const keyHandler = (e) => {
            if (e.key === "Enter") saveField();
            if (e.key === "Escape") setIsEditing(false);
        };

        return (
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
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
                        onKeyDown={keyHandler}
                        placeholder="Enter values separated by commas"
                    />
                ) : (
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 1,
                            cursor: "pointer",
                            border: "1px solid #e0e0e0",
                            backgroundColor: "#fafafa",
                            "&:hover": {
                                border: "1px solid #1976d2",
                                backgroundColor: "#f0f8ff"
                            }
                        }}
                        onClick={() => setIsEditing(true)}
                    >
                        {values?.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {values.map((item, index) => (
                                    <Chip key={index} label={item} size="small" variant="outlined" />
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

    const personalFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('personalDetails'));
    const referenceFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('referenceDetails') && !f.includes('gurantorMno'));
    const documentFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('documents'));
    const bankFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('bankDetails'));
    const professionalFields = Object.keys(FIELD_MAP).filter(f => f.startsWith('professionalDetails')); // ADDED PROFESSIONAL FIELDS

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ borderBottom: "1px solid #e0e0e0", pb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Edit Member: {getValueByPath(formData, "personalDetails.nameOfMember") || "Unknown"}
                    </Typography>
                    <IconButton onClick={onClose} disabled={loading}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ maxHeight: '70vh' }}>
                <Grid container spacing={3}>
                    {/* Personal Details */}
                    <Grid size={{ xs: 12 }}>
                        <Accordion defaultExpanded sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Personal Details
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {personalFields.map(fieldKey => (
                                        <Grid size={{ xs: 12, md: 6 }} md={4} key={fieldKey}>
                                            <EditableField
                                                label={FIELD_MAP[fieldKey]}
                                                value={getValueByPath(formData, fieldKey)}
                                                path={fieldKey}
                                                onUpdate={handleFieldUpdate}
                                                type={fieldKey.includes('date') ? 'date' : 'text'}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                    {/* Professional Details - ADDED THIS SECTION */}
                    <Grid size={{ xs: 12 }}>
                        <Accordion sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
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

                    {/* Address Details */}
                    <Grid size={{ xs: 12 }}>
                        <Accordion defaultExpanded sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Address Details
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <EditableObjectField
                                    label="Permanent Address"
                                    value={getValueByPath(formData, 'addressDetails.permanentAddress')}
                                    path="addressDetails.permanentAddress"
                                    onUpdate={handleFieldUpdate}
                                    fields={[
                                        { key: 'flatHouseNo', label: 'Flat/House No' },
                                        { key: 'areaStreetSector', label: 'Area/Street/Sector' },
                                        { key: 'locality', label: 'Locality' },
                                        { key: 'landmark', label: 'Landmark' },
                                        { key: 'city', label: 'City' },
                                        { key: 'country', label: 'Country' },
                                        { key: 'state', label: 'State' },
                                        { key: 'pincode', label: 'Pincode' },
                                    ]}
                                />

                                <EditableObjectField
                                    label="Current Residential Address"
                                    value={getValueByPath(formData, 'addressDetails.currentResidentalAddress')}
                                    path="addressDetails.currentResidentalAddress"
                                    onUpdate={handleFieldUpdate}
                                    fields={[
                                        { key: 'flatHouseNo', label: 'Flat/House No' },
                                        { key: 'areaStreetSector', label: 'Area/Street/Sector' },
                                        { key: 'locality', label: 'Locality' },
                                        { key: 'landmark', label: 'Landmark' },
                                        { key: 'city', label: 'City' },
                                        { key: 'country', label: 'Country' },
                                        { key: 'state', label: 'State' },
                                        { key: 'pincode', label: 'Pincode' },
                                    ]}
                                />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                    {/* Reference Details */}
                    <Grid size={{ xs: 12 }}>
                        <Accordion sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Reference & Guarantor Details
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {referenceFields.map(fieldKey => (
                                        <Grid size={{ xs: 12, }} key={fieldKey}>
                                            <EditableField
                                                label={FIELD_MAP[fieldKey]}
                                                value={getValueByPath(formData, fieldKey)}
                                                path={fieldKey}
                                                onUpdate={handleFieldUpdate}
                                            />
                                        </Grid>
                                    ))}
                                    <Grid size={{ xs: 12 }}>
                                        <EditableArrayField
                                            label="Guarantor Mobile Numbers"
                                            values={getValueByPath(formData, 'referenceDetails.gurantorMno')}
                                            path="referenceDetails.gurantorMno"
                                            onUpdate={handleFieldUpdate}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                    {/* Documents Section */}
                    <Grid size={{ xs: 12 }}>
                        <Accordion sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Document Details
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {documentFields.map(fieldKey => (
                                        <Grid size={{ xs: 12, md: 6 }} md={4} key={fieldKey}>
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

                    {/* Bank Details */}
                    <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <Accordion sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Bank Details
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {bankFields.map(fieldKey => (
                                        <Grid size={{ xs: 12, md: 6 }} md={4} key={fieldKey}>
                                            <EditableField
                                                label={FIELD_MAP[fieldKey]}
                                                value={getValueByPath(formData, fieldKey)}
                                                path={fieldKey}
                                                onUpdate={handleFieldUpdate}
                                                type={fieldKey.includes('civilScore') ? 'number' : 'text'}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ borderTop: "1px solid #e0e0e0", p: 2 }}>
                <Button onClick={onClose} disabled={loading} sx={{ minWidth: 100 }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                    disabled={loading}
                    onClick={handleSave}
                    sx={{ minWidth: 120 }}
                >
                    {loading ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}