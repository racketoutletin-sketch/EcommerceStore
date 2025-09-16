// src/api/cartApi.ts
import axios from "./axios";
import type { Cart, CartItemPayload, CartItem } from "../redux/features/cart/types";

/**
 * Fetch the current user's cart
 */
export const fetchCart = async (): Promise<Cart> => {
  const { data } = await axios.get<Cart>("/api/cart/");
  return data;
};

/**
 * Add an item to the cart
 */
export const addCartItem = async (payload: CartItemPayload): Promise<CartItem> => {
  const { data } = await axios.post<CartItem>("/api/cart/items/", payload);
  return data;
};

/**
 * Update a cart item quantity
 */
export const updateCartItem = async (
  id: number,
  payload: { product_id: number; quantity: number }
): Promise<CartItem> => {
  const { data } = await axios.put<CartItem>(`/api/cart/items/${id}/`, payload);
  return data;
};

/**
 * Remove a cart item
 */
export const removeCartItem = async (id: number): Promise<void> => {
  await axios.delete(`/api/cart/items/${id}/`);
};

/**
 * Remove multiple cart items at once
 */
export const removeMultipleCartItems = async (ids: number[]): Promise<void> => {
  // You can either loop over each DELETE call:
  await Promise.all(ids.map((id) => removeCartItem(id)));
  // Or create a DRF endpoint that accepts multiple IDs in POST/DELETE for batch removal
};
