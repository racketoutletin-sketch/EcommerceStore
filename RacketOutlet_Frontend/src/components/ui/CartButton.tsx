// components/ui/CartButton.tsx
import React from "react";

interface CartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
}

const CartButton: React.FC<CartButtonProps> = ({ children = "Add to Cart", size = "md", className = "", ...props }) => {
  // Size styles
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
        bg-white text-black
        shadow-md hover:shadow-xl
        transition-colors duration-300 ease-in-out
        hover:bg-black hover:text-white
        ${sizeClass} ${className} group
      `}
      {...props}
    >
      {/* Wave hover animation */}
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className={`
            absolute top-0 left-0 w-full h-full
            bg-gradient-to-r from-white/30 via-white/10 to-white/0
            opacity-0 group-hover:opacity-100
            transform -translate-x-full
            pointer-events-none
            wave-layer wave-layer-${i}
          `}
        />
      ))}

      <span className="relative z-10">{children}</span>

      <style>
        {`
          @keyframes wave {
            0% { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(300%) skewX(-15deg); }
          }
          .wave-layer {
            animation: wave 1.2s linear infinite;
          }
          .wave-layer-1 { animation-delay: 0.2s; }
          .wave-layer-2 { animation-delay: 0.4s; }
        `}
      </style>
    </button>
  );
};

export default CartButton;
