import React from "react";

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        {/* Add to Cart Button */}
        <button
          onClick={() => alert("Added to cart!")}
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 transition-colors duration-300"
        >
          ADD TO CART
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium uppercase tracking-wide">{product.name}</h2>
            <p className="text-xl font-bold mt-1">€{product.price.$numberDecimal}</p>
          </div>
          {/* Save Button */}
          <button
            onClick={() => alert("Saved!")}
            className="text-gray-500 hover:text-black transition-colors duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth="1.5"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;