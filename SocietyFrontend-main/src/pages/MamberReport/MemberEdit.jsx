import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    TextField,
    CircularProgress
} from "@mui/material";
import ImageDisplay from "./ImageDisplay";

const EditFieldDialog = ({ open, onClose, fieldKey, fieldName, currentValue, onSave, loading, isImageField = false }) => {
    const [value, setValue] = useState(currentValue || "");
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        setValue(currentValue || "");
        setFile(null);
        setPreviewUrl("");
    }, [currentValue, open]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setValue(selectedFile.name);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSave = () => {
        if (isImageField && file) {
            onSave(fieldKey, file);
        } else {
            onSave(fieldKey, value);
        }
    };

    const handleClose = () => {
        setValue(currentValue || "");
        setFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        onClose();
    };

    const isCloudinaryUrl = currentValue && currentValue.includes('cloudinary');

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Edit {fieldName}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Field: {fieldName}
                    </Typography>

                    {isImageField ? (
                        <>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Current File: {currentValue ? "Uploaded" : "No file uploaded"}
                            </Typography>

                            {currentValue && !file && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                        Current Image:
                                    </Typography>
                                    <ImageDisplay
                                        imageUrl={currentValue}
                                        alt="Current"
                                        height={150}
                                    />
                                    {isCloudinaryUrl && (
                                        <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                                            ✅ Cloudinary URL
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                    Upload New Image:
                                </Typography>
                                <input
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px dashed #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </Box>

                            {previewUrl && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                        New Image Preview:
                                    </Typography>
                                    <ImageDisplay
                                        imageUrl={previewUrl}
                                        alt="Preview"
                                        height={150}
                                    />
                                </Box>
                            )}
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Current Value: {currentValue || "Empty"}
                            </Typography>
                            <TextField
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                placeholder={`Enter value for ${fieldName}`}
                                sx={{ mt: 2 }}
                            />
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={loading || (isImageField && !file && !currentValue)}
                >
                    {loading ? <CircularProgress size={24} /> : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditFieldDialog;