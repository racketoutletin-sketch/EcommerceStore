import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  addCartItemThunk,
  updateCartItemThunk,
  removeCartItemThunk,
} from "../redux/features/cart/cartThunks";
import BuyNowButton from "../components/ui/BuyNowButton";
import CartButton from "../components/ui/CartButton";

interface ProductCardProps {
  id: number;
  name: string;
  description?: string;
  main_image_url?: string | null;
  images?: string[];
  price: number;
  discounted_price?: number | null;
  brand?: string | null;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  main_image_url,
  images = [],
  price,
  discounted_price,
  brand,
}) => {
  const [loadingCart, setLoadingCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const cart = useAppSelector((state) => state.cart.cart);
  const cartItem = cart?.items?.find((item) => item.product.id === id);
  const inCart = !!cartItem;

  // ✅ Images: main_image_url → main_image → images[] → fallback
  
const productImages: string[] = (() => {
  if (main_image_url) {
    return [main_image_url, ...(images || [])];
  }
  if (images && images.length > 0) {
    return images;
  }
  return ["/default.png"];
})();



  // ✅ Navigate images
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // ✅ Add to cart
  const handleAddToCart = async (quantity: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return navigate("/login");
    if (quantity < 1) return;

    try {
      setLoadingCart(true);
      if (inCart && cartItem?.id) {
        await dispatch(
          updateCartItemThunk({ id: cartItem.id, product_id: id, quantity })
        ).unwrap();
      } else {
        await dispatch(addCartItemThunk({ product_id: id, quantity })).unwrap();
      }
    } catch (err) {
      console.error("Cart update failed:", err);
    } finally {
      setLoadingCart(false);
    }
  };

  // ✅ Buy now
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return navigate("/login");

    const finalPrice = discounted_price ?? price;
    const directItem = {
      id: Date.now(),
      quantity: 1,
      product: {
        id,
        name,
        main_image: productImages[0], // ✅ always first resolved image
        price,
        discounted_price,
        current_price: finalPrice,
      },
      subtotal: finalPrice,
    };

    navigate("/checkout", {
      state: { directItems: [directItem], total: finalPrice },
    });
  };

  const handleView = () => navigate(`/products/${id}`);

  return (
    <div
      onClick={handleView}
      className="bg-white w-full rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 relative group border cursor-pointer"
    >
      {/* Image carousel */}
      <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden">
        <img
          src={productImages[currentImageIndex]}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Left/Right buttons */}
        {productImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute top-1/2 -translate-y-1/2 left-2 
                 flex items-center justify-center
                 w-6 h-6 sm:w-8 sm:h-8 rounded-full 
                 bg-black/10 text-black text-sm sm:text-base
                 hover:bg-black/30 transition-all duration-200 hover:scale-110 shadow-md"
            >
              ‹
            </button>
            <button
              onClick={handleNextImage}
              className="absolute top-1/2 -translate-y-1/2 right-2 
                 flex items-center justify-center
                 w-6 h-6 sm:w-8 sm:h-8 rounded-full 
                 bg-black/10 text-black text-sm sm:text-base
                 hover:bg-black/30 transition-all duration-200 hover:scale-110 shadow-md"
            >
              ›
            </button>
          </>
        )}

        {/* Dots/indicators */}
        {productImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {productImages.map((_, index) => (
              <span
                key={index}
                onClick={(e) => handleDotClick(e, index)}
                className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full cursor-pointer ${
                  index === currentImageIndex
                    ? "bg-black"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3 sm:p-4 md:p-5 space-y-1 sm:space-y-2">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 line-clamp-2">
          {name}
        </h2>

        {brand && (
          <p className="text-xs sm:text-sm md:text-base text-gray-500 truncate">
            {brand}
          </p>
        )}

        <div className="mt-2 flex items-center space-x-2">
          {discounted_price ? (
            <>
              <span className="text-red-500 font-bold text-sm sm:text-base md:text-lg lg:text-xl">
                ₹{discounted_price}
              </span>
              <span className="text-gray-400 line-through text-xs sm:text-sm md:text-base">
                ₹{price}
              </span>
            </>
          ) : (
            <span className="text-gray-800 font-bold text-sm sm:text-base md:text-lg lg:text-xl">
              ₹{price}
            </span>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-3 flex items-center space-x-2">
          <BuyNowButton
            onClick={handleBuyNow}
            disabled={loadingCart}
            className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm md:text-base"
          >
            Buy Now
          </BuyNowButton>

          {inCart ? (
            <div className="flex items-center border rounded text-xs sm:text-sm md:text-base">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (cartItem?.quantity === 1 && cartItem?.id) {
                    dispatch(removeCartItemThunk(cartItem.id));
                  } else if (cartItem?.quantity && cartItem?.id) {
                    handleAddToCart(cartItem.quantity - 1, e);
                  }
                }}
                className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-gray-700 hover:bg-gray-100"
              >
                -
              </button>

              <span className="px-2 sm:px-3 md:px-4">
                {cartItem?.quantity ?? 1}
              </span>

              <button
                onClick={(e) =>
                  handleAddToCart((cartItem?.quantity ?? 0) + 1, e)
                }
                className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-gray-700 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          ) : (
            <CartButton
              onClick={(e) => handleAddToCart(1, e)}
              disabled={loadingCart}
              className="flex-1 py-1 sm:py-2 px-2 sm:px-3 rounded border hover:bg-black text-xs sm:text-sm md:text-base"
            >
              {loadingCart ? "Adding..." : "Add Cart"}
            </CartButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
