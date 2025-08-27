const MovementSection = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 bg-white">
      {/* Left: Heading + Button */}
      <div className="md:w-1/2 mb-10 md:mb-0">
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
          More Than Just Gear,<br />
            <span>
            It's a <span className="underline decoration-yellow-300 decoration-4">Movement</span>
            </span>

        </h2>

<button
  className="mt-8 flex items-center gap-2 px-6 py-3 border border-black rounded-full text-black bg-white hover:bg-black hover:text-white transition-colors duration-300"
  aria-label="Learn more about our story"
  onClick={() => {
    const el = document.getElementById("about");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }}
>
  Our Story
  <span className="text-xl">→</span>
</button>

      </div>

      {/* Right: Description */}
      <div className="md:w-1/2 text-gray-700 text-lg leading-relaxed">
        <p>
          At RacketOutlet, we believe in empowering sports enthusiasts and athletes of all levels, fostering a vibrant sporting community. We provide top-tier gear, expert advice, and curated experiences to help you elevate your game. Join us in celebrating the passion and joy of sport.
        </p>
      </div>
    </section>
  );
};

export default MovementSection;
