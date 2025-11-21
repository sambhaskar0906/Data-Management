import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";



// =============================
// CREATE LOAN
// =============================
export const createLoan = createAsyncThunk(
    "loan/createLoan",
    async (loanData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/loans', loanData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// =============================
// GET ALL LOANS
// =============================
export const getAllLoans = createAsyncThunk(
    "loan/getAllLoans",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/loans');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// =============================
// GET SINGLE LOAN BY ID
// =============================
export const getLoanById = createAsyncThunk(
    "loan/getLoanById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/loans/${id}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// =============================
// GET LOANS BY MEMBER ID
// =============================
export const getLoansByMemberId = createAsyncThunk(
    "loan/getLoansByMemberId",
    async (memberId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/loans/member/${memberId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// =============================
// UPDATE LOAN
// =============================
export const updateLoan = createAsyncThunk(
    "loan/updateLoan",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/loans/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// =============================
// DELETE LOAN
// =============================
export const deleteLoan = createAsyncThunk(
    "loan/deleteLoan",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/loans/${id}`);
            return id; // return deleted id
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// =============================
// SLICE
// =============================
const loanSlice = createSlice({
    name: "loan",
    initialState: {
        loans: [],
        singleLoan: null,
        memberLoans: [],
        loading: false,
        error: null,
        success: false,
    },

    reducers: {
        resetLoanState: (state) => {
            state.success = false;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            // CREATE LOAN
            .addCase(createLoan.pending, (state) => {
                state.loading = true;
            })
            .addCase(createLoan.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.loans.push(action.payload);
            })
            .addCase(createLoan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // GET ALL LOANS
            .addCase(getAllLoans.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllLoans.fulfilled, (state, action) => {
                state.loading = false;
                state.loans = action.payload;
            })
            .addCase(getAllLoans.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // GET LOAN BY ID
            .addCase(getLoanById.pending, (state) => {
                state.loading = true;
            })
            .addCase(getLoanById.fulfilled, (state, action) => {
                state.loading = false;
                state.singleLoan = action.payload;
            })
            .addCase(getLoanById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // GET LOANS BY MEMBER ID
            .addCase(getLoansByMemberId.pending, (state) => {
                state.loading = true;
            })
            .addCase(getLoansByMemberId.fulfilled, (state, action) => {
                state.loading = false;
                state.memberLoans = action.payload;
            })
            .addCase(getLoansByMemberId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE LOAN
            .addCase(updateLoan.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateLoan.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.loans = state.loans.map((loan) =>
                    loan._id === action.payload._id ? action.payload : loan
                );
            })
            .addCase(updateLoan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // DELETE LOAN
            .addCase(deleteLoan.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteLoan.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.loans = state.loans.filter((loan) => loan._id !== action.payload);
            })
            .addCase(deleteLoan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetLoanState } = loanSlice.actions;
export default loanSlice.reducer;