import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../redux/store";
import axios from "../../../api/axios";
import type { Product } from "./types";

// ------------------ Types ------------------
export interface ProductApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export type SortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc" | "recent";

export interface Filters {
  brand?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  type?: string;
  sort?: SortOption;
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
  brands: string[];
  brandsLoading: boolean;
  pageCache: Record<number, Product[]>; // cached pages
}

// ------------------ Defaults ------------------
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;

const initialState: ProductSearchState = {
  products: [],
  count: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
  filters: { page: DEFAULT_PAGE, page_size: DEFAULT_PAGE_SIZE, sort: "recent" },
  brands: [],
  brandsLoading: false,
  pageCache: {},
};

// ------------------ Helpers ------------------
const getTotalPages = (count: number, pageSize?: number) => {
  const size = pageSize || DEFAULT_PAGE_SIZE;
  return Math.max(1, Math.ceil(count / size));
};

const mapSortToOrdering = (sort?: SortOption): string | undefined => {
  switch (sort) {
    case "name_asc": return "name";
    case "name_desc": return "-name";
    case "price_asc": return "current_price_value";
    case "price_desc": return "-current_price_value";
    case "recent": return "-created_at";
    default: return undefined;
  }
};

// ------------------ Thunks ------------------
export const fetchProducts = createAsyncThunk<
  ProductApiResponse,
  Filters | void,
  { rejectValue: string; state: RootState }
>(
  "products/fetchProducts",
  async (_filters, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState().productSearch;
      const mergedFilters = { ...state.filters, ...(_filters || {}) };
      const page = mergedFilters.page || DEFAULT_PAGE;

      // Serve cached page immediately
      if (state.pageCache[page]) {
        return {
          count: state.count,
          next: state.next,
          previous: state.previous,
          results: state.pageCache[page],
        };
      }

      const params: Record<string, any> = { ...mergedFilters };
      if (mergedFilters.sort) {
        params.ordering = mapSortToOrdering(mergedFilters.sort);
        delete params.sort;
      }

      // Fetch current page
      const response = await axios.get<ProductApiResponse>("/api/products", { params });

      // Prefetch next 3 pages
      const totalPages = getTotalPages(response.data.count, mergedFilters.page_size);
      for (let offset = 1; offset <= 3; offset++) {
        const nextPage = page + offset;
        if (nextPage <= totalPages && !state.pageCache[nextPage]) {
          axios
            .get<ProductApiResponse>("/api/products", { params: { ...params, page: nextPage } })
            .then((res) =>
              dispatch(cachePage({ page: nextPage, data: res.data.results }))
            )
            .catch(() => {});
        }
      }

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.detail || "Failed to fetch products");
    }
  }
);

export const fetchBrands = createAsyncThunk<string[], void, { rejectValue: string }>(
  "products/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ brands: string[] }>("/api/brands/");
      return response.data.brands;
    } catch {
      return rejectWithValue("Failed to fetch brands");
    }
  }
);

// ------------------ Slice ------------------
const productSearchSlice = createSlice({
  name: "productSearch",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Filters>) {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
      state.pageCache = {}; // clear cache on new filter/search
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.filters.page_size = action.payload;
      state.filters.page = 1;
      state.pageCache = {}; // clear cache when page size changes
    },
    cachePage(state, action: PayloadAction<{ page: number; data: Product[] }>) {
      state.pageCache[action.payload.page] = action.payload.data;
      // keep max 8 cached pages
      const pages = Object.keys(state.pageCache).map(Number).sort((a, b) => a - b);
      if (pages.length > 8) delete state.pageCache[pages[0]];
    },
    clearCache(state) {
      state.pageCache = {};
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
        const page = state.filters.page || DEFAULT_PAGE;
        state.pageCache[page] = action.payload.results;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching products";
      })
      .addCase(fetchBrands.pending, (state) => { state.brandsLoading = true; })
      .addCase(fetchBrands.fulfilled, (state, action) => { state.brandsLoading = false; state.brands = action.payload; })
      .addCase(fetchBrands.rejected, (state, action) => { state.brandsLoading = false; state.error = action.payload || "Error fetching brands"; });
  },
});

export const { setFilters, setPage, setPageSize, cachePage, clearCache } = productSearchSlice.actions;
export default productSearchSlice.reducer;

// ------------------ Selectors ------------------
export const selectPagination = (state: RootState) => {
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
