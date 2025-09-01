// src/redux/utils/createAuthThunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export function createAuthThunk<Returned, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: (
    arg: ThunkArg,
    helpers: { state: RootState }
  ) => Promise<Returned> | Returned
) {
  return createAsyncThunk<Returned, ThunkArg>(
    typePrefix,
    async (arg, { getState, rejectWithValue }) => {
      const state = getState() as RootState;
      const user = state.auth.user;
      if (!user) {
        return rejectWithValue("User not logged in");
      }
      return await payloadCreator(arg, { state });
    }
  );
}
