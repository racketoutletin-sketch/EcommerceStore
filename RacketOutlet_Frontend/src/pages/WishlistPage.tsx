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

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchWishlistThunk());
    }
  }, [dispatch, items.length]);

  if (loading) return <Loader />;

  if (error)
    return (
      <p className="text-center mt-8 text-red-500 text-lg font-medium">
        Error: {error}
      </p>
    );

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <TopBar />
      <Header />

      <div className="w-full px-4 sm:px-6 lg:px-12 py-6 flex flex-col gap-6">
        <h1 className="text-4xl font-bold text-gray-800">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-500 text-lg font-medium">
              Your wishlist is empty.
            </p>
            <Link
              to="/search"
              className="mt-6 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-white hover:text-black border border-black transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="max-w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border rounded-xl p-4 shadow hover:shadow-lg transition flex flex-col"
              >
                <Link to={`/products/${item.product?.id}`}>
                  <img
                    src={item.product?.main_image_url || "/placeholder.png"}
                    alt={item.product?.name || "Product image"}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <h2 className="mt-3 font-semibold text-lg text-gray-800">
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
                    e.preventDefault();
                    if (!item.product?.id) return;

                    // Optimistic update
                    dispatch(removeWishlistItemOptimistic(item.product.id));

                    // Actual API call
                    dispatch(removeWishlistItemThunk(item.product.id))
                      .unwrap()
                      .catch((err) => {
                        console.error("Failed to remove wishlist item", err);
                        dispatch(fetchWishlistThunk()); // rollback on failure
                      });
                  }}
                  className="mt-4 px-4 py-2 w-full"
                >
                  Remove
                </BuyNowButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
