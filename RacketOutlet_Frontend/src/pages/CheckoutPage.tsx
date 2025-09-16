import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../redux/store";
import api from "../api/axios";
import type { CartItem as ReduxCartItem } from "../redux/features/cart/types";
import { removeMultipleCartItemsThunk } from "../redux/features/cart/cartThunks";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import CheckoutButton from "../components/ui/CheckoutButton";

interface SelectedItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    discounted_price?: number | null;
    main_image_url?: string | null;
  };
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { itemIds = [], total = 0, directItems = [] as SelectedItem[] } = location.state || {};
  const cartItems = useSelector((state: RootState) => state.cart.cart?.items ?? []) as ReduxCartItem[];
  const user = useSelector((state: RootState) => state.auth.user);

  // Build selected items
  const selectedItems: SelectedItem[] =
    directItems.length > 0
      ? directItems
      : cartItems.filter((item) => itemIds.includes(item.id));

  // --------------------------
  // Delivery person details
  // --------------------------
  const [deliveryName, setDeliveryName] = useState(user?.first_name || "");
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone_number || "");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // --------------------------
  // Load Razorpay script
  // --------------------------
  useEffect(() => {
    if (!document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => setError("Failed to load payment gateway. Please refresh.");
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, []);

  // --------------------------
  // Remove items from cart after successful order
  // --------------------------
  const handleRemoveCartItems = (orderedItemIds: number[]) => {
    if (itemIds.length > 0) dispatch(removeMultipleCartItemsThunk(orderedItemIds));
  };

  // --------------------------
  // Checkout handler
  // --------------------------
  const handleCheckout = async () => {
    if (!user) {
      setError("User not logged in.");
      return;
    }

    if (!deliveryName.trim() || !deliveryPhone.trim() || !deliveryAddress.trim()) {
      setError("Please provide delivery name, phone number, and address.");
      return;
    }

    if (!razorpayLoaded) {
      setError("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Payload matches Django serializer
      const orderPayload = {
        shipping_address: deliveryAddress,
        billing_address: deliveryAddress,
        shipping_person_name: deliveryName,
        shipping_person_number: deliveryPhone,
        payment_method: "online",
        notes: "",
        items: selectedItems.map((item) => ({
          product_id: Number(item.product.id),
          quantity: Number(item.quantity),
        })),
      };

      // 1️⃣ Create order
      const orderRes = await api.post("/api/orders/", orderPayload);
      const order = orderRes.data;

      if (!order?.id) throw new Error("Order creation failed.");
      const orderedItemIds = selectedItems.map((item) => item.id);

      // 2️⃣ Create Razorpay payment
      const paymentRes = await api.post(`/api/orders/${order.id}/payment/`);
      const payment = paymentRes.data.payment;

      if (!payment?.razorpay_order_id || !payment?.amount)
        throw new Error("Payment creation failed. Please try again.");

      // 3️⃣ Razorpay checkout
      const options = {
        key: import.meta.env.REACT_APP_RAZORPAY_KEY || "rzp_test_RFrJoW4hx7cX3I",
        amount: payment.amount,
        currency: payment.currency || "INR",
        name: "RacketOutlet",
        description: `Order #${order.id}`,
        order_id: payment.razorpay_order_id,
        handler: async (response: any) => {
          try {
            setPaymentProcessing(true);
            await api.post(`/api/orders/${order.id}/payment/verify/`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            handleRemoveCartItems(orderedItemIds);
            navigate(`/orders/${order.id}`);
          } catch (err: any) {
            console.error(err);
            await api.post(`/api/orders/${order.id}/payment/fail/`);
            setPaymentProcessing(false);
            setError("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              await api.post(`/api/orders/${order.id}/payment/cancel/`);
            } catch (err) {
              console.error("Payment cancel failed:", err);
            }
            alert("Payment cancelled.");
            navigate(itemIds.length > 0 ? `/cart` : `/`);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.response?.data?.detail || err.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // Calculate total
  // --------------------------
  const calculatedTotal =
    directItems.length > 0
      ? total
      : selectedItems.reduce((sum, item) => {
          const price = item.product.discounted_price ?? item.product.price;
          return sum + (parseFloat(price.toString()) || 0) * item.quantity;
        }, 0);

  // --------------------------
  // Render
  // --------------------------
  return (
    <div className="w-full bg-gray-50 min-h-screen relative">
      <TopBar />
      <Header />

      {paymentProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3">
          <svg
            width="40"
            height="40"
            className="animate-spin text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>

            <p className="text-lg font-semibold text-green-700">Verifying Payment...</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-5 flex flex-col lg:flex-row gap-6">
        {/* Delivery Person Details */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-4">Checkout</h1>
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="bg-white p-5 rounded-2xl shadow-md flex flex-col gap-3">
            <h2 className="text-xl font-semibold mb-2">Delivery Person Details</h2>
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
 {selectedItems.map((item) => {
  const price = item.product.discounted_price ?? item.product.price;
  return (
    <div key={item.id} className="flex justify-between items-center border-b py-2">
      <div className="flex items-center gap-2">
        {item.product.main_image_url && (
          <img
            src={item.product.main_image_url}
            alt={item.product.name}
            className="w-12 h-12 object-cover rounded"
          />
        )}
        <span>{item.product.name} x {item.quantity}</span>
      </div>
      <span>₹{price * item.quantity}</span>
    </div>
  );
})}

            <div className="flex justify-between font-bold pt-2">
              <span>Total</span>
              <span>₹{calculatedTotal}</span>
            </div>
          </div>

          <CheckoutButton
            onClick={handleCheckout}
            loading={loading}
            disabled={loading || paymentProcessing}
          >
            Pay Now
          </CheckoutButton>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
