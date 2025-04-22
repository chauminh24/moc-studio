import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// 3D Model Viewer Component
function ModelViewer({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [media, setMedia] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/connectDB?type=productDetails&productId=${productId}`
        );
        if (!response.ok) throw new Error("Failed to fetch product details");
        const data = await response.json();

        if (!data.product) throw new Error("Product not found");

        setProduct(data.product);
        setMedia(data.media || []);
        setReviews(data.reviews || []);
        setRelatedProducts(data.relatedProducts || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      await addToCart(product);
      // Optional: Show a toast notification instead of alert
      alert(`${product.name} added to cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % media.length);
  };

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
  };

  const renderMedia = () => {
    if (media.length === 0) {
      return (
        <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          <img
            src={product?.image_url || "/placeholder/image_placeholder.png"}
            alt={product?.name || "Product image"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/placeholder/image_placeholder.png";
            }}
          />
        </div>
      );
    }

    const currentMedia = media[currentMediaIndex];

    switch (currentMedia.media_type) {
      case "3d_model":
        return (
          <div className="w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden relative">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <pointLight position={[-10, -10, -10]} />
              <Suspense fallback={
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
                </div>
              }>
                <ModelViewer url={currentMedia.file_path} />
                <OrbitControls enableZoom={true} enablePan={true} />
              </Suspense>
            </Canvas>
          </div>
        );
      case "video":
        return (
          <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
            <video
              controls
              className="w-full h-full object-cover"
              src={currentMedia.file_path}
            />
          </div>
        );
      default: // image
        return (
          <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={currentMedia.file_path}
              alt={product?.name || "Product media"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/placeholder/image_placeholder.png";
              }}
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto pt-[12em] p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto pt-[12em] p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto pt-[12em] p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Product not found</p>
          <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">
            Browse our products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-[12em] p-6 max-w-7xl">
      {/* Product Details Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Product Media */}
        <div className="flex-1 relative">
          {renderMedia()}
          {/* Media navigation */}
          {media.length > 1 && (
            <div className="flex justify-between absolute top-1/2 w-full px-4 transform -translate-y-1/2">
              <button
                onClick={handlePrevMedia}
                className="bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all"
                aria-label="Previous media"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextMedia}
                className="bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all"
                aria-label="Next media"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          {/* Media indicators */}
          {media.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMediaIndex(index)}
                  className={`w-3 h-3 rounded-full ${currentMediaIndex === index ? 'bg-blue' : 'bg-gray-300'}`}
                  aria-label={`Go to media ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <div className="sticky top-28">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center mb-4">
              {/* Rating display - assuming product has rating */}
              {product.rating && (
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-sm text-gray-600">
                    ({reviews.length} reviews)
                  </span>
                </div>
              )}
              {/* SKU or other info */}
              {product.sku && (
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              )}
            </div>

            <p className="text-2xl font-semibold text-blue mb-6">
              €{product.price?.$numberDecimal || product.price}
            </p>

            <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: product.description }} />

            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="bg-blue hover:bg-dark-blue text-white px-8 py-3 rounded-lg transition flex items-center justify-center min-w-[200px]"
              >
                {addingToCart ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  "Add to Cart"
                )}
              </button>
              <button className="border border-blue text-blue hover:bg-blue/10 px-8 py-3 rounded-lg transition min-w-[200px]">
                Buy Now
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold mb-2">Product Details</h3>
              <ul className="space-y-2">
                {product.material && (
                  <li className="flex">
                    <span className="text-gray-600 w-32">Material:</span>
                    <span>{product.material}</span>
                  </li>
                )}
                {product.dimensions && (
                  <li className="flex">
                    <span className="text-gray-600 w-32">Dimensions:</span>
                    <span>{product.dimensions}</span>
                  </li>
                )}
                {product.weight && (
                  <li className="flex">
                    <span className="text-gray-600 w-32">Weight:</span>
                    <span>{product.weight}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200">Customer Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-medium mb-2">{review.title}</p>
                <p className="text-gray-700">{review.comment}</p>
                {review.userName && (
                  <p className="text-sm text-gray-500 mt-2">- {review.userName}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            <button className="mt-4 text-blue hover:underline">
              Write a Review
            </button>
          </div>
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                to={`/product/${relatedProduct._id}`}
                key={relatedProduct._id}
                className="group border rounded-lg overflow-hidden hover:shadow-lg transition duration-300"
              >
                <div className="relative h-60 bg-gray-100 overflow-hidden">
                  <img
                    src={relatedProduct.image_url || "/placeholder/image_placeholder.png"}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/placeholder/image_placeholder.png";
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-blue transition">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-dark-blue font-bold">
                    €{relatedProduct.price?.$numberDecimal || relatedProduct.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;