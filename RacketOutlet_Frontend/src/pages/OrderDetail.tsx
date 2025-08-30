import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchOrderById, clearOrderDetail } from "../redux/features/orders/orderDetailSlice";
import type { RootState, AppDispatch } from "../redux/store";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import Loader from "../components/Loader"; 


// ✅ Utility to safely format price values
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
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-indigo-100 text-indigo-800";
      case "shipped": return "bg-orange-100 text-orange-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "refunded": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-center text-red-500 mt-10">Error: {error}</p>;
  if (!order) return null;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <TopBar />
      <Header />
    <div className="container mx-auto p-4">

      <Link to="/orders" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to Orders
      </Link>

      <h1 className="text-2xl font-bold mb-4">Order #{order.order_number}</h1>

      <div className="flex flex-wrap justify-between items-center mb-4">
        <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
        <span>
          Total: <span className="font-semibold">${formatPrice(order.total_amount)}</span>
        </span>
        <span>Payment: {order.payment_method} ({order.payment_status})</span>
      </div>

      <div className="mb-4">
        <p><span className="font-semibold">Shipping Address:</span> {order.shipping_address}</p>
        <p><span className="font-semibold">Billing Address:</span> {order.billing_address}</p>
        <p><span className="font-semibold">Created At:</span> {new Date(order.created_at).toLocaleString()}</p>
        <p><span className="font-semibold">Updated At:</span> {new Date(order.updated_at).toLocaleString()}</p>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Items:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex border p-2 rounded-md shadow-sm hover:shadow-md">
              <img
                src={item.product.main_image}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded mr-3"
              />
              <div className="flex flex-col justify-between">
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-sm">Price: ${formatPrice(item.product.current_price)}</p>
                <p className="text-sm">Quantity: {item.quantity}</p>
                <p className="text-sm font-semibold">Subtotal: ${formatPrice(item.subtotal)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>

  );
};

export default OrderDetailPage;
