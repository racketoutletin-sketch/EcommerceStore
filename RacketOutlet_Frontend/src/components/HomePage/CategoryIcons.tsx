// src/components/HomepageSubcategories.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

interface Subcategory {
  id: number;
  name: string;
  description: string;
  image: string;
}

const CACHE_KEY = "Featuredsubcategories_data";
const CACHE_VERSION_KEY = "Featuredsubcategories_cache_version";

const HomepageSubcategories: React.FC = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  // Step 1: Load cached immediately
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData) {
    try {
      setSubcategories(JSON.parse(cachedData));
      setLoading(false);
    } catch {
      console.warn("Corrupt cache, ignoring...");
    }
  }

  // Step 2: Always fetch fresh version in background
  const fetchSubcategories = async () => {
  console.log("fetchSubcategories started...");
  try {
    const res = await fetch(
      "https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-homepage-categories"
    );
    if (!res.ok) throw new Error(`API Error: ${res.status}`);

    const data = await res.json();
    console.log("API response:", data);

    const newVersion = data.version ?? 1;
    const oldVersion = Number(localStorage.getItem(CACHE_VERSION_KEY));

    if (newVersion !== oldVersion) {
      console.log(`Version changed ${oldVersion} → ${newVersion}`);
      const freshData: Subcategory[] = data.sub_categories || [];
      localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
      localStorage.setItem(CACHE_VERSION_KEY, newVersion.toString());
      setSubcategories(freshData);
    } else {
      console.log("Cache still valid, no update needed");
    }
  } catch (err) {
    console.error("Error in fetchSubcategories:", err);
  } finally {
    // ✅ Always stop loading after API finishes
    setLoading(false);
  }
};


  fetchSubcategories(); // ✅ make sure it's called
}, []);


  if (loading) return <Loader />;
  if (subcategories.length === 0)
    return <p className="text-center py-16">No categories available.</p>;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-6">Explore Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {subcategories.map((cat) => (
          <div
            key={cat.id}
            className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition p-4"
            onClick={() => navigate(`/subcategories/${cat.id}`)}
          >
            <img
              src={cat.image || "/default.png"}
              alt={cat.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = "/default.png";
              }}
            />
            <h3 className="text-black font-semibold text-base mt-3">{cat.name}</h3>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomepageSubcategories;
