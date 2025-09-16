// src/components/FeaturedProduct.tsx
import React, { useEffect, useState } from "react";
import Loader from "../Loader";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { fetchHomeData, selectExclusiveProducts, selectHomeData } from "../../redux/features/home/homeSlice";
import { addCartItemThunk, updateCartItemThunk } from "../../redux/features/cart/cartThunks";

const FeaturedProduct: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Redux state
  const exclusiveProducts = useAppSelector(selectExclusiveProducts);
  const homeData = useAppSelector(selectHomeData);
  const loading = useAppSelector((state) => state.home.loading);
  const user = useAppSelector((state) => state.auth.user);
  const cart = useAppSelector((state) => state.cart.cart);

  // Local state
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loadingCart, setLoadingCart] = useState(false);

  // Get first exclusive product
  const product = exclusiveProducts.length > 0 ? exclusiveProducts[0].product : null;

  // Set main image whenever product changes
  useEffect(() => {
    if (product) setMainImage(product.main_image_url);
  }, [product]);

  // Fetch home data only if Redux store is empty
  useEffect(() => {
    if (!homeData) {
      dispatch(fetchHomeData());
    }
  }, [dispatch, homeData]);

  if (loading) return <Loader />;
  if (!product) return <p className="text-center text-gray-500 py-10">No featured product</p>;

  // Prepare images for carousel
  const images = product.images?.length
    ? [product.main_image_url, ...product.images.map(img => img.image_url).filter((url): url is string => !!url)]
    : [product.main_image_url];

  const cartItem = cart?.items?.find(item => item.product.id === product.id);

  const handleAddToCart = async (quantity: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) return navigate("/login");
    if (quantity < 1) return;

    try {
      setLoadingCart(true);
      if (cartItem?.id) {
        await dispatch(updateCartItemThunk({ id: cartItem.id, product_id: product.id, quantity })).unwrap();
      } else {
        await dispatch(addCartItemThunk({ product_id: product.id, quantity })).unwrap();
      }
    } catch (err) {
      console.error("Cart update failed:", err);
    } finally {
      setLoadingCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) return navigate("/login");

    const finalPrice = Number(product.discounted_price ?? product.price);
    const directItem = {
      id: Date.now(),
      quantity: 1,
      product: {
        id: product.id,
        name: product.name,
        main_image_url: product.main_image_url,
        price: Number(product.price),
        discounted_price: product.discounted_price ?? undefined,
        current_price: finalPrice,
      },
      subtotal: finalPrice
    };

    navigate("/checkout", { state: { directItems: [directItem], total: finalPrice } });
  };

  return (
    <div className="bg-white p-8 rounded-lg max-w-7xl mx-auto mt-16 mb-16 min-h-[600px] grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Left: Image Carousel */}
      <div className="flex flex-col w-full h-full">
        {mainImage && (
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg mb-4"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/default.png"; }}
          />
        )}
        <div className="flex space-x-2">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img ?? "/default.png"}
              alt={`Thumbnail ${idx}`}
              className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${mainImage === img ? "border-black" : "border-gray-300"}`}
              onClick={() => setMainImage(img)}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/default.png"; }}
            />
          ))}
        </div>
      </div>

      {/* Right: Product Details */}
      <div className="flex flex-col justify-between">
        <div
          className="cursor-pointer"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          <span className="text-sm text-gray-500">{product.brand}</span>
          <h2 className="text-2xl font-bold my-2 text-black">{product.name}</h2>

          <div className="flex items-center mb-4">
            <span className="text-red-500 font-bold text-xl mr-2">
              ₹{product.discounted_price || product.price}
            </span>
            {product.discounted_price && (
              <span className="text-gray-400 line-through">₹{product.price}</span>
            )}
          </div>

          <span className="text-sm text-gray-500">{product.description}</span>
        </div>

        <div className="flex space-x-4 mt-4">
          {cartItem ? (
            <button
              onClick={(e) => { e.stopPropagation(); navigate("/cart"); }}
              className="flex-1 py-3 rounded-md bg-black text-white hover:bg-white hover:text-black hover:border transition"
            >
              Go to Cart
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); handleAddToCart(1, e); }}
              disabled={loadingCart}
              className={`flex-1 py-3 rounded-md transition text-white ${loadingCart ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}
            >
              {loadingCart ? "Adding..." : "Add to Cart"}
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); handleBuyNow(); }}
            className="flex-1 border border-gray-300 text-black py-3 rounded-md hover:bg-gray-100 transition"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct;
