import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMembers } from '../../features/member/memberSlice';
import { Download } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SuretyReport = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { members, loading, error } = useSelector((state) => state.members);

    const [selectedMember, setSelectedMember] = useState('');
    const [selectedMemberData, setSelectedMemberData] = useState(null);

    // Fetch all members on component mount
    useEffect(() => {
        dispatch(fetchAllMembers());
    }, [dispatch]);

    // Handle member selection
    const handleMemberChange = (event) => {
        const memberId = event.target.value;
        setSelectedMember(memberId);

        // Find the selected member data
        const member = members.find(m => m._id === memberId);
        setSelectedMemberData(member);
    };

    // Format member name for display
    const formatMemberName = (member) => {
        if (!member || !member.personalDetails) return 'Unknown Member';
        return `${member.personalDetails.title || ''} ${member.personalDetails.nameOfMember || ''}`.trim();
    };

    // Handle PDF download in the same window
    const handleDownloadPdf = () => {
        if (!selectedMemberData?.personalDetails?.membershipNumber) {
            alert('Please select a valid member first');
            return;
        }

        const membershipNumber = selectedMemberData.personalDetails.membershipNumber;

        // Navigate to PDF route in the same window
        navigate(`/exppdf/${membershipNumber}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading members...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Error loading members: {error.message || error.toString()}
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Typography variant="h4" gutterBottom sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                mb: 4
            }}>
                Surety Report
            </Typography>

            {/* Member Selection Dropdown */}
            <Card sx={{ mb: 3, p: 2 }}>
                <CardContent>
                    <FormControl fullWidth size="medium">
                        <InputLabel id="member-select-label">Select Member</InputLabel>
                        <Select
                            labelId="member-select-label"
                            id="member-select"
                            value={selectedMember}
                            label="Select Member"
                            onChange={handleMemberChange}
                        >
                            <MenuItem value="">
                                <em>Select a member</em>
                            </MenuItem>
                            {members.map((member) => (
                                <MenuItem key={member._id} value={member._id}>
                                    {formatMemberName(member)}
                                    {member.personalDetails?.membershipNumber &&
                                        ` (${member.personalDetails.membershipNumber})`
                                    }
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            {/* Selected Member Info and Download Button */}
            {selectedMemberData && (
                <Card sx={{ mb: 3, p: 2 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                            Selected Member Details
                        </Typography>
                        <Typography variant="body1">
                            <strong>Name:</strong> {formatMemberName(selectedMemberData)}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Membership Number:</strong> {selectedMemberData.personalDetails?.membershipNumber || 'N/A'}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Member ID:</strong> {selectedMemberData._id}
                        </Typography>

                        {/* Download Button */}
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Download />}
                                onClick={handleDownloadPdf}
                                size="large"
                            >
                                Generate Surety Report PDF
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default SuretyReport;