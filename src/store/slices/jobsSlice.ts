import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { JobOpening } from '@/types/models';
import type { JobListItemDTO } from '@/types/dto';
import * as jobsApi from '@/lib/api/jobs';

interface JobsState {
  list: JobListItemDTO[];
  current: JobOpening | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: JobsState = {
  list: [],
  current: null,
  status: 'idle',
  error: null,
};

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  return jobsApi.listJobs();
});

export const fetchJob = createAsyncThunk(
  'jobs/fetchJob',
  async (id: string) => {
    return jobsApi.getJob(id);
  },
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (
    payload: Pick<JobOpening, 'title' | 'description' | 'required_skills'>,
    { dispatch },
  ) => {
    const job = await jobsApi.createJob(payload);
    dispatch(fetchJobs());
    return job;
  },
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async (
    {
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Pick<JobOpening, 'title' | 'description' | 'required_skills' | 'status'>>;
    },
    { dispatch },
  ) => {
    const job = await jobsApi.updateJob(id, payload);
    dispatch(fetchJobs());
    return job;
  },
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearCurrentJob(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch jobs';
      })
      .addCase(fetchJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch job';
      });
  },
});

export const { clearCurrentJob } = jobsSlice.actions;
export default jobsSlice.reducer;
