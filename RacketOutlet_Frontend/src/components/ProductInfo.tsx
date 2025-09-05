import React from "react";
import { useNavigate } from "react-router-dom";
import BuyNowButton from "./ui/BuyNowButton";
import CartButton from "./ui/CartButton";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface ProductInfoProps {
  productDetail: any;
  cartItem: any;
  wishlisted: boolean;
  loading: boolean;
  user: any;
  handleBuyNow: (e: React.MouseEvent) => void;
  handleToggleWishlist: () => void;
  handleAddToCart: (quantity?: number) => void;
  removeCartItem: (id: number) => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  productDetail,
  cartItem,
  wishlisted,
  loading,
  user,
  handleBuyNow,
  handleToggleWishlist,
  handleAddToCart,
  removeCartItem,
}) => {
  const navigate = useNavigate();

  const redirectIfNotLoggedIn = () => {
    if (!user) {
      navigate("/login");
      return false;
    }
    return true;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
      {/* Product Info */}
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-extrabold text-gray-900">{productDetail.name}</h1>
        <p className="text-gray-600 text-lg">{productDetail.description}</p>

        {/* Price */}
        <div className="flex items-center gap-4">
          {productDetail.discounted_price ? (
            <>
              <span className="text-3xl font-bold text-red-600">
                ₹{productDetail.discounted_price}
              </span>
              <span className="text-gray-400 line-through text-xl">
                ₹{productDetail.price}
              </span>
            </>
          ) : (
            <span className="text-3xl font-bold text-gray-900">₹{productDetail.price}</span>
          )}
        </div>

        {/* Inventory Badge */}
        {productDetail.inventory && (
          <p
            className={`text-sm font-semibold ${
              productDetail.inventory.is_low_stock ? "text-red-600" : "text-green-600"
            }`}
          >
            {productDetail.inventory.is_low_stock
              ? "⚠️ Low Stock"
              : `In Stock: ${productDetail.inventory.quantity}`}
          </p>
        )}

        {/* Extra Attributes Grid */}
        {productDetail.extra_attributes && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {Object.entries(productDetail.extra_attributes).map(([section, attributes]) => (
              <div key={section} className="bg-gray-50 p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-2">{section}</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  {Object.entries(attributes as Record<string, any>).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">{key}:</span>{" "}
                      {Array.isArray(value) ? value.join(", ") : value}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <BuyNowButton
            onClick={(e) => redirectIfNotLoggedIn() && handleBuyNow(e)}
            className="px-6 py-3 text-lg rounded-xl"
          >
            Buy Now
          </BuyNowButton>

          <button
            onClick={() => redirectIfNotLoggedIn() && handleToggleWishlist()}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-colors ${
              wishlisted
                ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {wishlisted ? <FaHeart /> : <FaRegHeart />}
            {wishlisted ? "Wishlisted" : "Wishlist"}
          </button>

          {cartItem ? (
            <div className="flex items-center border rounded-xl overflow-hidden">
              <button
                onClick={() => {
                  if (!redirectIfNotLoggedIn()) return;
                  if (cartItem.quantity === 1) removeCartItem(cartItem.id);
                  else handleAddToCart(cartItem.quantity - 1);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                disabled={loading}
              >
                -
              </button>
              <span className="px-5 py-2 font-medium">{cartItem.quantity}</span>
              <button
                onClick={() => {
                  if (!redirectIfNotLoggedIn()) return;
                  handleAddToCart(cartItem.quantity + 1);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200"
              >
                +
              </button>
            </div>
          ) : (
            <CartButton
              onClick={() => redirectIfNotLoggedIn() && handleAddToCart(1)}
              disabled={loading}
              className="px-6 py-3 text-lg rounded-xl"
            >
              {loading ? "Adding..." : "Add Cart"}
            </CartButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
