import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    Tooltip,
    TextField,
    Chip,
    Stack,
    Snackbar,
    CircularProgress,
} from "@mui/material";
import {
    Announcement as NoticeIcon,
    CloudUpload as UploadIcon,
    Share as ShareIcon,
    WhatsApp as WhatsAppIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import Autocomplete from "@mui/material/Autocomplete";
import SectionHeader from "../../layout/SectionHeader";
import { useDispatch, useSelector } from "react-redux";
import {
    sendNoticeToMembers,
    resetNoticeState,
} from "../../features/notice/noticeSlice";
import { fetchAllMembers } from "../../features/member/memberSlice";

const NoticePage = () => {
    const dispatch = useDispatch();

    const { members, loading: memberLoading } = useSelector((state) => state.members);
    const { loading: noticeLoading, success, error, message } = useSelector(
        (state) => state.notice
    );

    const [snackOpen, setSnackOpen] = useState(false);

    /* 🔹 Load all members on mount */
    useEffect(() => {
        dispatch(fetchAllMembers());
    }, [dispatch]);

    /* 🔹 Show snackbar when success/error occurs */
    useEffect(() => {
        if (success || error) setSnackOpen(true);
    }, [success, error]);

    /* 🔹 Formik setup */
    const formik = useFormik({
        initialValues: {
            selectedMembers: [],
            note: "",
            files: [],
        },
        onSubmit: async (values) => {
            const memberIds = values.selectedMembers.map((m) => m._id);
            const attachment = values.files[0] || null;

            const result = await dispatch(
                sendNoticeToMembers({
                    memberIds,
                    subject: "Society Notice",
                    message: values.note,
                    attachment,
                })
            );

            if (sendNoticeToMembers.fulfilled.match(result)) {
                formik.resetForm();
            }
        },
    });

    /* 🔹 File upload validation */
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(
            (file) =>
                file.size <= 5 * 1024 * 1024 && // max 5 MB
                ["image/", "application/pdf"].some((type) =>
                    file.type.startsWith(type)
                )
        );

        if (validFiles.length !== files.length) {
            alert(
                "Some files were too large or unsupported. Only PDFs and images under 5MB allowed."
            );
        }

        formik.setFieldValue("files", validFiles);
    };

    /* 🔹 Filter members efficiently */
    const availableMembers = useMemo(() => {
        return members.filter(
            (m) => !formik.values.selectedMembers.some((s) => s._id === m._id)
        );
    }, [members, formik.values.selectedMembers]);

    /* 🔹 Snackbar close handler */
    const handleSnackClose = () => {
        setSnackOpen(false);
        dispatch(resetNoticeState());
    };

    return (
        <Card
            sx={{
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                mt: 4,
            }}
        >
            <CardContent sx={{ p: 4 }}>
                <SectionHeader
                    icon={<NoticeIcon color="primary" />}
                    title="Notice Management"
                    subtitle="Send important notices to members"
                />

                {memberLoading ? (
                    <Box display="flex" justifyContent="center" mt={3}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : (
                    <form onSubmit={formik.handleSubmit}>
                        {/* 🔸 Select Members */}
                        <Box mt={3}>
                            <Autocomplete
                                options={availableMembers}
                                getOptionLabel={(option) =>
                                    `${option.personalDetails?.nameOfMember || "Unnamed"} (${option.personalDetails?.membershipNumber
                                    })`
                                }
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                        formik.setFieldValue("selectedMembers", [
                                            ...formik.values.selectedMembers,
                                            newValue,
                                        ]);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search and Select Member"
                                        placeholder="Type to search..."
                                    />
                                )}
                                sx={{ width: "100%" }}
                                clearOnBlur
                            />
                        </Box>

                        {/* 🔸 Selected Members */}
                        {formik.values.selectedMembers.length > 0 && (
                            <Box mt={2}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Selected Members:
                                </Typography>
                                <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap">
                                    {formik.values.selectedMembers.map((member) => (
                                        <Chip
                                            key={member._id}
                                            label={`${member.personalDetails?.nameOfMember} (${member.personalDetails?.membershipNumber})`}
                                            color="primary"
                                            variant="outlined"
                                            onDelete={() =>
                                                formik.setFieldValue(
                                                    "selectedMembers",
                                                    formik.values.selectedMembers.filter(
                                                        (m) => m._id !== member._id
                                                    )
                                                )
                                            }
                                        />
                                    ))}
                                </Stack>

                                {/* 🔸 Member Details */}
                                <Box mt={2}>
                                    {formik.values.selectedMembers.map((member) => (
                                        <Card
                                            key={member._id}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                mt: 1,
                                                borderRadius: 2,
                                                background: "#f9f9f9",
                                            }}
                                        >
                                            <Typography variant="body1">
                                                <strong>{member.personalDetails?.nameOfMember}</strong>{" "}
                                                ({member.personalDetails?.membershipNumber})
                                            </Typography>
                                            <Typography variant="body2">
                                                📞 {member.personalDetails?.phoneNo || "N/A"}
                                            </Typography>
                                            <Typography variant="body2">
                                                ✉️ {member.personalDetails?.emailId || "N/A"}
                                            </Typography>
                                        </Card>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* 🔸 Message Input */}
                        <Box mt={3}>
                            <Typography variant="subtitle1" gutterBottom>
                                Notice Message
                            </Typography>
                            <TextField
                                multiline
                                rows={4}
                                name="note"
                                label="Enter your message here"
                                value={formik.values.note}
                                onChange={formik.handleChange}
                                fullWidth
                                required
                            />
                        </Box>

                        {/* 🔸 File Upload */}
                        <Box mt={3}>
                            <Typography variant="subtitle1" gutterBottom>
                                Upload Attachment (optional)
                            </Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadIcon />}
                            >
                                Upload
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                    multiple
                                />
                            </Button>
                            {formik.values.files.length > 0 && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1 }}
                                >
                                    {formik.values.files.map((f) => f.name).join(", ")}
                                </Typography>
                            )}
                        </Box>

                        {/* 🔸 Submit Buttons */}
                        <Box
                            mt={4}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            gap={2}
                            flexWrap="wrap"
                        >
                            <Tooltip title="Send Notice">
                                <span>
                                    <IconButton
                                        color="primary"
                                        type="submit"
                                        sx={{
                                            backgroundColor: "#1976d2",
                                            color: "white",
                                            p: 2,
                                            "&:hover": { backgroundColor: "#1565c0" },
                                        }}
                                        disabled={
                                            noticeLoading || formik.values.selectedMembers.length === 0
                                        }
                                    >
                                        {noticeLoading ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            <ShareIcon />
                                        )}
                                    </IconButton>
                                </span>
                            </Tooltip>

                            {/* Quick WhatsApp Share */}
                            <Button
                                variant="outlined"
                                color="success"
                                startIcon={<WhatsAppIcon />}
                                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                                    formik.values.note || "Notice"
                                )}`}
                                target="_blank"
                            >
                                WhatsApp
                            </Button>
                        </Box>
                    </form>
                )}

                {/* 🔹 Snackbar Messages */}
                <Snackbar
                    open={snackOpen}
                    autoHideDuration={3000}
                    onClose={handleSnackClose}
                    message={
                        success
                            ? message || "Notice sent successfully!"
                            : error || "Failed to send notice"
                    }
                    ContentProps={{
                        sx: { backgroundColor: success ? "green" : "red" },
                    }}
                />
            </CardContent>
        </Card>
    );
};

export default NoticePage;