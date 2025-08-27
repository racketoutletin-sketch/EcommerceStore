const TopBar = () => (
  <div className="bg-black text-white py-2 px-4 flex items-center justify-between relative overflow-hidden">
    {/* Left: Social Icons */}
    <div className="flex space-x-4 z-10">
      <a href="#" className="text-white text-xl hover:text-blue-600 wave-icon" aria-label="Facebook">
        <i className="fab fa-facebook-f"></i>
      </a>
      <a href="#" className="text-white text-xl hover:text-pink-500 wave-icon" aria-label="Instagram">
        <i className="fab fa-instagram"></i>
      </a>
      <a href="#" className="text-white text-xl hover:text-red-600 wave-icon" aria-label="YouTube">
        <i className="fab fa-youtube"></i>
      </a>
    </div>

    {/* Scrolling Message */}
    <div className="flex-1 flex justify-center overflow-hidden relative">
      <div className="animate-scroll whitespace-nowrap">
        Free shipping above 1000 &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; Weekend Sale Up to 60% Off
      </div>
    </div>

    {/* Right: Empty div for layout balance */}
    <div className="w-16 z-10"></div>

    <style>
  {`
    @keyframes wave {
      0% { transform: rotate(0deg); }
      15% { transform: rotate(14deg); }
      30% { transform: rotate(-8deg); }
      45% { transform: rotate(14deg); }
      60% { transform: rotate(-4deg); }
      75% { transform: rotate(10deg); }
      100% { transform: rotate(0deg); }
    }
    .wave-icon:hover {
      animation: wave 0.8s ease-in-out;
    }

    @keyframes scroll {
      0% { transform: translateX(50%); }
      50% { transform: translateX(-100%); }
      100% { transform: translateX(50%); }
    }
    .animate-scroll {
      display: inline-block;
      animation: scroll 10s linear infinite;
    }
    .animate-scroll:hover {
      animation-play-state: paused;
    }

    @media (max-width: 768px) { .animate-scroll { animation-duration: 15s; } }
    @media (max-width: 480px) { .animate-scroll { animation-duration: 20s; } }
  `}
</style>

  </div>
);

export default TopBar;
