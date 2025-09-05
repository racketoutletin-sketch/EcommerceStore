import React, { useEffect, useState } from "react";
import Loader from "../Loader";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../redux/store";
import { addCartItemThunk, updateCartItemThunk } from "../../redux/features/cart/cartThunks";

interface ProductImage {
  id: number;
  image_url: string | null;
  is_primary: boolean;
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
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const cart = useSelector((state: RootState) => state.cart.cart);

  const [product, setProduct] = useState<ExclusiveProduct | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingCart, setLoadingCart] = useState(false);

  useEffect(() => {
    // Load cached product
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const prod = JSON.parse(cachedData) as ExclusiveProduct;
        setProduct(prod);
        setMainImage(prod.product?.main_image_url || null);
        setLoadingProduct(false);
      } catch {
        console.warn("Corrupt cache, ignoring...");
      }
    }

    const fetchExclusiveProduct = async () => {
      try {
        const res = await api.get<{ exclusiveProducts: ExclusiveProduct[]; version: number }>(
          "https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-homepage-exclusive-products"
        );

        if (!res.data || res.data.exclusiveProducts.length === 0) return;

        const newVersion = res.data.version ?? 1;
        const oldVersion = Number(localStorage.getItem(CACHE_VERSION_KEY));

        if (newVersion !== oldVersion) {
          const prod = res.data.exclusiveProducts[0];
          localStorage.setItem(CACHE_KEY, JSON.stringify(prod));
          localStorage.setItem(CACHE_VERSION_KEY, newVersion.toString());
          setProduct(prod);
          setMainImage(prod.product?.main_image_url || null);
        }
      } catch (err) {
        console.error("Error fetching featured product:", err);
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchExclusiveProduct();
  }, []);

  if (loadingProduct) return <Loader />;
  if (!product?.product) return <p className="text-center text-gray-500 py-10">No featured product</p>;

  const images = product.product.images.length > 0
    ? [product.product.main_image_url, ...product.product.images.map(img => img.image_url).filter((url): url is string => !!url)]
    : [product.product.main_image_url];

  const cartItem = cart?.items?.find(item => item.product.id === product.product!.id);

  const handleAddToCart = async (quantity: number, e?: React.MouseEvent) => {
  e?.stopPropagation();
  if (!user) return navigate("/login");
  if (quantity < 1) return;

  try {
    setLoadingCart(true);
    if (cartItem?.id && cartItem.id < 1e12) {
      // If the id looks like a temp client id, skip update and just add
      await dispatch(addCartItemThunk({ product_id: product.product!.id, quantity })).unwrap();
    } else if (cartItem?.id) {
      await dispatch(updateCartItemThunk({ id: cartItem.id, product_id: product.product!.id, quantity })).unwrap();
    } else {
      await dispatch(addCartItemThunk({ product_id: product.product!.id, quantity })).unwrap();
    }
  } catch (err) {
    console.error("Cart update failed:", err);
  } finally {
    setLoadingCart(false);
  }
};


  const handleBuyNow = () => {
    if (!product.product) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const finalPrice = Number(product.product.discounted_price ?? product.product.price);
    const directItem = {
      id: Date.now(),
      quantity: 1,
      product: {
        id: product.product.id,
        name: product.product.name,
        main_image_url: product.product.main_image_url,
        price: Number(product.product.price),
        discounted_price: product.product.discounted_price ?? undefined,
        current_price: finalPrice,
      },
      subtotal: finalPrice
    };

    navigate("/checkout", { state: { directItems: [directItem], total: finalPrice } });
  };

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
              className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${mainImage === img ? "border-black" : "border-gray-300"}`}
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

          <div className="flex items-center mb-4">
            <span className="text-red-500 font-bold text-xl mr-2">
              ${product.product.discounted_price || product.product.price}
            </span>
            {product.product.discounted_price && (
              <span className="text-gray-400 line-through">${product.product.price}</span>
            )}
          </div>

          <span className="text-sm text-gray-500">{product.product.description}</span>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 mt-4">
          <button
            onClick={(e) => handleAddToCart(1, e)}
            disabled={loadingCart}
            className={`flex-1 py-3 rounded-md transition text-white ${loadingCart ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-800"}`}
          >
            {loadingCart ? "Adding..." : "Add to Cart"}
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 border border-gray-300 text-black py-3 rounded-md hover:bg-gray-100 transition"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct;
