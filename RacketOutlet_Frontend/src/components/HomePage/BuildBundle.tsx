

const products = [
  { name: "Yonex Nanoflare 800", price: "₹8,999", img: "https://placehold.co/200x150/e2e8f0/e2e8f0?text=Badminton+Racket" },
  { name: "Adidas Performance Backpack", price: "₹2,499", img: "https://placehold.co/200x150/e2e8f0/e2e8f0?text=Backpack" },
  { name: "Overgrip Tape Pack", price: "₹299", img: "https://placehold.co/200x150/e2e8f0/e2e8f0?text=Grip+Tape" }
];

const BuildBundle = () => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-4">Build your Bundle</h2>
    <p className="text-sm text-gray-600 mb-4">Choose from our curated collection of products to build your perfect bundle.</p>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {products.map((p, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4">
          <img src={p.img} alt={p.name} className="w-full h-24 object-cover mb-2" />
          <h3 className="text-sm font-medium">{p.name}</h3>
          <p className="text-xs text-gray-500">{p.price}</p>
          <button className="mt-2 bg-black text-white text-xs py-1 px-3 rounded">Add to Bundle</button>
        </div>
      ))}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Your Bundle</h3>
        <p className="text-xs text-gray-500 mb-2">No items added yet</p>
        <button className="w-full bg-gray-200 text-gray-700 text-xs py-1 px-3 rounded">Checkout</button>
      </div>
    </div>
  </div>
);

export default BuildBundle;
