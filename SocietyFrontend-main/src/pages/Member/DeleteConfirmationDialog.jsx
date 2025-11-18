import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch } from "react-redux";
import { deleteMember } from "../../features/member/memberSlice";

// Helper function to get nested values
const getValueByPath = (obj, path) => {
    if (!path || !obj) return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
        if (cur === undefined || cur === null) return undefined;
        cur = cur[p];
    }
    return cur;
};

const DeleteConfirmationDialog = ({ open, onClose, onConfirm, member, loading }) => {
    const dispatch = useDispatch();

    const memberName = getValueByPath(member, 'personalDetails.nameOfMember') || 'Unknown';
    const membershipNumber = getValueByPath(member, 'personalDetails.membershipNumber') || 'N/A';

    const handleConfirm = () => {
        if (member) {
            dispatch(deleteMember(member._id));
        }
        onConfirm();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <ErrorOutlineIcon color="error" />
                    <Typography variant="h6">Confirm Delete</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    Are you sure you want to delete the following member? This action cannot be undone.
                </Typography>
                <Box sx={{ p: 2, backgroundColor: '#fff5f5', borderRadius: 1, mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {memberName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Membership No: {membershipNumber}
                    </Typography>
                </Box>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    This will permanently delete all member data including personal details, addresses, documents, and loan information.
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="error"
                    startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
                    disabled={loading}
                >
                    {loading ? 'Deleting...' : 'Delete Member'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmationDialog;