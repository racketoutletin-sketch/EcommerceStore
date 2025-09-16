import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

import { fetchHomeData, selectCategories, selectHomeData } from "../../redux/features/home/homeSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

const HomepageSubcategories: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const subcategories = useAppSelector(selectCategories);
  const homeData = useAppSelector(selectHomeData);
  const loading = useAppSelector((state) => state.home.loading);

  // Fetch home data only if Redux store is empty
  useEffect(() => {
    if (!homeData) {
      dispatch(fetchHomeData());
    }
  }, [dispatch, homeData]);

  if (loading) return <Loader />;
  if (subcategories.length === 0)
    return <p className="text-center py-16">No categories available.</p>;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-6">Explore Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {subcategories.map((cat) => (
          <div
            key={cat.subcategory.id}
            className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition p-4"
            onClick={() => navigate(`/subcategories/${cat.subcategory.id}/products`)}
          >
            <img
              src={cat.subcategory.image || "/default.png"}
              alt={cat.subcategory.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = "/default.png";
              }}
            />
            <h3 className="text-black font-semibold text-base mt-3">{cat.subcategory.name}</h3>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{cat.subcategory.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomepageSubcategories;
