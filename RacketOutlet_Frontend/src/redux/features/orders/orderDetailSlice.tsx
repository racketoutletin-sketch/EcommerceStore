// src/redux/features/orders/orderDetailSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

interface Product {
  id: number;
  name: string;
  slug: string;
  main_image_url: string;
  current_price: number;
}

interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: string;
  subtotal: number;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: string;
  shipping_address: string;
  billing_address: string;
  payment_method: string;
  payment_status: string;
  notes:string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface OrderDetailState {
  order: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderDetailState = {
  order: null,
  loading: false,
  error: null,
};

// Async thunk to fetch a single order
export const fetchOrderById = createAsyncThunk(
  "orderDetail/fetchOrderById",
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/orders/${orderId}/`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Something went wrong");
    }
  }
);

const orderDetailSlice = createSlice({
  name: "orderDetail",
  initialState,
  reducers: {
    clearOrderDetail: (state) => {
      state.order = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrderDetail } = orderDetailSlice.actions;
export default orderDetailSlice.reducer;
