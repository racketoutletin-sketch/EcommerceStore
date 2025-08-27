// features/preload/preloadSlice.ts
import { createSlice } from "@reduxjs/toolkit";

import type     { PayloadAction } from "@reduxjs/toolkit";

interface PreloadState {
  ready: boolean;
}

const initialState: PreloadState = { ready: false };

const preloadSlice = createSlice({
  name: "preload",
  initialState,
  reducers: {
    setReady: (state, action: PayloadAction<boolean>) => {
      state.ready = action.payload;
    },
  },
});

export const { setReady } = preloadSlice.actions;
export default preloadSlice.reducer;
