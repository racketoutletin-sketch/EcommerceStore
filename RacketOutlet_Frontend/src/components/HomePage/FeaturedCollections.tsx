// src/components/FeaturedCollections.tsx
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Loader from "../Loader";

interface Collection {
  title: string;
  desc: string;
  img: string;
  productId: number;
}

const CACHE_KEY = "FeaturedCollections_data";
const CACHE_VERSION_KEY = "FeaturedCollections_cache_version";

const FeaturedCollections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cached data first
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        setCollections(JSON.parse(cachedData));
        setLoading(false);
      } catch {
        console.warn("Corrupt cache, ignoring...");
      }
    }

    // Fetch fresh data
    const fetchCollections = async () => {
      try {
        const res = await fetch(
          "https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-homepage-featured-product"
        );
        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        const data = await res.json();
        const newVersion = data.version ?? 1;
        const oldVersion = Number(localStorage.getItem(CACHE_VERSION_KEY));

        if (newVersion !== oldVersion) {
          const freshData: Collection[] = (data.featuredProducts || []).map((item: any) => ({
            title: item.name ?? "No Title",
            desc: item.description ?? "No Description",
            img: item.main_image_url ?? "/default.png",
            productId: item.product_id ?? 0,
          }));

          localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
          localStorage.setItem(CACHE_VERSION_KEY, newVersion.toString());
          setCollections(freshData);
        }
      } catch (err) {
        console.error("Error fetching featured collections:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) return <Loader />;
  if (!collections.length)
    return <p className="text-center py-16 text-gray-500">No collections available.</p>;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-6">
        Featured Collections
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {collections.map((col) => (
          <Link
            key={col.productId}
            to={`/products/${col.productId}`}
            className="group border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition p-4 block"
          >
            <img
              src={col.img || "/default.png"}
              alt={col.title}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/default.png";
              }}
            />
            <div className="p-3">
              <h3 className="text-black font-semibold text-base">{col.title}</h3>
              <p className="text-gray-500 text-sm mb-2 line-clamp-2">{col.desc}</p>
              <div className="flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:underline">
                Shop Now <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCollections;
