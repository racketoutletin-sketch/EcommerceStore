// src/components/FeaturedCollections.tsx
import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store"; // adjust path
import Loader from "../Loader";
import { fetchHomeData, selectFeaturedProducts, selectHomeLoading } from "../../redux/features/home/homeSlice";

const FeaturedCollections: React.FC = () => {
  const dispatch = useAppDispatch();
  const featuredProducts = useAppSelector(selectFeaturedProducts);
  const loading = useAppSelector(selectHomeLoading);

  useEffect(() => {
    if (!featuredProducts.length) {
      dispatch(fetchHomeData());
    }
  }, [dispatch, featuredProducts.length]);

  if (loading) return <Loader />;
  if (!featuredProducts.length)
    return <p className="text-center py-16 text-gray-500">No collections available.</p>;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-6">
        Featured Collections
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {featuredProducts.map((fp) => {
          const product = fp.product;
          return (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition p-4 block"
            >
              <img
                src={product.main_image_url || "/default.png"}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/default.png";
                }}
              />
              <div className="p-3">
                <h3 className="text-black font-semibold text-base">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
                <p className="text-sm font-medium">
                  Price: ₹{Number(product.current_price).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Stock: {product.inventory.quantity} {product.inventory.is_low_stock ? "(Low)" : ""}
                </p>
                <div className="flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:underline mt-2">
                  Shop Now <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedCollections;
