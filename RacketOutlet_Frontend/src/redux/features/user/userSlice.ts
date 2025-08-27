// src/redux/features/user/userSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile, updateProfile } from "./userThunks";

interface UserState {
  profile: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = { profile: null, loading: false, error: null };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: { clearProfile: (state) => { state.profile = null; state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(fetchProfile.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to fetch profile"; })
      .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(updateProfile.rejected, (state, action) => { state.loading = false; state.error = action.error.message || "Failed to update profile"; });
  },
});


export const { clearProfile } = userSlice.actions;
export default userSlice.reducer;
