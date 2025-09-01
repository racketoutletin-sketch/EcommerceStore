// src/redux/features/cart/cartThunks.ts
import * as cartApi from "../../../api/cartApi";
import { createAuthThunk } from "../../utils/createAuthThunk";
import type { CartItemPayload } from "./types";

// ✅ Fetch Cart
export const fetchCartThunk = createAuthThunk("cart/fetch", async () => {
  return await cartApi.fetchCart();
});

// ✅ Add Item
export const addCartItemThunk = createAuthThunk(
  "cart/addItem",
  async (payload: CartItemPayload) => {
    cartApi.addCartItem(payload).catch(console.error);
    return payload; // optimistic update
  }
);

// ✅ Update Item
export const updateCartItemThunk = createAuthThunk(
  "cart/updateItem",
  async ({ id, product_id, quantity }: { id: number; product_id: number; quantity: number }) => {
    cartApi.updateCartItem(id, { product_id, quantity }).catch(console.error);
    return { id, product_id, quantity };
  }
);

// ✅ Remove Item
export const removeCartItemThunk = createAuthThunk("cart/removeItem", async (id: number) => {
  cartApi.removeCartItem(id).catch(console.error);
  return id;
});

// ✅ Remove Multiple
export const removeMultipleCartItemsThunk = createAuthThunk(
  "cart/removeMultiple",
  async (itemIds: number[]) => {
    Promise.all(itemIds.map((id) => cartApi.removeCartItem(id))).catch(console.error);
    return itemIds;
  }
);
