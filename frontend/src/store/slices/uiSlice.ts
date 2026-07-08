import { createSlice } from '@reduxjs/toolkit';
import type { CandidateStatus } from '@/types/models';

interface UiState {
  statusFilter: CandidateStatus | null;
  searchQuery: string;
  candidateDrawerOpen: boolean;
  createJobDrawerOpen: boolean;
}

const initialState: UiState = {
  statusFilter: null,
  searchQuery: '',
  candidateDrawerOpen: false,
  createJobDrawerOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setStatusFilter(state, action: { payload: CandidateStatus | null }) {
      state.statusFilter = action.payload;
    },
    setSearchQuery(state, action: { payload: string }) {
      state.searchQuery = action.payload;
    },
    toggleCandidateDrawer(state) {
      state.candidateDrawerOpen = !state.candidateDrawerOpen;
    },
    toggleCreateJobDrawer(state) {
      state.createJobDrawerOpen = !state.createJobDrawerOpen;
    },
    setCandidateDrawerOpen(state, action: { payload: boolean }) {
      state.candidateDrawerOpen = action.payload;
    },
    setCreateJobDrawerOpen(state, action: { payload: boolean }) {
      state.createJobDrawerOpen = action.payload;
    },
  },
});

export const {
  setStatusFilter,
  setSearchQuery,
  toggleCandidateDrawer,
  toggleCreateJobDrawer,
  setCandidateDrawerOpen,
  setCreateJobDrawerOpen,
} = uiSlice.actions;
export default uiSlice.reducer;
