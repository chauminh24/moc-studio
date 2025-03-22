import React from "react";

const ProductCard = ({ image, name, price, onSave, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover"
        />
        {/* Add to Cart Button (inside image) */}
        <button
          onClick={onAddToCart}
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-gray-800 transition-colors duration-300"
        >
          Add to Cart
        </button>
      </div>

      {/* name, Price, and Save Button */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          {/* name and Price */}
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-gray-600">€{price}</p>
          </div>
          {/* Save Button */}
          <button
            onClick={onSave}
            className="text-gray-500 hover:text-gray-900 transition-colors duration-300"
          >
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
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;