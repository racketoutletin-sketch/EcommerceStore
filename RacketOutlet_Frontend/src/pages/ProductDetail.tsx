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
import { addWishlistItemThunk, removeWishlistItemThunk } from "../redux/features/wishlist/wishlistSlice";

import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import ProductCard from "../components/ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import BuyNowButton from "../components/ui/BuyNowButton";
import CartButton from "../components/ui/CartButton";
import Loader from "../components/Loader"; 


// Carousel component
interface CarouselProps {
  title: string;
  products: any[];
  ref: React.RefObject<HTMLDivElement>;
  scroll: (ref: React.RefObject<HTMLDivElement>, dir: "left" | "right") => void;
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ title, products, scroll }, ref) => (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="relative">
        <button
          onClick={() => scroll(ref as React.RefObject<HTMLDivElement>, "left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white border rounded-full p-2 shadow z-10 hover:bg-gray-100 transition"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
        </button>
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto scroll-smooth px-2 py-2 cursor-grab hide-scrollbar"
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="flex-shrink-0 w-72 h-[28rem] rounded-2xl overflow-hidden"
            >
              <ProductCard {...p} main_image={p.main_image || "/placeholder.png"} />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll(ref as React.RefObject<HTMLDivElement>, "right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white border rounded-full p-2 shadow z-10 hover:bg-gray-100 transition"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  )
);

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  // Redux state
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

  const cartItem = cart?.items?.find((item) => item.product.id === Number(productId));
  const wishlisted = wishlistItems.some((item) => item.product?.id === productDetail?.id);

  const similarRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!productId) return;
    dispatch(fetchProductById(Number(productId)));
  }, [productId, dispatch]);

  // Add to recently viewed
  useEffect(() => {
    if (!productDetail) return;
    const productToAdd = {
      id: productDetail.id,
      name: productDetail.name,
      description: productDetail.description ?? "",
      main_image: productDetail.main_image || "/placeholder.png",
      current_price: Number(productDetail.price),
      discounted_price: productDetail.discounted_price
        ? Number(productDetail.discounted_price)
        : undefined,
      brand: productDetail.brand ?? "",
    };
    dispatch(addRecentlyViewed(productToAdd));
  }, [productDetail, dispatch]);

  const handleToggleWishlist = () => {
    if (!productDetail) return;
    if (wishlisted) dispatch(removeWishlistItemThunk(productDetail.id));
    else dispatch(addWishlistItemThunk(productDetail.id));
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!productDetail) return;
    const finalPrice = productDetail.discounted_price || Number(productDetail.price);
    const directItem = {
      id: Date.now(),
      quantity: 1,
      product: {
        id: productDetail.id,
        name: productDetail.name,
        main_image: productDetail.main_image || "/placeholder.png",
        price: Number(productDetail.price),
        discounted_price: productDetail.discounted_price || undefined,
        current_price: finalPrice,
      },
      subtotal: finalPrice,
    };
    navigate("/checkout", { state: { directItems: [directItem], total: finalPrice } });
  };

  const handleAddToCart = async (quantity = 1) => {
    if (!productDetail) return;
    try {
      setLoading(true);
      if (cartItem) {
        await dispatch(
          updateCartItemThunk({ id: cartItem.id, product_id: productDetail.id, quantity })
        ).unwrap();
      } else {
        await dispatch(addCartItemThunk({ product_id: productDetail.id, quantity })).unwrap();
      }
    } catch (err) {
      console.error("Cart update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (!ref.current) return;
    const cardWidth = ref.current.firstElementChild?.clientWidth || 288;
    ref.current.scrollBy({ left: direction === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  };

  if (detailLoading) return <Loader />;
  if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;
  if (!productDetail) return <p className="text-gray-500 text-center mt-6">Product not found</p>;

  const filteredSimilar = subCatProducts?.filter((p) => p.id !== productDetail.id) || [];
  const filteredRecentlyViewed = recentlyViewed.filter((p) => p.id !== productDetail.id);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <TopBar />
      <Header />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Product Info */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Images */}
            <div className="flex-1">
              <img
                src={productDetail.main_image || "/placeholder.png"}
                alt={productDetail.name}
                className="w-full h-96 object-cover rounded-2xl mb-4"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1 flex flex-col gap-4">
              <h1 className="text-3xl font-bold text-gray-800">{productDetail.name}</h1>
              <p className="text-gray-600">{productDetail.description}</p>

              <div className="flex items-center gap-4">
                {productDetail.discounted_price ? (
                  <>
                    <span className="text-2xl font-bold text-red-600">
                      ₹{productDetail.discounted_price}
                    </span>
                    <span className="text-gray-400 line-through">₹{productDetail.price}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-red-600">₹{productDetail.price}</span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <BuyNowButton onClick={handleBuyNow}>Buy Now</BuyNowButton>
                <button
                  onClick={handleToggleWishlist}
                  className={`py-2 px-4 rounded border ${
                    wishlisted ? "text-white" : "bg-white text-gray-700"
                  } hover:bg-gray-100`}
                >
                  {wishlisted ? "❤️" : "♡"}
                </button>

                {cartItem ? (
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => {
                        if (cartItem.quantity === 1) {
                          dispatch(removeCartItemThunk(cartItem.id));
                        } else {
                          handleAddToCart(cartItem.quantity - 1);
                        }
                      }}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      disabled={loading}
                    >
                      -
                    </button>

                    <span className="px-4 py-1">{cartItem.quantity}</span>
                    <button
                      onClick={() => handleAddToCart(cartItem.quantity + 1)}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <CartButton onClick={() => handleAddToCart(1)} disabled={loading}>
                    {loading ? "Adding..." : "Add Cart"}
                  </CartButton>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {filteredSimilar.length > 0 && (
          <Carousel title="Similar Products" products={filteredSimilar} ref={similarRef} scroll={scroll} />
        )}

        {/* Recently Viewed */}
        {filteredRecentlyViewed.length > 0 && (
          <Carousel title="Recently Viewed" products={filteredRecentlyViewed} ref={recentRef} scroll={scroll} />
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
