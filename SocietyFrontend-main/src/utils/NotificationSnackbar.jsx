import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Snackbar, Alert } from "@mui/material";
import { clearError, clearSuccessMessage } from "../features/member/memberSlice";

const NotificationSnackbar = ({ error, successMessage }) => {
    const dispatch = useDispatch();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("info");

    useEffect(() => {
        // Only show snackbar if there's a meaningful error or success message
        if (error && error.trim() !== "" && error !== "Member not found") {
            setSnackbarOpen(true);
            setAlertMessage(error);
            setAlertSeverity("error");
        } else if (successMessage && successMessage.trim() !== "") {
            setSnackbarOpen(true);
            setAlertMessage(successMessage);
            setAlertSeverity("success");
        }
    }, [error, successMessage]);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
        setTimeout(() => {
            if (error) dispatch(clearError());
            if (successMessage) dispatch(clearSuccessMessage());
        }, 100);
    };

    // Don't render if there's no meaningful message
    if (!alertMessage || alertMessage.trim() === "") {
        return null;
    }

    return (
        <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert
                onClose={handleSnackbarClose}
                severity={alertSeverity}
                sx={{ width: '100%' }}
                variant="filled"
            >
                {alertMessage}
            </Alert>
        </Snackbar>
    );
};

export default NotificationSnackbar;