import { useState, useRef } from "react";
import type { MouseEvent, Touch } from "react";



const CraftedForChampions: React.FC = () => {
  const [position, setPosition] = useState<number>(50); // % of reveal
  const containerRef = useRef<HTMLDivElement | null>(null);

  // --- Handle Mouse Drag ---
  const handleMouseDrag = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let newY = ((e.clientY - rect.top) / rect.height) * 100;
    newY = Math.max(0, Math.min(100, newY)); // clamp
    setPosition(newY);
  };

  // --- Handle Touch Drag ---
  const handleTouchDrag = (touch: Touch) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let newY = ((touch.clientY - rect.top) / rect.height) * 100;
    newY = Math.max(0, Math.min(100, newY));
    setPosition(newY);
  };

  return (
    <section className="bg-gray-100 py-16">
      <div className="w-full px-2 md:px-0 flex flex-col items-center select-none">
        {/* Top small text */}
        <p className="text-sm md:text-base text-gray-500 mb-2 uppercase tracking-wide">
          Speed · Comfort · Precision
        </p>

        {/* Big gradient headline */}
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-black">
          Crafted for Champions
        </h1>

        {/* Before/After Vertical Image Slider */}
        <div
          ref={containerRef}
          className="relative w-full md:w-[90vw] h-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-lg border"
          onMouseMove={(e) => e.buttons === 1 && handleMouseDrag(e)}
          onTouchMove={(e) => handleTouchDrag(e.touches[0])}
        >
          {/* Bottom Image */}
          <img
            src="/img.jpg"
            alt="Bottom"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Top Image clipped vertically */}
          <div
            className="absolute left-0 top-0 w-full overflow-hidden"
            style={{ height: `${position}%` }}
          >
            <img
              src="/img.jpg"
              alt="Top"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* Divider Line (Draggable) */}
          <div
            className="absolute left-0 right-0 cursor-row-resize"
            style={{ top: `${position}%` }}
            onMouseDown={(e) => handleMouseDrag(e)}
            onTouchStart={(e) => handleTouchDrag(e.touches[0])}
          >
            <div className="h-1 bg-white w-full shadow-md"></div>
            <div className="absolute left-1/2 -top-3 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-gray-400 shadow-md flex items-center justify-center">
              <div className="w-4 h-2 bg-gray-600 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CraftedForChampions;
