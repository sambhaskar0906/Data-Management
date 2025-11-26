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
// GET ALL LOANS BY MEMBERSHIP NUMBER
// =============================
export const getAllLoansByMembershipNumber = createAsyncThunk(
    "loan/getAllLoansByMembershipNumber",
    async (membershipNumber, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/loans/membership/${membershipNumber}`);
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
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


// =====================================================
// ⭐ NEW API: GET GUARANTOR RELATION (my guarantors + whom I guaranteed)
// =====================================================
export const getGuarantorRelationsByMember = createAsyncThunk(
    "loan/getGuarantorRelationsByMember",
    async (search, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/loans/guarantor-relations?search=${search}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// =====================================================
// ⭐ GET SURETY SUMMARY BY MEMBERSHIP NUMBER
// =====================================================
export const getSuretySummaryByMember = createAsyncThunk(
    "loan/getSuretySummaryByMember",
    async (membershipNumber, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/loans/surety-summary/${membershipNumber}`);
            return response.data.data;
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
        membershipLoans: [], // ✅ NEW: for getAllLoansByMembershipNumber
        guarantorRelations: null,
        suretySummary: null, // ✅ NEW: for getSuretySummaryByMember
        loading: false,
        guarantorLoading: false,
        membershipLoading: false, // ✅ NEW: loading state for membership loans
        suretyLoading: false, // ✅ NEW: loading state for surety summary
        error: null,
        success: false,
    },

    reducers: {
        resetLoanState: (state) => {
            state.success = false;
            state.error = null;
        },
        clearMembershipLoans: (state) => {
            state.membershipLoans = [];
        },
        clearSuretySummary: (state) => {
            state.suretySummary = null;
        },
        clearGuarantorRelations: (state) => {
            state.guarantorRelations = null;
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

            // ✅ NEW: GET ALL LOANS BY MEMBERSHIP NUMBER
            .addCase(getAllLoansByMembershipNumber.pending, (state) => {
                state.membershipLoading = true;
            })
            .addCase(getAllLoansByMembershipNumber.fulfilled, (state, action) => {
                state.membershipLoading = false;
                state.membershipLoans = action.payload;
            })
            .addCase(getAllLoansByMembershipNumber.rejected, (state, action) => {
                state.membershipLoading = false;
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
            })

            // ⭐ GUARANTOR RELATIONS
            .addCase(getGuarantorRelationsByMember.pending, (state) => {
                state.guarantorLoading = true;
            })
            .addCase(getGuarantorRelationsByMember.fulfilled, (state, action) => {
                state.guarantorLoading = false;
                state.guarantorRelations = action.payload;
            })
            .addCase(getGuarantorRelationsByMember.rejected, (state, action) => {
                state.guarantorLoading = false;
                state.error = action.payload;
            })

            // ✅ NEW: SURETY SUMMARY BY MEMBER
            .addCase(getSuretySummaryByMember.pending, (state) => {
                state.suretyLoading = true;
            })
            .addCase(getSuretySummaryByMember.fulfilled, (state, action) => {
                state.suretyLoading = false;
                state.suretySummary = action.payload;
            })
            .addCase(getSuretySummaryByMember.rejected, (state, action) => {
                state.suretyLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    resetLoanState,
    clearMembershipLoans,
    clearSuretySummary,
    clearGuarantorRelations
} = loanSlice.actions;
export default loanSlice.reducer;