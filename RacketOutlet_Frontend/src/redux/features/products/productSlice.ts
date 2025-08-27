import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

interface ProductState {
  featured: any[];
  dealOfTheDay: any[];
  exclusive: any[];
  searchResults: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  featured: [],
  dealOfTheDay: [],
  exclusive: [],
  searchResults: [],
  loading: false,
  error: null,
};

// Fetch Featured Products
export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeatured",
  async () => {
    const response = await api.get("api/products/featured/");
    return response.data;
  }
);

// Fetch Deal of the Day Products
export const fetchDealOfTheDayProducts = createAsyncThunk(
  "products/fetchDealOfTheDay",
  async () => {
    const response = await api.get("api/products/deal-of-the-day/");
    return response.data;
  }
);

// Fetch Exclusive Products
export const fetchExclusiveProducts = createAsyncThunk(
  "products/fetchExclusive",
  async () => {
    const response = await api.get("api/products/exclusive/");
    return response.data;
  }
);


// Search Products
export const searchProducts = createAsyncThunk(
  "products/search",
  async (params: { search?: string; min_price?: string; max_price?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    const response = await api.get(`api/products/?${query}`);
    return response.data;
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featured = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch featured products";
      })
      .addCase(fetchDealOfTheDayProducts.fulfilled, (state, action) => {
        state.dealOfTheDay = action.payload;
      })
      .addCase(fetchExclusiveProducts.fulfilled, (state, action) => {
        state.exclusive = action.payload;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchResults = action.payload;});

  },
});

export default productSlice.reducer;
