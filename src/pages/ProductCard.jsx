import React from "react";

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white overflow-hidden group">
      {/* Image Container with 2:3 Aspect Ratio */}
      <div className="relative pb-[150%]"> {/* 3:2 = 150% (2/3*100) */}
        <img
          src={product.image_url}
          alt={product.name}
          className="absolute w-full h-full object-cover"
        />
        {/* Add to Cart Button - Now Visible */}
        <button
          onClick={() => alert("Added to cart!")}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                    bg-black text-white px-6 py-2 text-xs tracking-widest
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    whitespace-nowrap"
        >
          ADD TO CART
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-widest mb-1">{product.name}</h2>
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