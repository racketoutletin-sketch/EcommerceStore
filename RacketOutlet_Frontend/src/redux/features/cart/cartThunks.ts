import { createAsyncThunk } from "@reduxjs/toolkit";
import * as cartApi from "../../../api/cartApi";
import type { CartItemPayload } from "./types";

// ✅ Fetch
export const fetchCartThunk = createAsyncThunk("cart/fetch", cartApi.fetchCart);

// ✅ Add → then refetch
export const addCartItemThunk = createAsyncThunk(
  "cart/addItem",
  async (payload: CartItemPayload) => {
    await cartApi.addCartItem(payload);
    return await cartApi.fetchCart();
  }
);

// ✅ Update → then refetch
// 🔥 FIXED: enforce both product_id and quantity are passed
export const updateCartItemThunk = createAsyncThunk(
  "cart/updateItem",
  async ({
    id,
    product_id,
    quantity,
  }: { id: number; product_id: number; quantity: number }) => {
    await cartApi.updateCartItem(id, { product_id, quantity });
    return await cartApi.fetchCart();
  }
);

// ✅ Remove → then refetch
export const removeCartItemThunk = createAsyncThunk(
  "cart/removeItem",
  async (id: number) => {
    await cartApi.removeCartItem(id);
    return await cartApi.fetchCart();
  }
);

// redux/features/cart/cartThunks.ts

// Remove multiple items at once
export const removeMultipleCartItemsThunk = createAsyncThunk(
  "cart/removeMultiple",
  async (itemIds: number[]) => {
    // Call backend API for each item (or a batch endpoint if available)
    await Promise.all(itemIds.map((id) => cartApi.removeCartItem(id)));
    // Refetch cart after deletion
    return await cartApi.fetchCart();
  }
);
