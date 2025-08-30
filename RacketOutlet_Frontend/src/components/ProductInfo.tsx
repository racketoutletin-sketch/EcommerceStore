import React from "react";
import { useNavigate } from "react-router-dom";
import BuyNowButton from "./ui/BuyNowButton";
import CartButton from "./ui/CartButton";

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
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Images */}
        <div className="flex-1">
          <img
            src={productDetail.main_image_url || "/placeholder.png"}
            alt={productDetail.name}
            className="w-full h-96 object-cover rounded-2xl mb-4"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {productDetail.name}
          </h1>
          <p className="text-gray-600">{productDetail.description}</p>

          <div className="flex items-center gap-4">
            {productDetail.discounted_price ? (
              <>
                <span className="text-2xl font-bold text-red-600">
                  ₹{productDetail.discounted_price}
                </span>
                <span className="text-gray-400 line-through">
                  ₹{productDetail.price}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-red-600">
                ₹{productDetail.price}
              </span>
            )}
          </div>

          {/* Inventory Info */}
          {productDetail.inventory && (
            <p
              className={`text-sm ${
                productDetail.inventory.is_low_stock
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {productDetail.inventory.is_low_stock
                ? "Low Stock"
                : `In Stock: ${productDetail.inventory.quantity}`}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-4">
            {/* Buy Now */}
            <BuyNowButton
              onClick={(e) => redirectIfNotLoggedIn() && handleBuyNow(e)}
            >
              Buy Now
            </BuyNowButton>

            {/* Wishlist */}
            <button
              onClick={() => redirectIfNotLoggedIn() && handleToggleWishlist()}
              className={`py-2 px-4 rounded border ${
                wishlisted ? "bg-red-500 text-white" : "bg-white text-gray-700"
              } hover:bg-gray-100`}
            >
              {wishlisted ? "❤️ Wishlisted" : "♡ Wishlist"}
            </button>

            {/* Cart */}
            {cartItem ? (
              <div className="flex items-center border rounded">
                <button
                  onClick={() => {
                    if (!redirectIfNotLoggedIn()) return;
                    if (cartItem.quantity === 1) removeCartItem(cartItem.id);
                    else handleAddToCart(cartItem.quantity - 1);
                  }}
                  className="px-3 py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  disabled={loading}
                >
                  -
                </button>
                <span className="px-4 py-1">{cartItem.quantity}</span>
                <button
                  onClick={() => {
                    if (!redirectIfNotLoggedIn()) return;
                    handleAddToCart(cartItem.quantity + 1);
                  }}
                  className="px-3 py-1 text-gray-700 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            ) : (
              <CartButton
                onClick={() => redirectIfNotLoggedIn() && handleAddToCart(1)}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Cart"}
              </CartButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
