import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import type { RootState, AppDispatch } from "../redux/store";
import api from "../api/axios";
import type { CartItem as ReduxCartItem } from "../redux/features/cart/types";
import { removeMultipleCartItemsThunk } from "../redux/features/cart/cartThunks";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import BuyNowButton from "../components/ui/BuyNowButton";

interface DirectItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    main_image?: string | null;
  };
}

interface SelectedItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    main_image?: string | null;
  };
}

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { itemIds = [], total = 0, directItems = [] as DirectItem[] } = location.state || {};
  const cartItems = useSelector((state: RootState) => state.cart.cart?.items ?? []) as ReduxCartItem[];
  const user = useSelector((state: RootState) => state.auth.user);

  const selectedItems: SelectedItem[] =
    directItems.length > 0
      ? directItems.map((item: DirectItem) => ({ id: item.id, product: item.product, quantity: item.quantity }))
      : cartItems.filter((item) => itemIds.includes(item.id));

  const [deliveryName, setDeliveryName] = useState(user?.first_name || "");
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone_number || "");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay script
  useEffect(() => {
    if (!document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleRemoveCartItems = (orderedItemIds: number[]) => {
    if (itemIds.length > 0) dispatch(removeMultipleCartItemsThunk(orderedItemIds));
  };

  const handleCheckout = async () => {
    if (!user) {
      setError("User not logged in.");
      return;
    }

    if (!deliveryName.trim() || !deliveryPhone.trim() || !deliveryAddress.trim()) {
      setError("Please provide delivery name, phone number, and address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        shipping_address: deliveryAddress,
        billing_address: deliveryAddress,
        shipping_person_name: deliveryName,
        shipping_person_number: deliveryPhone,
        payment_method: "online",
        notes: "",
        items: selectedItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const orderRes = await api.post("/api/orders/", orderPayload);
      const order = orderRes.data;
      const orderedItemIds = selectedItems.map((item) => item.id);

      // Razorpay online payment
      const paymentRes = await api.post(`/api/orders/${order.id}/payment/`);
      const payment = paymentRes.data.payment;

      const options = {
        key: "rzp_test_R9fGK58JZFJfvK",
        amount: payment.amount * 100,
        currency: "INR",
        name: "RacketOutlet",
        description: `Order #${order.id}`,
        order_id: payment.razorpay_order_id,
        handler: async (response: any) => {
          try {
            await api.post(`/api/orders/${order.id}/payment/verify/`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert("Payment successful!");
            handleRemoveCartItems(orderedItemIds);
            window.location.href = `/orders/${order.id}`;
          } catch (err: any) {
            console.error(err);
            await api.post(`/api/orders/${order.id}/payment/fail/`);
            alert("Payment failed or verification failed. Please try again.");
          }
        },
        modal: {
          ondismiss: async () => {
            await api.post(`/api/orders/${order.id}/payment/cancel/`);
            alert("Payment cancelled.");
            window.location.href = itemIds.length > 0 ? `/cart` : "/";
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculatedTotal =
    directItems.length > 0
      ? total
      : selectedItems.reduce((sum, item) => sum + parseFloat(item.product.price.toString()) * item.quantity, 0);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <TopBar />
      <Header />
      <div className="max-w-6xl mx-auto p-5 flex flex-col lg:flex-row gap-6">
        {/* Delivery Info + Items */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-4">Checkout</h1>
          {error && <p className="text-red-600 mb-4">{error}</p>}

          {/* Delivery Info */}
          <div className="bg-white p-5 rounded-2xl shadow-md flex flex-col gap-3">
            <h2 className="text-xl font-semibold mb-2">Delivery Information</h2>
            <input
              type="text"
              placeholder="Recipient Name"
              className="w-full border rounded p-2"
              value={deliveryName}
              onChange={(e) => setDeliveryName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="w-full border rounded p-2"
              value={deliveryPhone}
              onChange={(e) => setDeliveryPhone(e.target.value)}
            />
            <textarea
              placeholder="Delivery Address"
              className="w-full border rounded p-2"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          {/* Selected Items */}
          <div className="bg-white p-5 rounded-2xl shadow-md flex flex-col gap-2">
            <h2 className="text-xl font-semibold mb-2">Selected Items</h2>
            {selectedItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.product.name} × {item.quantity}</span>
                <span>₹{(parseFloat(item.product.price.toString()) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80 bg-white p-5 rounded-2xl shadow-md h-fit flex flex-col gap-3">
          <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Total Items:</span>
            <span>{selectedItems.length}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total:</span>
            <span>₹{calculatedTotal.toFixed(2)}</span>
          </div>
          <BuyNowButton
            onClick={handleCheckout}
            className="w-full px-5 py-2"
              disabled={loading}
          >
            Pay Online
          </BuyNowButton>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
