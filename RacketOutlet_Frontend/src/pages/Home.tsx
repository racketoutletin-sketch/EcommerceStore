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

const Home = () => {
  return (
    <div className="min-h-screen bg-white font-poppins">
      <TopBar />
      <Header />

      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <HeroBanners />

        {/* Movement / Category Sections */}
        <MovementSection />
        <CategoryIcons />

        {/* Video Section */}
          <VideoCard/>

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
    </div>
  );
};

export default Home;
