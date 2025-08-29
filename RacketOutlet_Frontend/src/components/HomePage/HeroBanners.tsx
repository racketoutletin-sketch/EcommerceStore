// src/components/HeroBanners.tsx
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  subcategory_id: number | null;
  product_id: number | null;
}

const HeroBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const navigate = useNavigate();

  // ✅ Fetch banners directly from Supabase Edge Function
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(
          "https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-banners"
        );
        const data = await res.json();
        setBanners(data.banners || []);
      } catch (err) {
        console.error("Error fetching banners:", err);
      }
    };

    fetchBanners();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 1200,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
    cssEase: "ease-in-out",
    pauseOnHover: true,
    appendDots: (dots: React.ReactNode) => (
      <div>
        <ul className="m-0 p-0 flex justify-center">{dots}</ul>
      </div>
    ),
  };

  // ✅ Handle banner click
  const handleClick = (banner: Banner) => {
    if (banner.product_id) {
      navigate(`/products/${banner.product_id}`);
    } else if (banner.subcategory_id) {
      navigate(`/subcategories/${banner.subcategory_id}`);
    }
  };

  return (
    <div className="mb-8">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="relative h-64 md:h-96 overflow-hidden rounded-lg cursor-pointer"
            onClick={() => handleClick(banner)}
          >
            <img
              // 👇 Supabase storage URL (fix if needed)
              src={`https://wzonllfccvmvoftahudd.supabase.co/storage/v1/object/public/media/${banner.image}`}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-end p-6">
              <h2 className="text-white text-3xl md:text-5xl font-bold">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="text-white mt-2">{banner.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroBanners;
