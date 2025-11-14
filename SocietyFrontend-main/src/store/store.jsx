import { configureStore } from '@reduxjs/toolkit';
import bulkMailSlice from '../features/bulkMailSlice';
import memberReducer from "../features/member/memberSlice";
import noticeReducer from '../features/notice/noticeSlice';
export const store = configureStore({
    reducer: {
        bulkMail: bulkMailSlice,
        members: memberReducer,
        notice: noticeReducer,
    },
});

export default store;