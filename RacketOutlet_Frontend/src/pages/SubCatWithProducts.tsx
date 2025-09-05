// SubCatWithProducts.tsx
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { fetchSubCategoriesByCategory } from "../redux/features/subcategory/subcategorySlice";
import ProductCard from "../components/ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
  // --- Loading / error / empty states ---
import Loader from "../components/Loader";
import WaveButton from "../components/ui/AnimatedButton";

const SubCatWithProducts = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // --- Redux state ---
  const { byCategory, loading, error } = useSelector(
    (state: RootState) => state.subcategories
  );
  const categoryId = Number(id);
  const subcategories = byCategory[categoryId] || [];
  const isLoading = loading[categoryId] || false;
  const fetchError = error[categoryId] || null;

  // --- Scroll & drag refs ---
  const scrollRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const dragStartX = useRef<Record<number, number>>({});
  const scrollStartX = useRef<Record<number, number>>({});
  const isDragging = useRef<Record<number, boolean>>({});

  // --- Fetch subcategories only if not cached ---
  useEffect(() => {
    if (id && !byCategory[categoryId] && !loading[categoryId]) {
      dispatch(fetchSubCategoriesByCategory(categoryId));
    }
  }, [id, categoryId, byCategory, dispatch, loading]);

  const handleViewMore = (subId: number) =>
    navigate(`/subcategories/${subId}/products`);

  const scroll = (subId: number, direction: "left" | "right") => {
    const container = scrollRefs.current[subId];
    if (!container) return;

    const cardWidth = 264 + 24;
    const maxScroll = Math.min(
      cardWidth * 8,
      container.scrollWidth - container.clientWidth
    );

    const newPos =
      direction === "left"
        ? Math.max(container.scrollLeft - cardWidth, 0)
        : Math.min(container.scrollLeft + cardWidth, maxScroll);

    container.scrollTo({ left: newPos, behavior: "smooth" });
  };

  const handleMouseDown = (
    subId: number,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    isDragging.current[subId] = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current[subId] = clientX;
    scrollStartX.current[subId] = scrollRefs.current[subId]?.scrollLeft || 0;
  };

  const handleMouseMove = (
    subId: number,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    if (!isDragging.current[subId]) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const deltaX = dragStartX.current[subId] - clientX;
    const container = scrollRefs.current[subId];
    if (container) container.scrollLeft = scrollStartX.current[subId] + deltaX;
  };

  const handleMouseUp = (subId: number) => {
    isDragging.current[subId] = false;
  };


if (isLoading && !subcategories.length) {
  return <Loader />;
}
  if (fetchError)
    return <p className="text-red-500 text-center mt-6">{fetchError}</p>;

  if (!subcategories.length)
    return <p className="text-gray-500 text-center mt-6">No subcategories found</p>;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <TopBar />
      <Header />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {subcategories.map((sub) => {
          const showViewMore = sub.products.length > 8;
          const visibleProducts = sub.products.slice(0, 8);

          return (
            <div key={sub.id} className="border-b pb-6">
              {/* Subcategory Header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{sub.name}</h2>
                {showViewMore && (
                  <WaveButton size="md"
                    onClick={() => handleViewMore(sub.id)}>
                    View More
                  </WaveButton>
                )}
              </div>

              <div className="relative">
                {/* Left Arrow */}
                {visibleProducts.length > 4 && (
                  <button
                    onClick={() => scroll(sub.id, "left")}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white border rounded-full p-2 shadow z-10 hover:bg-gray-100 transition"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
                  </button>
                )}

                {/* Products Container */}
                <div
                  ref={(el) => {
                    scrollRefs.current[sub.id] = el ?? null; // ✅ TypeScript safe
                  }}
                  className="flex space-x-6 overflow-x-hidden scroll-smooth px-2 cursor-grab"
                  onMouseDown={(e) => handleMouseDown(sub.id, e)}
                  onMouseMove={(e) => handleMouseMove(sub.id, e)}
                  onMouseUp={() => handleMouseUp(sub.id)}
                  onMouseLeave={() => handleMouseUp(sub.id)}
                  onTouchStart={(e) => handleMouseDown(sub.id, e)}
                  onTouchMove={(e) => handleMouseMove(sub.id, e)}
                  onTouchEnd={() => handleMouseUp(sub.id)}
                >
                  {visibleProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex-shrink-0 w-72 border h-[28rem] rounded-2xl overflow-hidden"
                    >
                      <ProductCard
                        id={p.id}
                        name={p.name}
                        description={p.description}
                        main_image_url={p.main_image_url}
                        price={Number(p.price)}
                        discounted_price={
                          p.discounted_price ? Number(p.discounted_price) : undefined
                        }
                        brand={p.brand}
                      />
                    </div>
                  ))}
                </div>

                {/* Right Arrow */}
                {visibleProducts.length > 4 && (
                  <button
                    onClick={() => scroll(sub.id, "right")}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white border rounded-full p-2 shadow z-10 hover:bg-gray-100 transition"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-700" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubCatWithProducts;
