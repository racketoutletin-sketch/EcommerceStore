import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchOrders } from "../redux/features/orders/ordersthunks";
import type { RootState, AppDispatch } from "../redux/store";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import Loader from "../components/Loader"; 

interface Product {
  name: string;
  main_image: string;
  price: string;
  discounted_price: string | null;
}

interface OrderItemProps {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

const OrderItemCard = ({ product, quantity, subtotal }: OrderItemProps) => {
  const hasDiscount = product.discounted_price !== null;

  return (
    <div className="flex border p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow gap-3 bg-white">
      <img
        src={product.main_image || "/default.png"}
        alt={product.name}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <div className="flex flex-col justify-between flex-1">
        <h3 className="font-semibold text-gray-800">{product.name}</h3>

        <p className="text-sm mt-1">
          {hasDiscount ? (
            <>
              <span className="line-through text-gray-400 mr-2">
                ₹{Number(product.price).toFixed(2)}
              </span>
              <span className="font-bold text-red-600">
                ₹{Number(product.discounted_price).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-bold">₹{Number(product.price).toFixed(2)}</span>
          )}
        </p>

        <div className="flex justify-between mt-1 text-sm text-gray-600">
          <span>Qty: {quantity}</span>
          <span>Subtotal: ₹{subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

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

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <TopBar />
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Orders</h1>
        {orders.length === 0 && <p className="text-center text-gray-500">No orders found.</p>}

        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border rounded-2xl p-6 shadow-md hover:shadow-lg transition hover:bg-gray-50"
            >
              <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                <span className="font-semibold text-lg text-gray-700">Order #{order.order_number}</span>
                <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</span>
              </div>

              <div className="flex justify-start items-center flex-wrap gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
                <span className="text-gray-700 font-semibold">
                  Total: ₹{parseFloat(order.total_amount).toFixed(2)}
                </span>
                <span className="text-gray-600 text-sm">
                  Payment: {order.payment_method}
                </span>
                <span className="text-gray-600 text-sm">
                  Items: {order.items.length}
                </span>
              </div>

              <div className="mb-4">
                <p><span className="font-semibold">Shipping:</span> {order.shipping_address}</p>
                <p><span className="font-semibold">Billing:</span> {order.billing_address}</p>
              </div>

              <h2 className="font-semibold mb-2 text-gray-800">Products:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.items.map((item) => (
                  <OrderItemCard key={item.id} {...item} />
                ))}
              </div>

              <div className="mt-4 text-right">
<Link
  to={`/orders/${order.id}`}
  className="inline-block px-5 py-2 bg-black text-white rounded-lg shadow
             hover:bg-white hover:text-black transition"
>
  View Details
</Link>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
