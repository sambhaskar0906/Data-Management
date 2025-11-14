import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

export const sendNoticeToMembers = createAsyncThunk(
    "notice/sendNoticeToMembers",
    async ({ memberIds, subject, message, attachment }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("subject", subject);
            formData.append("message", message);
            formData.append("memberIds", JSON.stringify(memberIds));
            if (attachment) formData.append("attachment", attachment); // ✅ fixed field name

            const { data } = await axios.post("/notice/send", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            return data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Something went wrong while sending the notice"
            );
        }
    }
);

const noticeSlice = createSlice({
    name: "notice",
    initialState: {
        loading: false,
        success: false,
        error: null,
        message: "",
        response: null,
    },
    reducers: {
        resetNoticeState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
            state.message = "";
            state.response = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendNoticeToMembers.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
                state.message = "";
                state.response = null;
            })
            .addCase(sendNoticeToMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;
                state.response = action.payload;
            })
            .addCase(sendNoticeToMembers.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload || "Failed to send notice";
            });
    },
});

export const { resetNoticeState } = noticeSlice.actions;
export default noticeSlice.reducer;