import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const ShopByRoom = () => {
  const { category } = useParams(); // Get the category from the URL
  const [products, setProducts] = useState([]);

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

  useEffect(() => {
    if (selectedCategory) {
      console.log(`Fetching products for category: ${selectedCategory.name}`);
      fetch(`/api/connectDB?categoryName=${selectedCategory.name}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched products:", data);
          if (data.products) {
            setProducts(data.products);
          } else {
            console.error("No products found for category:", selectedCategory.name);
            setProducts([]);
          }
        })
        .catch((error) => console.error("Error fetching products:", error));
    }
  }, [selectedCategory]);

  return (
    <div className="pt-[10em] mx-8">
      <h1 className="text-3xl font-bold mb-4 ">Shop by Room</h1>
      <div className={`grid ${selectedCategory ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
        {selectedCategory ? (
          <>
            <div className="border p-6 rounded-lg shadow-sm bg-blue text-white">
              <h2 className="text-xl font-semibold mb-4">{selectedCategory.name}</h2>
              <p>Explore {selectedCategory.name} products.</p>
            </div>
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="text-red-500">No products found in this category.</p>
            )}
          </>
        ) : (
          subcontent["Shop by Room"].map((item) => (
            <div key={item.name} className="border p-6 rounded-lg shadow-sm bg-blue text-white">
              <h2 className="text-xl font-semibold mb-4">{item.name}</h2>
              <Link to={item.link} className="text-blue-600 hover:underline">
                Explore {item.name}
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShopByRoom;