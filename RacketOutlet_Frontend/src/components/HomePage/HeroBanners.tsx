// src/components/HeroBanners.tsx
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import api from "../../api/axios"; // ✅ axios instance
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  subcategory: number | null;
  product: number | null;
}

const HeroBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const navigate = useNavigate();

  // ✅ Fetch banners
  useEffect(() => {
    api
      .get("api/banners/")
      .then((res) => {
        setBanners(res.data.results || []);
      })
      .catch((err) => console.error("Error fetching banners:", err));
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
    if (banner.product) {
      navigate(`/products/${banner.product}`);
    } else if (banner.subcategory) {
      navigate(`/subcategories/${banner.subcategory}/products`);
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
              src={banner.image}
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
