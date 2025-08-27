import { FaHeadset, FaShippingFast, FaCheckCircle, FaLock } from "react-icons/fa";

const infoCards = [
  {
    icon: <FaHeadset className="text-2xl text-blue-600" />,
    title: "Customer Service",
    description: "Expert Help from Product Selection to Delivery Support",
  },
  {
    icon: <FaShippingFast className="text-2xl text-green-600" />,
    title: "Fast Free Shipping",
    description: "Free Shipping on Orders above ₹2000",
  },
  {
    icon: <FaCheckCircle className="text-2xl text-yellow-500" />,
    title: "100% Original",
    description: "Authenticity Guaranteed on all Products",
  },
  {
    icon: <FaLock className="text-2xl text-red-500" />,
    title: "Secure Payment",
    description: "Your payment information is processed securely",
  },
];

const InfoCards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center p-4">
    {infoCards.map((card, index) => (
      <div
        key={index}
        className="bg-white/60-800 p-4 rounded-md flex flex-col items-center space-y-2 text-black border" 
      >
        {card.icon}
        <h3 className="font-semibold">{card.title}</h3>
        <p className="text-sm">{card.description}</p>
      </div>
    ))}
  </div>
);

export default InfoCards;
