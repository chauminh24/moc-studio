import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const [isAdded, setIsAdded] = useState(false);
  const [imageError, setImageError] = useState(false); // Track if image failed to load

  // Use placeholder if no image URL or if error occurred
  const imageSrc = imageError || !product.image_url 
    ? "/placeholder/image_placeholder.png" 
    : product.image_url;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleImageError = (e) => {
    // Only set error state if it's not already the placeholder
    if (e.target.src !== "/placeholder/image_placeholder.png") {
      setImageError(true);
      e.target.src = "/placeholder/image_placeholder.png";
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="bg-white overflow-hidden group">
      {/* Image Container */}
      <div className="relative pb-[150%]">
        <img
          src={imageSrc}
          alt={product.name}
          className="absolute w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy" // Add lazy loading
          decoding="async" // Add async decoding
        />

        {/* Add to Cart Button */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleAddToCart}
            className={`p-3 transition-all duration-300 
                ${isAdded ? 'bg-blue text-white' : 'bg-white text-black shadow-md'} 
                rounded-full`}
          >
            {isAdded ? (
              <svg
                className="w-4 h-4"
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
                className="w-4 h-4"
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
            onClick={(e) => {
              e.preventDefault(); // Prevent navigation when clicking the "Save" button
              alert("Saved!");
            }}
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
    </Link>
  );
};

export default ProductCard;