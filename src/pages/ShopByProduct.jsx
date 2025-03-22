import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "./ProductCard"; // Import your ProductCard component

const ShopByProduct = () => {
  const { category, subcategory } = useParams(); // Get URL parameters
  const [products, setProducts] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const subcontent = {
    "Shop by Product": [
      {
        name: "Furniture",
        link: "/shop-by-product/furniture",
        isCollapsible: true,
        subItems: [
          { name: "Tables", link: "/shop-by-product/furniture/tables" },
          { name: "Chairs", link: "/shop-by-product/furniture/chairs" },
        ],
      },
      { name: "Lighting", link: "/shop-by-product/lighting" },
      { name: "Tableware", link: "/shop-by-product/tableware" },
      {
        name: "Accessories",
        link: "/shop-by-product/accessories",
        isCollapsible: true,
        subItems: [
          { name: "Rugs", link: "/shop-by-product/accessories/rugs" },
          { name: "Lamps", link: "/shop-by-product/accessories/lamps" },
          { name: "Cushions", link: "/shop-by-product/accessories/cushions" },
          { name: "Decor", link: "/shop-by-product/accessories/decor" },
        ],
      },
    ],
  };

  // Find the selected category or subcategory
  const selectedCategory = subcontent["Shop by Product"].find(
    (item) => item.link === `/shop-by-product/${category}`
  );

  const selectedSubcategory = selectedCategory?.subItems?.find(
    (item) => item.link === `/shop-by-product/${category}/${subcategory}`
  );

  useEffect(() => {
    // Determine the category/subcategory name to fetch products for
    const categoryName = selectedSubcategory
      ? selectedSubcategory.name
      : selectedCategory?.name;

    if (categoryName) {
      // Set the selected category name for display
      setSelectedCategoryName(categoryName);

      // Fetch products for the selected category/subcategory name
      console.log(`Fetching products for category: ${categoryName}`);
      fetch(`/api/products?category=${categoryName}`) // Replace with your API endpoint
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched products:", data);
          if (data.products) {
            setProducts(data.products);
          } else {
            console.error("No products found for category:", categoryName);
            setProducts([]);
          }
        })
        .catch((error) => console.error("Error fetching products:", error));
    }
  }, [selectedCategory, selectedSubcategory]);

  return (
    <div className="pt-[10em] mx-8">
      <h1 className="text-3xl font-bold mb-8">Shop by Product</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Full-height image (left column) */}
        <div className="md:col-span-1">
          <img
            src="https://via.placeholder.com/600x1200" // Replace with your image
            alt="Featured"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Product cards (right column) */}
        <div className="md:col-span-2">
          {selectedCategoryName ? (
            <>
              <div className="border p-6 rounded-lg shadow-sm bg-orange text-white mb-8">
                <h2 className="text-xl font-semibold mb-4">{selectedCategoryName}</h2>
                <p>Explore {selectedCategoryName} products.</p>
              </div>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-red-500">No products found in this category.</p>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcontent["Shop by Product"].map((item) => (
                <div key={item.name} className="border p-6 rounded-lg shadow-sm bg-orange text-white">
                  <h2 className="text-xl font-semibold mb-4">{item.name}</h2>
                  <Link to={item.link} className="text-blue-600 hover:underline">
                    Explore {item.name}
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

export default ShopByProduct;