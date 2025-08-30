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

// Load cart from localStorage
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
      state.items = state.items.filter((item) => !action.payload.includes(item.id));
      state.cart.items = state.items;
      state.cart.total_price = state.items
        .reduce((sum, i) => sum + parseFloat(i.subtotal), 0)
        .toFixed(2);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCartThunk.pending, (state) => { state.loading = true; })
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

      // Add Item (Optimistic)
      .addCase(addCartItemThunk.fulfilled, (state, action) => {
        const newItem = action.payload;
        const existing = state.items.find(i => i.product.id === newItem.product_id);

        if (existing) {
          existing.quantity += newItem.quantity;
          existing.subtotal = (parseFloat(existing.product.price) * existing.quantity).toFixed(2);
        } else {
          state.items.push({
            id: Date.now(),
            product: { id: newItem.product_id, name: "Loading...", price: "0" },
            quantity: newItem.quantity,
            subtotal: "0",
          });
        }

        state.cart = {
          ...state.cart!,
          items: state.items,
          total_price: state.items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0).toFixed(2),
        };
        localStorage.setItem("cart", JSON.stringify(state.cart));
      })

      // Update Item
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        const { id, quantity } = action.payload;
        const item = state.items.find((i) => i.id === id);
        if (item) {
          item.quantity = quantity;
          item.subtotal = (parseFloat(item.product.price) * quantity).toFixed(2);
        }
        state.cart!.items = state.items;
        state.cart!.total_price = state.items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0).toFixed(2);
        localStorage.setItem("cart", JSON.stringify(state.cart));
      })

      // Remove Item
      .addCase(removeCartItemThunk.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((i) => i.id !== id);
        state.cart!.items = state.items;
        state.cart!.total_price = state.items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0).toFixed(2);
        localStorage.setItem("cart", JSON.stringify(state.cart));
      })

      // Remove Multiple Items
      .addCase(removeMultipleCartItemsThunk.fulfilled, (state, action) => {
        const ids = action.payload;
        state.items = state.items.filter((i) => !ids.includes(i.id));
        state.cart!.items = state.items;
        state.cart!.total_price = state.items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0).toFixed(2);
        localStorage.setItem("cart", JSON.stringify(state.cart));
      });
  },
});

export const { clearCart, removeItemsFromCart } = cartSlice.actions;
export default cartSlice.reducer;
