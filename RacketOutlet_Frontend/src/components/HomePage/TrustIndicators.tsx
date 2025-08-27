import React, { useRef, useEffect, useState } from "react";

const indicators = ["Authentic Products", "Best Prices", "Fast Shipping"];

const TrustIndicators: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [speed, setSpeed] = useState(50); // base speed (pixels/sec)
  const [direction, setDirection] = useState(-1); // -1 = left, 1 = right

  // Auto scrolling effect
  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    const scrollStep = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      const container = containerRef.current;
      if (container) {
        container.scrollLeft += (speed * direction * delta) / 1000;

        // Looping effect
        if (container.scrollLeft >= container.scrollWidth) {
          container.scrollLeft = 0;
        }
        if (container.scrollLeft <= 0) {
          container.scrollLeft = container.scrollWidth;
        }
      }

      animationFrame = requestAnimationFrame(scrollStep);
    };

    animationFrame = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animationFrame);
  }, [speed, direction]);

  // Wheel listener
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        // scroll up → reverse
        setDirection(1);
        setSpeed(150);
      } else {
        // scroll down → forward faster
        setDirection(-1);
        setSpeed(150);
      }
      // reset after short burst
      setTimeout(() => setSpeed(50), 500);
    };
    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-hidden whitespace-nowrap border-y bg-white py-10 leading-relaxed"
    >
      <div className="inline-flex items-center">
        {Array(15) // repeat to make it feel infinite
          .fill(indicators)
          .flat()
          .map((text, i, arr) => (
            <React.Fragment key={i}>
              <span className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-black bg-clip-text text-transparent mx-8 tracking-wide leading-[1.2]">
                {text}
              </span>

              {/* Add separator after each item except the last */}
              {i !== arr.length - 1 && (
                <span className="w-3 h-3 bg-white border border-black rounded-full mx-4 inline-block"></span>
              )}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};

export default TrustIndicators;
