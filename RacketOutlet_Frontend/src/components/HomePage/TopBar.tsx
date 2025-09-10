const TopBar = () => (
  <div className="bg-black text-white py-2 px-4 flex items-center justify-center relative overflow-hidden">
    {/* Instagram + YouTube top-left */}
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-4 z-10">
      {/* Instagram */}
      <a
        href="https://www.instagram.com/racketek?utm_source=ig_web_button_share_sheet&igsh=MWlneXZ5Y2U1em1ycQ=="
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="instagram-btn transition-all duration-300 transform hover:scale-110"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5Zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm5.25-.88a.88.88 0 1 1-1.75 0 .88.88 0 0 1 1.75 0Z" />
        </svg>
      </a>

      {/* YouTube */}
      <a
        href="https://youtube.com/@racketek?si=wHSFyqpHjoaN-K_n"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        className="youtube-btn transition-all duration-300 transform hover:scale-110"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a2.994 2.994 0 0 0-2.11-2.11C19.165 3.5 12 3.5 12 3.5s-7.165 0-9.388.576a2.994 2.994 0 0 0-2.11 2.11C0 8.414 0 12 0 12s0 3.586.502 5.814a2.994 2.994 0 0 0 2.11 2.11C4.835 20.5 12 20.5 12 20.5s7.165 0 9.388-.576a2.994 2.994 0 0 0 2.11-2.11C24 15.586 24 12 24 12s0-3.586-.502-5.814ZM9.545 15.568V8.432L15.909 12l-6.364 3.568Z"/>
        </svg>
      </a>
    </div>

    {/* Scrolling Message */}
    <div className="flex-1 flex justify-center overflow-hidden relative">
      <div className="animate-scroll whitespace-nowrap">
        Free shipping above 1000 &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; Weekend Sale Up to 60% Off
      </div>
    </div>

    <style>
      {`
        /* Scrolling text */
        @keyframes scroll {
          0% { transform: translateX(50%); }
          50% { transform: translateX(-100%); }
          100% { transform: translateX(50%); }
        }
        .animate-scroll {
          display: inline-block;
          animation: scroll 12s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }

        /* Instagram official gradient hover */
        .instagram-btn:hover svg path {
          fill: url(#instagramOfficialGradient);
        }

        /* YouTube hover (solid red) */
        .youtube-btn:hover svg path {
          fill: #ff0000;
        }
      `}
    </style>

    {/* Instagram official gradient definition */}
    <svg width="0" height="0">
      <defs>
        <linearGradient id="instagramOfficialGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#feda75"/>
          <stop offset="25%" stopColor="#fa7e1e"/>
          <stop offset="50%" stopColor="#d62976"/>
          <stop offset="75%" stopColor="#962fbf"/>
          <stop offset="100%" stopColor="#4f5bd5"/>
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export default TopBar;
