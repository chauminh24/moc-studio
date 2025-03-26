import React, { useState } from "react";

const ProductCard = ({ product }) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    setIsAdded(true);
    // Add your actual cart logic here
    setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds for demo
  };

  return (
    <div className="bg-white overflow-hidden group">
      {/* Image Container */}
      <div className="relative pb-[150%]">
        <img
          src={product.image_url}
          alt={product.name}
          className="absolute w-full h-full object-cover"
        />

        {/* Add to Cart Button */}
        {/* Centered Button Wrapper */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleAddToCart}
            className={`p-3 transition-all duration-300 
                ${isAdded ? 'bg-blue text-white' : 'bg-white text-black shadow-md'} 
                rounded-full`}
          >
            {isAdded ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            )}
          </button>
        </div>


      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-widest mb-1">
              {product.name}
            </h2>
            <p className="text-base font-bold">€{product.price.$numberDecimal}</p>
          </div>
          {/* Save Button */}
          <button
            onClick={() => alert("Saved!")}
            className="text-gray-500 hover:text-black transition-colors duration-200"
          >
            <svg
              className="w-4 h-4"
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