import { createAsyncThunk } from "@reduxjs/toolkit";
import * as cartApi from "../../../api/cartApi";
import type { CartItemPayload } from "./types";

// ✅ Fetch Cart
export const fetchCartThunk = createAsyncThunk("cart/fetch", cartApi.fetchCart);

// ✅ Add Item (optimistic)
export const addCartItemThunk = createAsyncThunk(
  "cart/addItem",
  async (payload: CartItemPayload) => {
    // Fire & forget add API, optimistic update handled in slice
    cartApi.addCartItem(payload).catch(console.error);
    return payload; // return payload for slice to update immediately
  }
);

// ✅ Update Item (optimistic)
export const updateCartItemThunk = createAsyncThunk(
  "cart/updateItem",
  async ({
    id,
    product_id,
    quantity,
  }: { id: number; product_id: number; quantity: number }) => {
    cartApi.updateCartItem(id, { product_id, quantity }).catch(console.error);
    return { id, product_id, quantity }; // slice uses this to update instantly
  }
);

// ✅ Remove Item (optimistic)
export const removeCartItemThunk = createAsyncThunk(
  "cart/removeItem",
  async (id: number) => {
    cartApi.removeCartItem(id).catch(console.error);
    return id; // slice uses this to remove instantly
  }
);

// ✅ Remove Multiple Items (optimistic)
export const removeMultipleCartItemsThunk = createAsyncThunk(
  "cart/removeMultiple",
  async (itemIds: number[]) => {
    Promise.all(itemIds.map((id) => cartApi.removeCartItem(id))).catch(console.error);
    return itemIds; // slice removes items instantly
  }
);
