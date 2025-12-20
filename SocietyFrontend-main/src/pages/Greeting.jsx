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
    LinearProgress,
    Divider
} from "@mui/material";
import {
    Share,
    CloudUpload,
    Send,
    History,
    Celebration
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
    createBulkMail,
    getBulkMailHistory,
    clearError,
    clearSuccess
} from "../features/bulkMailSlice";

export default function FestivalGreetingPage() {
    const dispatch = useDispatch();
    const { loading, error, success, bulkMails } = useSelector((s) => s.bulkMail);

    const [selectedReligion, setSelectedReligion] = useState("Muslim");
    const [festivalName, setFestivalName] = useState("");
    const [customFestivalName, setCustomFestivalName] = useState("");
    const [customMessage, setCustomMessage] = useState("");
    const [senderName, setSenderName] = useState("");
    const [sendToAll, setSendToAll] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [historyDialog, setHistoryDialog] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);

    const festivalSuggestions = {
        Muslim: ["Eid al-Fitr", "Eid al-Adha", "Ramadan"],
        Hindu: ["Diwali", "Holi", "Dussehra"],
        Christian: ["Christmas", "Easter"],
        Sikh: ["Gurpurab", "Baisakhi"],
        All: ["New Year", "Independence Day", "Republic Day"]
    };

    useEffect(() => {
        if (success) {
            setSnackOpen(true);
            dispatch(clearSuccess());
            resetForm();
        }
    }, [success]);

    const resetForm = () => {
        setFestivalName("");
        setCustomFestivalName("");
        setCustomMessage("");
        setSenderName("");
        setPhoto(null);
    };

    const handleCreateBulkMail = () => {
        const finalFestival =
            festivalName === "Other" ? customFestivalName : festivalName;

        if (!finalFestival || !customMessage || !senderName) return;

        const formData = new FormData();
        formData.append("religion", selectedReligion);
        formData.append("festivalName", finalFestival);
        formData.append("customMessage", customMessage);
        formData.append("yourName", senderName);
        formData.append("sendToAll", sendToAll.toString());
        if (photo) formData.append("photo", photo);

        dispatch(createBulkMail(formData));
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                p: 4,
                background:
                    "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
            }}
        >
            {/* HEADER */}
            <Box textAlign="center" mb={5}>
                <Typography
                    variant="h3"
                    fontWeight={700}
                    color="white"
                >
                    Festival Greetings
                </Typography>
                <Typography color="rgba(255,255,255,0.85)">
                    Send professional festival wishes to society members
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* FORM */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper
                        elevation={12}
                        sx={{
                            p: 4,
                            borderRadius: 4
                        }}
                    >
                        <Typography
                            variant="h5"
                            fontWeight={600}
                            mb={3}
                        >
                            <Celebration sx={{ mr: 1 }} />
                            Create Greeting
                        </Typography>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{ mb: 2 }}
                                onClose={() => dispatch(clearError())}
                            >
                                {error}
                            </Alert>
                        )}

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={sendToAll}
                                    onChange={(e) => {
                                        setSendToAll(e.target.checked);
                                        setSelectedReligion(
                                            e.target.checked ? "All" : "Muslim"
                                        );
                                    }}
                                />
                            }
                            label="Send to all members"
                            sx={{ mb: 3 }}
                        />

                        {!sendToAll && (
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Religion</InputLabel>
                                <Select
                                    value={selectedReligion}
                                    label="Religion"
                                    onChange={(e) =>
                                        setSelectedReligion(e.target.value)
                                    }
                                >
                                    {["Muslim", "Hindu", "Christian", "Sikh"].map(
                                        (r) => (
                                            <MenuItem key={r} value={r}>
                                                {r}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        )}

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Festival</InputLabel>
                            <Select
                                value={festivalName}
                                label="Festival"
                                onChange={(e) => setFestivalName(e.target.value)}
                            >
                                {(festivalSuggestions[
                                    sendToAll ? "All" : selectedReligion
                                ] || []).map((f) => (
                                    <MenuItem key={f} value={f}>
                                        {f}
                                    </MenuItem>
                                ))}
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>

                        {festivalName === "Other" && (
                            <TextField
                                fullWidth
                                label="Custom Festival Name"
                                value={customFestivalName}
                                onChange={(e) =>
                                    setCustomFestivalName(e.target.value)
                                }
                                sx={{ mb: 3 }}
                            />
                        )}

                        <TextField
                            label="Greeting Message"
                            multiline
                            rows={4}
                            fullWidth
                            value={customMessage}
                            onChange={(e) =>
                                setCustomMessage(e.target.value)
                            }
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            label="Sender Name"
                            fullWidth
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            sx={{ mb: 3 }}
                        />

                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<CloudUpload />}
                            sx={{ mb: 3 }}
                        >
                            Upload Image
                            <input
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setPhoto(e.target.files[0])
                                }
                            />
                        </Button>

                        <Button
                            fullWidth
                            size="large"
                            variant="contained"
                            startIcon={
                                loading ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <Send />
                                )
                            }
                            onClick={handleCreateBulkMail}
                            disabled={loading}
                        >
                            Send Greeting
                        </Button>
                    </Paper>
                </Grid>

                {/* PREVIEW */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper
                        elevation={12}
                        sx={{
                            p: 4,
                            borderRadius: 4
                        }}
                    >
                        <Typography
                            variant="h5"
                            fontWeight={600}
                            mb={2}
                        >
                            <Share sx={{ mr: 1 }} />
                            Email Preview
                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        <Card sx={{ borderRadius: 3 }}>
                            {photo && (
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={URL.createObjectURL(photo)}
                                />
                            )}

                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    🎉{" "}
                                    {festivalName === "Other"
                                        ? customFestivalName
                                        : festivalName || "Festival"}
                                </Typography>

                                <Typography sx={{ mb: 2 }}>
                                    {customMessage ||
                                        "Your greeting message will appear here"}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Regards,
                                    <br />
                                    <strong>{senderName || "Your Name"}</strong>
                                </Typography>
                            </CardContent>
                        </Card>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
                message="Bulk email sent successfully"
            />
        </Box>
    );
}
