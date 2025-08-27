// src/redux/features/user/userThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import type {UpdateProfilePayload} from "./types"

export const fetchProfile = createAsyncThunk("user/fetchProfile", async (_, thunkAPI) => {
  try {
    const res = await api.get("/api/users/profile/");
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data || "Failed to fetch profile");
  }
});

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (data: UpdateProfilePayload, thunkAPI) => {
    try {
      const formData = new FormData();

      // Add all text fields
      for (const key of ["username", "email", "first_name", "last_name", "address", "phone_number", "date_of_birth"] as const) {
        if (data[key]) formData.append(key, data[key]!);
      }

      // Add preferences as JSON string
      if (data.preferences) {
        formData.append("preferences", JSON.stringify(data.preferences));
      }

      // Add profile picture
      if (data.profile_picture) {
        formData.append("profile_picture", data.profile_picture);
      }

      const res = await api.patch("/api/users/profile/update/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || "Failed to update profile");
    }
  }
);

