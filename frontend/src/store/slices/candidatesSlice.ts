import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CandidateProfileDTO, CandidateListItemDTO, PaginationMeta } from '@/types/dto';
import * as candidatesApi from '@/lib/api/candidates';

interface CandidatesState {
  list: CandidateListItemDTO[];
  pagination: PaginationMeta | null;
  current: CandidateProfileDTO | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CandidatesState = {
  list: [],
  pagination: null,
  current: null,
  status: 'idle',
  error: null,
};

export const fetchCandidates = createAsyncThunk(
  'candidates/fetchCandidates',
  async (params: Parameters<typeof candidatesApi.listCandidates>[0]) => {
    return candidatesApi.listCandidates(params);
  },
);

export const fetchCandidateProfile = createAsyncThunk(
  'candidates/fetchCandidateProfile',
  async (id: string) => {
    return candidatesApi.getCandidateProfile(id);
  },
);

export const rejectCandidate = createAsyncThunk(
  'candidates/rejectCandidate',
  async ({ id, reason }: { id: string; reason: string }, { dispatch }) => {
    await candidatesApi.rejectCandidate(id, reason);
    dispatch(fetchCandidateProfile(id));
  },
);

export const hireCandidate = createAsyncThunk(
  'candidates/hireCandidate',
  async (id: string, { dispatch }) => {
    await candidatesApi.hireCandidate(id);
    dispatch(fetchCandidateProfile(id));
  },
);

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    clearCurrentCandidate(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.candidates;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch candidates';
      })
      .addCase(fetchCandidateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCandidateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchCandidateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch candidate';
      });
  },
});

export const { clearCurrentCandidate } = candidatesSlice.actions;
export default candidatesSlice.reducer;
