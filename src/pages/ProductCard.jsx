import React from "react";

const ProductCard = ({ product }) => {
  return (
    <div className="border p-6 rounded-lg shadow-sm bg-white">
      <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover mb-4" />
      <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
      <p className="text-gray-700 mb-2">{product.description}</p>
      <p className="text-gray-900 font-bold mb-2">${product.price.$numberDecimal}</p>
      <p className="text-gray-600">In stock: {product.stock_quantity}</p>
    </div>
  );
};

export default ProductCard;