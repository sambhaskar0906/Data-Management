import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

/* ===========================
   Login
=========================== */
export const loginUser = createAsyncThunk(
    "auth/login",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await axios.post("/login", payload);

            // store token
            localStorage.setItem("token", res.data.data.accessToken);

            return res.data.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Login failed"
            );
        }
    }
);

/* ===========================
   Logout
=========================== */
export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await axios.post("/logout");
            localStorage.removeItem("token");
            return true;
        } catch (error) {
            return rejectWithValue("Logout failed");
        }
    }
);

/* ===========================
   Slice
=========================== */
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false,
        error: null,
        isAuthenticated: !!localStorage.getItem("token"),
    },
    reducers: {
        clearAuthState: (state) => {
            state.error = null;
        },
        logoutLocal: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem("token");
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearAuthState, logoutLocal } = authSlice.actions;
export default authSlice.reducer;
