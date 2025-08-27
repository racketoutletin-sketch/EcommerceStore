import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import {
  fetchProducts,
  setFilters,
  setPage,
  setPageSize,
  nextPage,
  prevPage,
  selectPagination,
} from "../redux/features/products/productSearchSlice";
import type { SortOption } from "../redux/features/products/productSearchSlice";
import Pagination from "../components/Pagination";
import ProductCard from "../components/ProductCard";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const brands = ["Head", "Yonex", "Wilson", "Nike", "Adidas", "Li-Ning", "PowerPlay"];

const SearchResults: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error, filters, count } = useSelector(
    (state: RootState) => state.productSearch
  );
  const { currentPage, totalPages } = useSelector(selectPagination);

  const types = Array.from(new Set(products.map((p) => p.sub_category_name)));

  // Local state for search input
  const [searchText, setSearchText] = useState(filters.search || "");

  // Trigger search on click
  const handleSearchClick = () => {
    dispatch(setFilters({ search: searchText }));
    dispatch(fetchProducts());
  };

  const handleBrandChange = (brand: string) => {
    dispatch(setFilters({ brand }));
    dispatch(fetchProducts());
  };

  const handleTypeChange = (type: string) => {
    dispatch(setFilters({ type }));
    dispatch(fetchProducts());
  };

  const handleSortChange = (sort: SortOption | "") => {
    dispatch(setFilters({ sort: sort || undefined }));
    dispatch(fetchProducts());
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setPageSize(Number(e.target.value)));
    dispatch(fetchProducts());
  };

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
          {brands.map((b) => (
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
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="flex items-baseline justify-between mb-2">
            <p className="font-bold">
              {count} products found
              {filters.brand && (
                <span className="text-sm font-normal text-gray-500"> · brand: {filters.brand}</span>
              )}
              {filters.type && (
                <span className="text-sm font-normal text-gray-500"> · type: {filters.type}</span>
              )}
              {filters.search && (
                <span className="text-sm font-normal text-gray-500"> · search: “{filters.search}”</span>
              )}
            </p>

            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                main_image={product.main_image}
                price={product.price ? parseFloat(product.price) : product.current_price}
                discounted_price={product.discounted_price ? parseFloat(product.discounted_price) : null}
                brand={product.brand}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => dispatch(prevPage())}
            onNext={() => dispatch(nextPage())}
            onPageSelect={(p) => dispatch(setPage(p))}
          />
        </>
      )}
    </div>
        </div>
  );
};

export default SearchResults;
