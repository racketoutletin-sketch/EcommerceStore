import { useEffect, useState } from "react";
import api from "../../api/axios";

const CategoryIcons = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("api/home-categories/"); // 👈 uses your axios instance
        setCategories(res.data.results); // because your API response is {count, results: [...]}
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/subcategories/${cat.subcategory.id}/products`} // ✅ correct way
            className="group flex flex-col items-start"
          >

            {/* Image Box */}
            <div className="bg-gray-100 shadow-md hover:shadow-xl transition-shadow rounded-xl w-full h-64 overflow-hidden">
              <img
                src={cat.subcategory.image || "/CategoryIcons/default.png"} // ✅ fallback
                alt={cat.subcategory.name}
                className="w-auto max-h-full mx-auto object-contain transition-transform duration-300 transform group-hover:scale-105"
              />
            </div>

            {/* Text + Arrow */}
            <div className="mt-4 flex items-center justify-between w-full">
              <div className="relative">
                <h3 className="text-lg font-bold text-gray-900 relative inline-block">
                  {cat.subcategory.name}
                  {/* Underline */}
                  <span className="absolute left-1/2 bottom-0 w-0 h-0.5 bg-gray-400 transition-all duration-300 group-hover:w-full group-hover:-translate-x-1/2"></span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {cat.subcategory.description}
                </p>
              </div>
              {/* Arrow */}
              <span className="text-xl text-gray-900 transition-transform duration-300 transform group-hover:-rotate-90 ml-4">
                →
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CategoryIcons;
