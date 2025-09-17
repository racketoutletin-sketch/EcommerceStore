// src/api/cartApi.ts
import axios from "./axios";
import type { Cart, CartItem, CartItemPayload } from "../redux/features/cart/types";

export const fetchCart = async (): Promise<Cart> => {
  const { data } = await axios.get<Cart>("/api/cart/");
  return data;
};

export const addCartItem = async (payload: CartItemPayload): Promise<Cart> => {
  // backend returns full cart after creation
  const { data } = await axios.post<Cart>("/api/cart/items/", payload);
  return data;
};

export const updateCartItem = async (
  id: number,
  payload: { quantity: number }
): Promise<CartItem> => {
  const { data } = await axios.patch<CartItem>(`/api/cart/items/${id}/`, payload);
  return data;
};

export const removeCartItem = async (id: number): Promise<void> => {
  await axios.delete(`/api/cart/items/${id}/`);
};
