import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/axios";

/* ===========================================================
   ✅ CREATE MEMBER
   =========================================================== */
export const createMember = createAsyncThunk(
    "members/createMember",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post("/members", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/* ===========================================================
   ✅ FETCH ALL MEMBERS
   =========================================================== */
export const fetchAllMembers = createAsyncThunk(
    "members/fetchAllMembers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("/members");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/* ===========================================================
   ✅ FETCH SINGLE MEMBER BY ID
   =========================================================== */
export const fetchMemberById = createAsyncThunk(
    "members/fetchMemberById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/members/${id}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/* ===========================================================
   ✅ UPDATE MEMBER
   =========================================================== */
export const updateMember = createAsyncThunk(
    "members/updateMember",
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/members/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/* ===========================================================
   ✅ DELETE MEMBER
   =========================================================== */
export const deleteMember = createAsyncThunk(
    "members/deleteMember",
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/members/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/* ===========================================================
   ✅ ADD GUARANTOR TO MEMBER
   =========================================================== */
export const addGuarantor = createAsyncThunk(
    "members/addGuarantor",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await axios.post("/members/add-guarantor", payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || { message: "Failed to add guarantor." }
            );
        }
    }
);

/* ===========================================================
   ✅ FETCH GUARANTOR RELATIONS BY MEMBER (search by name or number)
   =========================================================== */
export const fetchGuarantorRelations = createAsyncThunk(
    "members/fetchGuarantorRelations",
    async (searchQuery, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/members/guarantor-relations?search=${searchQuery}`);
            return response.data; // contains { member, myGuarantors, forWhomIAmGuarantor }
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

/* ===========================================================
   ✅ SLICE SETUP
   =========================================================== */
const memberSlice = createSlice({
    name: "members",
    initialState: {
        members: [],
        selectedMember: null,
        currentMember: null,
        loading: false,
        error: null,
        guarantorRelations: {
            member: null,
            myGuarantors: [],
            forWhomIAmGuarantor: [],
        },

        successMessage: null,
        // Operation-specific loading flags
        operationLoading: {
            create: false,
            update: false,
            delete: false,
            fetch: false,
            guarantor: false,
        },
    },
    reducers: {
        clearMemberState: (state) => {
            state.error = null;
            state.successMessage = null;
            state.loading = false;
            state.operationLoading = {
                create: false,
                update: false,
                delete: false,
                fetch: false,
                guarantor: false,
            };
        },
        clearSelectedMember: (state) => {
            state.selectedMember = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        clearGuarantorRelations: (state) => {
            state.guarantorRelations = {
                member: null,
                myGuarantors: [],
                forWhomIAmGuarantor: [],
            };
        },
        fetchMemberStart: (state) => {
            state.operationLoading.fetch = true;
            state.error = null;
        },
        fetchMemberSuccess: (state, action) => {
            state.operationLoading.fetch = false;
            state.currentMember = action.payload;
        },
        fetchMemberFailure: (state, action) => {
            state.operationLoading.fetch = false;
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            /* ======================== CREATE MEMBER ======================== */
            .addCase(createMember.pending, (state) => {
                state.loading = true;
                state.operationLoading.create = true;
                state.error = null;
            })
            .addCase(createMember.fulfilled, (state, action) => {
                state.loading = false;
                state.operationLoading.create = false;
                state.members.unshift(action.payload);
                state.successMessage = "Member created successfully";
            })
            .addCase(createMember.rejected, (state, action) => {
                state.loading = false;
                state.operationLoading.create = false;
                state.error = action.payload;
            })

            /* ======================== FETCH ALL MEMBERS ======================== */
            .addCase(fetchAllMembers.pending, (state) => {
                state.loading = true;
                state.operationLoading.fetch = true;
                state.error = null;
            })
            .addCase(fetchAllMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.operationLoading.fetch = false;
                state.members = action.payload;
            })
            .addCase(fetchAllMembers.rejected, (state, action) => {
                state.loading = false;
                state.operationLoading.fetch = false;
                state.error = action.payload;
            })

            /* ======================== FETCH MEMBER BY ID ======================== */
            .addCase(fetchMemberById.pending, (state) => {
                state.loading = true;
                state.operationLoading.fetch = true;
                state.error = null;
            })
            .addCase(fetchMemberById.fulfilled, (state, action) => {
                state.loading = false;
                state.operationLoading.fetch = false;
                state.selectedMember = action.payload;
            })
            .addCase(fetchMemberById.rejected, (state, action) => {
                state.loading = false;
                state.operationLoading.fetch = false;
                state.error = action.payload;
            })

            /* ======================== UPDATE MEMBER ======================== */
            .addCase(updateMember.pending, (state) => {
                state.loading = true;
                state.operationLoading.update = true;
                state.error = null;
            })
            .addCase(updateMember.fulfilled, (state, action) => {
                state.loading = false;
                state.operationLoading.update = false;
                const index = state.members.findIndex(
                    (m) => m._id === action.payload._id
                );
                if (index !== -1) {
                    state.members[index] = action.payload;
                }
                if (state.selectedMember && state.selectedMember._id === action.payload._id) {
                    state.selectedMember = action.payload;
                }
                state.successMessage = "Member updated successfully";
            })
            .addCase(updateMember.rejected, (state, action) => {
                state.loading = false;
                state.operationLoading.update = false;
                state.error = action.payload;
            })

            /* ======================== DELETE MEMBER ======================== */
            .addCase(deleteMember.pending, (state) => {
                state.loading = true;
                state.operationLoading.delete = true;
                state.error = null;
            })
            .addCase(deleteMember.fulfilled, (state, action) => {
                state.loading = false;
                state.operationLoading.delete = false;
                state.members = state.members.filter((m) => m._id !== action.payload);
                if (state.selectedMember && state.selectedMember._id === action.payload) {
                    state.selectedMember = null;
                }
                state.successMessage = "Member deleted successfully";
            })
            .addCase(deleteMember.rejected, (state, action) => {
                state.loading = false;
                state.operationLoading.delete = false;
                state.error = action.payload;
            })

            /* ======================== ADD GUARANTOR ======================== */
            .addCase(addGuarantor.pending, (state) => {
                state.operationLoading.guarantor = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(addGuarantor.fulfilled, (state, action) => {
                state.operationLoading.guarantor = false;
                state.successMessage = action.payload.message || "Guarantor added successfully";
                // Optional: update the member in state if it's selected
                if (state.selectedMember && state.selectedMember.personalDetails?.membershipNumber === action.payload.updatedMember?.membershipNumber) {
                    state.selectedMember.guaranteeDetails = action.payload.updatedMember.guaranteeDetails;
                }
            })
            .addCase(addGuarantor.rejected, (state, action) => {
                state.operationLoading.guarantor = false;
                state.error = action.payload?.message || "Failed to add guarantor.";
            })
            /* ======================== FETCH GUARANTOR RELATIONS ======================== */
            .addCase(fetchGuarantorRelations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGuarantorRelations.fulfilled, (state, action) => {
                state.loading = false;
                state.guarantorRelations = action.payload;
            })
            .addCase(fetchGuarantorRelations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

    },
});

export const {
    clearMemberState,
    clearSelectedMember,
    clearError,
    clearSuccessMessage,
    clearGuarantorRelations,
} = memberSlice.actions;

export default memberSlice.reducer;