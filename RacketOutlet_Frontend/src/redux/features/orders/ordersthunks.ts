// src/store/orders/thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import type { Order } from "./types";

interface FetchOrdersParams {
  page?: number;
  pageSize?: number;
  sort?: "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
}

export const fetchOrders = createAsyncThunk<
  { results: Order[]; page: number; totalPages: number; pageSize: number },
  FetchOrdersParams | undefined,
  { rejectValue: string }
>(
  "orders/fetchOrders",
  async (params = { page: 1, pageSize: 10, sort: "date_desc" }, { rejectWithValue }) => {
    try {
      const { page = 1, pageSize = 10, sort = "date_desc" } = params;
      const response = await api.get("/api/orders/", {
        params: { page, page_size: pageSize, ordering: sort === "date_desc" ? "-created_at" :
                                                        sort === "date_asc" ? "created_at" :
                                                        sort === "amount_desc" ? "-total_amount" :
                                                        "total_amount" }
      });

      // Backend should return results + total pages info
      return {
        results: response.data.results,
        page: response.data.page || page,
        totalPages: response.data.total_pages || 1,
        pageSize: response.data.page_size || pageSize,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch orders");
    }
  }
);
