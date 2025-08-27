// src/api/cartApi.ts
import axios from "./axios";
import type { Cart, CartItemPayload } from "../redux/features/cart/types";

export const fetchCart = async (): Promise<Cart> => {
  const { data } = await axios.get<Cart>("api/cart/");
  return data;
};

export const addCartItem = async (payload: CartItemPayload): Promise<void> => {
  await axios.post("api/cart/items/", payload);
};

export const updateCartItem = async (
  id: number,
  payload: { product_id: number; quantity: number }
): Promise<void> => {
  await axios.put(`api/cart/items/${id}/`, payload);
};
export const removeCartItem = async (id: number): Promise<void> => {
  await axios.delete(`api/cart/items/${id}/`);
};
