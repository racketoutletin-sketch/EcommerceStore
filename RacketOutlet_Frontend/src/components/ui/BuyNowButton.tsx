// components/ui/BuyNowButton.tsx
import React from "react";

interface BuyNowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
}

const BuyNowButton: React.FC<BuyNowButtonProps> = ({ children, size = "md", className = "", ...props }) => {
  let sizeClass = "";
  switch (size) {
    case "sm":
      sizeClass = "px-3 py-1 text-sm";
      break;
    case "md":
      sizeClass = "px-5 py-2 text-base";
      break;
    case "lg":
      sizeClass = "px-6 py-3 text-lg";
      break;
  }

  return (
    <button
      className={`
        relative overflow-hidden font-semibold rounded-lg
        bg-black text-white
        shadow-md hover:shadow-xl
        transition-colors duration-300 ease-in-out
        hover:bg-white hover:text-black
        ${sizeClass} ${className} group
      `}
      {...props}
    >
      {/* Wave SVG overlay */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100"
        preserveAspectRatio="none"
        viewBox="0 0 120 28"
      >
        <defs>
          <linearGradient id="waveGradient" gradientTransform="rotate(0)">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
          </linearGradient>
        </defs>
        <path
          className="wave-path animate-wave"
          fill="url(#waveGradient)"
          d="M0 20 Q 30 0 60 20 T 120 20 V28 H0 Z"
        />
      </svg>

      <span className="relative z-10">{children}</span>

      <style>
        {`
          @keyframes wave {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .wave-path {
            animation: wave 2s linear infinite;
          }
        `}
      </style>
    </button>
  );
};


export default BuyNowButton;
