import React, { useState } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent } from "@mui/material";

const ImageDisplay = ({ imageUrl, alt, height = 120 }) => {
    const [imgError, setImgError] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);

    const handleImageClick = () => {
        if (imageUrl && !imgError) {
            setShowFullImage(true);
        }
    };

    const handleCloseFullImage = () => {
        setShowFullImage(false);
    };

    if (!imageUrl || imgError) {
        return (
            <Box
                sx={{
                    height: height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    border: '1px dashed #ddd'
                }}
            >
                <Typography variant="caption" color="text.secondary">
                    No Image
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                        opacity: 0.8,
                        transition: 'opacity 0.2s'
                    }
                }}
                onClick={handleImageClick}
                title="Click to view full image"
            >
                <img
                    src={imageUrl}
                    alt={alt}
                    style={{
                        maxWidth: '100%',
                        height: height,
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                    }}
                    onError={() => setImgError(true)}
                    onLoad={() => setImgError(false)}
                />
            </Box>

            {/* Full Image Modal */}
            <Dialog
                open={showFullImage}
                onClose={handleCloseFullImage}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{alt}</Typography>
                        <Button
                            onClick={handleCloseFullImage}
                            color="primary"
                        >
                            Close
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                        <img
                            src={imageUrl}
                            alt={alt}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                                borderRadius: '8px'
                            }}
                        />
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button
                            variant="outlined"
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open Image in New Tab
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ImageDisplay;