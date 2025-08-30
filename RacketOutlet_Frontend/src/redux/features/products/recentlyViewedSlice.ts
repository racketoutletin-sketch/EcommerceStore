// redux/features/products/recentlyViewedSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


export interface Product {
  id: number;
  name: string;
  description: string;
  main_image_url?: string | null;
  price: number; // original price
  discounted_price?: number | null; // discounted price
  brand?: string | null;
}

interface RecentlyViewedState {
  products: Product[];
}

// Load from localStorage on initialization
const initialState: RecentlyViewedState = {
  products: JSON.parse(localStorage.getItem('recentlyViewed') || '[]'),
};

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    addRecentlyViewed: (state, action: PayloadAction<Product>) => {
      // Remove if already exists
      state.products = state.products.filter(p => p.id !== action.payload.id);
      
      // Add to front
      state.products.unshift(action.payload);

      // Keep only latest 10
      if (state.products.length > 10) state.products.pop();

      // Sync to localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(state.products));
    },
  },
});

export const { addRecentlyViewed } = recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;
