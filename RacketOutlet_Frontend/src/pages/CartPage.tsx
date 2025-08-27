import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchCartThunk } from "../redux/features/cart/cartThunks";
import CartItemComponent from "../components/Cart/CartItem";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import BuyNowButton from "../components/ui/BuyNowButton";

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cart, loading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCartThunk());
  }, [dispatch]);

  if (loading) return <p className="text-center py-5">Loading cart...</p>;

  const total =
    cart?.items?.reduce((sum, item) => sum + parseFloat(item.subtotal), 0) || 0;

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    const itemIds = cart.items.map((item) => item.id);
    navigate("/checkout", { state: { itemIds, total } });
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <TopBar />
      <Header />

      <div className="max-w-6xl mx-auto p-5 flex flex-col lg:flex-row gap-6">
        {/* Cart Items */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

          {cart && cart.items.length > 0 ? (
            <div className="flex flex-col gap-4">
              {cart.items.map((item) => (
                <CartItemComponent key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              {/* Empty Cart */}
              <img
                src="/ad.jpg"
                alt="Ad"
                className="w-60 h-60 object-contain mb-6" // Bigger image (240px)
              />
              <p className="text-2xl font-semibold mb-6 text-gray-700">
                Your cart is currently empty.
              </p>
              <button
                onClick={() => navigate("/search")}
                className="bg-black text-white px-8 py-4 text-lg rounded-full font-medium hover:bg-white hover:text-black border border-black transition"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Summary / Checkout */}
        {cart && cart.items.length > 0 && (
          <div className="w-full lg:w-80 bg-white p-5 rounded-2xl shadow-md h-fit">
            <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Total Items:</span>
              <span>{cart.items.length}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <BuyNowButton
              onClick={handleCheckout}
              className="w-full px-5 py-2"
            >
              Checkout
            </BuyNowButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
