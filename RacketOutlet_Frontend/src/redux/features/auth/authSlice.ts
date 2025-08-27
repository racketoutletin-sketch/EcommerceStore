import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "./authThunks";
import { getAccessToken, clearTokens } from "../../../utils/tokenUtils";
import type { AuthState } from "./types";
import { getUser, clearUser } from "../../../utils/tokenUtils";

const initialState: AuthState = {
  user: getUser() || null, // ✅ load user from localStorage
  accessToken: getAccessToken(),
  loading: false,
  error: null,
};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      clearTokens();
      clearUser();  // ✅ also clear user from localStorage
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.accessToken = action.payload.access;
        state.user = action.payload.user;  // store in Redux
        state.loading = false;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message || "Login failed";
        state.loading = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.error.message || "Registration failed";
        state.loading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
