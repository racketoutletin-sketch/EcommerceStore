// wishlistThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import type { WishlistItem } from "./wishlistSlice";

// Fetch wishlist
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

// Add product to wishlist
export const addWishlistItemThunk = createAsyncThunk<WishlistItem, number>(
  "wishlist/addItem",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/wishlist/add/", { product_id: productId });
      return res.data; // single WishlistItem
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
      // If the item is not found, just ignore
      if (err.response?.status === 404) return productId;
      return rejectWithValue(err.response?.data || "Failed to remove from wishlist");
    }
  }
);