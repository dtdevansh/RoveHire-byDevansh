import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface AuthState {
  session: Session | null;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  session: null,
  user: null,
  status: 'idle',
  error: null,
};

export const bootstrapSession = createAsyncThunk(
  'auth/bootstrapSession',
  async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },
);

export const signInWithPassword = createAsyncThunk(
  'auth/signInWithPassword',
  async (credentials: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data.session;
  },
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: { payload: Session | null }) {
      state.session = action.payload;
      state.user = action.payload?.user ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapSession.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.session = action.payload;
        state.user = action.payload?.user ?? null;
      })
      .addCase(bootstrapSession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Session bootstrap failed';
      })
      .addCase(signInWithPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signInWithPassword.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.session = action.payload;
        state.user = action.payload?.user ?? null;
      })
      .addCase(signInWithPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Sign-in failed';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.session = null;
        state.user = null;
        state.status = 'idle';
      });
  },
});

export const { setSession } = authSlice.actions;
export default authSlice.reducer;
