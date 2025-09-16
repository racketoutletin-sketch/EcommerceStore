import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  fetchHomeData,
  selectHomeData,
  selectHomeLoading,
} from "../redux/features/home/homeSlice";

import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import HeroBanners from "../components/HomePage/HeroBanners";
import MovementSection from "../components/HomePage/MovementSection";
import CategoryIcons from "../components/HomePage/CategoryIcons";
import VideoCard from "../components/HomePage/VideoCard";
import CraftedforChampions from "../components/HomePage/CraftedforChampions";
import FeaturedProduct from "../components/HomePage/FeaturedProduct";
import TrustIndicators from "../components/HomePage/TrustIndicators";
import AthletesImage from "../components/HomePage/AthletesImage";
import ShopTheLook from "../components/HomePage/ShopTheLook";
import Testimonial from "../components/HomePage/Testimonial";
import FeaturedCollections from "../components/HomePage/FeaturedCollections";
import AboutRacketOutlet from "../components/HomePage/AboutRacketOutlet";
import InfoCards from "../components/HomePage/InfoCards";
import Footer from "../components/HomePage/Footer";
import Loader from "../components/Loader";



const Home = () => {
  const dispatch = useAppDispatch();
  const homeData = useAppSelector(selectHomeData);
  const loading = useAppSelector(selectHomeLoading);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ✅ Always run on mount, let thunk decide cache vs fresh
  useEffect(() => {
    dispatch(fetchHomeData());
  }, [dispatch]);

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen flex flex-col bg-white font-poppins">
      <TopBar />
      <Header />
      <main className="flex-grow max-w-[1840px] w-full mx-auto px-2 py-4">
        {loading || !homeData ? (
<Loader />
) : (
  <>
    <HeroBanners />
    <MovementSection />
    <CategoryIcons />
    <VideoCard />
    <FeaturedProduct />
    <CraftedforChampions />
    <TrustIndicators />
    <AthletesImage />
    <ShopTheLook />
    <Testimonial />
    <FeaturedCollections />
    <div id="about">
      <AboutRacketOutlet />
    </div>
    <InfoCards />
  </>
)}

      </main>
      <Footer />

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/917996992599?text=Hi%20I%20need%20help!"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-5 right-5 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 hover:shadow-xl transition-all duration-500 ease-in-out z-50
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-10 h-10 fill-current"
        >
          <path d="M16.003 3.003c-7.168 0-13 5.832-13 13 0 2.293.61 4.533 1.768 6.493L3 29l6.696-1.742c1.883 1.01 3.985 1.544 6.307 1.544 7.168 0 13-5.832 13-13s-5.832-13-13-13zm0 23c-2.035 0-4.033-.525-5.774-1.518l-.414-.236-3.975 1.033 1.061-3.871-.254-.397c-1.07-1.668-1.628-3.598-1.628-5.511 0-5.794 4.706-10.5 10.5-10.5s10.5 4.706 10.5 10.5-4.706 10.5-10.5 10.5zm5.878-7.871c-.32-.16-1.883-.926-2.176-1.033-.293-.107-.507-.16-.72.16-.213.32-.826 1.033-1.013 1.246-.187.213-.373.24-.693.08-.32-.16-1.35-.497-2.57-1.584-.95-.847-1.592-1.892-1.779-2.212-.187-.32-.02-.493.14-.653.143-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.986-2.374-.26-.62-.527-.533-.72-.543-.187-.007-.4-.009-.613-.009-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.26 3.453 5.48 4.84.767.33 1.363.527 1.829.674.768.244 1.468.21 2.02.127.62-.093 1.883-.767 2.147-1.507.267-.747.267-1.387.187-1.507-.08-.12-.293-.187-.613-.347z"/>
</svg>
      </a>
    </div>
  );
};

export default Home;
