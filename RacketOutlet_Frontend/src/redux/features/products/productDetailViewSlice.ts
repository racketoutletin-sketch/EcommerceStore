import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

interface ProductState {
  featured: any[];
  dealOfTheDay: any[];
  exclusive: any[];
  searchResults: any[];
  productDetail: any | null; // for single product
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  featured: [],
  dealOfTheDay: [],
  exclusive: [],
  searchResults: [],
  productDetail: null,
  loading: false,
  error: null,
};

// Fetch single product by ID
export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/products/view/${productId}/`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch product");
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.productDetail = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetail = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default productSlice.reducer;
