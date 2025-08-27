

const AthletesImage = () => (
  <div className="mb-8 relative">
    <img
      src="athelet.png"
      alt="Group of athletes playing various sports"
      className="w-full h-full object-cover rounded-xl mt-6"
    />

    {/* Overlay Button */}
    <div className="absolute inset-0 flex items-end justify-center pb-6">
      <button className="px-8 py-3 bg-transparent text-white font-semibold rounded-full backdrop-blur-sm border border-white">
        Shop Now
      </button>
    </div>
  </div>
);

export default AthletesImage;
