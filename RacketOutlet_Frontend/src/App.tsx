import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProfileUpdate from "./pages/ProfileUpdate";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
// import useInitAuth from "./hooks/useInitAuth";
// import usePreloadSubCategories from "./hooks/usePreloadSubCategories";

import SubCatWithProducts from "./pages/SubCatWithProducts";
import ProductsBySubCategory from "./pages/ProductsBySubCategory";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetail";
import SearchResults from "./pages/SearchResults";



import WishlistPage from "./pages/WishlistPage";

// import SubCatWithProductsSkeleton from "../src/components/Skeleton/SubCatWithProductsSkeleton";
// 
import './App.css';

export default function App() {
//   useInitAuth();

//   // ✅ Preload all subcategories before rendering routes
//   const loadingSubCategories = usePreloadSubCategories();


// if (loadingSubCategories) {
//   return <SubCatWithProductsSkeleton subCount={3} productCount={8} />;
// }

  return (
    <Router>
      <div className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/update" element={<ProtectedRoute><ProfileUpdate /></ProtectedRoute>} />

          <Route path="/subcategories/:id" element={<SubCatWithProducts />} />
          <Route path="/subcategories/:subId/products" element={<ProductsBySubCategory />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/search" element={<SearchResults />} />

          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />




          <Route path="*" element={<PublicRoute><Home /></PublicRoute>} />
        </Routes>
      </div>
    </Router>
  );
}
