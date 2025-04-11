import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const ProductDetailsPage = () => {
  const { productId } = useParams(); // Dynamically get the product ID from the URL
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [media, setMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0); // Track the current media index
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        // Fetch product details from the backend
        const response = await fetch(`/api/connectDB?type=productDetails&productId=${productId}`);
        if (!response.ok) throw new Error("Failed to fetch product details");
        const data = await response.json();

        setProduct(data.product);
        setMedia(data.media);
        setReviews(data.reviews);
        setRelatedProducts(data.relatedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]); // Re-run the effect when the productId changes

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      alert("Product added to cart!");
    }
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % media.length);
  };

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto pt-[10em] p-6">
      {product ? (
        <>
          {/* Product Details Section */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Media */}
            <div className="flex-1 relative">
              {media.length > 0 ? (
                <>
                  <img
                    src={media[currentMediaIndex].media_url}
                    alt={product.name}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                  {/* Arrows for navigation */}
                  {media.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevMedia}
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-light-blue text-white p-2 rounded-full"
                      >
                        &#8592;
                      </button>
                      <button
                        onClick={handleNextMedia}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-light-blue text-white p-2 rounded-full"
                      >
                        &#8594;
                      </button>
                    </>
                  )}
                </>
              ) : (
                <img
                  src="/placeholder/image_placeholder.png"
                  alt="Placeholder"
                  className="w-full h-auto object-cover rounded-lg"
                />
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
              <p className="text-lg text-gray mb-4">{product.description}</p>
              <p className="text-xl font-semibold text-blue mb-4">
                €{product.price.$numberDecimal}
              </p>
              <button
                onClick={handleAddToCart}
                className="bg-blue text-white px-6 py-2 rounded-lg hover:bg-dark-blue transition"
              >
                Add to Cart
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="border-b border-light-gray py-4">
                  <p className="font-semibold">{review.comment}</p>
                  <p className="text-sm text-gray-500">
                    Rating: {review.rating} / 5
                  </p>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>

          {/* Related Products Section */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="border rounded-lg p-4 hover:shadow-lg transition"
                >
                  <img
                    src={relatedProduct.image_url}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold">{relatedProduct.name}</h3>
                  <p className="text-dark-blue font-bold">
                    €{relatedProduct.price.$numberDecimal}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>Product not found</div>
      )}
    </div>
  );
};

export default ProductDetailsPage;