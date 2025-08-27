import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

interface ProductListState {
  searchResults: any[];
  availableBrands: string[];
  availableProductTypes: string[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductListState = {
  searchResults: [],
  availableBrands: [],
  availableProductTypes: [],
  loading: false,
  error: null,
};

// Fetch products by subcategory with optional filters & sorting
export const fetchProductsBySubCategory = createAsyncThunk(
  "productListView/fetchBySubCategory",
  async (
    params: {
      subId: number;
      sort?: string;
      productType?: string;
      brand?: string;
      priceMin?: number;
      priceMax?: number;
      inStock?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      // Build only non-empty params
      const queryObj: any = {};
      if (params.sort) queryObj.sort = params.sort;
      if (params.productType) queryObj.product_type = params.productType;
      if (params.brand) queryObj.brand = params.brand;
      if (params.priceMin) queryObj.price_min = params.priceMin;
      if (params.priceMax) queryObj.price_max = params.priceMax;
      if (params.inStock) queryObj.in_stock = params.inStock;

      const query = new URLSearchParams(queryObj).toString();

      const response = await api.get(
        `/api/subcategories/${params.subId}/products/?${query}`
      );

      const products = response.data.results;

      // Extract dynamic filters from response
      const brands = Array.from(
        new Set(products.map((p: any) => p.brand).filter(Boolean))
      ) as string[];

      const productTypes = Array.from(
        new Set(
          products
            .map((p: any) => p.extra_attributes?.type) // adjust if API uses different field
            .filter(Boolean)
        )
      ) as string[];

      return { products, brands, productTypes };

    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch products");
    }
  }
);

const productListReducer = createSlice({
  name: "productListView",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsBySubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.searchResults = [];
        state.availableBrands = [];
        state.availableProductTypes = [];
      })
      .addCase(fetchProductsBySubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.products;
        state.availableBrands = action.payload.brands;
        state.availableProductTypes = action.payload.productTypes;
      })
      .addCase(fetchProductsBySubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default productListReducer.reducer;
