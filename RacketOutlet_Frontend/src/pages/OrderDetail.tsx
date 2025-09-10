import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchOrderById, clearOrderDetail } from "../redux/features/orders/orderDetailSlice";
import type { RootState, AppDispatch } from "../redux/store";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import Loader from "../components/Loader";

const formatPrice = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "0.00";
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { order, loading, error } = useSelector((state: RootState) => state.orderDetail);

  useEffect(() => {
    if (id) dispatch(fetchOrderById(parseInt(id)));
    return () => void dispatch(clearOrderDetail());
  }, [dispatch, id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-200 text-yellow-800";
      case "confirmed": return "bg-blue-200 text-blue-800";
      case "processing": return "bg-gray-200 text-gray-800";
      case "shipped": return "bg-gray-300 text-gray-900";
      case "delivered": return "bg-black text-white";
      case "cancelled": return "bg-red-200 text-red-800";
      case "refunded": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-center text-red-500 mt-10">Error: {error}</p>;
  if (!order) return null;

  return (
    <div className="w-full bg-white min-h-screen text-gray-900">
      <TopBar />
      <Header />

      <div className="w-full px-6 lg:px-20 py-8 flex flex-col gap-8">

        <Link to="/orders" className="text-gray-700 hover:text-black hover:underline mb-4 inline-block">
          &larr; Back to Orders
        </Link>

        <h1 className="text-3xl font-bold mb-6 border-b pb-2 border-gray-200">Order #{order.order_number}</h1>

        {/* Order summary */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          <span className="text-lg font-medium">
            Total: <span className="font-bold">₹{formatPrice(order.total_amount)}</span>
          </span>
          <span className="text-sm md:text-base">
            Payment: <span className="font-medium">{order.payment_method} ({order.payment_status})</span>
          </span>
        </div>

      <div className="flex flex-col md:flex-row gap-6">
  {/* Customer details */}
  <div className="flex-1 bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <h2 className="font-semibold text-lg mb-3 border-b border-gray-200 pb-1">Customer Details</h2>
    <p><span className="font-semibold">Name:</span> {order.user.username} ({order.user.first_name} {order.user.last_name})</p>
    <p><span className="font-semibold">Email:</span> {order.user.email}</p>
    <p><span className="font-semibold">Mobile:</span> {order.user.phone_number}</p>
    <p><span className="font-semibold">Address:</span> {order.user.address}</p>
  </div>

  {/* Shipping details */}
  <div className="flex-1 bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <h2 className="font-semibold text-lg mb-3 border-b border-gray-200 pb-1">Shipping Details</h2>
    <p><span className="font-semibold">Name:</span> {order.shipping_person_name}</p>
    <p><span className="font-semibold">Mobile:</span> {order.shipping_person_number}</p>
    <p><span className="font-semibold">Address:</span> {order.shipping_address}</p>
  </div>
</div>


        {/* Items */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-4 border-b border-gray-200 pb-1">Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50">
                <img
                  src={item.product.main_image_url}
                  alt={item.product.name}
                  className="w-28 h-28 object-cover rounded mr-4"
                />
                <div className="flex flex-col justify-between">
                  <h3 className="font-semibold text-lg">{item.product.name}</h3>
                  <p className="text-sm"><span className="font-medium">Brand:</span> {item.product.brand}</p>
                  <p className="text-sm"><span className="font-medium">Price:</span> ₹{formatPrice(item.product.current_price)}</p>
                  <p className="text-sm"><span className="font-medium">Quantity:</span> {item.quantity}</p>
                  <p className="text-sm"><span className="font-medium">Subtotal:</span> ₹{formatPrice(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes & timestamps */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <p><span className="font-semibold">Ordered At:</span> {new Date(order.created_at).toLocaleString()}</p>
          <p><span className="font-semibold">Last Updated:</span> {new Date(order.updated_at).toLocaleString()}</p>
        </div>

      </div>

      {/* Support Info */}
      <div className="mt-10 text-center py-6 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-700">
          For any support, contact us at{" "}
          <a
            href="mailto:racketoutlet.in@gmail.com"
            className="text-black font-semibold hover:underline"
          >
            racketoutlet.in@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default OrderDetailPage;
