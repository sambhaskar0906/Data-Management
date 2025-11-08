import { configureStore } from '@reduxjs/toolkit';
import bulkMailSlice from '../features/bulkMailSlice';
import memberReducer from "../features/member/memberSlice";

export const store = configureStore({
    reducer: {
        bulkMail: bulkMailSlice,
        members: memberReducer,
    },
});

export default store;