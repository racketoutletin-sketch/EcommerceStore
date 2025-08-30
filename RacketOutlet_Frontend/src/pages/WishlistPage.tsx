import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import Loader from "../components/Loader";
import {
  fetchWishlistThunk,
  removeWishlistItemThunk,
  removeWishlistItemOptimistic,
} from "../redux/features/wishlist/wishlistSlice";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import { Link } from "react-router-dom";
import BuyNowButton from "../components/ui/BuyNowButton";

const Wishlist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector(
    (state: RootState) => state.wishlist
  );

  // Fetch wishlist on mount if empty
  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchWishlistThunk());
    }
  }, [dispatch, items.length]);


  if (loading)
    return <Loader />;
  if (error)
    return (
      <p className="text-center mt-8 text-red-500">Error: {error}</p>
    );

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <TopBar />
      <Header />

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.length === 0 ? (
          <p className="text-center col-span-full text-gray-500 font-medium">
            Your wishlist is empty.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white border rounded-xl p-4 shadow hover:shadow-lg transition flex flex-col"
            >
              {/* Link to product detail page */}
              <Link
                to={`/products/${item.product?.id}`}
                className="cursor-pointer"
              >
                <img
                  src={item.product?.main_image_url || "/placeholder.png"}
                  alt={item.product?.name || "Product image"}
                  className="w-full h-48 object-cover rounded-lg"
                />

                <h2 className="mt-3 font-semibold text-lg">
                  {item.product?.name || "Unnamed Product"}
                </h2>
              </Link>

              <p className="mt-1 text-gray-600">
                {item.product?.discounted_price ? (
                  <>
                    <span className="line-through text-gray-400 mr-2">
                      ₹{item.product?.price}
                    </span>
                    <span className="text-red-500 font-bold">
                      ₹{item.product?.discounted_price}
                    </span>
                  </>
                ) : (
                  <span className="font-bold">₹{item.product?.price}</span>
                )}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Brand: {item.product?.brand || "Unknown"}
              </p>

              <BuyNowButton
  onClick={(e) => {
    e.preventDefault();  // ✅ Prevent form submission / reload
    if (!item.product?.id) return;
    dispatch(removeWishlistItemOptimistic(item.product.id));
    dispatch(removeWishlistItemThunk(item.product.id))
    .unwrap()
    .catch((err) => {
      console.error("Failed to remove wishlist item", err);
      dispatch(fetchWishlistThunk()); // Only on actual API failure
    });

  }}
  className="mt-3 px-4 py-2"
>
  Remove
</BuyNowButton>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Wishlist;
