import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import ProductCard from "./ProductCard";

interface ProductCarouselProps {
  title: string;
  products: any[];
  refProp: React.RefObject<HTMLDivElement | null>; // ✅ allow null
  scroll: (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: "left" | "right"
  ) => void;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  products,
  refProp,
  scroll,
}) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <div className="relative">
      {/* Left button */}
      <button
        onClick={() => scroll(refProp, "left")}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white border rounded-full p-2 shadow z-10 hover:bg-gray-100 transition"
      >
        <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
      </button>

      {/* Scrollable product list */}
      <div
        ref={refProp}
        className="flex gap-4 overflow-x-auto scroll-smooth px-2 py-2 cursor-grab hide-scrollbar"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="flex-shrink-0 w-72 h-[28rem] rounded-2xl overflow-hidden"
          >
<ProductCard
  id={p.id}
  name={p.name}
  description={p.description}
  main_image={p.main_image_url || "/placeholder.png"}
  price={p.price} // original price
  discounted_price={p.discounted_price ?? null} // pass null if no discount
  brand={p.brand}
/>



          </div>
        ))}
      </div>

      {/* Right button */}
      <button
        onClick={() => scroll(refProp, "right")}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white border rounded-full p-2 shadow z-10 hover:bg-gray-100 transition"
      >
        <ChevronRightIcon className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  </div>
);

export default ProductCarousel;
