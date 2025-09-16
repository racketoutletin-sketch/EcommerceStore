import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "../Loader";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { logout } from "../../redux/features/auth/authSlice";
import {
  faUser,
  faSearch,
  faShoppingCart,
  faBars,
  faXmark,
  faHeart,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

import {
  fetchHomeData,
  selectHomeLoading,
  selectFeaturedCategories,
  selectHomeData,
} from "../../redux/features/home/homeSlice";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const closeTimeout = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auth
  const accessToken = localStorage.getItem("access_token");

  // Redux state
  const loading = useAppSelector(selectHomeLoading);
  const categories = useAppSelector(selectFeaturedCategories);
  const homeData = useAppSelector(selectHomeData);

  // Fetch home data if not already loaded
  useEffect(() => {
    if (!homeData) {
      dispatch(fetchHomeData());
    }
  }, [dispatch, homeData]);

  // Preload category images (fixes hover flicker)
  useEffect(() => {
    categories.forEach((cat: any) => {
      if (cat.image_url) {
        const img = new Image();
        img.src = cat.image_url;
      }
      if (cat.subcategories) {
        cat.subcategories.forEach((sub: any) => {
          if (sub.image_url) {
            const img = new Image();
            img.src = sub.image_url;
          }
        });
      }
    });
  }, [categories]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleProfileClick = () => {
    if (!accessToken) navigate("/login");
    else setDropdownOpen(!dropdownOpen);
  };

  // Mega menu hover with delay
  const handleMouseEnter = (catId: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setHoveredCat(catId);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = window.setTimeout(() => setHoveredCat(null), 150);
  };

  return (
    <header className="w-full top-0 left-0 z-50 border-b border-gray-200 bg-white text-black sticky">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="logo">
          <Link to="/" className="text-lg md:text-xl font-bold whitespace-nowrap">
            RacketOutlet
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 relative">
          {loading ? (
            <Loader />
          ) : categories.length ? (
            <>
              {/* Category Titles */}
              {categories.map((cat: any) => (
                <div
                  key={cat.id}
                  onMouseEnter={() => handleMouseEnter(cat.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <h2 className="font-semibold text-base md:text-m hover:text-red-600 transition-colors cursor-pointer">
                    {cat.name}
                  </h2>
                </div>
              ))}

              {/* Mega Menu Dropdowns */}
              {categories.map(
                (cat: any) =>
                  cat.subcategories &&
                  cat.subcategories.length > 0 &&
                  hoveredCat === cat.id && (
                    <div
                      key={`dropdown-${cat.id}`}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 z-50"
                      onMouseEnter={() => handleMouseEnter(cat.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div
                        className="w-[90vw] max-w-7xl border rounded-2xl shadow-2xl p-8 relative overflow-hidden"
                        style={{
                          background: cat.bgColor || undefined,
                        }}
                      >
                        {/* Optional background image */}
                        {cat.image_url && (
                          <div
                            className="absolute inset-0 bg-cover bg-center opacity-100 bg-white"
                            style={{ backgroundImage: `url(${cat.image_url})` }}
                          />
                        )}

                        {/* Main Layout: Subcategories | Description */}
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                          {/* Left: Subcategories */}
                          <div className="grid grid-cols-2 gap-6">
                            {cat.subcategories.map((sub: any) => (
                              <Link
                                key={sub.id}
                                to={`/subcategories/${sub.id}/products`}
                                className="flex flex-col items-center text-center bg-white bg-opacity-60 border hover:bg-red-50 hover:bg-opacity-90 rounded-xl p-4 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                              >
                                <img
                                  src={sub.image_url || "/default.png"}
                                  alt={sub.name}
                                  className="w-28 h-28 object-cover rounded-lg mb-3 border border-gray-200"
                                />
                                <span className="text-base font-medium text-gray-700 hover:text-red-600">
                                  {sub.name}
                                </span>
                              </Link>
                            ))}
                          </div>

                          {/* Right: Static description */}
                          <div className="flex flex-col justify-center items-center text-gray-800 px-6">
                            <h3 className="text-6xl md:text-5xl font-extrabold mb-3 text-center">
                              {cat.name}
                            </h3>
                            <p className="text-m text-black px-6 py-3 rounded-lg text-justify max-w-lg">
                              {cat.description ||
                                "Explore our exclusive range of products in this category."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </>
          ) : (
            <span className="text-gray-500">No categories</span>
          )}
        </nav>

        {/* Icons & Profile */}
        <div className="flex items-center space-x-4 relative">
          {/* Search */}
          <button className="text-lg md:text-xl" onClick={() => navigate("/search")}>
            <FontAwesomeIcon icon={faSearch} />
          </button>

          {/* Cart */}
          <Link to="/cart" className="text-lg md:text-xl">
            <FontAwesomeIcon icon={faShoppingCart} />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={handleProfileClick} className="text-lg md:text-xl flex items-center">
              <FontAwesomeIcon icon={faUser} />
            </button>
            {accessToken && dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 md:w-48 bg-white border rounded shadow-lg flex flex-col text-left z-50">
                <Link
                  to="/orders"
                  className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm md:text-base"
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/wishlist"
                  className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm md:text-base"
                >
                  <FontAwesomeIcon icon={faHeart} />
                  <span>Wishlist</span>
                </Link>
                <Link
                  to="/profile"
                  className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm md:text-base"
                >
                  <FontAwesomeIcon icon={faCog} />
                  <span>Account Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 hover:bg-gray-100 text-red-500 text-left text-sm md:text-base"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col space-y-4">
          {loading ? (
            <Loader />
          ) : categories.length ? (
            categories.map((cat) => (
              <div key={cat.id}>
                <Link
                  to={`/subcategories/${cat.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-medium text-sm hover:text-red-600 transition-colors block py-1"
                >
                  {cat.name}
                </Link>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="pl-4 mt-1">
                    {cat.subcategories.map((sub: any) => (
                      <Link
                        key={sub.id}
                        to={`/subcategories/${sub.id}/products`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1 text-sm text-gray-700 hover:text-red-600"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <span className="text-gray-500">No categories</span>
          )}

          {/* Mobile Profile / Auth Links */}
          {accessToken ? (
            <>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1 hover:text-red-600 text-sm"
              >
                Orders
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1 hover:text-red-600 text-sm"
              >
                Wishlist
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1 hover:text-red-600 text-sm"
              >
                Account Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="px-2 py-1 text-red-500 hover:text-red-600 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                setMobileMenuOpen(false);
              }}
              className="px-2 py-1 hover:text-red-600 text-sm"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
