// src/redux/features/cart/cartSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Cart } from "./types";
import {
  fetchCartThunk,
  addCartItemThunk,
  updateCartItemThunk,
  removeCartItemThunk,
  removeMultipleCartItemsThunk,
} from "./cartThunks";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: () => initialState,
  },
  extraReducers: (builder) => {
    // ------------------- Fetch cart -------------------
    builder.addCase(fetchCartThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCartThunk.fulfilled, (state, action) => {
      state.cart = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchCartThunk.rejected, (state, action) => {
      state.error = action.error.message || "Failed to fetch cart";
      state.loading = false;
    });

    // ------------------- Add item → replace with server cart -------------------
    builder.addCase(addCartItemThunk.fulfilled, (state, action) => {
      state.cart = action.payload;
    });

    // ------------------- Update item → optimistic -------------------
    builder.addCase(updateCartItemThunk.fulfilled, (state, action) => {
      if (!state.cart) return;
      const idx = state.cart.items.findIndex((i) => i.id === action.payload.id);
      if (idx !== -1) {
        state.cart.items[idx] = action.payload;
      }
    });

    // ------------------- Remove single item → optimistic -------------------
    builder.addCase(
      removeCartItemThunk.fulfilled,
      (state, action: PayloadAction<number>) => {
        if (!state.cart) return;
        state.cart.items = state.cart.items.filter(
          (i) => i.id !== action.payload
        );
      }
    );

    // ------------------- Remove multiple items → replace with server cart -------------------
    builder.addCase(removeMultipleCartItemsThunk.fulfilled, (state, action) => {
      state.cart = action.payload;
    });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;

