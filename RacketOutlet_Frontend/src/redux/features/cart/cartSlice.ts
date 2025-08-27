// src/redux/features/cart/cartSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { CartState } from "./types";
import {
  fetchCartThunk,
  addCartItemThunk,
  updateCartItemThunk,
  removeCartItemThunk,
  removeMultipleCartItemsThunk,
} from "./cartThunks";

// Load initial cart from localStorage if exists
const savedCart = localStorage.getItem("cart");
const initialState: CartState = {
  cart: savedCart ? JSON.parse(savedCart) : null,
  items: savedCart ? JSON.parse(savedCart).items : [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null;
      state.items = [];
      localStorage.removeItem("cart");
    },
    removeItemsFromCart: (state, action: PayloadAction<number[]>) => {
  if (!state.cart) return;

  const newItems = state.cart.items.filter(
    (item) => !action.payload.includes(item.id)
  );

  // Update cart safely
  state.cart = {
    ...state.cart,
    items: newItems,
    total_price: newItems
      .reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
      .toFixed(2), // string
  };

  // Sync state.items
  state.items = newItems;

  // Persist
  localStorage.setItem("cart", JSON.stringify(state.cart));
},




  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.items = action.payload.items;
        localStorage.setItem("cart", JSON.stringify(action.payload));
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch cart";
      })
      .addCase(addCartItemThunk.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload.items;
        localStorage.setItem("cart", JSON.stringify(action.payload));
      })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload.items;
        localStorage.setItem("cart", JSON.stringify(action.payload));
      })
      .addCase(removeCartItemThunk.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload.items;
        localStorage.setItem("cart", JSON.stringify(action.payload));
      })
      .addCase(removeMultipleCartItemsThunk.fulfilled, (state, action) => {
      state.cart = action.payload;
      state.items = action.payload.items;
      localStorage.setItem("cart", JSON.stringify(action.payload));
    });
  },
});

export const { clearCart, removeItemsFromCart } = cartSlice.actions;
export default cartSlice.reducer;
