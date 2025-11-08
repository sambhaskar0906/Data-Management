import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axios.jsx';

// Async Thunks
export const createBulkMail = createAsyncThunk(
    'bulkMail/createBulkMail',
    async (formData, { rejectWithValue }) => {
        try {
            console.log('Sending bulk mail request...');
            const response = await axiosInstance.post('/bulk', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Bulk mail response:', response);
            return response;
        } catch (error) {
            console.error('Bulk mail error:', error);
            return rejectWithValue(error.response?.data || error.message || 'Network error');
        }
    }
);

export const getBulkMailStats = createAsyncThunk(
    'bulkMail/getBulkMailStats',
    async (bulkMailId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/bulk/stats/${bulkMailId}`);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message || 'Failed to get stats');
        }
    }
);

export const getBulkMailHistory = createAsyncThunk(
    'bulkMail/getBulkMailHistory',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { page = 1, limit = 10, religion = '' } = params;
            console.log('Fetching history with params:', params);
            const response = await axiosInstance.get(`/bulk/history?page=${page}&limit=${limit}&religion=${religion}`);
            console.log('History response:', response);
            return response;
        } catch (error) {
            console.error('History error:', error);
            return rejectWithValue(error.response?.data || error.message || 'Failed to get history');
        }
    }
);

export const getBulkMailById = createAsyncThunk(
    'bulkMail/getBulkMailById',
    async (bulkMailId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/bulk/${bulkMailId}`);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message || 'Failed to get bulk mail details');
        }
    }
);

// Initial State
const initialState = {
    loading: false,
    error: null,
    success: false,
    bulkMails: [],
    currentBulkMail: null,
    stats: null,
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
    }
};

// Slice
const bulkMailSlice = createSlice({
    name: 'bulkMail',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        clearCurrentBulkMail: (state) => {
            state.currentBulkMail = null;
        },
        resetForm: (state) => {
            state.success = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Bulk Mail
            .addCase(createBulkMail.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createBulkMail.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentBulkMail = action.payload?.data;
                state.error = null;
                console.log('Bulk mail created successfully:', action.payload);
            })
            .addCase(createBulkMail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload?.error || 'Failed to create bulk mail';
                state.success = false;
                console.error('Bulk mail failed:', action.payload);
            })
            // Get Bulk Mail Stats
            .addCase(getBulkMailStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBulkMailStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload?.data;
                state.error = null;
            })
            .addCase(getBulkMailStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to get stats';
            })
            // Get Bulk Mail History
            .addCase(getBulkMailHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBulkMailHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.bulkMails = action.payload?.data || [];
                state.pagination = action.payload?.pagination || {
                    currentPage: 1,
                    totalPages: 0,
                    totalItems: 0,
                };
                state.error = null;
                console.log('History loaded:', state.bulkMails);
            })
            .addCase(getBulkMailHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to get history';
                state.bulkMails = [];
            })
            // Get Bulk Mail By ID
            .addCase(getBulkMailById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getBulkMailById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBulkMail = action.payload?.data;
                state.error = null;
            })
            .addCase(getBulkMailById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to get bulk mail details';
            });
    },
});

export const { clearError, clearSuccess, clearCurrentBulkMail, resetForm } = bulkMailSlice.actions;
export default bulkMailSlice.reducer;