import { useState, useEffect } from "react";

const testimonials = [
  {
    quote:
      "I decided to buy a pair of Puma shoes from Instasport and my experience was wonderful.",
    author: "Aman, Delhi",
  },
  {
    quote:
      "The quality of the products exceeded my expectations. Fast delivery too!",
    author: "Sneha, Bangalore",
  },
  {
    quote:
      "Best sports gear store I’ve shopped at. Smooth checkout and great support.",
    author: "Ravi, Mumbai",
  },
  {
    quote:
      "Loved the variety of collections. I found everything I needed in one place.",
    author: "Priya, Hyderabad",
  },
];

const Testimonial = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 4000); // Auto slide every 4s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-auto bg-black text-white py-12 flex items-center justify-center">
      <div className="w-full max-w-3xl px-6 text-center">
        <blockquote className="text-xl md:text-2xl italic font-semibold transition-all duration-700 ease-in-out">
          “{testimonials[current].quote}”
        </blockquote>
        <p className="mt-4 text-gray-300 font-semibold">— {testimonials[current].author}</p>

        {/* Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                current === i ? "bg-white scale-110" : "bg-gray-500"
              }`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
