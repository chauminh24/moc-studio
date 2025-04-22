import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const ShopByRoom = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state

  // Mapping of room categories to their image paths
  const roomImages = {
    "Living Room": "/images/categories/living-room.jpg",
    "Bedroom": "/images/categories/bedroom.jpg",
    "Bathroom": "/images/categories/bathroom.jpg",
    "Kitchen": "/images/categories/kitchen.jpg",
    "More": "/images/categories/more.jpg"
  };

  const subcontent = {
    "Shop by Room": [
      { name: "Living Room", link: "/shop-by-room/living-room" },
      { name: "Bedroom", link: "/shop-by-room/bedroom" },
      { name: "Bathroom", link: "/shop-by-room/bathroom" },
      { name: "Kitchen", link: "/shop-by-room/kitchen" },
      { name: "More", link: "/shop-by-room/more" },
    ],
  };

  const selectedCategory = subcontent["Shop by Room"].find(
    (item) => item.link === `/shop-by-room/${category}`
  );

  // Get the appropriate image based on the selected category
  const categoryImage = selectedCategory
    ? roomImages[selectedCategory.name]
    : "/images/categories/default.jpg";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (selectedCategory) {
          setLoading(true); // Start loading
          const response = await fetch(`/api/connectDB?type=categoriesAndProducts&categoryName=${encodeURIComponent(selectedCategory.name)}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
          }
          const data = await response.json();
          setProducts(data.products || []);
        } else {
          setProducts([]); // Clear products if no category is selected
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="pt-[10em] mx-8">
      <h1 className="text-3xl font-bold mb-8">Shop by Room</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Full-height image (left column) - only on larger screens */}
        <div className="hidden lg:block lg:col-span-1">
          <img
            src={categoryImage}
            alt={selectedCategory ? selectedCategory.name : "Shop by Room"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/placeholder/image_placeholder.png";
            }}
          />
        </div>

        {/* Product cards (right columns) */}
        <div className="lg:col-span-3">
          {selectedCategory ? (
            <>
              <div className="mb-8 p-6 bg-blue text-white">
                <h2 className="text-xl font-semibold">{selectedCategory.name}</h2>
                <p>Explore {selectedCategory.name} products.</p>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))
                  ) : (
                    <p className="col-span-full text-red-500">
                      {loading ? "Loading..." : "No products found"}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subcontent["Shop by Room"].map((item) => (
                <div key={item.name} className="p-4 bg-blue text-white">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <Link to={item.link} className="text-blue-200 hover:underline">
                    Explore
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopByRoom;