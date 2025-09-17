// src/redux/features/cart/cartThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as cartApi from "../../../api/cartApi";
import type {
  Cart,
  CartItemPayload,
  UpdateCartItemPayload,
  CartItem,
} from "./types";

// Fetch entire cart
export const fetchCartThunk = createAsyncThunk<Cart>(
  "cart/fetch",
  async () => {
    return await cartApi.fetchCart();
  }
);

// Add item → backend returns full cart
export const addCartItemThunk = createAsyncThunk<Cart, CartItemPayload>(
  "cart/addItem",
  async (payload) => {
    return await cartApi.addCartItem(payload);
  }
);

// Update item → backend returns updated CartItem
export const updateCartItemThunk = createAsyncThunk<
  CartItem,
  UpdateCartItemPayload
>("cart/updateItem", async ({ id, quantity }) => {
  return await cartApi.updateCartItem(id, { quantity });
});

// Remove single item → no body returned
export const removeCartItemThunk = createAsyncThunk<number, number>(
  "cart/removeItem",
  async (id) => {
    await cartApi.removeCartItem(id);
    return id;
  }
);

// 🔹 Remove multiple items → re-fetches cart for sync
export const removeMultipleCartItemsThunk = createAsyncThunk<
  Cart,
  number[]
>("cart/removeMultiple", async (ids) => {
  await Promise.all(ids.map((id) => cartApi.removeCartItem(id)));
  return await cartApi.fetchCart();
});
