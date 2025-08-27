// src/store/orders/thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import type { Order } from "./types";

export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/orders/");
      return response.data.results;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch orders");
    }
  }
);
