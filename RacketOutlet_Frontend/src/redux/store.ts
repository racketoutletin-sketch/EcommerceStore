// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import categoriesReducer from "./features/categories/categoriesSlice";
import productListReducer from "./features/products/productsListViewSlice";
import productViewReducer from "./features/products/productDetailViewSlice";
import productSearchReducer from "./features/products/productSearchSlice";

import recentlyViewedReducer from "./features/products/recentlyViewedSlice";
import cartReducer from "./features/cart/cartSlice";
import ordersReducer from "./features/orders/ordersSlice";
import orderDetailSlice from "./features/orders/orderDetailSlice";

import wishlistSlice from "./features/wishlist/wishlistSlice";

import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

import type { ThunkDispatch } from "@reduxjs/toolkit";
import type { AnyAction } from "redux";

import homeReducer from "./features/home/homeSlice";

// ------------------ Store ------------------
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    categories: categoriesReducer,
    productView: productViewReducer,
    productListView: productListReducer,
    recentlyViewed: recentlyViewedReducer,
    cart: cartReducer,
    wishlist: wishlistSlice,
    orders: ordersReducer,
    orderDetail: orderDetailSlice,
    productSearch: productSearchReducer,
    home: homeReducer,
  },
});

// ------------------ Types ------------------
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch now includes thunk dispatch
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// ------------------ Typed Hooks ------------------
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
