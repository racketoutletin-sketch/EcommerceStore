import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchProducts,
  fetchBrands,
  setFilters,
  setPage,
  clearCache,
  selectPagination,
} from "../redux/features/products/productSearchSlice";
import type { SortOption } from "../redux/features/products/productSearchSlice";

import Pagination from "../components/Pagination";
import ProductCard from "../components/ProductCard";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const SearchResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error, filters, count, brands, brandsLoading, pageCache } =
    useAppSelector((state) => state.productSearch);
  const { currentPage, totalPages } = useAppSelector(selectPagination);

  const types = Array.from(new Set(products.map((p) => p.sub_category_name)));
  const [searchText, setSearchText] = useState(filters.search || "");

  // ------------------ Fetch brands only ------------------
  React.useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  // ------------------ Generic Filter Updater ------------------
  const updateFilter = (payload: Partial<typeof filters>) => {
    dispatch(clearCache());
    const updatedFilters = { ...filters, ...payload, page: 1 };
    dispatch(setFilters(updatedFilters));
    dispatch(fetchProducts(updatedFilters));
  };

  // ------------------ Handlers ------------------
  const handleSearchClick = () => {
    if (!searchText.trim()) return; // prevent empty search
    updateFilter({ search: searchText });
  };
  const handleBrandChange = (brand: string) => updateFilter({ brand });
  const handleTypeChange = (type: string) => updateFilter({ type });
  const handleSortChange = (sort: SortOption | "") =>
    updateFilter({ sort: sort || undefined });
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateFilter({ page_size: Number(e.target.value) });

  // ------------------ Pagination Handlers ------------------
  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
    if (!pageCache[page]) {
      dispatch(fetchProducts({ ...filters, page }));
    }
  };
  const handlePrevPage = () => handlePageChange(Math.max(1, currentPage - 1));
  const handleNextPage = () => handlePageChange(Math.min(totalPages, currentPage + 1));
  const handlePageSelect = (page: number) => handlePageChange(page);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <TopBar />
      <Header />

      <div className="m-7 p-7">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
              className="border p-2 rounded min-w-[200px] pr-10"
            />
            <button
              onClick={handleSearchClick}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-800"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Brand */}
          <select
            value={filters.brand || ""}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Brands</option>
            {!brandsLoading &&
              brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
          </select>

          {/* Type */}
          <select
            value={filters.type || ""}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={filters.sort || ""}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="border p-2 rounded"
          >
            <option value="">Sort By</option>
            <option value="name_asc">A → Z</option>
            <option value="name_desc">Z → A</option>
            <option value="recent">Recently Published</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* Page size */}
          <label className="text-sm text-gray-600">
            Page size:&nbsp;
            <select
              value={filters.page_size || 12}
              onChange={handlePageSizeChange}
              className="border p-1 rounded"
            >
              {[8, 12, 16, 24, 32].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Results */}
        {loading && !pageCache[currentPage] && <p className="text-black">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!error && products.length > 0 && (
          <>
            <div className="flex items-baseline justify-between mb-2">
              <p className="font-bold">
                {count} products found
                {filters.brand && (
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    · brand: {filters.brand}
                  </span>
                )}
                {filters.type && (
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    · type: {filters.type}
                  </span>
                )}
                {filters.search && (
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    · search: “{filters.search}”
                  </span>
                )}
              </p>

              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            {/* Grid of Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {(pageCache[currentPage] || products).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition duration-200"
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    main_image_url={product.main_image_url}
                    images={(product.images ?? [])
                      .map((img) => img?.image_url)
                      .filter((url): url is string => Boolean(url))}
                    price={parseFloat(product.price)}
                    discounted_price={
                      product.discounted_price
                        ? parseFloat(product.discounted_price)
                        : undefined
                    }
                    brand={product.brand}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={handlePrevPage}
                onNext={handleNextPage}
                onPageSelect={handlePageSelect}
              />
            </div>
          </>
        )}

        {/* Show message if no products found */}
        {!error && products.length === 0 && !loading && (
          <p className="text-gray-500 mt-6">Start typing and press Enter to search products.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
