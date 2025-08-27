import { useEffect, useRef } from "react";

const brands: string[] = ["Nike", "Adidas", "Puma", "Yonex", "Wilson", "Li-Ning", "Head", "Asics"];

interface Position {
  x: number;
  y: number;
}

const VShapeMarquee: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const logosRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    let speed = 0.5;
    const positions: Position[] = Array(brands.length * 2)
      .fill(0)
      .map(() => ({ x: 0, y: 0 }));

    const updatePositions = () => {
      const container = containerRef.current;
      if (!container) return;

      const width = container.offsetWidth;
      const height = container.offsetHeight;

      logosRef.current.forEach((logo, i) => {
        if (!logo) return;

        const row = i < brands.length ? 0 : 1;

        const startY = row === 0 ? height * 0.2 : height * 0.6;
        const endY = row === 0 ? height * 0.4 : height * 0.8;

        positions[i].x += speed;
        positions[i].y = startY + ((endY - startY) / width) * positions[i].x;

        if (positions[i].x > width) positions[i].x = -100;

        logo.style.transform = `translate(${positions[i].x}px, ${positions[i].y}px)`;
      });

      requestAnimationFrame(updatePositions);
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) speed = 3;
      else if (e.deltaY < 0) speed = -3;
      else speed = 0.5;
    };

    window.addEventListener("wheel", handleWheel);
    updatePositions();

    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  const duplicatedBrands: string[] = [...brands, ...brands];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] bg-gray-50 overflow-hidden"
    >
      {duplicatedBrands.map((b, i) => (
        <div
          key={i}
          ref={(el) => { logosRef.current[i] = el; }} // ✅ Return void
          className="absolute w-12 h-12 bg-white border rounded-full flex items-center justify-center text-black text-sm font-bold shadow"
        >
          {b}
        </div>
      ))}
    </div>
  );
};

export default VShapeMarquee;
