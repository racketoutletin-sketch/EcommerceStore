import { useEffect, useState } from "react";
import api from "../../api/axios"; // your axios instance

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
  discounted_price: string;
  brand: string;
  main_image_url: string;
  images: ProductImage[];
}

interface ExclusiveProduct {
  id: number;
  product: Product | null;
  created_at: string;
}

const FeaturedProduct = () => {
  const [product, setProduct] = useState<ExclusiveProduct | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchExclusiveProduct = async () => {
    try {
      const res = await api.get<{ exclusiveProducts: ExclusiveProduct[] }>(
        "https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-homepage-exclusive-products"
      );

      if (res.data.exclusiveProducts.length > 0) {
        const prod = res.data.exclusiveProducts[0];
        setProduct(prod);
        setMainImage(prod.product?.main_image_url || null);
      }
    } catch (err) {
      console.error("Error fetching featured product:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchExclusiveProduct();
}, []);


  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg my-16" />
    );
  }

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
    onError={(e) => {
      (e.currentTarget as HTMLImageElement).src = '/default.png';
    }}
  />
)}
<div className="flex space-x-2">
  {images.map((img, idx) => (
    <img
      key={idx}
      src={img ?? '/default.png'}
      alt={`Thumbnail ${idx}`}
      className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${
        mainImage === img ? "border-black" : "border-gray-300"
      }`}
      onClick={() => setMainImage(img)}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = '/default.png';
      }}
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

          {/* Rating (placeholder) */}
          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${i < 4 ? "text-yellow-400" : "text-gray-300"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.38 8.72c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.293z" />
              </svg>
            ))}
            <span className="ml-2 text-gray-500 text-sm">(120 reviews)</span>
          </div>

          {/* Size Selection */}
          <div className="mb-4">
            <p className="mb-2 font-medium text-black">Select Size</p>
            <div className="flex space-x-4 text-black">
              {["M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 border rounded-md ${
                    selectedSize === size
                      ? "border-black bg-gray-100"
                      : "border-gray-300"
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
