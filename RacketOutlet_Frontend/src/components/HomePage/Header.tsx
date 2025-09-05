// src/components/Header.tsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "../Loader";
import { useAppDispatch } from "../../redux/store"; 
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

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cacheVersion, setCacheVersion] = useState<number>(1); // track cache version
  const dropdownRef = useRef<HTMLDivElement>(null);

  const accessToken = localStorage.getItem("access_token");

  // Fetch categories with cache version
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-featured-categories"
        );
        if (!res.ok) throw new Error("Failed to fetch categories");

        const data = await res.json();
        setCategories(data.featured_categories || []);
        if (data.version) setCacheVersion(data.version); // update cache version
      } catch (err) {
        console.error(err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown on outside click
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
        <nav className="hidden md:flex flex-wrap space-x-6 items-center">
          {loading ? (
            <Loader />
          ) : categories.length ? (
            categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/subcategories/${cat.id}`}
                className="font-medium text-sm md:text-base hover:text-red-600 transition-colors"
              >
                {cat.name}
              </Link>
            ))
          ) : (
            <span className="text-gray-500">No categories</span>
          )}
        </nav>

        {/* Icons & Profile */}
        <div className="flex items-center space-x-4 relative">
          <button
            className="text-lg md:text-xl"
            onClick={() => navigate("/search")}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
          <Link to="/cart" className="text-lg md:text-xl">
            <FontAwesomeIcon icon={faShoppingCart} />
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleProfileClick}
              className="text-lg md:text-xl flex items-center"
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
            {accessToken && dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 md:w-48 bg-white border rounded shadow-lg flex flex-col text-left z-50">
                <Link
                  to="/orders"
                  className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm md:text-base"
                >
                  <FontAwesomeIcon icon={faShoppingCart} /> <span>Orders</span>
                </Link>
                <Link
                  to="/wishlist"
                  className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm md:text-base"
                >
                  <FontAwesomeIcon icon={faHeart} /> <span>Wishlist</span>
                </Link>
                <Link
                  to="/profile"
                  className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm md:text-base"
                >
                  <FontAwesomeIcon icon={faCog} /> <span>Account Settings</span>
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

          <button
            className="md:hidden text-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="p-6 flex flex-col space-y-4">
          {loading ? (
            <Loader />
          ) : categories.length ? (
            categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/subcategories/${cat.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium text-sm hover:text-red-600 transition-colors"
              >
                {cat.name}
              </Link>
            ))
          ) : (
            <span className="text-gray-500">No categories</span>
          )}

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
