import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchOrders } from "../redux/features/orders/ordersthunks";
import type { RootState, AppDispatch } from "../redux/store";
import type { Order, OrderItem } from "../redux/features/orders/types";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import Loader from "../components/Loader";

// ---------------- Order Item Card ----------------
const OrderItemCard = ({ product, quantity, subtotal }: OrderItem) => {
  const hasDiscount = product.discounted_price !== null;

  return (
    <div className="flex border p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow gap-3 bg-white">
      <img
        src={product.main_image_url || "/default.png"}
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

// ---------------- Orders Page ----------------
const OrdersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error, totalPages } = useSelector(
    (state: RootState) => state.orders
  );

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<
    "date_desc" | "date_asc" | "amount_desc" | "amount_asc"
  >("date_desc");

  useEffect(() => {
    dispatch(fetchOrders({ page, sort }));
  }, [dispatch, page, sort]);

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

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-center text-red-500 mt-10">Error: {error}</p>;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <TopBar />
      <Header />
      <div className="w-full px-8 lg:px-24 py-6 flex flex-col gap-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">My Orders</h1>

        {/* Sorting */}
        <div className="flex items-center gap-4 mb-4">
          <span className="font-semibold">Sort by:</span>
          <select
            className="border rounded-lg px-3 py-1"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
          >
            <option value="date_desc">Date: Newest First</option>
            <option value="date_asc">Date: Oldest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>

        {orders.length === 0 && (
          <p className="text-center text-gray-500">No orders found.</p>
        )}

        <div className="flex flex-col gap-6">
          {orders.map((order: Order) => (
            <div
              key={order.id}
              className="bg-white border rounded-2xl p-6 shadow-md hover:shadow-lg transition hover:bg-gray-50"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                <span className="font-semibold text-lg text-gray-700">
                  Order #{order.order_number}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </div>

              {/* Status + summary */}
              <div className="flex justify-start items-center flex-wrap gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
                <span className="text-gray-700 font-semibold">
                  Total: ₹{parseFloat(order.total_amount).toFixed(2)}
                </span>
                <span className="text-gray-600 text-sm">Payment: {order.payment_method}</span>
                <span className="text-gray-600 text-sm">Payment Status: {order.payment_status}</span>
                <span className="text-gray-600 text-sm">Items: {order.items.length}</span>
              </div>

              {/* Products */}
              <h2 className="font-semibold mb-2 text-gray-800">Products:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.items.map((item) => (
                  <OrderItemCard key={item.id} {...item} />
                ))}
              </div>

              {/* Link to details */}
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

        {/* Pagination */}
        {orders.length > 0 && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 py-2 font-semibold">{page}</span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Support Info */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-600">
            For any support, contact us at{" "}
            <a href="mailto:racketoutlet.in@gmail.com" className="text-blue-600 hover:underline font-medium">
              racketoutlet.in@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
