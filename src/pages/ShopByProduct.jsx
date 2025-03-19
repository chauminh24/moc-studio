import React from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../productCard";

const ShopByProduct = () => {
  const { category, subcategory } = useParams(); // Get URL parameters

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

  return (
    <div className="pt-[10em] mx-8">
      <h1 className="text-3xl font-bold mb-4">Shop by Product</h1>
      <div className={`grid ${selectedSubcategory || selectedCategory ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
        {selectedSubcategory ? (
          <div className="border p-6 rounded-lg shadow-sm jusify-center bg-orange" style={{ backgroundImage: `url(/images/categories/${selectedSubcategory.name}.jpg)`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <h2 className="text-xl font-semibold mb-4 ">{selectedSubcategory.name}</h2>
            <p>Explore {selectedSubcategory.name} products.</p>
          </div>
        ) : selectedCategory ? (
          selectedCategory.isCollapsible ? (
            selectedCategory.subItems.map((subItem) => (
              <div key={subItem.name} className="border p-6 rounded-lg shadow-sm bg-orange">
                <h2 className="text-xl font-semibold mb-4">{subItem.name}</h2>
                <Link to={subItem.link} className="text-blue-600 hover:underline">
                  Explore {subItem.name}
                </Link>
              </div>
            ))
          ) : (
            <div className="border p-6 rounded-lg shadow-sm bg-orange" style={{ backgroundImage: `url(${selectedCategory.image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
              <h2 className="text-xl font-semibold mb-4">{selectedCategory.name}</h2>
              <p>Explore {selectedCategory.name} products.</p>
            </div>
          )
        ) : (
          subcontent["Shop by Product"].map((item) => (
            <div key={item.name} className="border p-6 rounded-lg shadow-sm bg-orange">
              <h2 className="text-xl font-semibold mb-4">{item.name}</h2>
              {item.isCollapsible ? (
                <Link to={item.link} className="text-blue-600 hover:underline">
                  Explore {item.name}
                </Link>
              ) : (
                <Link to={item.link} className="text-blue-600 hover:underline">
                  Explore {item.name}
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

};

export default ShopByProduct;