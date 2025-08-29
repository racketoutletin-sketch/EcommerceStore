import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


import api from "../../../api/axios";

interface Product {
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
}

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_featured: boolean;
  is_active: boolean;
  products: Product[];
}

interface SubCategoryState {
  byCategory: Record<number, SubCategory[]>; // cache by categoryId
  loading: Record<number, boolean>;          // per-category loading
  error: Record<number, string | null>;     // per-category error
}

const initialState: SubCategoryState = {
  byCategory: {},
  loading: {},
  error: {},
};

// ✅ Fetch subcategories by category id (handles caching)
export const fetchSubCategoriesByCategory = createAsyncThunk<
  { categoryId: number; results: SubCategory[] },
  number,
  { rejectValue: string }
>(
  "subcategories/fetchByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.get(`https://wzonllfccvmvoftahudd.supabase.co/functions/v1/hyper-action?category_id=${categoryId}`);
      return { categoryId, results: response.data.results };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch subcategories");
    }
  }
);

const subCategorySlice = createSlice({
  name: "subcategories",
  initialState,
  reducers: {
    clearCategoryCache: (state, action: PayloadAction<number>) => {
      const categoryId = action.payload;
      delete state.byCategory[categoryId];
      delete state.loading[categoryId];
      delete state.error[categoryId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubCategoriesByCategory.pending, (state, action) => {
        const categoryId = action.meta.arg;
        state.loading[categoryId] = true;
        state.error[categoryId] = null;
      })
      .addCase(fetchSubCategoriesByCategory.fulfilled, (state, action) => {
        const { categoryId, results } = action.payload;
        state.byCategory[categoryId] = results;
        state.loading[categoryId] = false;
      })
      .addCase(fetchSubCategoriesByCategory.rejected, (state, action) => {
        const categoryId = action.meta.arg;
        state.error[categoryId] = action.payload || "Error fetching subcategories";
        state.loading[categoryId] = false;
      });
  },
});

export const { clearCategoryCache } = subCategorySlice.actions;
export default subCategorySlice.reducer;
