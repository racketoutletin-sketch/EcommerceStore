import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";


interface CollectionCardProps {
  title: string;
  desc: string;
  img: string;
  productId: number;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  img,
  title,
  desc,
  productId,
}) => (
  <Link
    to={`/products/${productId}`}
    className="group border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition p-4 block"
  >
    <img src={img} alt={title} className="w-full h-48 object-cover" />
    <div className="p-3">
      <h3 className="text-black font-semibold text-base">{title}</h3>
      <p className="text-gray-500 text-sm mb-2 line-clamp-2">{desc}</p>
      <div className="flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:underline">
        Shop Now <ArrowRight size={16} />
      </div>
    </div>
  </Link>
);

const FeaturedCollections: React.FC = () => {
  const [collections, setCollections] = useState<CollectionCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchCollections = async () => {
    try {
      const res = await api.get(
        "https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-homepage-featured-product"
      );

      const mapped = res.data.featuredProducts.map((item: any) => ({
        title: item.name,                      // ✅ product name
        desc: item.description,                // ✅ product description
        img: item.main_image_url,              // ✅ main image
        productId: item.product_id,            // ✅ correct product id
      }));

      setCollections(mapped);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchCollections();
}, []);



  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-6">
        Featured Collections
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading collections...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {collections.map((col, i) => (
            <CollectionCard key={i} {...col} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedCollections;
