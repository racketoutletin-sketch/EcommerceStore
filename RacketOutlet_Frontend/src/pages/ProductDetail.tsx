import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchProductById } from "../redux/features/products/productDetailViewSlice";
import { addRecentlyViewed } from "../redux/features/products/recentlyViewedSlice";
import {
  addCartItemThunk,
  updateCartItemThunk,
  removeCartItemThunk,
} from "../redux/features/cart/cartThunks";
import {
  addWishlistItemThunk,
  removeWishlistItemThunk,
  addWishlistItemOptimistic,
  removeWishlistItemOptimistic,
} from "../redux/features/wishlist/wishlistSlice";

import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import Loader from "../components/Loader";
import ProductInfo from "../components/ProductInfo";
import ProductCarousel from "../components/ProductCarousel";
import { fetchProductsBySubCategory } from "../redux/features/products/productsListViewSlice";

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const { productDetail, loading: detailLoading, error } = useSelector(
    (state: RootState) => state.productView
  );
  const { searchResults: subCatProducts } = useSelector(
    (state: RootState) => state.productListView
  );
  const { products: recentlyViewed } = useSelector(
    (state: RootState) => state.recentlyViewed
  );
  const cart = useSelector((state: RootState) => state.cart.cart);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const cartItem = cart?.items?.find(
    (item) => item.product.id === Number(productId)
  );
  const wishlisted = wishlistItems.some(
    (item) => item.product?.id === productDetail?.id
  );

  const similarRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!productId) return;
    dispatch(fetchProductById(Number(productId)));
  }, [productId, dispatch]);
  useEffect(() => {
  if (productDetail?.subcategory_id) {
    dispatch(
      fetchProductsBySubCategory({
        subId: productDetail.subcategory_id,
        limit: 10, // optional
      })
    );
  }
}, [productDetail, dispatch]);
  useEffect(() => {
    if (!productDetail) return;
dispatch(
  addRecentlyViewed({
    id: productDetail.id,
    name: productDetail.name,
    description: productDetail.description ?? "",
    main_image_url: productDetail.main_image_url || "/placeholder.png",
    price: Number(productDetail.price), // ✅ original price
    discounted_price: productDetail.discounted_price ?? null, // ✅ discounted price
    brand: productDetail.brand ?? "",
  })
);

  }, [productDetail, dispatch]);

  const handleToggleWishlist = () => {
    if (!productDetail) return;
    if (wishlisted) {
      dispatch(removeWishlistItemOptimistic(productDetail.id));
      dispatch(removeWishlistItemThunk(productDetail.id)).catch(() =>
        dispatch(
          addWishlistItemOptimistic({
            id: Date.now(),
            product: productDetail,
            added_at: new Date().toISOString(),
          })
        )
      );
    } else {
      dispatch(
        addWishlistItemOptimistic({
          id: Date.now(),
          product: {
            id: productDetail.id,
            name: productDetail.name,
            main_image_url: productDetail.main_image_url || "/placeholder.png",
            price: Number(productDetail.price),
            discounted_price: productDetail.discounted_price ?? undefined,
            brand: productDetail.brand ?? "",
            description: productDetail.description ?? "",
          },
          added_at: new Date().toISOString(),
        })
      );
      dispatch(addWishlistItemThunk(productDetail.id)).catch(() =>
        dispatch(removeWishlistItemOptimistic(productDetail.id))
      );
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!productDetail) return;
    const finalPrice =
      productDetail.discounted_price ?? Number(productDetail.price);
    const directItem = {
      id: Date.now(),
      quantity: 1,
      product: {
        id: productDetail.id,
        name: productDetail.name,
        main_image_url: productDetail.main_image_url || "/placeholder.png",
        price: Number(productDetail.price),
        discounted_price: productDetail.discounted_price ?? undefined,
        current_price: finalPrice,
      },
      subtotal: finalPrice,
    };
    navigate("/checkout", {
      state: { directItems: [directItem], total: finalPrice },
    });
  };

  const handleAddToCart = async (quantity = 1) => {
    if (!productDetail) return;
    try {
      setLoading(true);
      if (cartItem) {
        await dispatch(
          updateCartItemThunk({
            id: cartItem.id,
            product_id: productDetail.id,
            quantity,
          })
        ).unwrap();
      } else {
        await dispatch(
          addCartItemThunk({ product_id: productDetail.id, quantity })
        ).unwrap();
      }
    } finally {
      setLoading(false);
    }
  };

const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: "left" | "right") => {
  if (!ref.current) return; // guard against null
  if (dir === "left") {
    ref.current.scrollBy({ left: -200, behavior: "smooth" });
  } else {
    ref.current.scrollBy({ left: 200, behavior: "smooth" });
  }
};


  if (detailLoading) return <Loader />;
  if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;
  if (!productDetail)
    return (
      <p className="text-gray-500 text-center mt-6">Product not found</p>
    );

  const filteredSimilar =
    subCatProducts?.filter((p) => p.id !== productDetail.id) || [];
    
  const filteredRecentlyViewed = recentlyViewed.filter(
    (p) => p.id !== productDetail.id
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <TopBar />
      <Header />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <ProductInfo
          productDetail={productDetail}
          cartItem={cartItem}
          wishlisted={wishlisted}
          loading={loading}
          handleBuyNow={handleBuyNow}
          handleToggleWishlist={handleToggleWishlist}
          handleAddToCart={handleAddToCart}
          removeCartItem={(id) => dispatch(removeCartItemThunk(id))}
        />

        {filteredSimilar.length > 0 && (
          <ProductCarousel
            title="Similar Products"
            products={filteredSimilar}
            refProp={similarRef}
            scroll={scroll}
          />
        )}

        {filteredRecentlyViewed.length > 0 && (
          <ProductCarousel
            title="Recently Viewed"
            products={filteredRecentlyViewed}
            refProp={recentRef}
            scroll={scroll}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
