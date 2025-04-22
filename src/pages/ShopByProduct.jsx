import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const ShopByProduct = () => {
  const { category, subcategory } = useParams();
  const [products, setProducts] = useState([]);

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

  const selectedCategory = subcontent["Shop by Product"].find(
    (item) => item.link === `/shop-by-product/${category}`
  );

  const selectedSubcategory = selectedCategory?.subItems?.find(
    (item) => item.link === `/shop-by-product/${category}/${subcategory}`
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const categoryName = selectedSubcategory
          ? selectedSubcategory.name
          : selectedCategory
            ? selectedCategory.name
            : null;

        if (categoryName) {
          const response = await fetch(`/api/connectDB?type=categoriesAndProducts&categoryName=${encodeURIComponent(categoryName)}`);
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
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedSubcategory]);

  return (
    <div className="pt-[10em] mx-8">
      <h1 className="text-3xl font-bold mb-8">Shop by Product</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Full-height image (left column) - only on larger screens */}
        <div className="hidden lg:block lg:col-span-1">
          <img
            src="https://via.placeholder.com/600x1200"
            alt="Featured"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product cards (right columns) */}
        <div className="lg:col-span-3">
          {selectedSubcategory ? (
            <>
              <div className="mb-8 p-6 bg-orange text-white"
                style={{
                  backgroundImage: `url(/images/categories/${selectedSubcategory.name}.jpg)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}>
                <h2 className="text-xl font-semibold">{selectedSubcategory.name}</h2>
                <p>Explore {selectedSubcategory.name} products.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <p className="col-span-full text-red-500">No products found</p>
                )}
              </div>
            </>
          ) : selectedCategory ? (
            selectedCategory.isCollapsible ? (
              <>
                <div className="mb-8 p-6 bg-orange text-white"
                  style={{
                    backgroundImage: `url(/images/categories/${selectedCategory.name}.jpg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}>
                  <h2 className="text-xl font-semibold">{selectedCategory.name}</h2>
                  <p>Explore {selectedCategory.name} products.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedCategory.subItems.map((subItem) => (
                    <div key={subItem.name} className="p-4 bg-orange">
                      <h2 className="text-lg font-semibold">{subItem.name}</h2>
                      <Link to={subItem.link} className="text-blue-600 hover:underline">
                        Explore
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-8 p-6 bg-orange text-white"
                  style={{
                    backgroundImage: `url(/images/categories/${selectedCategory.name}.jpg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}>
                  <h2 className="text-xl font-semibold">{selectedCategory.name}</h2>
                  <p>Explore {selectedCategory.name} products.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))
                  ) : (
                    <p className="col-span-full text-red-500">No products found</p>
                  )}
                </div>
              </>
            )
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subcontent["Shop by Product"].map((item) => (
                <div key={item.name} className="p-4 bg-orange">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <Link to={item.link} className="text-blue-600 hover:underline">
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

export default ShopByProduct;