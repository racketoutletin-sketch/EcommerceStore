// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import productReducer from "./features/products/productSlice";
import categoriesReducer from "./features/categories/categoriesSlice";
import subCategoryReducer from "./features/subcategory/subcategorySlice";
import productListReducer from "./features/products/productsListViewSlice";
import productViewReducer from "./features/products/productDetailViewSlice";
import productSearchReducer from "./features/products/productSearchSlice";

import recentlyViewedReducer from "./features/products/recentlyViewedSlice";
import cartReducer from "./features/cart/cartSlice";
import ordersReducer  from "./features/orders/ordersSlice";
import orderDetailSlice  from "./features/orders/orderDetailSlice";


import wishlistSlice from "./features/wishlist/wishlistSlice";

import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    products: productReducer,
    subcategories: subCategoryReducer,
    categories: categoriesReducer,
    productView: productViewReducer,
    productListView: productListReducer,
    recentlyViewed: recentlyViewedReducer, // ✅ added missing comma
    cart: cartReducer, // ✅ registered correctly
    wishlist:wishlistSlice,
    orders: ordersReducer,
    orderDetail:orderDetailSlice,
    productSearch: productSearchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
