// src/features/home/homeSlice.ts
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../../api/axios";
import type { RootState } from "../../store"; // adjust based on your store file

// ---- Types ----
export interface Category {
  id: number;
  name: string;
  subcategories: SubCategory[];
  image_url: string;
  description: string;
  is_active: boolean;

}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  subcategory: number | null;
  product: number | null;
}

export interface SubCategory {
  id: number;
  name: string;
  description: string;
  image: string;
}

export interface CategoryWithSub {
  id: number;
  subcategory: SubCategory;
  created_at: string;
}

export interface Video {
  id: number;
  video: string;
  video_url: string;
}

export interface ProductImage {
  id: number;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
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
  current_price: string;
  sku: string;
  brand: string;
  weight: string;
  dimensions: string;
  material: string;
  main_image_url: string;
  extra_attributes: any;
  is_featured: boolean;
  is_deal_of_the_day: boolean;
  is_exclusive_product: boolean;
  is_active: boolean;
  images: ProductImage[];
  inventory: Inventory;
  sub_category_id: number;
  sub_category_name: string;
}

export interface ExclusiveProduct {
  id: number;
  product: Product;
  created_at: string;
}

export interface ShopHotspot {
  id: number;
  top: number;
  left: number;
  right: number;
  product: Product;
}

export interface ShopTheLook {
  id: number;
  title: string;
  player_image: string;
  hotspots: ShopHotspot[];
}

export interface FeaturedProduct {
  id: number;
  product: Product;
  created_at: string;
}

export interface HomeResponse {
  featured_categories: Category[];
  banners: Banner[];
  categories: CategoryWithSub[];
  videos: Video[];
  exclusive_products: ExclusiveProduct[];
  shop_the_look: ShopTheLook[];
  featured_products: FeaturedProduct[];
}

// ---- State ----
interface HomeState {
  data: HomeResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  data: null,
  loading: false,
  error: null,
};

// ---- Thunks ----
export const fetchHomeData = createAsyncThunk<HomeResponse, void, { rejectValue: string }>(
  
  "home/fetchHomeData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<HomeResponse>("/api/homepage/");
      console.log("fetchHomepage called")
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch home data");
    }
  }
);

// ---- Slice ----
const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    clearHomeData: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action: PayloadAction<HomeResponse>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ---- Exports ----
export const { clearHomeData } = homeSlice.actions;
export default homeSlice.reducer;

// ---- Memoized Selectors ----
const selectHomeState = (state: RootState) => state.home;

export const selectHomeLoading = createSelector(
  selectHomeState,
  (home) => home.loading
);

export const selectHomeError = createSelector(
  selectHomeState,
  (home) => home.error
);

export const selectHomeData = createSelector(
  selectHomeState,
  (home) => home.data
);

export const selectFeaturedCategories = createSelector(
  selectHomeData,
  (data) => data?.featured_categories ?? []
);

export const selectBanners = createSelector(
  selectHomeData,
  (data) => data?.banners ?? []
);

export const selectCategories = createSelector(
  selectHomeData,
  (data) => data?.categories ?? []
);

export const selectVideos = createSelector(
  selectHomeData,
  (data) => data?.videos ?? []
);

export const selectExclusiveProducts = createSelector(
  selectHomeData,
  (data) => data?.exclusive_products ?? []
);

export const selectShopTheLook = createSelector(
  selectHomeData,
  (data) => data?.shop_the_look ?? []
);

export const selectFeaturedProducts = createSelector(
  selectHomeData,
  (data) => data?.featured_products ?? []
);
