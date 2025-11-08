import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Grid,
    Paper,
    TextField,
    Button,
    Stack,
    Snackbar,
    Avatar,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardMedia,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress
} from "@mui/material";
import {
    Share,
    WhatsApp,
    Facebook,
    Email,
    CloudUpload,
    Send,
    History,
    Celebration
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { createBulkMail, getBulkMailHistory, clearError, clearSuccess } from "../features/bulkMailSlice";

export default function FestivalGreetingPage() {
    const dispatch = useDispatch();
    const { loading, error, success, bulkMails } = useSelector((state) => state.bulkMail);

    const [selectedReligion, setSelectedReligion] = useState("");
    const [festivalName, setFestivalName] = useState("");
    const [customFestivalName, setCustomFestivalName] = useState("");
    const [customMessage, setCustomMessage] = useState("");
    const [senderName, setSenderName] = useState("");
    const [sendToAll, setSendToAll] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [snackOpen, setSnackOpen] = useState(false);
    const [historyDialog, setHistoryDialog] = useState(false);

    // Predefined festival suggestions
    const festivalSuggestions = {
        Muslim: ["Eid al-Fitr", "Eid al-Adha", "Ramadan", "Mawlid", "Ashura"],
        Hindu: ["Diwali", "Holi", "Dussehra", "Makar Sankranti", "Raksha Bandhan"],
        Christian: ["Christmas", "Easter", "Good Friday", "Thanksgiving", "Halloween"],
        Sikh: ["Gurpurab", "Baisakhi", "Lohri", "Hola Mohalla", "Bandhi Chhor Divas"],
        All: ["New Year", "Thanksgiving", "Friendship Day", "Independence Day", "Republic Day"]
    };

    // Form reset function
    const resetForm = () => {
        setFestivalName("");
        setCustomFestivalName("");
        setCustomMessage("");
        setSenderName("");
        setPhoto(null);
        // Don't reset religion and sendToAll
    };

    useEffect(() => {
        if (success) {
            setSnackOpen(true);
            resetForm(); // Reset form on success
            dispatch(clearSuccess());
        }
    }, [success, dispatch]);

    const handleCreateBulkMail = async () => {
        const finalFestivalName = festivalName === "Other" ? customFestivalName : festivalName;

        if (!finalFestivalName || !customMessage || !senderName) {
            dispatch(clearError());
            dispatch(createBulkMail.rejected({ message: "Please fill all required fields" }));
            return;
        }

        const formData = new FormData();
        formData.append("religion", selectedReligion);
        formData.append("festivalName", finalFestivalName);
        formData.append("customMessage", customMessage);
        formData.append("yourName", senderName);
        formData.append("sendToAll", sendToAll.toString());
        if (photo) {
            formData.append("photo", photo);
        }

        console.log("Sending form data:", {
            religion: selectedReligion,
            festivalName: finalFestivalName,
            customMessage,
            yourName: senderName,
            sendToAll: sendToAll.toString(),
            hasPhoto: !!photo
        });

        dispatch(createBulkMail(formData));
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                dispatch(clearError());
                dispatch(createBulkMail.rejected({ message: "File size should be less than 5MB" }));
                return;
            }
            setPhoto(file);
        }
    };

    const handleViewHistory = () => {
        console.log("Fetching history for religion:", selectedReligion);
        dispatch(getBulkMailHistory({ religion: selectedReligion, page: 1, limit: 10 }));
        setHistoryDialog(true);
    };

    const getGreetingPreview = () => {
        if (customMessage) return customMessage;

        const defaultGreetings = {
            Muslim: "Eid Mubarak! May Allah bless you with happiness, peace, and prosperity.",
            Hindu: "Happy Diwali! May the festival of lights bring joy and happiness to your life.",
            Christian: "Merry Christmas! Wishing you and your family a wonderful holiday season.",
            Sikh: "Happy Gurpurab! May the Guru's blessings always be with you.",
            All: "Warm greetings and best wishes to you and your family!"
        };

        return defaultGreetings[selectedReligion] || "Warm wishes on this special occasion!";
    };

    const getFinalFestivalName = () => {
        return festivalName === "Other" ? customFestivalName : festivalName;
    };

    return (
        <Box sx={{
            p: 4,
            bgcolor: "background.default",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }}>
            {/* Header */}
            <Box textAlign="center" mb={4}>
                <Typography
                    variant="h3"
                    fontWeight="bold"
                    color="white"
                    gutterBottom
                    sx={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
                >
                    🎉 Festival Greetings 🎉
                </Typography>
                <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
                    Send beautiful festival wishes to all society members
                </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
                {/* Left Side - Form */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{
                        p: 4,
                        borderRadius: 4,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        background: "white"
                    }}>
                        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                            <Celebration sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Create Festival Greeting
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                ✅ Bulk mail created successfully! Emails are being sent.
                            </Alert>
                        )}

                        {/* Send to All Toggle */}
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={sendToAll}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setSendToAll(isChecked);
                                        if (isChecked) {
                                            setSelectedReligion("All");
                                        } else {
                                            setSelectedReligion("Muslim");
                                        }
                                    }}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="h6" color="primary">
                                    Send to <strong>ALL</strong> Members
                                </Typography>
                            }
                            sx={{ mb: 3 }}
                        />

                        {/* Religion Selection - Only show if not sending to all */}
                        {!sendToAll && (
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Select Religion</InputLabel>
                                <Select
                                    value={selectedReligion}
                                    label="Select Religion"
                                    onChange={(e) => setSelectedReligion(e.target.value)}
                                >
                                    <MenuItem value="Muslim">Muslim</MenuItem>
                                    <MenuItem value="Hindu">Hindu</MenuItem>
                                    <MenuItem value="Christian">Christian</MenuItem>
                                    <MenuItem value="Sikh">Sikh</MenuItem>
                                </Select>
                            </FormControl>
                        )}

                        {/* Festival Name Section */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Festival Name *
                            </Typography>

                            {/* Dropdown for predefined festivals */}
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Choose Festival</InputLabel>
                                <Select
                                    value={festivalName}
                                    label="Choose Festival"
                                    onChange={(e) => setFestivalName(e.target.value)}
                                >
                                    {/* Show festivals based on selection */}
                                    {sendToAll ? (
                                        festivalSuggestions["All"]?.map(festival => (
                                            <MenuItem key={festival} value={festival}>
                                                {festival}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        festivalSuggestions[selectedReligion]?.map(festival => (
                                            <MenuItem key={festival} value={festival}>
                                                {festival}
                                            </MenuItem>
                                        ))
                                    )}
                                    <MenuItem value="Other">Other (Custom Name)</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Custom festival name input */}
                            {festivalName === "Other" && (
                                <TextField
                                    label="Enter Custom Festival Name *"
                                    value={customFestivalName}
                                    onChange={(e) => setCustomFestivalName(e.target.value)}
                                    fullWidth
                                    placeholder={sendToAll ? "e.g., Society Anniversary, Community Event" : "e.g., Pongal, Onam, Chhath"}
                                    helperText="Enter any festival or occasion name"
                                />
                            )}

                            {/* Direct text input for quick entry */}
                            <TextField
                                label="Or Type Festival Name Directly *"
                                value={festivalName === "Other" ? customFestivalName : festivalName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setCustomFestivalName(value);
                                    setFestivalName("Other");
                                }}
                                fullWidth
                                sx={{ mt: 2 }}
                                placeholder={sendToAll ? "Enter any occasion name..." : "Enter festival name..."}
                                helperText="Type any festival or occasion name directly"
                            />
                        </Box>

                        {/* Custom Message */}
                        <TextField
                            label="Custom Greeting Message *"
                            multiline
                            rows={4}
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            fullWidth
                            placeholder={getGreetingPreview()}
                            sx={{ mb: 3 }}
                            helperText="Write a heartfelt message for the festival"
                        />

                        {/* Sender Name */}
                        <TextField
                            label="Your Name *"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            fullWidth
                            sx={{ mb: 3 }}
                            helperText="This will appear as the sender name"
                        />

                        {/* Photo Upload */}
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                            fullWidth
                            sx={{ mb: 3, py: 1.5 }}
                        >
                            {photo ? "Change Festival Photo" : "Upload Festival Photo (Optional)"}
                            <input hidden accept="image/*" type="file" onChange={handlePhotoUpload} />
                        </Button>

                        {photo && (
                            <Box textAlign="center" mb={3}>
                                <Avatar
                                    src={URL.createObjectURL(photo)}
                                    alt="Festival"
                                    variant="rounded"
                                    sx={{
                                        width: "100%",
                                        height: 200,
                                        borderRadius: 3,
                                        boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {photo.name}
                                </Typography>
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => setPhoto(null)}
                                    sx={{ mt: 1 }}
                                >
                                    Remove Photo
                                </Button>
                            </Box>
                        )}

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                                onClick={handleCreateBulkMail}
                                disabled={loading || !getFinalFestivalName() || !customMessage || !senderName}
                                fullWidth
                                sx={{ py: 1.5 }}
                            >
                                {loading ? "Sending..." : "Send Bulk Email"}
                            </Button>
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                startIcon={<History />}
                                onClick={handleViewHistory}
                                fullWidth
                            >
                                View Sent History
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={resetForm}
                                fullWidth
                            >
                                Clear Form
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Right Side - Preview */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{
                        p: 4,
                        borderRadius: 4,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        background: "white",
                        height: "fit-content"
                    }}>
                        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                            <Share sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Email Preview
                        </Typography>

                        <Card sx={{
                            border: "2px solid",
                            borderColor: "primary.light",
                            borderRadius: 3,
                            overflow: "hidden",
                            minHeight: 400
                        }}>
                            {photo && (
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={URL.createObjectURL(photo)}
                                    alt="Festival"
                                />
                            )}

                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" color="primary" gutterBottom>
                                    🎉 {getFinalFestivalName() || "Festival Name"} Greetings 🎉
                                </Typography>

                                <Typography variant="body1" paragraph sx={{ lineHeight: 1.6, minHeight: 120 }}>
                                    {customMessage || getGreetingPreview()}
                                </Typography>

                                {senderName && (
                                    <Typography variant="body2" color="text.secondary">
                                        With warm regards,
                                        <br />
                                        <strong>{senderName}</strong>
                                    </Typography>
                                )}

                                <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        This email will be sent to:{" "}
                                        <strong>
                                            {sendToAll ? "ALL society members" : `${selectedReligion} members only`}
                                        </strong>
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Paper>
                </Grid>
            </Grid>

            {/* History Dialog */}
            <Dialog
                open={historyDialog}
                onClose={() => setHistoryDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight="bold">
                        <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Sent Email History - {selectedReligion || "All"}
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    {bulkMails && bulkMails.length === 0 ? (
                        <Typography color="text.secondary" textAlign="center" py={4}>
                            No sent emails found for {selectedReligion || "All"}
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {bulkMails?.map((mail) => (
                                <Card key={mail._id} variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6">
                                            <Celebration sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
                                            {mail.festivalName}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Religion: {mail.religion} |
                                            Recipients: {mail.totalRecipients} |
                                            Sent: {mail.sentCount} |
                                            Failed: {mail.failedCount}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Date: {new Date(mail.createdAt).toLocaleDateString()}
                                            Status: <strong>{mail.status}</strong>
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(mail.sentCount / mail.totalRecipients) * 100}
                                            sx={{ mt: 1 }}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setHistoryDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
                message="✅ Bulk mail created successfully! Form has been reset."
            />
        </Box>
    );
}