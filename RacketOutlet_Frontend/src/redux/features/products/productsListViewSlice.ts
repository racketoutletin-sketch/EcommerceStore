import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  current_price: number;
  discounted_price?: number | null;
  images?: string[];
  main_image_url?: string | null;
  quantity: number;
  description?: string;
  extra_attributes?: { type?: string } | null;
}

interface ProductListState {
  searchResults: Product[];
  availableBrands: string[];
  availableProductTypes: string[];
  loading: boolean;
  error: string | null;
  page: number;        // current page
  totalPages: number;  // total number of pages
}

const initialState: ProductListState = {
  searchResults: [],
  availableBrands: [],
  availableProductTypes: [],
  loading: false,
  error: null,
  page: 1,
  totalPages: 1,
};

// Type guard
const isString = (value: unknown): value is string => typeof value === "string";

// Thunk
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
      limit?: number;
      page?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const queryObj: Record<string, string> = {
        subcategory_id: params.subId.toString(),
      };

      if (params.sort) queryObj.sort = params.sort;
      if (params.productType) queryObj.product_type = params.productType;
      if (params.brand) queryObj.brand = params.brand;
      if (params.priceMin !== undefined)
        queryObj.price_min = params.priceMin.toString();
      if (params.priceMax !== undefined)
        queryObj.price_max = params.priceMax.toString();
      if (params.inStock !== undefined)
        queryObj.in_stock = params.inStock.toString();

      // pagination defaults
      const limit = params.limit ?? 16;
      const page = params.page ?? 1;
      const offset = (page - 1) * limit;

      queryObj.limit = limit.toString();
      queryObj.offset = offset.toString();

      const query = new URLSearchParams(queryObj).toString();
      const response = await api.get(
        `https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-products-with-subcategory?${query}`
      );

      const products: Product[] = response.data.results ?? [];
      const total: number = response.data.total ?? products.length;
      const totalPages = Math.ceil(total / limit);

      const brands: string[] = Array.from(
        new Set(products.map((p) => p.brand).filter(isString))
      );

      const productTypes: string[] = Array.from(
        new Set(products.map((p) => p.extra_attributes?.type).filter(isString))
      );

      return {
        products,
        brands,
        productTypes,
        page,
        totalPages,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.detail || err.message || "Failed to fetch products"
      );
    }
  }
);

const productListReducer = createSlice({
  name: "productListView",
  initialState,
  reducers: {
    resetProducts(state) {
      state.searchResults = [];
      state.page = 1;
      state.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsBySubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsBySubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.products;
        state.availableBrands = action.payload.brands;
        state.availableProductTypes = action.payload.productTypes;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProductsBySubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProducts } = productListReducer.actions;
export default productListReducer.reducer;
