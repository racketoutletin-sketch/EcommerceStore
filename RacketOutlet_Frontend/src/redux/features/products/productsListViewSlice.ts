import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

interface Inventory {
  quantity: number;
  low_stock_threshold: number;
  last_restocked_at: string;
  is_low_stock: boolean;
}

interface Product {
  id: number;
  name: string;
  brand: string | null;
  price: number;
  current_price: number;
  discounted_price: number | null;
  main_image_url?: string | null;
  images: string[];
  inventory?: Inventory; // Include full inventory info
}

interface ProductListState {
  searchResults: Product[];
  availableBrands: string[];
  availableProductTypes: string[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
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

// Fetch global brands once
export const fetchGlobalBrands = createAsyncThunk<string[], void, { rejectValue: string }>(
  "productListView/fetchGlobalBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<{ brands: string[] }>("/api/brands/");
      return response.data.brands ?? [];
    } catch {
      return rejectWithValue("Failed to fetch global brands");
    }
  }
);

// Fetch products by subcategory
export const fetchProductsBySubCategory = createAsyncThunk<
  {
    products: Product[];
    brands: string[];
    page: number;
    totalPages: number;
    total: number;
  },
  {
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
  { rejectValue: string }
>("productListView/fetchBySubCategory", async (params, { rejectWithValue }) => {
  try {
    const queryObj: Record<string, string> = {};

    if (params.sort && params.sort !== "relevance") queryObj.sort = params.sort;
    if (params.productType?.trim()) queryObj.product_type = params.productType;
    if (params.brand?.trim()) queryObj.brand = params.brand;
    if (params.priceMin && params.priceMin > 0) queryObj.price_min = params.priceMin.toString();
    if (params.priceMax && params.priceMax > 0) queryObj.price_max = params.priceMax.toString();
    if (params.inStock) queryObj.in_stock = "true";

    const limit = params.limit ?? 16;
    const page = params.page ?? 1;
    queryObj.limit = limit.toString();
    queryObj.page = page.toString();

    const query = new URLSearchParams(queryObj).toString();
    const response = await api.get(`/api/subcategories/${params.subId}/products/?${query}`);

    const products: Product[] = (response.data.results ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      brand: p.brand ?? null,
      price: Number(p.price),
      current_price: Number(p.current_price),
      discounted_price: p.discounted_price ? Number(p.discounted_price) : null,
      main_image_url: p.main_image_url ?? null,
      images: p.images?.map((img: any) => img.image_url) ?? [],
      inventory: p.inventory
        ? {
            quantity: p.inventory.quantity,
            low_stock_threshold: p.inventory.low_stock_threshold,
            last_restocked_at: p.inventory.last_restocked_at,
            is_low_stock: p.inventory.is_low_stock,
          }
        : undefined,
    }));

    const total: number = response.data.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    // Merge brands in current result
    const brands: string[] = Array.from(
      new Set(products.map((p) => p.brand).filter(isString))
    );

    return { products, brands, page, totalPages, total };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || err.message || "Failed to fetch products");
  }
});

const productListSlice = createSlice({
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
      .addCase(fetchGlobalBrands.fulfilled, (state, action) => {
        state.availableBrands = action.payload ?? [];
      })
      .addCase(fetchProductsBySubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsBySubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.products;
        // Merge new brands with existing global brands
        state.availableBrands = Array.from(
          new Set([...state.availableBrands, ...action.payload.brands])
        );
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.total = action.payload.total;
      })
      .addCase(fetchProductsBySubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch products";
      });
  },
});

export const { resetProducts } = productListSlice.actions;
export default productListSlice.reducer;
