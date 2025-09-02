// src/components/FeaturedProduct.tsx
import React, { useEffect, useState } from "react";
import Loader from "../Loader";
import api from "../../api/axios"; // axios instance

interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  image_url: string | null;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  discounted_price: string | null;
  brand: string;
  main_image_url: string;
  images: ProductImage[];
}

interface ExclusiveProduct {
  id: number;
  product: Product | null;
  created_at: string;
}

const CACHE_KEY = "FeaturedProduct_data";
const CACHE_VERSION_KEY = "FeaturedProduct_cache_version";

const FeaturedProduct: React.FC = () => {
  const [product, setProduct] = useState<ExclusiveProduct | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Step 1: Load cached data immediately
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const prod = JSON.parse(cachedData) as ExclusiveProduct;
        setProduct(prod);
        setMainImage(prod.product?.main_image_url || null);
        setLoading(false);
      } catch {
        console.warn("Corrupt cache, ignoring...");
      }
    }

    // Step 2: Fetch fresh data in background
    const fetchExclusiveProduct = async () => {
      try {
        const res = await api.get<{ exclusiveProducts: ExclusiveProduct[]; version: number }>(
          "https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-homepage-exclusive-products"
        );

        if (!res.data || res.data.exclusiveProducts.length === 0) return;

        const newVersion = res.data.version ?? 1;
        const oldVersion = Number(localStorage.getItem(CACHE_VERSION_KEY));

        if (newVersion !== oldVersion) {
          console.log(`Featured product version changed: ${oldVersion} → ${newVersion}`);
          const prod = res.data.exclusiveProducts[0];
          localStorage.setItem(CACHE_KEY, JSON.stringify(prod));
          localStorage.setItem(CACHE_VERSION_KEY, newVersion.toString());
          setProduct(prod);
          setMainImage(prod.product?.main_image_url || null);
        } else {
          console.log("Featured product cache still valid");
        }
      } catch (err) {
        console.error("Error fetching featured product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExclusiveProduct();
  }, []);

  if (loading) return <Loader />;

  if (!product || !product.product) {
    return <p className="text-center text-gray-500 py-10">No featured product</p>;
  }

  const images = product.product.images.length > 0
    ? product.product.images.map((img) => img.image_url)
    : [product.product.main_image_url];

  return (
    <div className="bg-white p-8 rounded-lg max-w-7xl mx-auto mt-16 mb-16 min-h-[600px] grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Left: Image Carousel */}
      <div className="flex flex-col w-full h-full">
        {mainImage && (
          <img
            src={mainImage}
            alt={product.product.name}
            className="w-full h-full object-cover rounded-lg mb-4"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/default.png"; }}
          />
        )}
        <div className="flex space-x-2">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img ?? "/default.png"}
              alt={`Thumbnail ${idx}`}
              className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${
                mainImage === img ? "border-black" : "border-gray-300"
              }`}
              onClick={() => setMainImage(img)}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/default.png"; }}
            />
          ))}
        </div>
      </div>

      {/* Right: Product Details */}
      <div className="flex flex-col justify-between">
        <div>
          <span className="text-sm text-gray-500">{product.product.brand}</span>
          <h2 className="text-2xl font-bold my-2 text-black">{product.product.name}</h2>

          {/* Price */}
          <div className="flex items-center mb-4">
            <span className="text-red-500 font-bold text-xl mr-2">
              ${product.product.discounted_price || product.product.price}
            </span>
            {product.product.discounted_price && (
              <span className="text-gray-400 line-through">${product.product.price}</span>
            )}
          </div>

          {/* Size Selection */}
          <div className="mb-4">
            <p className="mb-2 font-medium text-black">Select Size</p>
            <div className="flex space-x-4 text-black">
              {["M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 border rounded-md ${
                    selectedSize === size ? "border-black bg-gray-100" : "border-gray-300"
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <span className="text-sm text-gray-500">{product.product.description}</span>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 mt-4">
          <button className="flex-1 bg-black text-white py-3 rounded-md hover:bg-gray-800 transition">
            Add to Cart
          </button>
          <button className="flex-1 border border-gray-300 text-black py-3 rounded-md hover:bg-gray-100 transition">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct;
