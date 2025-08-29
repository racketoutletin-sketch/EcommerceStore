import { useState, useEffect } from "react";
import axios from "../../api/axios"; // your axios instance

interface Product {
  id: number;
  name: string;
  price: number; // should be number (API returns number, not string)
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

const ShopTheLook = () => {
  const [data, setData] = useState<ShopTheLookData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    axios.get("https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-homepage-data").then((res) => {
      const shopData = res.data.shopTheLook[0]; // ✅ correct path
      setData(shopData);

      if (shopData.hotspots.length > 0) {
        setSelectedProduct(shopData.hotspots[0].product);
      }
    });
  }, []);

  if (!data || !selectedProduct) return <div>Loading...</div>;

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
                right: hotspot.right ? `${hotspot.right}px` : undefined,
              }}
            ></div>
          ))}
        </div>

        {/* Selected Product */}
        <div className="border border-gray-200 text-black rounded-lg p-4 md:col-span-2 flex flex-col">
          <span className="block text-center">
            <span className="block text-sm tracking-widest text-gray-500 uppercase mb-1">
              Player’s Choice
            </span>
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-black text-transparent bg-clip-text">
              Shop the Look
            </span>
          </span>

          <img
            src={selectedProduct.main_image_url}
            alt={selectedProduct.name}
            className="w-full h-full object-cover mb-5 rounded"
          />
          <h3 className="text-sm font-medium">{selectedProduct.name}</h3>
          <p className="text-xs text-gray-500">₹{selectedProduct.price}</p>
          <button className="mt-auto bg-black text-white text-xs py-1 px-3 rounded">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopTheLook;
