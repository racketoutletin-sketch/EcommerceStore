import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AliveScope, KeepAlive } from "react-activation";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProfileUpdate from "./pages/ProfileUpdate";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import SubCatWithProducts from "./pages/SubCatWithProducts";
import ProductsBySubCategory from "./pages/ProductsBySubCategory";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetail";
import SearchResults from "./pages/SearchResults";
import WishlistPage from "./pages/WishlistPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";

import "./App.css";

export default function App() {
  return (
    <Router>
      <AliveScope>
        <Routes>
          {/* ✅ Cached Home inside PublicRoute */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <KeepAlive name="HomePage" when={true}>
                  <Home />
                </KeepAlive>
              </PublicRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/update"
            element={
              <ProtectedRoute>
                <ProfileUpdate />
              </ProtectedRoute>
            }
          />

          <Route path="/subcategories/:id" element={<SubCatWithProducts />} />
          <Route
            path="/subcategories/:subId/products"
            element={<ProductsBySubCategory />}
          />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/search" element={<SearchResults />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />

          {/* ✅ Fallback to cached Home */}
          <Route
            path="*"
            element={
              <PublicRoute>
                <KeepAlive name="HomePage" when={true}>
                  <Home />
                </KeepAlive>
              </PublicRoute>
            }
          />
        </Routes>
      </AliveScope>
    </Router>
  );
}
