import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Loader from "../Loader";

import { fetchHomeData, selectBanners, selectHomeData } from "../../redux/features/home/homeSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

const HeroBanners: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Select banners and loading state from Redux
  const banners = useAppSelector(selectBanners);
  const homeData = useAppSelector(selectHomeData);
  const loading = useAppSelector((state) => state.home.loading);

  // Force Slick slider refresh
  const [sliderKey, setSliderKey] = useState(0);

  // Fetch home data only if not already in Redux
  useEffect(() => {
    if (!homeData) {
      dispatch(fetchHomeData());
    }
  }, [dispatch, homeData]);

  useEffect(() => {
    if (banners.length > 0) setSliderKey((prev) => prev + 1);
  }, [banners]);

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

  const handleClick = (banner: typeof banners[0]) => {
    if (banner.product) navigate(`/products/${banner.product}`);
    else if (banner.subcategory) navigate(`/subcategories/${banner.subcategory}/products`);
  };

  if (loading) return <Loader />;

  if (banners.length === 0)
    return <p className="text-center py-16">No banners available.</p>;

  return (
    <div className="mb-8">
      <Slider key={sliderKey} {...settings}>
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
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-end p-6">
              <h2 className="text-white text-3xl md:text-5xl font-bold">
                {banner.title}
              </h2>
              {banner.subtitle && <p className="text-white mt-2">{banner.subtitle}</p>}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroBanners;
