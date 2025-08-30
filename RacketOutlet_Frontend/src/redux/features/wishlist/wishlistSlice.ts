// wishlistSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/axios";

// ----------------- Types -----------------
// wishlistSlice.ts
// wishlistSlice.ts

export interface WishlistItem {
  id: number
  product: {
    id: number
    name: string
    main_image_url: string
    price: number
    discounted_price?: number | null
    brand?: string | null   // 👈 allow undefined as well
    description: string
  }
    added_at: string; // 👈 added here
}


interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

// ----------------- Initial State -----------------
const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

// ----------------- Thunks -----------------
export const fetchWishlistThunk = createAsyncThunk<WishlistItem[]>(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/wishlist/");
      return res.data.items;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to fetch wishlist");
    }
  }
);

export const addWishlistItemThunk = createAsyncThunk<WishlistItem, number>(
  "wishlist/addItem",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/wishlist/add/", { product_id: productId });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "Failed to add to wishlist");
    }
  }
);

export const removeWishlistItemThunk = createAsyncThunk<number, number>(
  "wishlist/removeItem",
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/wishlist/remove/${productId}/`);
      return productId;
    } catch (err: any) {
      if (err.response?.status === 404) return productId;
      return rejectWithValue(err.response?.data || "Failed to remove from wishlist");
    }
  }
);

// ----------------- Slice -----------------
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    removeWishlistItemOptimistic: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.product?.id !== action.payload);
    },
    addWishlistItemOptimistic: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.find(item => item.product?.id === action.payload.product?.id);
      if (!exists && action.payload.product) state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchWishlistThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlistThunk.fulfilled, (state, action: PayloadAction<WishlistItem[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchWishlistThunk.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add
      .addCase(addWishlistItemThunk.fulfilled, (state, action: PayloadAction<WishlistItem>) => {
        if (!action.payload.product) return;
        const exists = state.items.find(item => item.product?.id === action.payload.product?.id);
        if (!exists) state.items.push(action.payload);
      })
      // Remove
      .addCase(removeWishlistItemThunk.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter(item => item.product?.id !== action.payload);
      });
  },
});

export const { removeWishlistItemOptimistic, addWishlistItemOptimistic } = wishlistSlice.actions;
export default wishlistSlice.reducer;
