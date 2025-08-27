import React from "react";

interface ProductCardSkeletonProps {
  count?: number; // how many skeleton cards to show
}

const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="flex space-x-6 overflow-x-auto">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-72 h-[28rem] bg-white rounded-2xl shadow animate-pulse p-4 space-y-4"
        >
          {/* Image placeholder */}
          <div className="w-full h-52 bg-gray-300 rounded-lg" />

          {/* Title */}
          <div className="h-6 bg-gray-300 rounded w-3/4" />

          {/* Brand */}
          <div className="h-4 bg-gray-300 rounded w-1/2" />

          {/* Description */}
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />

          {/* Price */}
          <div className="h-6 bg-gray-300 rounded w-1/4 mt-2" />

          {/* CTA / Buttons */}
          <div className="flex space-x-2 mt-4">
            <div className="h-8 bg-gray-300 rounded flex-1" />
            <div className="h-8 bg-gray-300 rounded flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCardSkeleton;
