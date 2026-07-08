import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import candidatesReducer from './slices/candidatesSlice';
import jobsReducer from './slices/jobsSlice';
import interviewsReducer from './slices/interviewsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    candidates: candidatesReducer,
    jobs: jobsReducer,
    interviews: interviewsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
