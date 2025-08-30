import React, { useState, useEffect } from "react";

interface CheckoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  loading?: boolean; // new prop
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  children,
  size = "md",
  className = "",
  loading = false,
  ...props
}) => {
  const [dots, setDots] = useState(".");

  // Animate dots when loading is true
  useEffect(() => {
    if (!loading) {
      setDots(".");
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : "."));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

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
        ${sizeClass} ${className} group flex items-center justify-center
      `}
      disabled={loading || props.disabled}
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

      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            Processing{dots}
          </>
        ) : (
          children
        )}
      </span>

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

export default CheckoutButton;
