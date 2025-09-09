// src/store/orders/slice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { OrdersState, Order } from "./types";
import { fetchOrders } from "./ordersthunks";

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
  page: 1,
  totalPages: 1,
  pageSize: 10, // default page size
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<{ results: Order[]; page: number; totalPages: number; pageSize: number }>) => {
        state.loading = false;
        state.orders = action.payload.results;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default ordersSlice.reducer;
