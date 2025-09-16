// src/components/HomePage/ShopTheLook.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { addCartItemThunk, updateCartItemThunk } from "../../redux/features/cart/cartThunks";
import { selectShopTheLook } from "../../redux/features/home/homeSlice";
import type { ShopTheLook as ReduxShopTheLook, ShopHotspot } from "../../redux/features/home/homeSlice";

interface Product {
  id: number;
  name: string;
  price: number; // component expects number
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

interface ShopTheLook {
  id: number;
  title: string;
  player_image: string;
  hotspots: Hotspot[];
}

const ShopTheLook: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const cart = useAppSelector((state) => state.cart.cart);

  const shopList = useAppSelector(selectShopTheLook); // ReduxShopTheLook[]
  const shopReduxData: ReduxShopTheLook | null = shopList?.[0] ?? null;

  // Convert Redux data to component-friendly types
  const shopData: ShopTheLook | null = shopReduxData
    ? {
        ...shopReduxData,
        hotspots: shopReduxData.hotspots.map((hotspot: ShopHotspot): Hotspot => ({
          ...hotspot,
          product: {
            ...hotspot.product,
            price: Number(hotspot.product.price), // convert string -> number
          },
        })),
      }
    : null;
    

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    shopData?.hotspots?.[0]?.product ?? null
  );
  const [loadingCart, setLoadingCart] = useState(false);

  useEffect(() => {
    const firstProduct = shopData?.hotspots?.[0]?.product ?? null;
    setSelectedProduct((prev) => {
      if (!prev && firstProduct) return firstProduct; // only set once
      return prev;
    });
  }, [shopData?.hotspots?.[0]?.product.id]);


  if (!shopData || !selectedProduct)
    return <p className="text-center text-gray-500 py-16">No Shop the Look data available.</p>;

  const cartItem = cart?.items?.find((item) => item.product.id === selectedProduct.id);

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");

    try {
      setLoadingCart(true);
      if (cartItem?.id) {
        await dispatch(
          updateCartItemThunk({
            id: cartItem.id,
            product_id: selectedProduct.id,
            quantity: cartItem.quantity + 1,
          })
        ).unwrap();
      } else {
        await dispatch(addCartItemThunk({ product_id: selectedProduct.id, quantity: 1 })).unwrap();
      }
    } catch (err) {
      console.error("Cart update failed:", err);
    } finally {
      setLoadingCart(false);
    }
    console.log(shopData)
  };

  return (
    <div className="mb-8 w-full">
      <h2 className="text-xl font-semibold mb-4">{shopData.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
        {/* Player Image with hotspots */}
        <div className="relative border border-gray-200 rounded-lg overflow-hidden md:col-span-3 h-[650px]">
          <img
            src={shopData.player_image}

            alt="Player"
            className="w-full h-full object-cover"
          />
          {shopData.hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              onMouseEnter={() => setSelectedProduct(hotspot.product)}
              className="absolute w-4 h-4 bg-white border-2 border-black rounded-full cursor-pointer hover:scale-125 transition"
              style={{
                top: `${hotspot.top}px`,
                left: hotspot.left != null ? `${hotspot.left}px` : undefined,
                right: hotspot.right != null ? `${hotspot.right}px` : undefined,
              }}
            />
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
              onClick={(e) => {
                e.stopPropagation();
                navigate("/cart");
              }}
              className="flex-1 py-3 rounded-md bg-black text-white hover:bg-white hover:text-black hover:border transition mt-3"
            >
              Go to Cart
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
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
