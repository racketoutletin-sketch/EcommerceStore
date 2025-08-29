export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white space-y-4">
      {/* Spinner */}
      <div className="w-16 h-16 border-4 border-black border-t-white rounded-full animate-spin-slow"></div>
      
      {/* Brand Name */}
      <span className="text-2xl font-bold text-black">RacketOutlet</span>
    </div>
  );
}
