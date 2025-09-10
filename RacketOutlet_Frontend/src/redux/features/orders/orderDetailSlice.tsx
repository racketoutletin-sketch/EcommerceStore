// src/redux/features/orders/orderDetailSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

// Product Image
interface ProductImage {
  id: number;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
}

// Product Inventory
interface ProductInventory {
  quantity: number;
  low_stock_threshold: number;
  last_restocked_at: string;
  is_low_stock: boolean;
}

// Product
interface Product {
  id: number;
  name: string;
  slug: string;
  main_image_url: string;
  current_price: number;
  discounted_price?: number | null;
  price: string;
  sku: string;
  brand: string;
  weight: string;
  dimensions: string;
  material: string;
  images?: ProductImage[];
  inventory?: ProductInventory;
  description?: string;
  sub_category_id?: number;
  sub_category_name?: string;
  is_featured?: boolean;
  is_deal_of_the_day?: boolean;
  is_exclusive_product?: boolean;
  is_active?: boolean;
}

// Order Item
interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: string;
  subtotal: number;
}

// User
interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address?: string;
}

// Order
interface Order {
  id: number;
  order_number: string;
  user: User;
  status: string;
  total_amount: string;
  shipping_address: string;
  billing_address: string;
  shipping_person_name?: string;
  shipping_person_number?: string;
  payment_method: string;
  payment_status: string;
  notes: string;
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
