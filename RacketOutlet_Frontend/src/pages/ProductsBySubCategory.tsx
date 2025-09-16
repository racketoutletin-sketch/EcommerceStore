import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import {
  fetchProductsBySubCategory,
  resetProducts,
} from "../redux/features/products/productsListViewSlice";
import { useDebounce } from "use-debounce";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const ProductsBySubCategory = () => {
  const { subId } = useParams<{ subId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const {
    searchResults,
    availableBrands,
    availableProductTypes,
    loading,
    error,
    page,
    totalPages,
  } = useSelector((state: RootState) => state.productListView);

  const [filters, setFilters] = useState({
    sort: "",
    productType: "",
    brand: "",
    priceMin: 0,
    priceMax: 43000,
    inStock: false,
  });

  const [debouncedFilters] = useDebounce(filters, 500);

  useEffect(() => {
    if (subId) {
      dispatch(resetProducts());
      dispatch(
        fetchProductsBySubCategory({
          subId: Number(subId),
          ...debouncedFilters,
          page: 1,
        })
      );
    }
  }, [subId, debouncedFilters, dispatch]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    if (subId && newPage >= 1 && newPage <= totalPages) {
      dispatch(
        fetchProductsBySubCategory({
          subId: Number(subId),
          ...debouncedFilters,
          page: newPage,
        })
      );
    }
  };

  if (loading && page === 1) return <Loader />;
  if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;
  if (!searchResults.length)
    return <p className="text-gray-500 text-center mt-6">No products found</p>;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <TopBar />
      <Header />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filters & Sort */}
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl shadow-sm items-center">
          {/* Product Type */}
          <div>
            <label className="font-semibold mr-2">Type:</label>
            <select
              className="border p-2 rounded"
              value={filters.productType}
              onChange={(e) => handleFilterChange("productType", e.target.value)}
            >
              <option value="">All</option>
              {availableProductTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="font-semibold mr-2">Brand:</label>
            <select
              className="border p-2 rounded"
              value={filters.brand}
              onChange={(e) => handleFilterChange("brand", e.target.value)}
            >
              <option value="">All</option>
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* In Stock */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange("inStock", e.target.checked)}
              className="mr-2"
            />
            <label className="font-semibold">In Stock</label>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <label className="font-semibold">Price:</label>
            <input
              type="number"
              value={filters.priceMin}
              onChange={(e) =>
                handleFilterChange("priceMin", Number(e.target.value))
              }
              className="border p-2 w-20 rounded"
              placeholder="Min"
            />
            <span>-</span>
            <input
              type="number"
              value={filters.priceMax}
              onChange={(e) =>
                handleFilterChange("priceMax", Number(e.target.value))
              }
              className="border p-2 w-20 rounded"
              placeholder="Max"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="font-semibold mr-2">Sort:</label>
            <select
              className="border p-2 rounded"
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
            >
              <option value="">Select</option>
              <option value="featured">Featured</option>
              <option value="best_selling">Best Selling</option>
              <option value="name_asc">A-Z</option>
              <option value="name_desc">Z-A</option>
              <option value="price_asc">Price Low to High</option>
              <option value="price_desc">Price High to Low</option>
              <option value="date_asc">Oldest</option>
              <option value="date_desc">Newest</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {searchResults.map((product: any) => (
            <div key={product.id} className="w-full min-w-0">
              <ProductCard
                id={product.id}
                name={product.name ?? ""}
                description={product.description ?? ""}
                main_image_url={product.main_image_url}
                price={Number(product.price)}
                discounted_price={
                  product.discounted_price
                    ? Number(product.discounted_price)
                    : undefined
                }
                brand={product.brand ?? ""}
              />
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, idx) => {
            const pg = idx + 1;
            return (
              <button
                key={pg}
                onClick={() => handlePageChange(pg)}
                className={`px-3 py-1 rounded ${
                  pg === page ? "bg-black text-white" : "bg-gray-200"
                }`}
              >
                {pg}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsBySubCategory;
