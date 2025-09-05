import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

// --- Types ---
export interface ProductImage {
  id: number;
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
}

export interface Inventory {
  quantity: number;
  low_stock_threshold: number;
  last_restocked_at: string;
  is_low_stock: boolean;
}

export interface ProductDetailType {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  discounted_price?: number | null;
  sku: string;
  brand?: string | null;
  weight?: number | null;
  dimensions?: string | null;
  material?: string | null;
  main_image?:string | null;
  main_image_url: string;
  extra_attributes?: any;
  is_featured: boolean;
  is_deal_of_the_day: boolean;
  is_exclusive_product: boolean;
  is_active: boolean;
  subcategory_id: number;
  sub_category_name: string;
  images: ProductImage[];
  inventory: Inventory;
}

export interface CarouselProduct {
  id: number;
  name: string;
  description: string;
  main_image_url: string;
  current_price: number;
  discounted_price?: number;
  brand: string;
}

// --- State ---
interface ProductState {
  featured: CarouselProduct[];
  dealOfTheDay: CarouselProduct[];
  exclusive: CarouselProduct[];
  searchResults: CarouselProduct[];
  productDetail: ProductDetailType | null;
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

// --- Async Thunks ---
// Fetch single product by ID
export const fetchProductById = createAsyncThunk<
  ProductDetailType,
  number,
  { rejectValue: string }
>(
  "products/fetchById",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-product--with-product-ID?id=${productId}`
      );
      return response.data as ProductDetailType;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to fetch product"
      );
    }
  }
);

// --- Slice ---
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
        state.error = action.payload ?? "Failed to fetch product";
      });
  },
});

export default productSlice.reducer;
