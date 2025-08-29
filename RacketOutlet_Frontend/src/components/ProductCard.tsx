import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { addCartItemThunk, updateCartItemThunk, removeCartItemThunk } from "../redux/features/cart/cartThunks";
import BuyNowButton from "../components/ui/BuyNowButton";
import CartButton from "../components/ui/CartButton";




interface ProductCardProps {
  id: number;
  name: string;
  description?: string;
  main_image?: string | null;
  price: number;
  discounted_price?: number | null;
  brand?: string | null;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  main_image,
  price,
  discounted_price,
  brand,
}) => {
  const [loadingCart, setLoadingCart] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const cart = useAppSelector((state) => state.cart.cart);
  const cartItem = cart?.items?.find((item) => item.product.id === id);
  const inCart = !!cartItem;

  const handleAddToCart = async (quantity: number) => {
    if (quantity < 1) return;
    try {
      setLoadingCart(true);
      if (inCart && cartItem?.id) {
        await dispatch(updateCartItemThunk({ id: cartItem.id, product_id: id, quantity })).unwrap();
      } else {
        await dispatch(addCartItemThunk({ product_id: id, quantity })).unwrap();
      }
    } catch (err) {
      console.error("Cart update failed:", err);
    } finally {
      setLoadingCart(false);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const finalPrice = discounted_price ?? price;

    const directItem = {
      id: Date.now(),
      quantity: 1,
      product: {
        id,
        name,
        main_image,
        price,
        discounted_price,
        current_price: finalPrice,
      },
      subtotal: finalPrice,
    };

    navigate("/checkout", { state: { directItems: [directItem], total: finalPrice } });
  };

  const handleView = () => navigate(`/products/${id}`);

  return (
    <div
      onClick={handleView}
      className="bg-white w-full rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 relative group border cursor-pointer"
    >
      <img
        src={main_image || "/placeholder.png"}
        alt={name}
        className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
      />

      <div className="p-4 space-y-2">
        <h2 className="text-lg font-bold text-gray-800">{name}</h2>
        {brand && <p className="text-sm text-gray-500">{brand}</p>}
        <p className="text-gray-600 text-sm line-clamp-2">{description}</p>

        <div className="mt-2 flex items-center space-x-2">
          {discounted_price ? (
            <>
              <span className="text-red-500 font-bold text-lg">₹{discounted_price}</span>
              <span className="text-gray-400 line-through">₹{price}</span>
            </>
          ) : (
            <span className="text-gray-800 font-bold text-lg">₹{price}</span>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex items-center space-x-2">
          <BuyNowButton
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow(e);
            }}
            aria-label="Buy Now"
            disabled={loadingCart}
          >
            Buy Now
          </BuyNowButton>

          {inCart ? (
  <div className="flex items-center border rounded">
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (cartItem?.quantity === 1 && cartItem?.id) {
          // Remove item from cart
          dispatch(removeCartItemThunk(cartItem.id));
        } else if (cartItem?.quantity && cartItem?.id) {
          handleAddToCart(cartItem.quantity - 1);
        }
      }}
      className="px-3 py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
      disabled={loadingCart}
    >
      -
    </button>

    <span className="px-4 py-1">{cartItem?.quantity ?? 1}</span>

    <button
      onClick={(e) => {
        e.stopPropagation();
        handleAddToCart((cartItem?.quantity ?? 0) + 1);
      }}
      disabled={loadingCart}
      aria-label="Increase quantity"
      className="px-3 py-1 text-gray-700 hover:bg-gray-100"
    >
      +
    </button>
  </div>
) : (
  <CartButton
    onClick={(e) => {
      e.stopPropagation();
      handleAddToCart(1);
    }}
    disabled={loadingCart}
    aria-label="Add to cart"
    className="flex-1 bg-white-500 text-black py-1 rounded hover:bg-black border disabled:opacity-50"
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
