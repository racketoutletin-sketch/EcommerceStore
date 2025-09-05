import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import ProductCard from "./ProductCard";


interface ProductCarouselProps {
  title: string;
  products: any[];
  refProp: React.RefObject<HTMLDivElement | null>;
  scroll: (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: "left" | "right"
  ) => void;
}

interface ArrowButtonProps {
  direction: "left" | "right";
  onClick: () => void;
}

const ArrowButton: React.FC<ArrowButtonProps> = ({ direction, onClick }) => {
  const Icon = direction === "left" ? ChevronLeftIcon : ChevronRightIcon;
  const position = direction === "left" ? "left-0" : "right-0";

  return (
    <button
      onClick={onClick}
      className={`absolute ${position} top-1/2 -translate-y-1/2 bg-white border rounded-full p-2 shadow z-10 hover:bg-gray-100 transition`}
    >
      <Icon className="w-5 h-5 text-gray-700" />
    </button>
  );
};

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
      <ArrowButton direction="left" onClick={() => scroll(refProp, "left")} />

      {/* Scrollable container */}
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
              main_image_url={p.main_image_url}
              price={p.price}
              discounted_price={p.discounted_price ?? null}
              brand={p.brand}
            />
          </div>
        ))}
      </div>

      {/* Right button */}
      <ArrowButton direction="right" onClick={() => scroll(refProp, "right")} />
    </div>
  </div>
);

export default ProductCarousel;
