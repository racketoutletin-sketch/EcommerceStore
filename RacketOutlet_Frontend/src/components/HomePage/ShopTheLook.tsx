import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "../../api/axios";
import Loader from "../Loader";
import type { AppDispatch, RootState } from "../../redux/store";
import { addCartItemThunk, updateCartItemThunk } from "../../redux/features/cart/cartThunks";

interface Product {
  id: number;
  name: string;
  price: number;
  main_image_url: string;
  slug: string;
}

interface Hotspot {
  id: number;
  top: number;
  left?: number;
  right?: number;
  product: Product;
}

interface ShopTheLookData {
  id: number;
  title: string;
  player_image: string;
  hotspots: Hotspot[];
}

const CACHE_KEY = "shop_the_look_data";
const CACHE_VERSION_KEY = "shop_the_look_cache_version";

const ShopTheLook = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const cart = useSelector((state: RootState) => state.cart.cart);

  const [data, setData] = useState<ShopTheLookData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCart, setLoadingCart] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed: ShopTheLookData = JSON.parse(cached);
        setData(parsed);
        if (parsed.hotspots.length > 0) setSelectedProduct(parsed.hotspots[0].product);
        setLoading(false);
      } catch {
        console.warn("Corrupt cache, ignoring...");
      }
    }

    const fetchData = async () => {
      try {
        const res = await axios.get<{ shopTheLook: ShopTheLookData[]; version: number }>(
          "https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-homepage-data"
        );

        const shopData = res.data.shopTheLook[0];
        const newVersion = res.data.version ?? 1;
        const oldVersion = Number(localStorage.getItem(CACHE_VERSION_KEY));

        if (newVersion !== oldVersion) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(shopData));
          localStorage.setItem(CACHE_VERSION_KEY, newVersion.toString());
          setData(shopData);
          if (shopData.hotspots.length > 0) setSelectedProduct(shopData.hotspots[0].product);
        }
      } catch (err) {
        console.error("Error fetching ShopTheLook:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (!data || !selectedProduct)
    return <p className="text-center text-gray-500 py-16">No Shop the Look data available.</p>;

  const cartItem = cart?.items?.find(item => item.product.id === selectedProduct.id);

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");

    try {
      setLoadingCart(true);
      if (cartItem?.id) {
        await dispatch(updateCartItemThunk({ id: cartItem.id, product_id: selectedProduct.id, quantity: cartItem.quantity + 1 })).unwrap();
      } else {
        await dispatch(addCartItemThunk({ product_id: selectedProduct.id, quantity: 1 })).unwrap();
      }
    } catch (err) {
      console.error("Cart update failed:", err);
    } finally {
      setLoadingCart(false);
    }
  };

  return (
    <div className="mb-8 w-full">
      <h2 className="text-xl font-semibold mb-4">{data.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
        {/* Player Image with hotspots */}
        <div className="relative border border-gray-200 rounded-lg overflow-hidden md:col-span-3 h-[650px]">
          <img
            src={`https://wzonllfccvmvoftahudd.supabase.co/storage/v1/object/public/media/${data.player_image}`}
            alt="Player"
            className="w-full h-full object-cover"
          />
          {data.hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              onMouseEnter={() => setSelectedProduct(hotspot.product)}
              className="absolute w-4 h-4 bg-white border-2 border-black rounded-full cursor-pointer hover:scale-125 transition"
              style={{
                top: `${hotspot.top}px`,
                left: hotspot.left ? `${hotspot.left}px` : undefined,
                right: hotspot.right ? `${hotspot.right}px` : undefined
              }}
            ></div>
          ))}
        </div>

        {/* Selected Product */}
<div className="border border-gray-200 text-black rounded-lg p-4 md:col-span-2 flex flex-col">
  <div
    className="flex flex-col cursor-pointer"
    onClick={() => navigate(`/products/${selectedProduct.id}`)}
  >
    <span className="block text-center mb-2">
      <span className="block text-sm tracking-widest text-gray-500 uppercase mb-1">
        Player’s Choice
      </span>
      <span className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-black text-transparent bg-clip-text">
        Shop the Look
      </span>
    </span>

    <img
      src={selectedProduct.main_image_url || "/default.png"}
      alt={selectedProduct.name}
      className="w-full h-full object-cover mb-5 rounded"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = "/default.png";
      }}
    />

    <h3 className="text-sm font-medium">{selectedProduct.name}</h3>
    <p className="text-xs text-gray-500">₹{selectedProduct.price}</p>
  </div>

  {/* Add to Cart / Go to Cart */}
  {cartItem ? (
    <button
      onClick={(e) => { e.stopPropagation(); navigate("/cart"); }}
      className="flex-1 py-3 rounded-md bg-black text-white hover:bg-white hover:text-black hover:border transition mt-3"
    >
      Go to Cart
    </button>
  ) : (
    <button
      onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
      disabled={loadingCart}
      className={`text-xs py-2 px-4 rounded text-white transition mt-3 ${
        loadingCart ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-800"
      }`}
    >
      {loadingCart ? "Adding..." : "Add to Cart"}
    </button>
  )}
</div>

      </div>
    </div>
  );
};

export default ShopTheLook;
