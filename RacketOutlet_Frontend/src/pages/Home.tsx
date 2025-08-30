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
import useInitAuth from "../hooks/useInitAuth";
import usePreloadSubCategories from "../hooks/usePreloadSubCategories";
import Loader from "../components/Loader";

const Home = () => {
  useInitAuth();

  const loadingSubCategories = usePreloadSubCategories();

  return (
    <div className="min-h-screen flex flex-col bg-white font-poppins">
      <TopBar />
      <Header />

      <main className="flex-grow max-w-[1840px] w-full mx-auto px-2 py-4">


        {/* Hero Section */}
        <HeroBanners />

        {/* Movement / Category Sections */}
        <MovementSection />
        <CategoryIcons />

        {/* Video Section */}
        <VideoCard />

        {/* Featured Products & Highlights */}
        <FeaturedProduct />
        <CraftedforChampions />
        <TrustIndicators />
        <AthletesImage />
        <ShopTheLook />

        {/* Testimonials & Collections */}
        <Testimonial />
        <FeaturedCollections />

        {/* About & Info */}
        <div id="about">
          <AboutRacketOutlet />
        </div>
        <InfoCards />
      </main>

      <Footer />

      {/* Full-screen Loader overlay */}
      {loadingSubCategories && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Home;
