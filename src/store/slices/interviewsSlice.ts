import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Interview } from '@/types/models';
import * as interviewsApi from '@/lib/api/interviews';

interface InterviewsState {
  list: Interview[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: InterviewsState = {
  list: [],
  status: 'idle',
  error: null,
};

export const fetchInterviews = createAsyncThunk(
  'interviews/fetchInterviews',
  async () => {
    return interviewsApi.listInterviews();
  },
);

export const scheduleInterview = createAsyncThunk(
  'interviews/scheduleInterview',
  async (
    {
      candidateId,
      payload,
    }: {
      candidateId: string;
      payload: Parameters<typeof interviewsApi.scheduleInterview>[1];
    },
    { dispatch },
  ) => {
    const interview = await interviewsApi.scheduleInterview(
      candidateId,
      payload,
    );
    dispatch(fetchInterviews());
    return interview;
  },
);

export const completeInterview = createAsyncThunk(
  'interviews/completeInterview',
  async (
    {
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof interviewsApi.completeInterview>[1];
    },
    { dispatch },
  ) => {
    const interview = await interviewsApi.completeInterview(id, payload);
    dispatch(fetchInterviews());
    return interview;
  },
);

const interviewsSlice = createSlice({
  name: 'interviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterviews.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch interviews';
      });
  },
});

export default interviewsSlice.reducer;
