import React from "react";


interface SubCatWithProductsSkeletonProps {
  subCount?: number; // number of subcategories to show
  productCount?: number; // products per subcategory
}

const SubCatWithProductsSkeleton: React.FC<SubCatWithProductsSkeletonProps> = ({
  subCount = 3,
  productCount = 8,
}) => {
  return (
    <div className="w-full bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* TopBar & Header skeleton */}
      <div className="h-12 bg-gray-300 rounded mb-4 animate-pulse" />
      <div className="h-16 bg-gray-300 rounded mb-6 animate-pulse" />

      {Array.from({ length: subCount }).map((_, i) => (
        <div key={i} className="border-b pb-6 space-y-4">
          {/* Subcategory title skeleton */}
          <div className="h-6 w-1/3 bg-gray-300 rounded animate-pulse" />

          {/* View More button skeleton */}
          <div className="h-8 w-24 bg-gray-300 rounded animate-pulse" />

          {/* Horizontal products skeleton */}
          <div className="flex space-x-6 overflow-x-auto">
            {Array.from({ length: productCount }).map((_, j) => (
              <div
                key={j}
                className="flex-shrink-0 w-72 h-[28rem] bg-white rounded-2xl shadow animate-pulse p-4 space-y-4"
              >
                <div className="w-full h-52 bg-gray-300 rounded-lg" />
                <div className="h-6 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
                <div className="h-4 bg-gray-300 rounded w-full" />
                <div className="h-4 bg-gray-300 rounded w-5/6" />
                <div className="h-6 bg-gray-300 rounded w-1/4 mt-2" />
                <div className="flex space-x-2 mt-4">
                  <div className="h-8 bg-gray-300 rounded flex-1" />
                  <div className="h-8 bg-gray-300 rounded flex-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubCatWithProductsSkeleton;
