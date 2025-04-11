import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        // Fetch product details
        const productResponse = await fetch(`/api/connectDB?type=productDetails&productId=${productId}`);
        if (!productResponse.ok) throw new Error("Failed to fetch product details");
        const productData = await productResponse.json();
        setProduct(productData.product);
        setMedia(productData.media);
        setReviews(productData.reviews);
        setRelatedProducts(productData.relatedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      alert("Product added to cart!");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      {product ? (
        <>
          {/* Product Details Section */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Media */}
            <div className="flex-1">
              {media.length > 0 ? (
                <img
                  src={media[0].media_url}
                  alt={product.name}
                  className="w-full h-auto object-cover rounded-lg"
                />
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
              <p className="text-lg text-gray-700 mb-4">{product.description}</p>
              <p className="text-xl font-semibold text-blue-600 mb-4">
                €{product.price.$numberDecimal}
              </p>
              <button
                onClick={handleAddToCart}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
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
                <div key={review._id} className="border-b border-gray-200 py-4">
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
                  <p className="text-blue-600 font-bold">
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