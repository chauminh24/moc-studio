import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../productCard";

const ShopByRoom = ({ categories }) => {
  const { category } = useParams(); // Get the category from the URL
  const [products, setProducts] = useState([]);

  const selectedCategory = categories.find(
    (item) => item.link === `/shop-by-room/${category}`
  );

  useEffect(() => {
    if (selectedCategory) {
      fetch(`/api/connectDB?categoryId=${selectedCategory._id}`)
        .then((response) => response.json())
        .then((data) => setProducts(data.products))
        .catch((error) => console.error("Error fetching products:", error));
    }
  }, [selectedCategory]);

  return (
    <div className="pt-[10em] mx-8">
      <h1 className="text-3xl font-bold mb-4 ">Shop by Room</h1>
      <div className={`grid ${selectedCategory ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
        {selectedCategory ? (
          <div className="border p-6 rounded-lg shadow-sm bg-blue text-white">
            <h2 className="text-xl font-semibold mb-4">{selectedCategory.name}</h2>
            <p>Explore {selectedCategory.name} products.</p>
          </div>
        ) : (
          categories.map((item) => (
            <div key={item.name} className="border p-6 rounded-lg shadow-sm bg-blue text-white">
              <h2 className="text-xl font-semibold mb-4">{item.name}</h2>
              <Link to={item.link} className="text-blue-600 hover:underline">
                Explore {item.name}
              </Link>
            </div>
          ))
        )}
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product._id}
                image={product.image_url}
                title={product.name}
                description={product.description}
                price={product.price}
                onSave={() => console.log("Save", product._id)}
                onAddToCart={() => console.log("Add to Cart", product._id)}
              />
            ))
          ) : (
            <p>No products available for {selectedCategory.name}.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopByRoom;