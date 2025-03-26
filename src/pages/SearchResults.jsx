import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "./ProductCard"; // Import the ProductCard component

const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/connectDB?type=search&query=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch search results: ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  if (loading) {
    return <p className="text-center pt-[20em] uppercase text-xl">Loading...</p>;
  }

  if (error) {
    return <p className="text-center pt-[20em] text-red">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto pt-[10em] px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Search Results</h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center">No products found for "{query}".</p>
      )}
    </div>
  );
};

export default SearchResults;