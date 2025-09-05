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
import { getFinalImageUrl } from "../utils/imageUtils";  // ✅ import utility

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const user = useSelector((state: RootState) => state.auth.user);
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
    if (productId) {
      dispatch(fetchProductById(Number(productId)));
    }
  }, [productId, dispatch]);

  useEffect(() => {
    if (productDetail?.subcategory_id) {
      dispatch(
        fetchProductsBySubCategory({
          subId: productDetail.subcategory_id,
          limit: 10,
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
        main_image_url: getFinalImageUrl(
          productDetail.main_image,
          productDetail.main_image_url
        ),
        price: Number(productDetail.price),
        discounted_price: productDetail.discounted_price ?? null,
        brand: productDetail.brand ?? "",
      })
    );
  }, [productDetail, dispatch]);

  const handleToggleWishlist = () => {
    if (!productDetail) return;
    if (!user) {
      navigate("/login");
      return;
    }

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
            main_image_url: getFinalImageUrl(
              productDetail.main_image,
              productDetail.main_image_url
            ),
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
    if (!user) {
      navigate("/login");
      return;
    }

    const finalPrice =
      productDetail.discounted_price ?? Number(productDetail.price);
    const directItem = {
      id: Date.now(),
      quantity: 1,
      product: {
        id: productDetail.id,
        name: productDetail.name,
        main_image_url: getFinalImageUrl(
          productDetail.main_image,
          productDetail.main_image_url
        ),
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
    if (!user) {
      navigate("/login");
      return;
    }

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
    } catch (err) {
      console.error("Cart update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: "left" | "right"
  ) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: dir === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  if (detailLoading) return <Loader />;
  if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;
  if (!productDetail)
    return <p className="text-gray-500 text-center mt-6">Product not found</p>;

  // ✅ unified images
  const finalImages: string[] = [
    getFinalImageUrl(productDetail.main_image, productDetail.main_image_url),
    ...(productDetail.images
      ? productDetail.images
          .map((img) => img?.image_url)
          .filter((url): url is string => !!url)
      : []),
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? finalImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === finalImages.length - 1 ? 0 : prev + 1
    );
  };

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
        {/* ✅ Main Image Viewer */}
        <div className="relative w-full max-w-2xl mx-auto">
          <img
            src={finalImages[currentIndex]}
            alt={productDetail.name}
            className="w-full h-96 object-contain rounded-xl shadow"
          />

          {finalImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute top-1/2 left-2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                ‹
              </button>
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                ›
              </button>

              <div className="flex justify-center mt-4 gap-2">
                {finalImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`thumb-${idx}`}
                    className={`w-14 h-14 object-cover rounded-md border-2 cursor-pointer ${
                      idx === currentIndex
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    onClick={() => setCurrentIndex(idx)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ✅ Product Info */}
        <ProductInfo
          productDetail={productDetail}
          cartItem={cartItem}
          wishlisted={wishlisted}
          loading={loading}
          user={user}
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
