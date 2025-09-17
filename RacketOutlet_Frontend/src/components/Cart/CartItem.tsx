// src/components/Cart/CartItem.tsx
import React from "react";
import type { CartItem } from "../../redux/features/cart/types";
import { useAppDispatch } from "../../redux/store";
import { updateCartItemThunk, removeCartItemThunk } from "../../redux/features/cart/cartThunks";
import { Link } from "react-router-dom";

interface Props {
  item: CartItem;
}

const CartItemComponent: React.FC<Props> = ({ item }) => {
  const dispatch = useAppDispatch();

  const handleDecrease = () => {
    if (item.quantity > 1) {
      dispatch(
        updateCartItemThunk({
          id: item.id,
          product_id: item.product.id,
          quantity: item.quantity - 1,
        })
      );
    }
  };

  const handleIncrease = () => {
    dispatch(
      updateCartItemThunk({
        id: item.id,
        product_id: item.product.id,
        quantity: item.quantity + 1,
      })
    );
  };

  const handleRemove = () => {
    dispatch(removeCartItemThunk(item.id));
  };

  // ✅ Use discounted price if available, otherwise regular price
  const price = Number(item.product.discounted_price ?? item.product.price);

  // ✅ Subtotal calculated dynamically based on quantity
  const subtotal = price * Number(item.quantity);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl shadow p-4 gap-4">
      {/* Product Image & Name clickable */}
      <Link to={`/products/${item.product.id}`} className="flex items-center gap-4 flex-1">
        <img
          src={item.product.main_image_url || "/placeholder.png"}
          alt={item.product.name}
          className="w-20 h-20 object-cover rounded-lg"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold text-lg">{item.product.name}</h3>
          <p className="text-gray-500 text-sm">
            Price: ₹{price.toFixed(2)}
          </p>
        </div>
      </Link>

      {/* Quantity Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={handleDecrease}
            disabled={item.quantity <= 1}
            className="px-3 py-1 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            -
          </button>
          <span className="px-4 py-1">{item.quantity}</span>
          <button
            onClick={handleIncrease}
            className="px-3 py-1 text-gray-700 hover:bg-gray-100"
          >
            +
          </button>
        </div>
        <button
          onClick={handleRemove}
          className="text-red-500 text-sm hover:underline"
        >
          Remove
        </button>
      </div>

      {/* Subtotal */}
      <div className="font-semibold text-gray-800">
        Subtotal: ₹{subtotal.toFixed(2)}
      </div>
    </div>
  );
};

export default CartItemComponent;
