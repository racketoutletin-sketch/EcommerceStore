// src/features/products/productSearchSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "../../../api/axios";

// ------------------ Types ------------------
export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  image_url: string | null;
}
export interface Inventory {
  quantity: number;
  low_stock_threshold: number;
  last_restocked_at: string;
  is_low_stock: boolean;
}
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  discounted_price: string | null;
  current_price: number;
  sku: string;
  brand: string;
  main_image: string;
  images?: ProductImage[];
  inventory?: Inventory;
  sub_category_id?: number;
  sub_category_name: string;
}

interface ProductApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
  currentPage?: number;
  totalPages?: number;
}

export type SortOption =
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "recent";

// Filters user can apply
export interface Filters {
  brand?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  type?: string; // sub_category_name
  sort?: SortOption;

  // Pagination
  page?: number;
  page_size?: number;
}

interface ProductSearchState {
  products: Product[];
  count: number;
  next: string | null;
  previous: string | null;

  loading: boolean;
  error: string | null;

  filters: Filters;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;

// ------------------ Initial State ------------------
const initialState: ProductSearchState = {
  products: [],
  count: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
  filters: {
    page: DEFAULT_PAGE,
    page_size: DEFAULT_PAGE_SIZE,
    sort: "recent",
  },
};

// ------------------ Helpers ------------------
const getTotalPages = (count: number, pageSize?: number) => {
  const size = pageSize || DEFAULT_PAGE_SIZE;
  return Math.max(1, Math.ceil(count / size));
};

// Map frontend sort options → API params
const mapSortToOrdering = (sort?: SortOption): string | undefined => {
  switch (sort) {
    case "name_asc":
      return "name";
    case "name_desc":
      return "-name";
    case "price_asc":
      return "current_price_value";   // ✅ use annotation
    case "price_desc":
      return "-current_price_value";  // ✅ use annotation
    case "recent":
      return "-created_at";
    default:
      return undefined;
  }
};


// ------------------ Thunks ------------------
export const fetchProducts = createAsyncThunk<
  ProductApiResponse,
  Filters | void,
  { rejectValue: string; state: { productSearch: ProductSearchState } }
>("products/fetchProducts", async (_filters, { rejectWithValue, getState }) => {
  try {
    const stateFilters = getState().productSearch.filters;
    const mergedFilters = { ...stateFilters, ...(_filters || {}) };

    // Convert sort → ordering
    const params: Record<string, any> = { ...mergedFilters };
    if (mergedFilters.sort) {
      params.ordering = mapSortToOrdering(mergedFilters.sort);
      delete params.sort; // remove frontend-only param
    }

    const response = await axios.get<ProductApiResponse>("/api/products", {
      params,
    });

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.detail || "Failed to fetch products"
    );
  }
});

// ------------------ Slice ------------------
const productSearchSlice = createSlice({
  name: "productSearch",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<Filters>>) {
      const nextFilters = { ...state.filters, ...action.payload };

      // Reset to page 1 if filter changes (except explicit page)
      if (
        ("brand" in action.payload ||
          "type" in action.payload ||
          "min_price" in action.payload ||
          "max_price" in action.payload ||
          "search" in action.payload ||
          "sort" in action.payload) &&
        typeof action.payload.page === "undefined"
      ) {
        nextFilters.page = 1;
      }

      state.filters = nextFilters;
    },
    clearFilters(state) {
      state.filters = {
        page: DEFAULT_PAGE,
        page_size: DEFAULT_PAGE_SIZE,
        sort: "recent",
      };
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = Math.max(1, action.payload);
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.filters.page_size = Math.max(1, action.payload);
      state.filters.page = 1;
    },
    nextPage(state) {
      const total = getTotalPages(state.count, state.filters.page_size);
      const current = state.filters.page || 1;
      if (current < total) state.filters.page = current + 1;
    },
    prevPage(state) {
      const current = state.filters.page || 1;
      if (current > 1) state.filters.page = current - 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching products";
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setPage,
  setPageSize,
  nextPage,
  prevPage,
} = productSearchSlice.actions;

export default productSearchSlice.reducer;

// ------------------ Selectors ------------------
export const selectSearchState = (state: { productSearch: ProductSearchState }) =>
  state.productSearch;

export const selectPagination = (state: { productSearch: ProductSearchState }) => {
  const { count, filters, next, previous } = state.productSearch;
  const currentPage = filters.page || DEFAULT_PAGE;
  const pageSize = filters.page_size || DEFAULT_PAGE_SIZE;
  const totalPages = getTotalPages(count, pageSize);
  return {
    currentPage,
    pageSize,
    totalPages,
    hasNext: Boolean(next) || currentPage < totalPages,
    hasPrev: Boolean(previous) || currentPage > 1,
  };
};
