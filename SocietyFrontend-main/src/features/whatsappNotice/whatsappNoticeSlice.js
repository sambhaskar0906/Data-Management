import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

// 🔹 Async Thunk
export const sendBulkWhatsAppNotice = createAsyncThunk(
    "whatsappNotice/sendBulk",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(
                "/notice/send-whatsapp",
                payload
            );
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "WhatsApp sending failed"
            );
        }
    }
);

// 🔹 Slice
const whatsappNoticeSlice = createSlice({
    name: "whatsappNotice",
    initialState: {
        loading: false,
        success: false,
        error: null,
        result: null,
    },
    reducers: {
        resetWhatsAppState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
            state.result = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendBulkWhatsAppNotice.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(sendBulkWhatsAppNotice.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.result = action.payload;
            })
            .addCase(sendBulkWhatsAppNotice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    },
});

export const { resetWhatsAppState } = whatsappNoticeSlice.actions;
export default whatsappNoticeSlice.reducer;
