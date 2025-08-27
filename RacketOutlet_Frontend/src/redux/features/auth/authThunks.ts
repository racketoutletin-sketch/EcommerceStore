import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import { setTokens } from "../../../utils/tokenUtils";
import { setUser } from "../../../utils/tokenUtils";

export interface RegisterPayload {
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  password: string;
  password_confirm: string;
}

// Register user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: RegisterPayload, thunkAPI) => {
    try {
      const res = await api.post("/api/users/register/", data);
      if (res.data.access && res.data.refresh) {
        setTokens(res.data.access, res.data.refresh);
      }
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    const res = await api.post("/api/users/login/", credentials);
    setTokens(res.data.access, res.data.refresh);

    if (res.data.user) {
      setUser(res.data.user); // store user persistently
    }

    console.log("LOGIN RESPONSE:", res.data);
    return res.data; // includes user
  }
);



