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
  total: number;       // total number of products
}

const initialState: ProductListState = {
  searchResults: [],
  availableBrands: [],
  availableProductTypes: [],
  loading: false,
  error: null,
  page: 1,
  totalPages: 1,
  total: 0,
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

      // only add when meaningful
      if (params.sort && params.sort !== "relevance") {
        queryObj.sort = params.sort;
      }
      if (params.productType && params.productType.trim() !== "") {
        queryObj.product_type = params.productType;
      }
      if (params.brand && params.brand.trim() !== "") {
        queryObj.brand = params.brand;
      }
      if (params.priceMin !== undefined && params.priceMin > 0) {
        queryObj.price_min = params.priceMin.toString();
      }
      if (params.priceMax !== undefined && params.priceMax > 0) {
        queryObj.price_max = params.priceMax.toString();
      }
      if (params.inStock === true) {
        queryObj.in_stock = "true";
      }

      // pagination defaults
      const limit = params.limit ?? 16;
      const page = params.page ?? 1;
      queryObj.limit = limit.toString();
      queryObj.page = page.toString();

      const query = new URLSearchParams(queryObj).toString();
      const response = await api.get(
        `https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-products-with-subcategory?${query}`
      );

      console.log("API Response:", response.data);

      const products: Product[] = response.data.results ?? [];
      const total: number = response.data.total ?? 0;
      const pageFromApi: number = response.data.page ?? page;
      const totalPages: number = response.data.totalPages ?? 1;

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
        page: pageFromApi,
        totalPages,
        total,
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
      state.total = 0;
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
        state.total = action.payload.total;
      })
      .addCase(fetchProductsBySubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProducts } = productListReducer.actions;
export default productListReducer.reducer;
